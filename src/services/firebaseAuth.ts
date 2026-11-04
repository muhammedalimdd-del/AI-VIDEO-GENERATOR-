import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { auth } from './firebase.ts';
import { UserAccount, TrialStatus } from '../types/client.ts';
import { saveUserToFirestore, getUserFromFirestore } from './firestoreService.ts';
import { safeFetchJson } from './apiClient.ts';
export { auth };

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuthListener = (
  onUserChanged: (user: User | null, profile: UserAccount | null) => void
) => {
  if (!auth) {
    onUserChanged(null, null);
    return () => {};
  }
  try {
    return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      let resolvedProfile: UserAccount | null = null;
      try {
        // Sync with backend to get persisted database user & trial status
        const syncResult = await safeFetchJson<{ user?: UserAccount }>('/api/auth/google-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          })
        });

        if (syncResult.ok && syncResult.data?.user) {
          resolvedProfile = syncResult.data.user;
        }
      } catch (err) {
        console.error('Failed to sync authenticated Google user with backend:', err);
      }

      if (!resolvedProfile) {
        // Check Firestore first
        try {
          const fromFirestore = await getUserFromFirestore(firebaseUser.uid);
          if (fromFirestore) resolvedProfile = fromFirestore;
        } catch (e) {
          // ignore
        }
      }

      if (!resolvedProfile) {
        // Fallback local profile if backend sync had a network error
        resolvedProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Google User',
          photoURL: firebaseUser.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          trialStatus: 'eligible'
        };
      }

      // Synchronize with Firestore database
      saveUserToFirestore(resolvedProfile).catch((err) => {
        console.warn('Notice: Background Firestore user save:', err);
      });

      onUserChanged(firebaseUser, resolvedProfile);
    } else {
      cachedAccessToken = null;
      onUserChanged(null, null);
    }
  });
} catch (err) {
  console.warn('Firebase auth listener notice:', err);
  onUserChanged(null, null);
  return () => {};
}
};

export const signInWithGoogle = async (): Promise<{
  firebaseUser: User;
  profile: UserAccount;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    // Persist and fetch backend user profile
    const syncRes = await safeFetchJson<{ user?: UserAccount }>('/api/auth/google-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      })
    });

    let profile: UserAccount;
    if (syncRes.ok && syncRes.data?.user) {
      profile = syncRes.data.user;
    } else {
      profile = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        trialStatus: 'eligible'
      };
    }

    // Save to Firestore database
    try {
      await saveUserToFirestore(profile);
    } catch (fsErr) {
      console.warn('Notice: Firestore user write during signInWithGoogle:', fsErr);
    }

    return {
      firebaseUser: result.user,
      profile,
      accessToken: cachedAccessToken || ''
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const fetchTrialEligibility = async (
  email: string,
  uid?: string
): Promise<{ eligible: boolean; trialStatus: TrialStatus }> => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (uid) params.append('uid', uid);

    const result = await safeFetchJson<{ eligible?: boolean; trialStatus?: TrialStatus }>(`/api/user/trial-eligibility?${params.toString()}`);
    if (result.ok && result.data) {
      return {
        eligible: !!result.data.eligible,
        trialStatus: result.data.trialStatus || 'eligible'
      };
    }
  } catch (e) {
    console.error('Failed to fetch trial eligibility:', e);
  }
  return { eligible: true, trialStatus: 'eligible' };
};
