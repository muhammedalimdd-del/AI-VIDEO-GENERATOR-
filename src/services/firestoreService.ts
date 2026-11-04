import { UserAccount, VideoRequestClient } from '../types/client.ts';
import { safeFetchJson } from './apiClient.ts';

const LOCAL_USERS_KEY = 'aivm_local_users_store';
const LOCAL_DEVICES_KEY = 'aivm_local_devices_store';
const LOCAL_SESSIONS_KEY = 'aivm_local_sessions_store';
const LOCAL_REQUESTS_KEY = 'studio_local_requests';
const LOCAL_BUDGETS_KEY = 'studio_budget_requests';

export interface FirestoreDeviceDoc {
  deviceId: string;
  fingerprintHash: string;
  registeredUserId: string;
  registeredUsername: string;
  firstRegisteredAt: string;
  lastSeenAt: string;
  registrationLockActive: boolean;
}

export interface FirestoreSessionDoc {
  token: string;
  userId: string;
  username: string;
  deviceId: string;
  createdAt: string;
  expiresAt: string;
}

export interface FirestoreAuthUserDoc extends UserAccount {
  passwordHash?: string;
  passwordSalt?: string;
  deviceFingerprint?: string;
}

function readLocalList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function writeLocalList<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

export async function saveUserToFirestore(user: FirestoreAuthUserDoc): Promise<void> {
  const users = readLocalList<FirestoreAuthUserDoc>(LOCAL_USERS_KEY);
  const idx = users.findIndex((u) => u.uid === user.uid);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user };
  } else {
    users.unshift(user);
  }
  writeLocalList(LOCAL_USERS_KEY, users);
}

export async function getUserFromFirestore(uid: string): Promise<FirestoreAuthUserDoc | null> {
  const users = readLocalList<FirestoreAuthUserDoc>(LOCAL_USERS_KEY);
  return users.find((u) => u.uid === uid) || null;
}

export async function getUserByUsernameFromFirestore(username: string): Promise<FirestoreAuthUserDoc | null> {
  const lower = username.trim().toLowerCase();
  const users = readLocalList<FirestoreAuthUserDoc>(LOCAL_USERS_KEY);
  return users.find((u) => (u.username || '').trim().toLowerCase() === lower) || null;
}

export async function getDeviceFromFirestore(
  deviceId?: string,
  fingerprintHash?: string
): Promise<FirestoreDeviceDoc | null> {
  const devices = readLocalList<FirestoreDeviceDoc>(LOCAL_DEVICES_KEY);
  if (deviceId) {
    const match = devices.find((d) => d.deviceId === deviceId);
    if (match) return match;
  }
  if (fingerprintHash) {
    const match = devices.find((d) => d.fingerprintHash === fingerprintHash);
    if (match) return match;
  }
  return null;
}

export async function saveDeviceToFirestore(device: FirestoreDeviceDoc): Promise<void> {
  const devices = readLocalList<FirestoreDeviceDoc>(LOCAL_DEVICES_KEY);
  const idx = devices.findIndex((d) => d.deviceId === device.deviceId);
  if (idx >= 0) {
    devices[idx] = { ...devices[idx], ...device };
  } else {
    devices.unshift(device);
  }
  writeLocalList(LOCAL_DEVICES_KEY, devices);
}

export async function saveSessionToFirestore(session: FirestoreSessionDoc): Promise<void> {
  const sessions = readLocalList<FirestoreSessionDoc>(LOCAL_SESSIONS_KEY);
  const idx = sessions.findIndex((s) => s.token === session.token);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  writeLocalList(LOCAL_SESSIONS_KEY, sessions);
}

export async function getSessionFromFirestore(token: string): Promise<FirestoreSessionDoc | null> {
  const sessions = readLocalList<FirestoreSessionDoc>(LOCAL_SESSIONS_KEY);
  const found = sessions.find((s) => s.token === token);
  if (!found) return null;
  if (new Date(found.expiresAt).getTime() <= Date.now()) return null;
  return found;
}

export async function deleteSessionFromFirestore(token: string): Promise<void> {
  const sessions = readLocalList<FirestoreSessionDoc>(LOCAL_SESSIONS_KEY);
  writeLocalList(
    LOCAL_SESSIONS_KEY,
    sessions.filter((s) => s.token !== token)
  );
}

export async function saveVideoRequestToFirestore(request: VideoRequestClient): Promise<void> {
  const requests = readLocalList<VideoRequestClient>(LOCAL_REQUESTS_KEY);
  const idx = requests.findIndex((r) => r.id === request.id);
  if (idx >= 0) {
    requests[idx] = { ...requests[idx], ...request };
  } else {
    requests.unshift(request);
  }
  writeLocalList(LOCAL_REQUESTS_KEY, requests);
}

export async function getVideoRequestsForUser(userId: string): Promise<VideoRequestClient[]> {
  const requests = readLocalList<VideoRequestClient>(LOCAL_REQUESTS_KEY);
  return requests.filter((r) => r.userId === userId);
}

export async function getVideoRequestById(requestId: string): Promise<VideoRequestClient | null> {
  const requests = readLocalList<VideoRequestClient>(LOCAL_REQUESTS_KEY);
  return requests.find((r) => r.id === requestId) || null;
}

export async function saveBudgetRequestToFirestore(budgetRequest: any): Promise<void> {
  const items = readLocalList<any>(LOCAL_BUDGETS_KEY);
  const idx = items.findIndex((b) => b.id === budgetRequest.id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...budgetRequest };
  } else {
    items.unshift(budgetRequest);
  }
  writeLocalList(LOCAL_BUDGETS_KEY, items);
}

export function subscribeToUserRequests(
  userId: string,
  onUpdate: (requests: VideoRequestClient[]) => void
) {
  getVideoRequestsForUser(userId)
    .then(onUpdate)
    .catch(() => {});
  return () => {};
}

export async function getAllVideoRequestsFromFirestore(): Promise<VideoRequestClient[]> {
  try {
    const token = localStorage.getItem('studio_admin_token') || 'videomaker2026';
    const res = await safeFetchJson<{ requests?: VideoRequestClient[] }>('/api/admin/requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok && Array.isArray(res.data?.requests)) {
      return res.data.requests;
    }
  } catch {}
  return readLocalList<VideoRequestClient>(LOCAL_REQUESTS_KEY);
}

export async function getAllBudgetRequestsFromFirestore(): Promise<any[]> {
  try {
    const token = localStorage.getItem('studio_admin_token') || 'videomaker2026';
    const res = await safeFetchJson<{ budgetRequests?: any[] }>('/api/admin/budget-requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok && Array.isArray(res.data?.budgetRequests)) {
      return res.data.budgetRequests;
    }
  } catch {}
  return readLocalList<any>(LOCAL_BUDGETS_KEY);
}

export async function getAllUsersFromFirestore(): Promise<UserAccount[]> {
  try {
    const token = localStorage.getItem('studio_admin_token') || 'videomaker2026';
    const res = await safeFetchJson<{ users?: UserAccount[] }>('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok && Array.isArray(res.data?.users)) {
      return res.data.users;
    }
  } catch {}
  return readLocalList<UserAccount>(LOCAL_USERS_KEY);
}

export async function seedInitialFirestoreData(_currentUser?: UserAccount | null): Promise<{
  success: boolean;
  seededCount: number;
  message: string;
}> {
  return {
    success: true,
    seededCount: 0,
    message: 'Backend database active (no Firebase dependency).'
  };
}

