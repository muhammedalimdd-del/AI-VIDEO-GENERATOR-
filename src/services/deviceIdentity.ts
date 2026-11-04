/**
 * Device Identity & Hardware Fingerprinting Service
 * 
 * Provides multi-layer device identification combining:
 * 1. Persistent Hardware & WebGL GPU Fingerprinting (Canvas rendering, GPU renderer, screen geometry, CPU concurrency)
 * 2. Cross-Storage Redundant Device Identifier (localStorage, sessionStorage, persistent cookie)
 * 3. Server-side validation enforcing the strict One-Account-Per-Device policy
 */

import { safeFetchJson } from './apiClient.ts';

const DEVICE_STORAGE_KEY = 'aivm_device_id';
const SESSION_TOKEN_KEY = 'aivm_session_token';
const CACHED_USER_KEY = 'aivm_cached_user';

export interface DeviceStatusResponse {
  isRegistered: boolean;
  lockedUsername: string | null;
  deviceId: string;
}

export interface ClientHardwareProfile {
  screenRes: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  platform: string;
  timezone: string;
  gpuRenderer: string;
  gpuVendor: string;
}

/**
 * Generate a deterministic SHA-256 hash of a string using Web Crypto API
 */
async function sha256Hex(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback simple hash if subtle crypto is restricted
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

/**
 * Generates an invisible sub-pixel Canvas signature.
 * Different GPU drivers, anti-aliasing algorithms, and OS font-renderers produce unique image binary hashes.
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    // Canvas background
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial, "Helvetica Neue", sans-serif';
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, 240, 50);

    // Gradient styling
    const gradient = ctx.createLinearGradient(0, 0, 240, 0);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#a855f7');
    gradient.addColorStop(1, '#06b6d4');
    ctx.fillStyle = gradient;

    // Render characters with shadow and subpixel arcs
    ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('AI-VIDEO-MAKER-DEV-LOCK-✨🎥', 8, 12);

    // Additional arc geometry
    ctx.beginPath();
    ctx.arc(200, 25, 15, 0, Math.PI * 2, true);
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    return canvas.toDataURL();
  } catch (e) {
    return 'canvas-error';
  }
}

/**
 * Extract WebGL hardware renderer and vendor
 */
function getWebGLHardware(): { renderer: string; vendor: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return { renderer: 'no-webgl', vendor: 'no-webgl' };

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      return { renderer: String(renderer), vendor: String(vendor) };
    }
    return {
      renderer: String(gl.getParameter(gl.RENDERER) || ''),
      vendor: String(gl.getParameter(gl.VENDOR) || '')
    };
  } catch (e) {
    return { renderer: 'webgl-error', vendor: 'webgl-error' };
  }
}

/**
 * Read persistent cookie value
 */
function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  } catch {
    return null;
  }
}

/**
 * Set persistent cookie with 10-year lifespan
 */
function setCookie(name: string, value: string) {
  try {
    const expires = new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {}
}

/**
 * Obtains or creates a persistent device ID with multi-storage redundancy
 */
export function getPersistentDeviceId(): string {
  let deviceId: string | null = null;

  // 1. Check localStorage
  try {
    deviceId = localStorage.getItem(DEVICE_STORAGE_KEY);
  } catch {}

  // 2. Check Cookie
  if (!deviceId) {
    deviceId = getCookie(DEVICE_STORAGE_KEY);
  }

  // 3. Check sessionStorage
  if (!deviceId) {
    try {
      deviceId = sessionStorage.getItem(DEVICE_STORAGE_KEY);
    } catch {}
  }

  // 4. Generate new if not found in any store
  if (!deviceId) {
    const entropy = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    deviceId = `dev_${Date.now().toString(36)}_${entropy}`;
  }

  // Sync across all stores
  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
  } catch {}
  try {
    sessionStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
  } catch {}
  setCookie(DEVICE_STORAGE_KEY, deviceId);

  return deviceId;
}

/**
 * Computes a hardware fingerprint hash that persists even if browser storage is cleared
 */
export async function computeHardwareFingerprint(): Promise<{
  fingerprintHash: string;
  hardwareProfile: ClientHardwareProfile;
}> {
  const webgl = getWebGLHardware();
  const canvasSignature = getCanvasFingerprint();

  const hardwareProfile: ClientHardwareProfile = {
    screenRes: `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    deviceMemory: (navigator as any).deviceMemory || 8,
    platform: navigator.platform || '',
    timezone: Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'UTC',
    gpuRenderer: webgl.renderer,
    gpuVendor: webgl.vendor
  };

  const compositeString = [
    hardwareProfile.screenRes,
    hardwareProfile.hardwareConcurrency,
    hardwareProfile.deviceMemory,
    hardwareProfile.platform,
    hardwareProfile.timezone,
    hardwareProfile.gpuRenderer,
    hardwareProfile.gpuVendor,
    canvasSignature
  ].join('|||');

  const fingerprintHash = await sha256Hex(compositeString);

  return { fingerprintHash, hardwareProfile };
}

/**
 * Check if current device is registered on the backend
 */
export async function checkDeviceRegistrationStatus(): Promise<DeviceStatusResponse> {
  const deviceId = getPersistentDeviceId();
  const { fingerprintHash } = await computeHardwareFingerprint();

  try {
    const result = await safeFetchJson<any>('/api/device/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, fingerprintHash })
    });

    if (result.ok && result.data) {
      const data = result.data;
      if (data.deviceId && data.deviceId !== deviceId) {
        // Sync reconciled device ID
        localStorage.setItem(DEVICE_STORAGE_KEY, data.deviceId);
        setCookie(DEVICE_STORAGE_KEY, data.deviceId);
      }
      return {
        isRegistered: !!data.isRegistered,
        lockedUsername: data.lockedUsername || null,
        deviceId: data.deviceId || deviceId
      };
    }
  } catch (err) {
    console.warn('Notice: Device status check error, fallback to offline evaluation:', err);
  }

  return {
    isRegistered: false,
    lockedUsername: null,
    deviceId
  };
}

/**
 * Register account for this device (First-Time Registration)
 */
export async function registerDeviceAccount(params: {
  username: string;
  password: string;
  confirmPassword: string;
  contactEmail?: string;
}): Promise<{ user: any; token: string }> {
  const deviceId = getPersistentDeviceId();
  const { fingerprintHash, hardwareProfile } = await computeHardwareFingerprint();

  const result = await safeFetchJson<{ user?: any; token?: string; error?: string }>('/api/auth/register-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: params.username,
      password: params.password,
      confirmPassword: params.confirmPassword,
      contactEmail: params.contactEmail,
      deviceId,
      fingerprintHash,
      clientHardware: hardwareProfile
    })
  });

  if (!result.ok || !result.data?.token) {
    throw new Error(result.data?.error || result.error || 'Failed to create account.');
  }

  const data = result.data;
  // Save session token
  if (data.token) {
    try {
      localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    } catch {}
  }
  if (data.user) {
    try {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data.user));
    } catch {}
  }

  return { user: data.user, token: data.token! };
}

/**
 * Login on registered device (Returning User Login)
 */
export async function loginDeviceAccount(params: {
  username: string;
  password: string;
}): Promise<{ user: any; token: string }> {
  const deviceId = getPersistentDeviceId();
  const { fingerprintHash } = await computeHardwareFingerprint();

  const result = await safeFetchJson<{ user?: any; token?: string; error?: string }>('/api/auth/login-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: params.username,
      password: params.password,
      deviceId,
      fingerprintHash
    })
  });

  if (!result.ok || !result.data?.token) {
    throw new Error(result.data?.error || result.error || 'Invalid username or password. Please try again.');
  }

  const data = result.data;
  // Save session token
  if (data.token) {
    try {
      localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    } catch {}
  }
  if (data.user) {
    try {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data.user));
    } catch {}
  }

  return { user: data.user, token: data.token! };
}

/**
 * Restore existing session if token is valid
 */
export async function checkActiveSession(): Promise<any | null> {
  let token: string | null = null;
  try {
    token = localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {}

  if (!token) return null;

  try {
    const result = await safeFetchJson<{ user?: any; error?: string }>('/api/auth/session', {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-session-token': token
      }
    });

    if (result.ok && result.data?.user) {
      const user = result.data.user;
      try {
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
      } catch {}
      return user;
    } else if (result.status === 401 || result.status === 403) {
      // Session expired or invalidated on server
      try {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(CACHED_USER_KEY);
      } catch {}
    }
  } catch (err) {
    console.warn('Session check network error, falling back to cached profile if available:', err);
    try {
      const cached = localStorage.getItem(CACHED_USER_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  return null;
}

/**
 * Sign out user.
 * Note: Session token is invalidated, but DEVICE REGISTRATION IS PERMANENTLY PRESERVED!
 */
export async function logoutDeviceUser(): Promise<void> {
  let token: string | null = null;
  try {
    token = localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {}

  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-session-token': token
        }
      });
    } catch (e) {
      // ignore
    }
  }

  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(CACHED_USER_KEY);
    sessionStorage.removeItem('aivm_preview_mode');
  } catch {}
}
