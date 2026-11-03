import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase.ts';
import { handleFirestoreError, OperationType } from './firestoreErrors.ts';
import { UserAccount, VideoRequestClient } from '../types/client.ts';

const USERS_COLLECTION = 'users';
const VIDEO_REQUESTS_COLLECTION = 'video_requests';
const BUDGET_REQUESTS_COLLECTION = 'budget_requests';

/**
 * Persist or update user profile document in Firestore
 */
export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  const path = `${USERS_COLLECTION}/${user.uid}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const payload = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Creator',
      photoURL: user.photoURL || '',
      createdAt: user.createdAt || new Date().toISOString(),
      lastLoginAt: user.lastLoginAt || new Date().toISOString(),
      trialStatus: user.trialStatus || 'eligible',
      role: user.role || 'user'
    };
    await setDoc(userRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieve user profile from Firestore by UID
 */
export async function getUserFromFirestore(uid: string): Promise<UserAccount | null> {
  const path = `${USERS_COLLECTION}/${uid}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as UserAccount;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
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
      customerName: request.customerName,
      deliveryEmail: request.customerEmail,
      requestType: request.requestType === 'free_trial' ? 'free_trial' : 'paid_order',
      pricingMessage: request.pricingMessage || 'Custom Video Request',
      title: request.title,
      videoType: request.videoType || 'Cinematic',
      purpose: request.purpose || 'General',
      summary: (request.summary || '').slice(0, 2048),
      style: request.style,
      format: request.format,
      aspectRatio: request.aspectRatio,
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
