export type VideoStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Awaiting Customer Information'
  | 'Approved'
  | 'In Production'
  | 'Quality Check'
  | 'Completed'
  | 'Delivered'
  | 'Cancelled';

export type TrialStatus = 'eligible' | 'reserved' | 'used';

export interface VideoStyleOption {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  imageUrl: string;
  recommendedFor: string;
  aspectSupport: string;
}

export interface UserAccount {
  uid: string;
  username?: string;
  email: string;
  displayName: string;
  deviceId?: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  trialStatus: TrialStatus;
  trialUsedAt?: string;
  trialRequestId?: string;
  role?: 'user' | 'admin';
}

export interface QuoteDetails {
  amount: number;
  currency: string;
  formattedAmount: string;
  breakdown?: string;
  validUntil?: string;
  paymentLink?: string;
  status: 'pending' | 'sent' | 'accepted' | 'declined';
  sentAt?: string;
  respondedAt?: string;
  adminNotes?: string;
}

export interface PaymentDetails {
  status: 'not_required' | 'pending' | 'paid' | 'verified';
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  transactionRef?: string;
  paidAt?: string;
  verifiedAt?: string;
}

export interface CharacterItem {
  id: string;
  name: string;
  role: string;
  ageRange?: string;
  appearance: string;
  clothing?: string;
  hairstyle?: string;
  personality?: string;
  dialogue?: string;
  actions?: string;
  sceneAppearances?: string;
  referencePhotoUrl?: string;
  referencePhotoName?: string;
}

export interface SceneItem {
  id: string;
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  charactersPresent: string;
  actions: string;
  dialogue?: string;
  cameraMovement: string;
  lightingAtmosphere: string;
  soundPreferences?: string;
  estimatedDuration: string;
}

export interface DialogueLine {
  id: string;
  character: string;
  text: string;
  language: string;
  pronunciationNotes?: string;
}

export interface CompletedVideoDetails {
  url?: string;
  filename?: string;
  uploadedAt: string;
  message?: string;
  sizeBytes?: number;
  downloadUrl?: string;
  directLink?: string;
}

export interface StatusHistoryEntry {
  status: VideoStatus;
  timestamp: string;
  note?: string;
  changedBy: string;
}

export interface VideoRequestClient {
  id: string;
  accessToken: string;
  createdAt: string;
  updatedAt: string;
  status: VideoStatus;
  userId?: string;
  userEmail?: string;
  requestType: 'free_trial' | 'paid';
  pricingMessage: string;
  quote?: QuoteDetails;
  payment?: PaymentDetails;
  title: string;
  videoType: string;
  purpose: string;
  summary: string;
  style: string;
  customStyle?: string;
  format: 'portrait' | 'landscape' | 'square';
  aspectRatio: string;
  resolution: string;
  targetPlatform: string;
  language?: string;
  characters: CharacterItem[];
  characterMode: 'photos_only' | 'fictional_only' | 'both';
  characterConsistencyNote?: string;
  photoConsentConfirmed: boolean;
  storyDescription: string;
  scenes: SceneItem[];
  dialogueLines: DialogueLine[];
  additionalInstructions?: string;
  duration: string;
  customDuration?: string;
  outputResolution: string;
  visualFinish: string;
  cameraMovementPref: string;
  voiceOverPref: string;
  dialoguePref: string;
  subtitles: boolean;
  backgroundMusic: string;
  soundEffects: boolean;
  endingText?: string;
  customerName: string;
  customerUsername?: string;
  customerEmail: string;
  customerPhone?: string;
  emailNotifications: boolean;
  termsAccepted: boolean;
  estimatedCompletionDate?: string;
  customerVisibleNotes?: string;
  completedVideo?: CompletedVideoDetails;
  statusHistory: StatusHistoryEntry[];
}

export interface RequestFormData {
  // Account & Trial
  userId?: string;
  userEmail?: string;
  customerUsername?: string;
  requestType: 'free_trial' | 'paid';

  // Step 1: Basic
  title: string;
  videoType: string;
  purpose: string;
  summary: string;

  // Step 2: Style
  style: string;
  customStyle: string;

  // Step 3: Format
  format: 'portrait' | 'landscape' | 'square';
  aspectRatio: string;
  resolution: string;
  targetPlatform: string;

  // Step 4: Characters
  characters: CharacterItem[];
  characterMode: 'photos_only' | 'fictional_only' | 'both';
  characterConsistencyNote: string;
  photoConsentConfirmed: boolean;

  // Step 5: Story & Scenes
  storyDescription: string;
  scenes: SceneItem[];
  dialogueLines: DialogueLine[];
  additionalInstructions: string;
  language: string; // Malayalam, English, Hindi, Arabic, etc.

  // Step 6: Duration & Quality
  duration: string;
  customDuration: string;
  outputResolution: string;
  visualFinish: string;
  cameraMovementPref: string;
  voiceOverPref: string;
  dialoguePref: string;
  subtitles: boolean;
  backgroundMusic: string;
  soundEffects: boolean;
  endingText: string;

  // Step 7: Customer Delivery
  customerName: string;
  customerEmail: string;
  confirmEmail: string;
  customerPhone: string;
  emailNotifications: boolean;
  termsAccepted: boolean;
}
