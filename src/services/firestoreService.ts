import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase.ts';
import { handleFirestoreError, OperationType } from './firestoreErrors.ts';
import { UserAccount, VideoRequestClient } from '../types/client.ts';

const USERS_COLLECTION = 'users';
const DEVICES_COLLECTION = 'devices';
const SESSIONS_COLLECTION = 'sessions';
const VIDEO_REQUESTS_COLLECTION = 'video_requests';
const BUDGET_REQUESTS_COLLECTION = 'budget_requests';

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

/**
 * Persist or update user profile document in Firestore (including optional auth fields)
 */
export async function saveUserToFirestore(user: FirestoreAuthUserDoc): Promise<void> {
  const path = `${USERS_COLLECTION}/${user.uid}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const payload: Record<string, any> = {
      uid: user.uid,
      username: user.username || user.displayName || 'Creator',
      email: user.email || `${(user.username || 'user').toLowerCase()}@aivideomaker.local`,
      displayName: user.displayName || user.username || 'Creator',
      photoURL: user.photoURL || '',
      createdAt: user.createdAt || new Date().toISOString(),
      lastLoginAt: user.lastLoginAt || new Date().toISOString(),
      trialStatus: user.trialStatus || 'eligible',
      role: user.role || 'user'
    };
    if (user.passwordHash) payload.passwordHash = user.passwordHash;
    if (user.passwordSalt) payload.passwordSalt = user.passwordSalt;
    if (user.deviceId) payload.deviceId = user.deviceId;
    if (user.deviceFingerprint) payload.deviceFingerprint = user.deviceFingerprint;

    await setDoc(userRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieve user profile from Firestore by UID
 */
export async function getUserFromFirestore(uid: string): Promise<FirestoreAuthUserDoc | null> {
  const path = `${USERS_COLLECTION}/${uid}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as FirestoreAuthUserDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Query a user profile in Firestore by username (case-insensitive match)
 */
export async function getUserByUsernameFromFirestore(username: string): Promise<FirestoreAuthUserDoc | null> {
  const path = USERS_COLLECTION;
  try {
    const trimmed = username.trim();
    const qExact = query(collection(db, USERS_COLLECTION), where('username', '==', trimmed));
    const exactSnap = await getDocs(qExact);
    if (!exactSnap.empty) {
      return exactSnap.docs[0].data() as FirestoreAuthUserDoc;
    }

    // Fallback case-insensitive scan across users collection
    const allSnap = await getDocs(collection(db, USERS_COLLECTION));
    const lower = trimmed.toLowerCase();
    for (const d of allSnap.docs) {
      const data = d.data() as FirestoreAuthUserDoc;
      if (data.username && data.username.trim().toLowerCase() === lower) {
        return data;
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Retrieve permanent device lock from Firestore by deviceId or fingerprintHash
 */
export async function getDeviceFromFirestore(
  deviceId?: string,
  fingerprintHash?: string
): Promise<FirestoreDeviceDoc | null> {
  try {
    if (deviceId) {
      const devRef = doc(db, DEVICES_COLLECTION, deviceId);
      const snap = await getDoc(devRef);
      if (snap.exists()) {
        return snap.data() as FirestoreDeviceDoc;
      }
    }
    if (fingerprintHash) {
      const qFp = query(
        collection(db, DEVICES_COLLECTION),
        where('fingerprintHash', '==', fingerprintHash)
      );
      const fpSnap = await getDocs(qFp);
      if (!fpSnap.empty) {
        return fpSnap.docs[0].data() as FirestoreDeviceDoc;
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${DEVICES_COLLECTION}/${deviceId || 'query'}`);
  }
}

/**
 * Save permanent device lock to Firestore
 */
export async function saveDeviceToFirestore(device: FirestoreDeviceDoc): Promise<void> {
  const path = `${DEVICES_COLLECTION}/${device.deviceId}`;
  try {
    const devRef = doc(db, DEVICES_COLLECTION, device.deviceId);
    await setDoc(
      devRef,
      {
        deviceId: device.deviceId,
        fingerprintHash: device.fingerprintHash,
        registeredUserId: device.registeredUserId,
        registeredUsername: device.registeredUsername,
        firstRegisteredAt: device.firstRegisteredAt,
        lastSeenAt: device.lastSeenAt,
        registrationLockActive: true
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save active session token to Firestore
 */
export async function saveSessionToFirestore(session: FirestoreSessionDoc): Promise<void> {
  const path = `${SESSIONS_COLLECTION}/${session.token}`;
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, session.token);
    await setDoc(sessionRef, session, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieve active session from Firestore by token
 */
export async function getSessionFromFirestore(token: string): Promise<FirestoreSessionDoc | null> {
  const path = `${SESSIONS_COLLECTION}/${token}`;
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, token);
    const snap = await getDoc(sessionRef);
    if (!snap.exists()) return null;
    const data = snap.data() as FirestoreSessionDoc;
    if (new Date(data.expiresAt).getTime() <= Date.now()) {
      return null;
    }
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Delete session from Firestore upon logout
 */
export async function deleteSessionFromFirestore(token: string): Promise<void> {
  const path = `${SESSIONS_COLLECTION}/${token}`;
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, token);
    await deleteDoc(sessionRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Persist a video request document to Firestore
 */
export async function saveVideoRequestToFirestore(
  request: VideoRequestClient
): Promise<void> {
  const path = `${VIDEO_REQUESTS_COLLECTION}/${request.id}`;
  try {
    const reqRef = doc(db, VIDEO_REQUESTS_COLLECTION, request.id);
    const payload = {
      id: request.id,
      accessToken: request.accessToken || '',
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      status: request.status,
      userId: request.userId || auth.currentUser?.uid || '',
      userEmail: request.userEmail || auth.currentUser?.email || request.customerEmail,
      customerUsername: request.customerUsername || '',
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      deliveryEmail: request.customerEmail,
      requestType: request.requestType === 'free_trial' ? 'free_trial' : 'paid_order',
      pricingMessage: request.pricingMessage || 'Custom Video Request',
      title: request.title,
      videoType: request.videoType || 'Cinematic',
      purpose: request.purpose || 'General',
      summary: (request.summary || '').slice(0, 2048),
      style: request.style,
      format: request.format || 'portrait',
      aspectRatio: request.aspectRatio || '9:16',
      duration: request.duration || '30 seconds',
      characters: Array.isArray(request.characters) ? request.characters : [],
      storyDescription: (request.storyDescription || '').slice(0, 5000),
      quotedPrice: request.quote?.amount || 0
    };
    await setDoc(reqRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Query all video requests created by a specific user from Firestore
 */
export async function getVideoRequestsForUser(
  userId: string
): Promise<VideoRequestClient[]> {
  const path = VIDEO_REQUESTS_COLLECTION;
  try {
    const q = query(
      collection(db, VIDEO_REQUESTS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const items: VideoRequestClient[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as VideoRequestClient);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Fetch a single video request by ID from Firestore
 */
export async function getVideoRequestById(
  requestId: string
): Promise<VideoRequestClient | null> {
  const path = `${VIDEO_REQUESTS_COLLECTION}/${requestId}`;
  try {
    const reqRef = doc(db, VIDEO_REQUESTS_COLLECTION, requestId);
    const snap = await getDoc(reqRef);
    if (!snap.exists()) return null;
    return snap.data() as VideoRequestClient;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Persist a budget contact inquiry to Firestore
 */
export async function saveBudgetRequestToFirestore(
  budgetRequest: any
): Promise<void> {
  const path = `${BUDGET_REQUESTS_COLLECTION}/${budgetRequest.id}`;
  try {
    const docRef = doc(db, BUDGET_REQUESTS_COLLECTION, budgetRequest.id);
    const payload = {
      id: budgetRequest.id,
      createdAt: budgetRequest.createdAt || new Date().toISOString(),
      updatedAt: budgetRequest.updatedAt || new Date().toISOString(),
      status: budgetRequest.status || 'New',
      userId: budgetRequest.userId || auth.currentUser?.uid || '',
      customerName: budgetRequest.customerName,
      customerEmail: budgetRequest.customerEmail,
      videoIdea: (budgetRequest.videoIdea || '').slice(0, 4096),
      message: (budgetRequest.message || '').slice(0, 4096),
      videoType: budgetRequest.videoType || 'realistic',
      format: budgetRequest.format || 'portrait',
      duration: budgetRequest.duration || '30 seconds',
      budgetOption: budgetRequest.budgetOption || 'FREE',
      budgetAmount: budgetRequest.budgetAmount || '₹0'
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener for customer requests with error handling
 */
export function subscribeToUserRequests(
  userId: string,
  onUpdate: (requests: VideoRequestClient[]) => void
) {
  const path = VIDEO_REQUESTS_COLLECTION;
  const q = query(
    collection(db, VIDEO_REQUESTS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const results: VideoRequestClient[] = [];
      snapshot.forEach((d) => {
        results.push(d.data() as VideoRequestClient);
      });
      onUpdate(results);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Fetch all video requests from Firestore (admin access)
 */
export async function getAllVideoRequestsFromFirestore(): Promise<VideoRequestClient[]> {
  const path = VIDEO_REQUESTS_COLLECTION;
  try {
    const querySnapshot = await getDocs(collection(db, VIDEO_REQUESTS_COLLECTION));
    const items: VideoRequestClient[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as VideoRequestClient);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Fetch all budget requests from Firestore (admin access)
 */
export async function getAllBudgetRequestsFromFirestore(): Promise<any[]> {
  const path = BUDGET_REQUESTS_COLLECTION;
  try {
    const querySnapshot = await getDocs(collection(db, BUDGET_REQUESTS_COLLECTION));
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data());
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Fetch all users from Firestore (admin access)
 */
export async function getAllUsersFromFirestore(): Promise<UserAccount[]> {
  const path = USERS_COLLECTION;
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const items: UserAccount[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as UserAccount);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Seed initial sample documents into Firebase Firestore database
 */
export async function seedInitialFirestoreData(currentUser?: UserAccount | null): Promise<{
  success: boolean;
  seededCount: number;
  message: string;
}> {
  const currentUid = auth.currentUser?.uid || currentUser?.uid || 'google-admin-usr-01';
  const currentEmail = auth.currentUser?.email || currentUser?.email || 'muhammedalimdd@gmail.com';
  const currentName = auth.currentUser?.displayName || currentUser?.displayName || 'Muhammed Ali';

  let count = 0;

  // 1. Seed admin role doc if admin email
  if (currentEmail === 'muhammedalimdd@gmail.com' || auth.currentUser?.email === 'muhammedalimdd@gmail.com') {
    try {
      await setDoc(
        doc(db, 'admins', currentUid),
        {
          email: currentEmail,
          role: 'superadmin',
          createdAt: new Date().toISOString()
        },
        { merge: true }
      );
      count++;
    } catch (e) {
      console.warn('Notice: Seeding admin doc in Firestore:', e);
    }
  }

  // 2. Seed primary demo video request
  const demoReqId = 'AVM-2026-8941';
  try {
    await setDoc(
      doc(db, VIDEO_REQUESTS_COLLECTION, demoReqId),
      {
        id: demoReqId,
        accessToken: 'sec_78a1c9e89b3f46028d7122b0f4',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'In Production',
        userId: currentUid,
        userEmail: currentEmail,
        customerName: currentName,
        deliveryEmail: currentEmail,
        requestType: 'free_trial',
        pricingMessage: 'One-Time Free Trial (Verified)',
        title: 'Neon Cyberpunk Detective Short',
        videoType: 'YouTube Shorts / Cinematic Story',
        purpose: 'YouTube Shorts & Reels',
        summary: 'A fast-paced neon rainy cyberpunk chase where Detective Sean tracks a rogue synthetic android in New Kyoto.',
        style: 'Realistic cinematic',
        format: 'portrait',
        aspectRatio: '9:16',
        storyDescription: 'Cold opening on rainy rooftop overlooking holographic skyscrapers. Vance traces an encrypted signal. In the alleyway below, Echo-09 looks directly up and triggers optical camouflage. Vance drops down, grappling hook sparks against brick, leading into a thrilling neon chase that cuts right before confrontation.',
        quotedPrice: 0
      },
      { merge: true }
    );
    count++;
  } catch (e) {
    console.warn('Notice: Seeding demoReqId in Firestore:', e);
  }

  // 3. Seed second sample video request
  const sampleReq2Id = 'AVM-2026-4420';
  try {
    await setDoc(
      doc(db, VIDEO_REQUESTS_COLLECTION, sampleReq2Id),
      {
        id: sampleReq2Id,
        accessToken: 'sec_99c3d4a1b2',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'Approved',
        userId: currentUid,
        userEmail: currentEmail,
        customerName: currentName,
        deliveryEmail: currentEmail,
        requestType: 'paid_order',
        pricingMessage: 'Standard Custom Video (₹299)',
        title: 'The Lost Jungle Temple Adventure',
        videoType: 'Landscape Cinematic 4K',
        purpose: 'YouTube Cinematic',
        summary: 'Golden hour drone sweeps across mountain ranges, uncovering ancient moss-covered ruins with glowing glyphs.',
        style: 'Adventure Videos',
        format: 'landscape',
        aspectRatio: '16:9',
        storyDescription: 'Expedition party approaches misty canyon. Ancient stone gate responds to solar medallion.',
        quotedPrice: 299
      },
      { merge: true }
    );
    count++;
  } catch (e) {
    console.warn('Notice: Seeding sampleReq2Id in Firestore:', e);
  }

  // 4. Seed sample budget inquiry
  const sampleBudgetId = 'BR-2026-1042';
  try {
    await setDoc(
      doc(db, BUDGET_REQUESTS_COLLECTION, sampleBudgetId),
      {
        id: sampleBudgetId,
        createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'In Review',
        userId: currentUid,
        customerName: currentName,
        customerEmail: currentEmail,
        videoIdea: 'Custom animated explainer with 3D character avatars and dynamic title cards.',
        message: 'Looking for a 60-second video with upbeat background music and voiceover delivery.',
        videoType: 'animated',
        format: 'portrait',
        duration: '1 minute',
        budgetOption: 'STANDARD',
        budgetAmount: '₹299'
      },
      { merge: true }
    );
    count++;
  } catch (e) {
    console.warn('Notice: Seeding sampleBudgetId in Firestore:', e);
  }

  return {
    success: count > 0,
    seededCount: count,
    message: `Successfully populated ${count} documents in Firebase Firestore!`
  };
}
