import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, TrialStatus } from '../types/client.ts';

// Initialize Firebase App singleton with resilience
let app: any = null;
let auth: any = null;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn('Firebase initialization notice:', e);
}
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
      try {
        // Sync with backend to get persisted database user & trial status
        const res = await fetch('/api/auth/google-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          })
        });

        if (res.ok) {
          const data = await res.json();
          onUserChanged(firebaseUser, data.user);
          return;
        }
      } catch (err) {
        console.error('Failed to sync authenticated Google user with backend:', err);
      }

      // Fallback local profile if backend sync had a network error
      const fallbackProfile: UserAccount = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Google User',
        photoURL: firebaseUser.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        trialStatus: 'eligible'
      };
      onUserChanged(firebaseUser, fallbackProfile);
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
    const res = await fetch('/api/auth/google-sync', {
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
    if (res.ok) {
      const data = await res.json();
      profile = data.user;
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

    const res = await fetch(`/api/user/trial-eligibility?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return {
        eligible: !!data.eligible,
        trialStatus: data.trialStatus || 'eligible'
      };
    }
  } catch (e) {
    console.error('Failed to fetch trial eligibility:', e);
  }
  return { eligible: true, trialStatus: 'eligible' };
};
