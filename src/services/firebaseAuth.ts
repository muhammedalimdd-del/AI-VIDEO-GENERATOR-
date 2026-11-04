import { UserAccount, TrialStatus } from '../types/client.ts';
import { safeFetchJson } from './apiClient.ts';

export const auth: { currentUser: any } = { currentUser: null };

export const initAuthListener = (
  onUserChanged: (user: any | null, profile: UserAccount | null) => void
) => {
  onUserChanged(null, null);
  return () => {};
};

export const getCachedAccessToken = (): string | null => {
  return null;
};

export const fetchTrialEligibility = async (
  email: string,
  uid?: string
): Promise<{ eligible: boolean; trialStatus: TrialStatus }> => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (uid) params.append('uid', uid);

    const result = await safeFetchJson<{ eligible?: boolean; trialStatus?: TrialStatus }>(
      `/api/user/trial-eligibility?${params.toString()}`
    );
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

