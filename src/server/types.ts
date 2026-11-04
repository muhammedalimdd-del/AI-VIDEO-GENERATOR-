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

export interface DeviceRegistration {
  deviceId: string;
  fingerprintHash: string;
  registeredUserId: string;
  registeredUsername: string;
  ipSubnet: string;
  userAgent: string;
  firstRegisteredAt: string;
  lastSeenAt: string;
  registrationLockActive: boolean;
}

export interface AuthSession {
  token: string;
  userId: string;
  username: string;
  deviceId: string;
  createdAt: string;
  expiresAt: string;
}

export interface UserAccount {
  uid: string; // User ID
  username: string; // Unique locked username
  email: string; // User email / contact email
  displayName: string;
  passwordHash?: string; // Salted scrypt/PBKDF2 hash
  passwordSalt?: string; // Cryptographic salt
  deviceId?: string; // Associated device ID
  deviceFingerprint?: string; // Hardware/GPU canvas fingerprint
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  trialStatus: TrialStatus;
  trialUsedAt?: string;
  trialRequestId?: string;
  role?: 'user' | 'admin';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  adminEmail: string;
  targetUserEmail: string;
  details: string;
}

export interface QuoteDetails {
  amount: number;
  currency: string; // e.g. "₹"
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

export interface StatusHistoryEntry {
  status: VideoStatus;
  timestamp: string;
  note?: string;
  changedBy: string;
}

export interface ClarificationMessage {
  id: string;
  from: 'admin' | 'customer';
  message: string;
  timestamp: string;
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

export interface VideoRequest {
  id: string;
  accessToken: string; // Secret tracking token for customer
  createdAt: string;
  updatedAt: string;
  status: VideoStatus;

  // User & Request Type
  userId?: string;
  userEmail?: string;
  requestType: 'free_trial' | 'paid';
  pricingMessage: string; // "One-Time Free Trial" or "The payment will be based on the video."
  quote?: QuoteDetails;
  payment?: PaymentDetails;

  // Step 1: Basic
  title: string;
  videoType: string;
  purpose: string;
  summary: string;

  // Step 2: Style
  style: string;
  customStyle?: string;

  // Step 3: Format
  format: 'portrait' | 'landscape' | 'square';
  aspectRatio: string;
  resolution: string;
  targetPlatform: string;

  // Step 4: Characters
  characters: CharacterItem[];
  characterMode: 'photos_only' | 'fictional_only' | 'both';
  characterConsistencyNote?: string;
  photoConsentConfirmed: boolean;

  // Step 5: Story & Scenes
  storyDescription: string;
  scenes: SceneItem[];
  dialogueLines: DialogueLine[];
  additionalInstructions?: string;
  language?: string; // Malayalam, English, Hindi, Arabic, etc.

  // Step 6: Length & Quality
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

  // Step 7: Customer Delivery
  customerName: string;
  customerUsername?: string;
  customerEmail: string; // Customer's preferred delivery email address
  customerPhone?: string;
  emailNotifications: boolean;
  termsAccepted: boolean;

  // Admin & Processing details
  estimatedCompletionDate?: string;
  customerVisibleNotes?: string;
  internalAdminNotes: string[];
  completedVideo?: CompletedVideoDetails;
  statusHistory: StatusHistoryEntry[];
  clarifications: ClarificationMessage[];
}

// ---------------- BUDGET / CONTACT REQUEST TYPES ----------------

export type BudgetRequestStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Accepted'
  | 'Declined'
  | 'In Production'
  | 'Completed';

export interface BudgetReply {
  id: string;
  from: 'admin' | 'customer';
  message: string;
  timestamp: string;
}

export interface BudgetRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: BudgetRequestStatus;

  // Fields
  fullName: string;
  email: string;
  videoIdea: string;
  detailedMessage?: string;
  preferredVideoType: string;
  videoFormat: 'portrait' | 'landscape' | 'square';
  aspectRatio: string;
  preferredDuration: string;
  budgetCategory: 'FREE' | 'BASIC' | 'STANDARD' | 'PREMIUM' | 'CUSTOM';
  budgetAmount: string;
  isFree: boolean;
  referencePhotoUrl?: string;
  referencePhotoName?: string;
  additionalInstructions?: string;

  // Admin management
  internalNotes: string[];
  replies: BudgetReply[];
}

export interface EmailLog {
  id: string;
  requestId: string;
  type:
    | 'owner_new_request'
    | 'customer_confirmation'
    | 'video_delivery'
    | 'clarification'
    | 'status_update'
    | 'quote_sent'
    | 'payment_confirmed'
    | 'budget_request_owner'
    | 'budget_request_customer'
    | 'budget_request_reply'
    | 'test_connection';
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'simulated';
  error?: string;
  sentAt: string;
  htmlBody: string;
  textBody: string;
}

export interface DatabaseSchema {
  users: UserAccount[];
  devices: DeviceRegistration[];
  sessions: AuthSession[];
  requests: VideoRequest[];
  budgetRequests: BudgetRequest[];
  emailLogs: EmailLog[];
  auditLogs: AuditLog[];
  settings: {
    ownerNotificationEmail: string;
    emailFromAddress: string;
    defaultTurnaroundDays: number;
    emailProvider?: 'gmail' | 'smtp' | 'resend' | 'sendgrid';
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    smtpUser?: string;
    smtpPass?: string;
    apiKey?: string;
    lastTestedAt?: string;
    lastTestStatus?: 'success' | 'failed';
    lastTestError?: string;
  };
}
