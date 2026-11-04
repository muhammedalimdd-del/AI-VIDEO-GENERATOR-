/**
 * Device Identity, Hardware Fingerprinting & Multi-Tier Authentication Service
 * 
 * Provides:
 * 1. Persistent Hardware & WebGL GPU Fingerprinting (Canvas rendering, GPU renderer, screen geometry, CPU concurrency)
 * 2. Cross-Storage Redundant Device Identifier (localStorage, sessionStorage, persistent cookie)
 * 3. Synchronized Server + Firebase Firestore + Local Device-Locked Authentication enforcing the strict One-Account-Per-Device policy
 */

import { safeFetchJson } from './apiClient.ts';
import {
  saveUserToFirestore,
  getUserFromFirestore,
  getUserByUsernameFromFirestore,
  getDeviceFromFirestore,
  saveDeviceToFirestore,
  saveSessionToFirestore,
  getSessionFromFirestore,
  deleteSessionFromFirestore,
  FirestoreAuthUserDoc,
  FirestoreDeviceDoc,
  FirestoreSessionDoc
} from './firestoreService.ts';

const DEVICE_STORAGE_KEY = 'aivm_device_id';
const SESSION_TOKEN_KEY = 'aivm_session_token';
const CACHED_USER_KEY = 'aivm_cached_user';
const LOCAL_AUTH_REGISTRY_KEY = 'aivm_device_registry_v1';

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

interface LocalAuthRegistry {
  device: FirestoreDeviceDoc | null;
  users: Record<string, FirestoreAuthUserDoc>;
}

function getLocalRegistry(): LocalAuthRegistry {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        device: parsed.device || null,
        users: parsed.users || {}
      };
    }
  } catch {}
  return { device: null, users: {} };
}

function saveToLocalRegistry(user?: FirestoreAuthUserDoc, device?: FirestoreDeviceDoc) {
  try {
    const current = getLocalRegistry();
    if (device) {
      current.device = device;
    }
    if (user && user.username) {
      current.users[user.username.trim().toLowerCase()] = user;
    }
    localStorage.setItem(LOCAL_AUTH_REGISTRY_KEY, JSON.stringify(current));
  } catch {}
}

/**
 * Generate a deterministic SHA-256 hash of a string using Web Crypto API
 */
export async function sha256Hex(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback deterministic hash if subtle crypto is restricted
    let h1 = 0xdeadbeef ^ message.length;
    let h2 = 0x41c6ce57 ^ message.length;
    for (let i = 0, ch; i < message.length; i++) {
      ch = message.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (
      (h2 >>> 0).toString(16).padStart(8, '0') +
      (h1 >>> 0).toString(16).padStart(8, '0')
    ).repeat(4);
  }
}

/**
 * Generate random hex string using Web Crypto API
 */
function randomHex(bytes: number): string {
  try {
    return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    let out = '';
    for (let i = 0; i < bytes * 2; i++) {
      out += Math.floor(Math.random() * 16).toString(16);
    }
    return out;
  }
}

/**
 * Client-side salted SHA-256 password hashing (compatible with server verifyPassword)
 */
async function hashPasswordClient(password: string, existingSalt?: string): Promise<{ hash: string; salt: string }> {
  const salt = existingSalt || randomHex(16);
  const digest = await sha256Hex(`${salt}:${password}`);
  return {
    hash: `sha256:${digest}`,
    salt
  };
}

/**
 * Verify password against stored hash and salt on client/Firestore
 */
async function verifyPasswordClient(password: string, storedHash?: string, storedSalt?: string): Promise<boolean> {
  if (!storedHash || !storedSalt) return false;
  const digest = await sha256Hex(`${storedSalt}:${password}`);
  if (storedHash === `sha256:${digest}` || storedHash === digest) {
    return true;
  }
  return false;
}

function sanitizeClientUser(user: FirestoreAuthUserDoc): any {
  const { passwordHash, passwordSalt, ...safe } = user;
  return safe;
}

/**
 * Generates an invisible sub-pixel Canvas signature.
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial, "Helvetica Neue", sans-serif';
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, 240, 50);

    const gradient = ctx.createLinearGradient(0, 0, 240, 0);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#a855f7');
    gradient.addColorStop(1, '#06b6d4');
    ctx.fillStyle = gradient;

    ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('AI-VIDEO-MAKER-DEV-LOCK-✨🎥', 8, 12);

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

  try {
    deviceId = localStorage.getItem(DEVICE_STORAGE_KEY);
  } catch {}

  if (!deviceId) {
    deviceId = getCookie(DEVICE_STORAGE_KEY);
  }

  if (!deviceId) {
    try {
      deviceId = sessionStorage.getItem(DEVICE_STORAGE_KEY);
    } catch {}
  }

  if (!deviceId) {
    const localReg = getLocalRegistry();
    if (localReg.device?.deviceId) {
      deviceId = localReg.device.deviceId;
    }
  }

  if (!deviceId) {
    deviceId = `dev_${Date.now().toString(36)}_${randomHex(8)}`;
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
 * Check current client device identifier without forcing or pre-filling another user's username
 */
export async function checkDeviceRegistrationStatus(): Promise<DeviceStatusResponse> {
  const deviceId = getPersistentDeviceId();
  return {
    isRegistered: false,
    lockedUsername: null,
    deviceId
  };
}

/**
 * Register a new personal user account (New User Registration)
 * Saves to Express Backend AND Firebase Firestore AND Local Registry
 */
export async function registerDeviceAccount(params: {
  fullName?: string;
  email?: string;
  username: string;
  password: string;
  confirmPassword: string;
  contactEmail?: string;
}): Promise<{ user: any; token: string }> {
  const fullName = (params.fullName || '').trim();
  const rawEmail = (params.email || params.contactEmail || '').trim().toLowerCase();
  const username = (params.username || '').trim();

  if (!fullName) {
    throw new Error('Please enter your Full Name.');
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!rawEmail || !emailRegex.test(rawEmail)) {
    throw new Error('Please enter a valid Email Address.');
  }
  if (!username || username.length < 3) {
    throw new Error('Username must be at least 3 characters long.');
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    throw new Error('Username may only contain letters, numbers, underscores, dots, and hyphens.');
  }
  if (!params.password || params.password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }
  if (params.password !== params.confirmPassword) {
    throw new Error('Passwords do not match. Please verify and try again.');
  }

  const deviceId = getPersistentDeviceId();
  const { fingerprintHash, hardwareProfile } = await computeHardwareFingerprint();
  const { hash: passwordHash, salt: passwordSalt } = await hashPasswordClient(params.password);
  const generatedUid = `usr_${randomHex(8)}`;
  const now = new Date().toISOString();

  // Check Firestore username uniqueness first
  let existingFsUser: FirestoreAuthUserDoc | null = null;
  try {
    existingFsUser = await getUserByUsernameFromFirestore(username);
  } catch {
    // Ignore network/offline errors on pre-check
  }

  if (existingFsUser) {
    throw new Error('This username is already taken. Please choose another username.');
  }

  // 1. Call Backend API (/api/auth/register-device)
  const result = await safeFetchJson<{
    user?: any;
    token?: string;
    deviceId?: string;
    error?: string;
  }>('/api/auth/register-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName,
      displayName: fullName,
      email: rawEmail,
      contactEmail: rawEmail,
      username,
      password: params.password,
      confirmPassword: params.confirmPassword,
      deviceId,
      fingerprintHash,
      clientHardware: hardwareProfile,
      passwordHash,
      passwordSalt,
      uid: generatedUid
    })
  });

  // If backend responded with a genuine 400/403/409 validation or conflict error
  if (
    !result.ok &&
    !result.isHtmlFallback &&
    (result.status === 400 || result.status === 403 || result.status === 409)
  ) {
    throw new Error(result.data?.error || result.error || 'Failed to create account.');
  }

  // If backend was unreachable, also check local registry for duplicate username
  if (!result.ok) {
    const localReg = getLocalRegistry();
    if (localReg.users[username.toLowerCase()]) {
      throw new Error('This username is already taken. Please choose another username.');
    }
  }

  const finalUser: FirestoreAuthUserDoc =
    result.ok && result.data?.user
      ? {
          ...result.data.user,
          username: result.data.user.username || username,
          displayName: result.data.user.displayName || fullName,
          email: result.data.user.email || rawEmail,
          passwordHash,
          passwordSalt,
          deviceId: result.data.deviceId || deviceId,
          deviceFingerprint: fingerprintHash
        }
      : {
          uid: generatedUid,
          username,
          displayName: fullName,
          email: rawEmail,
          passwordHash,
          passwordSalt,
          deviceId,
          deviceFingerprint: fingerprintHash,
          createdAt: now,
          lastLoginAt: now,
          trialStatus: 'eligible',
          role: username.toLowerCase() === 'admin' ? 'admin' : 'user'
        };

  const finalToken =
    result.ok && result.data?.token ? result.data.token : `sess_${randomHex(24)}`;

  const finalDevice: FirestoreDeviceDoc = {
    deviceId: finalUser.deviceId || deviceId,
    fingerprintHash,
    registeredUserId: finalUser.uid,
    registeredUsername: finalUser.username || username,
    firstRegisteredAt: now,
    lastSeenAt: now,
    registrationLockActive: false
  };

  const finalSession: FirestoreSessionDoc = {
    token: finalToken,
    userId: finalUser.uid,
    username: finalUser.username || username,
    deviceId: finalDevice.deviceId,
    createdAt: now,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
  };

  // Persist to Firebase Firestore (users, devices, sessions)
  try {
    await Promise.all([
      saveUserToFirestore(finalUser),
      saveDeviceToFirestore(finalDevice),
      saveSessionToFirestore(finalSession)
    ]);
  } catch (fsErr) {
    console.warn('Notice: Background Firestore auth persistence:', fsErr);
  }

  // Persist to local registry & active session storage
  saveToLocalRegistry(finalUser, finalDevice);
  const cleanUser = sanitizeClientUser(finalUser);
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, finalToken);
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(cleanUser));
  } catch {}

  return { user: cleanUser, token: finalToken };
}

/**
 * Login with personal username and password (Returning User Login)
 * Verifies against Express Backend AND Firebase Firestore AND Local Registry
 */
export async function loginDeviceAccount(params: {
  username: string;
  password: string;
}): Promise<{ user: any; token: string }> {
  const username = (params.username || '').trim();
  if (!username || !params.password) {
    throw new Error('Invalid username or password. Please try again.');
  }

  const deviceId = getPersistentDeviceId();
  const { fingerprintHash } = await computeHardwareFingerprint();

  // 1. Attempt login via Backend API (/api/auth/login-device)
  const result = await safeFetchJson<{ user?: any; token?: string; error?: string }>(
    '/api/auth/login-device',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password: params.password,
        deviceId,
        fingerprintHash
      })
    }
  );

  if (result.ok && result.data?.token && result.data?.user) {
    const user = result.data.user;
    const token = result.data.token;
    const now = new Date().toISOString();

    try {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    } catch {}

    // Keep Firestore session & user lastLoginAt in sync
    saveUserToFirestore({ ...user, lastLoginAt: now }).catch(() => {});
    saveSessionToFirestore({
      token,
      userId: user.uid,
      username: user.username || username,
      deviceId: user.deviceId || deviceId,
      createdAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    }).catch(() => {});

    return { user, token };
  }

  // 2. Check Firebase Firestore & Local Registry (handles serverless cold-starts or static deployments)
  let fsUser: FirestoreAuthUserDoc | null = null;
  try {
    fsUser = await getUserByUsernameFromFirestore(username);
  } catch {}

  const localReg = getLocalRegistry();
  const matchedUser = fsUser || localReg.users[username.toLowerCase()] || null;

  if (matchedUser) {
    const isPasswordValid = await verifyPasswordClient(
      params.password,
      matchedUser.passwordHash,
      matchedUser.passwordSalt
    );

    if (!isPasswordValid) {
      throw new Error('Invalid username or password. Please try again.');
    }

    const now = new Date().toISOString();
    const token = `sess_${randomHex(24)}`;
    const updatedUser: FirestoreAuthUserDoc = {
      ...matchedUser,
      deviceId: matchedUser.deviceId || deviceId,
      deviceFingerprint: matchedUser.deviceFingerprint || fingerprintHash,
      lastLoginAt: now
    };
    const deviceRecord: FirestoreDeviceDoc = {
      deviceId: updatedUser.deviceId || deviceId,
      fingerprintHash,
      registeredUserId: updatedUser.uid,
      registeredUsername: updatedUser.username || username,
      firstRegisteredAt: updatedUser.createdAt || now,
      lastSeenAt: now,
      registrationLockActive: false
    };
    const sessionRecord: FirestoreSessionDoc = {
      token,
      userId: updatedUser.uid,
      username: updatedUser.username || username,
      deviceId: deviceRecord.deviceId,
      createdAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    };

    // Sync verified account back to Express backend & Firestore
    safeFetchJson('/api/auth/sync-device-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: updatedUser,
        device: deviceRecord,
        session: sessionRecord
      })
    }).catch(() => {});

    saveUserToFirestore(updatedUser).catch(() => {});
    saveDeviceToFirestore(deviceRecord).catch(() => {});
    saveSessionToFirestore(sessionRecord).catch(() => {});
    saveToLocalRegistry(updatedUser, deviceRecord);

    const cleanUser = sanitizeClientUser(updatedUser);
    try {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(cleanUser));
    } catch {}

    return { user: cleanUser, token };
  }

  throw new Error('Invalid username or password. Please try again.');
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

  // 1. Check Backend API
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
    }
  } catch {}

  // 2. Check Firebase Firestore session
  try {
    const fsSession = await getSessionFromFirestore(token);
    if (fsSession) {
      const fsUser = await getUserFromFirestore(fsSession.userId);
      if (fsUser) {
        const cleanUser = sanitizeClientUser(fsUser);
        try {
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(cleanUser));
        } catch {}
        return cleanUser;
      }
    }
  } catch {}

  // 3. Fallback to cached user if token exists
  try {
    const cached = localStorage.getItem(CACHED_USER_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}

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
    } catch {}

    deleteSessionFromFirestore(token).catch(() => {});
  }

  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(CACHED_USER_KEY);
    sessionStorage.removeItem('aivm_preview_mode');
  } catch {}
}
