import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  DatabaseSchema,
  VideoRequest,
  BudgetRequest,
  EmailLog,
  VideoStatus,
  UserAccount,
  AuditLog,
  QuoteDetails,
  PaymentDetails,
  TrialStatus
} from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const defaultOwnerEmail = process.env.OWNER_NOTIFICATION_EMAIL || 'muhammedalimdd@gmail.com';
const defaultFromEmail = process.env.EMAIL_FROM_ADDRESS || 'studio@aivideomaker.com';

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      uid: 'google-sample-usr-01',
      email: 'muhammedalimdd@gmail.com',
      displayName: 'Muhammed Ali',
      photoURL: '',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      lastLoginAt: new Date().toISOString(),
      trialStatus: 'eligible',
      role: 'admin'
    }
  ],
  auditLogs: [],
  requests: [
    {
      id: 'AVM-2026-8941',
      accessToken: 'sec_78a1c9e89b3f46028d7122b0f4',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      status: 'In Production',
      userId: 'google-sample-usr-01',
      userEmail: 'muhammedalimdd@gmail.com',
      requestType: 'free_trial',
      pricingMessage: 'One-Time Free Trial',
      title: 'Neon Cyberpunk Detective Short',
      videoType: 'YouTube Shorts / Cinematic Story',
      purpose: 'YouTube Shorts',
      summary: 'A fast-paced neon rainy cyberpunk chase where Detective Sean tracks a rogue synthetic android in New Kyoto.',
      style: 'Realistic cinematic',
      format: 'portrait',
      aspectRatio: '9:16',
      resolution: '1080 × 1920',
      targetPlatform: 'YouTube Shorts & Instagram Reels',
      language: 'English',
      characters: [
        {
          id: 'char-1',
          name: 'Detective Sean Vance',
          role: 'Main protagonist',
          ageRange: '35-40',
          appearance: 'Weathered trench coat, cybernetic glowing blue iris on right eye, wet silver-streaked dark hair.',
          clothing: 'Heavy tactical charcoal duster coat, high collar with amber LED status rim.',
          hairstyle: 'Messy slicked back from rain',
          personality: 'Gritty, laser-focused, quiet determination.',
          dialogue: 'The city never sleeps... and neither do the ghosts we built.',
          actions: 'Stands on rooftop edge holding holographic scanner, dashes down fire escape.',
          sceneAppearances: 'Scenes 1, 2, 3',
        },
        {
          id: 'char-2',
          name: 'Echo-09',
          role: 'Rogue android',
          ageRange: 'Apparent 20s',
          appearance: 'Sleek chrome accents on cheekbones, reflective visor helmet, holographic jacket.',
          clothing: 'Iridescent lightweight runners windbreaker, high top magnetic boots.',
          hairstyle: 'Short violet bob hairstyle',
          personality: 'Agile, enigmatic, evasive.',
          dialogue: 'You are chasing yesterday, detective.',
          actions: 'Leaps across illuminated neon billboards, vanishes into optical camouflage.',
          sceneAppearances: 'Scene 2, 3',
        }
      ],
      characterMode: 'fictional_only',
      characterConsistencyNote: 'Maintain Vance’s glowing blue right eye and Echo-09’s violet bob hair across all angles.',
      photoConsentConfirmed: true,
      storyDescription: 'Cold opening on rainy rooftop overlooking holographic skyscrapers. Vance traces an encrypted signal. In the alleyway below, Echo-09 looks directly up and triggers optical camouflage. Vance drops down, grappling hook sparks against brick, leading into a thrilling neon chase that cuts right before confrontation.',
      scenes: [
        {
          id: 'sc-1',
          sceneNumber: 1,
          location: 'Rooftop of Sector 7 Tower, New Kyoto',
          timeOfDay: 'Midnight during torrential neon rain',
          charactersPresent: 'Detective Sean Vance',
          actions: 'Pulls collar against rain, flips open holographic beacon tracking scanner.',
          cameraMovement: 'Slow push-in from wide skyline to extreme close-up of cybernetic blue eye',
          lightingAtmosphere: 'Deep obsidian night with hot magenta & electric teal volumetric rain illumination',
          estimatedDuration: '8s'
        },
        {
          id: 'sc-2',
          sceneNumber: 2,
          location: 'Narrow alleyway below billboards',
          timeOfDay: 'Midnight',
          charactersPresent: 'Echo-09 and Detective Vance in pursuit',
          actions: 'Echo-09 sprints, vaults over electromagnetic fence, vanishes into prismatic shimmer.',
          cameraMovement: 'Fast low-angle tracking dolly following footwork through neon puddles',
          lightingAtmosphere: 'Flickering neon kanji signs, reflections in wet asphalt',
          estimatedDuration: '12s'
        }
      ],
      dialogueLines: [
        {
          id: 'dl-1',
          character: 'Detective Vance',
          text: 'Signal locked. Sector seven lower catwalks.',
          language: 'English',
          pronunciationNotes: 'Low raspy voice, measured breath'
        }
      ],
      additionalInstructions: 'Atmospheric synthesized dark-synth soundtrack, sound of water splashing, humming holographic neon signs.',
      duration: '30s',
      outputResolution: '1080p Full HD (1080 × 1920)',
      visualFinish: 'Cinematic color graded with subtle anamorphic lens flares',
      cameraMovementPref: 'Dynamic tracking & cinematic dolly',
      voiceOverPref: 'Deep gritty male voiceover',
      dialoguePref: 'Included in scenes',
      subtitles: true,
      backgroundMusic: 'Dark Synthwave / Cyberpunk Ambient',
      soundEffects: true,
      endingText: 'Case File 09: To Be Continued',
      customerName: 'Muhammed Ali',
      customerEmail: 'muhammedalimdd@gmail.com',
      emailNotifications: true,
      termsAccepted: true,
      estimatedCompletionDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      customerVisibleNotes: 'Character reference sheets reviewed. Production underway with photorealistic lighting.',
      internalAdminNotes: ['Rendered scenes 1 and 2. Final color grading pending.'],
      statusHistory: [
        {
          status: 'Submitted',
          timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          changedBy: 'system',
          note: 'Request received from verified Google account with 1-time free trial.'
        },
        {
          status: 'Under Review',
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          changedBy: 'admin',
          note: 'Approved for free trial production.'
        },
        {
          status: 'In Production',
          timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          changedBy: 'admin',
          note: 'Scenes actively compiling.'
        }
      ],
      clarifications: []
    }
  ],
  emailLogs: [],
  budgetRequests: [],
  settings: {
    ownerNotificationEmail: defaultOwnerEmail,
    emailFromAddress: defaultFromEmail,
    defaultTurnaroundDays: 3,
    emailProvider: 'gmail',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: defaultOwnerEmail,
    smtpPass: ''
  }
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.requests)) {
          if (!Array.isArray(parsed.budgetRequests)) {
            parsed.budgetRequests = [];
          }
          if (!Array.isArray(parsed.users)) {
            parsed.users = [];
          }
          if (!Array.isArray(parsed.auditLogs)) {
            parsed.auditLogs = [];
          }
          if (!parsed.settings) {
            parsed.settings = INITIAL_DB.settings;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse database file, initializing fresh:', e);
    }
    this.persist(INITIAL_DB);
    return INITIAL_DB;
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
      this.data = dataToSave;
    } catch (err) {
      console.error('Database write error:', err);
      throw err;
    }
  }

  // ---------------- USER ACCOUNT METHODS ----------------

  public getUserByUid(uid: string): UserAccount | undefined {
    return this.data.users.find((u) => u.uid === uid);
  }

  public getUserByEmail(email: string): UserAccount | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.trim().toLowerCase() === normalized);
  }

  public getAllUsers(): UserAccount[] {
    return [...this.data.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public syncUser(payload: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  }): UserAccount {
    const normalizedEmail = payload.email.trim().toLowerCase();
    let user = this.data.users.find(
      (u) => u.uid === payload.uid || u.email.trim().toLowerCase() === normalizedEmail
    );

    const now = new Date().toISOString();

    if (user) {
      // Update existing user profile
      user.uid = payload.uid; // sync Google UID
      user.email = normalizedEmail;
      if (payload.displayName) user.displayName = payload.displayName;
      if (payload.photoURL) user.photoURL = payload.photoURL;
      user.lastLoginAt = now;
      this.persist({ ...this.data });
      return user;
    }

    // Create new persistent user record
    const newUser: UserAccount = {
      uid: payload.uid,
      email: normalizedEmail,
      displayName: payload.displayName || normalizedEmail.split('@')[0],
      photoURL: payload.photoURL || '',
      createdAt: now,
      lastLoginAt: now,
      trialStatus: 'eligible', // Fresh eligible account
      role: normalizedEmail === 'muhammedalimdd@gmail.com' ? 'admin' : 'user'
    };

    this.data.users.push(newUser);
    this.persist({ ...this.data });
    return newUser;
  }

  public updateUserTrialStatus(
    uidOrEmail: string,
    newStatus: TrialStatus,
    adminEmail: string,
    reason: string
  ): { user: UserAccount; audit: AuditLog } | null {
    const user = this.data.users.find(
      (u) => u.uid === uidOrEmail || u.email.toLowerCase() === uidOrEmail.toLowerCase()
    );
    if (!user) return null;

    const previousStatus = user.trialStatus;
    user.trialStatus = newStatus;
    if (newStatus === 'eligible') {
      user.trialUsedAt = undefined;
      user.trialRequestId = undefined;
    }

    const audit: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: 'UPDATE_TRIAL_STATUS',
      adminEmail,
      targetUserEmail: user.email,
      details: `Changed trial status from ${previousStatus} to ${newStatus}. Reason: ${reason}`
    };

    this.data.auditLogs.unshift(audit);
    this.persist({ ...this.data });
    return { user, audit };
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // ---------------- VIDEO REQUEST METHODS ----------------

  public getAllRequests(): VideoRequest[] {
    return [...this.data.requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getUserRequests(emailOrUid: string): VideoRequest[] {
    const term = emailOrUid.trim().toLowerCase();
    return this.data.requests
      .filter(
        (r) =>
          r.userId === emailOrUid ||
          r.userEmail?.toLowerCase() === term ||
          r.customerEmail.toLowerCase() === term
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getRequestById(id: string): VideoRequest | undefined {
    return this.data.requests.find((r) => r.id.toLowerCase() === id.trim().toLowerCase());
  }

  public getRequestByToken(id: string, token: string): VideoRequest | undefined {
    return this.data.requests.find(
      (r) =>
        r.id.toLowerCase() === id.trim().toLowerCase() &&
        r.accessToken.toLowerCase() === token.trim().toLowerCase()
    );
  }

  public createRequest(
    requestData: Omit<VideoRequest, 'id' | 'accessToken' | 'createdAt' | 'updatedAt' | 'status' | 'statusHistory' | 'clarifications' | 'internalAdminNotes'>
  ): { request: VideoRequest; isFreeTrial: boolean } {
    // Generate IDs
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const newId = `AVM-2026-${randomHex}`;
    const accessToken = `sec_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date().toISOString();

    const normalizedEmail = requestData.customerEmail.trim().toLowerCase();
    const user = this.data.users.find(
      (u) =>
        (requestData.userId && u.uid === requestData.userId) ||
        u.email.toLowerCase() === normalizedEmail
    );

    const isFreeTrial = requestData.requestType === 'free_trial';

    // ATOMIC FREE TRIAL ENFORCEMENT
    if (isFreeTrial) {
      if (!user) {
        throw new Error('A verified Google account is required to claim a free trial.');
      }
      if (user.trialStatus !== 'eligible') {
        throw new Error('This Google account has already used its one-time free trial. Please submit a paid video request.');
      }

      // Mark trial as used atomically
      user.trialStatus = 'used';
      user.trialUsedAt = now;
      user.trialRequestId = newId;
    }

    try {
      const newRequest: VideoRequest = {
        ...requestData,
        id: newId,
        accessToken,
        createdAt: now,
        updatedAt: now,
        status: 'Submitted',
        pricingMessage: isFreeTrial
          ? 'One-Time Free Trial'
          : 'The payment will be based on the video.',
        quote:
          requestData.quote ||
          (isFreeTrial
            ? undefined
            : {
                status: 'pending',
                amount: 0,
                currency: '₹',
                formattedAmount: 'Quote pending review'
              }),
        payment:
          requestData.payment ||
          (isFreeTrial
            ? { status: 'not_required' }
            : { status: 'pending' }),
        internalAdminNotes: [
          isFreeTrial
            ? `Submitted as 1-Time Free Trial by verified user ${normalizedEmail}.`
            : `Submitted as Paid Request. Price to be quoted based on creative brief.`
        ],
        statusHistory: [
          {
            status: 'Submitted',
            timestamp: now,
            changedBy: 'customer',
            note: isFreeTrial
              ? 'Request received via 1-time free trial.'
              : 'Paid request submitted. Initial review pending.'
          }
        ],
        clarifications: []
      };

      this.data.requests.unshift(newRequest);
      this.persist({ ...this.data });
      return { request: newRequest, isFreeTrial };
    } catch (err) {
      // Rollback trial eligibility if request saving failed
      if (isFreeTrial && user) {
        user.trialStatus = 'eligible';
        user.trialUsedAt = undefined;
        user.trialRequestId = undefined;
        this.persist({ ...this.data });
      }
      throw err;
    }
  }

  public updateRequest(
    id: string,
    updates: Partial<VideoRequest>,
    changedBy: string = 'admin',
    statusNote?: string
  ): VideoRequest | null {
    const index = this.data.requests.findIndex((r) => r.id.toLowerCase() === id.trim().toLowerCase());
    if (index === -1) return null;

    const current = this.data.requests[index];
    const now = new Date().toISOString();

    const newHistory = [...current.statusHistory];
    if (updates.status && updates.status !== current.status) {
      newHistory.unshift({
        status: updates.status,
        timestamp: now,
        changedBy,
        note: statusNote || `Status updated to ${updates.status}`
      });
    }

    const updatedRequest: VideoRequest = {
      ...current,
      ...updates,
      updatedAt: now,
      statusHistory: newHistory
    };

    this.data.requests[index] = updatedRequest;
    this.persist({ ...this.data });
    return updatedRequest;
  }

  // ---------------- QUOTE & PAYMENT WORKFLOW ----------------

  public setQuote(
    id: string,
    quoteData: {
      amount: number;
      currency?: string;
      breakdown?: string;
      validUntil?: string;
      paymentLink?: string;
      adminNotes?: string;
    }
  ): VideoRequest | null {
    const request = this.getRequestById(id);
    if (!request) return null;

    const now = new Date().toISOString();
    const currency = quoteData.currency || '₹';
    const formattedAmount = `${currency}${quoteData.amount.toLocaleString()}`;

    const quote: QuoteDetails = {
      amount: quoteData.amount,
      currency,
      formattedAmount,
      breakdown: quoteData.breakdown || 'Comprehensive video generation & professional human curation',
      validUntil: quoteData.validUntil,
      paymentLink: quoteData.paymentLink,
      status: 'sent',
      sentAt: now,
      adminNotes: quoteData.adminNotes
    };

    return this.updateRequest(
      id,
      {
        quote,
        status: 'Under Review'
      },
      'admin',
      `Custom quote sent: ${formattedAmount}. Awaiting customer approval.`
    );
  }

  public respondToQuote(
    id: string,
    action: 'accept' | 'decline',
    customerEmail?: string
  ): VideoRequest | null {
    const request = this.getRequestById(id);
    if (!request || !request.quote) return null;

    const now = new Date().toISOString();
    const newQuoteStatus = action === 'accept' ? 'accepted' : 'declined';

    const updatedQuote: QuoteDetails = {
      ...request.quote,
      status: newQuoteStatus,
      respondedAt: now
    };

    const newStatus: VideoStatus = action === 'accept' ? 'Approved' : 'Cancelled';

    return this.updateRequest(
      id,
      {
        quote: updatedQuote,
        status: newStatus,
        payment: {
          ...request.payment,
          status: action === 'accept' ? 'pending' : 'not_required'
        }
      },
      customerEmail || 'customer',
      `Customer ${action === 'accept' ? 'accepted' : 'declined'} the proposed quote of ${request.quote.formattedAmount}.`
    );
  }

  public recordPayment(
    id: string,
    paymentData: {
      status: 'pending' | 'paid' | 'verified';
      amount?: number;
      paymentMethod?: string;
      transactionRef?: string;
    }
  ): VideoRequest | null {
    const request = this.getRequestById(id);
    if (!request) return null;

    const now = new Date().toISOString();
    const payment: PaymentDetails = {
      status: paymentData.status,
      amount: paymentData.amount || request.quote?.amount,
      currency: request.quote?.currency || '₹',
      paymentMethod: paymentData.paymentMethod || 'Razorpay / UPI / Card',
      transactionRef: paymentData.transactionRef,
      paidAt: now,
      verifiedAt: paymentData.status === 'verified' ? now : undefined
    };

    const newStatus: VideoStatus = paymentData.status === 'verified' ? 'In Production' : request.status;

    return this.updateRequest(
      id,
      {
        payment,
        status: newStatus
      },
      'admin',
      `Payment ${paymentData.status}. Transaction ref: ${paymentData.transactionRef || 'N/A'}`
    );
  }

  public deliverVideo(
    id: string,
    delivery: { directLink?: string; message?: string }
  ): VideoRequest | null {
    const request = this.getRequestById(id);
    if (!request) return null;

    const now = new Date().toISOString();
    return this.updateRequest(
      id,
      {
        status: 'Completed',
        completedVideo: {
          directLink: delivery.directLink,
          message: delivery.message || 'Your custom AI video has been produced and is ready for download.',
          uploadedAt: now
        }
      },
      'admin',
      'Video production completed and delivery link attached.'
    );
  }

  // ---------------- BUDGET REQUEST METHODS ----------------

  public getAllBudgetRequests(): BudgetRequest[] {
    return [...this.data.budgetRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getBudgetRequestById(id: string): BudgetRequest | undefined {
    return this.data.budgetRequests.find((b) => b.id.toLowerCase() === id.trim().toLowerCase());
  }

  public createBudgetRequest(
    payload: Omit<BudgetRequest, 'id' | 'createdAt' | 'updatedAt' | 'internalNotes' | 'replies'>
  ): BudgetRequest {
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const newId = `BR-2026-${randomHex}`;
    const now = new Date().toISOString();

    const newBudgetReq: BudgetRequest = {
      ...payload,
      id: newId,
      createdAt: now,
      updatedAt: now,
      internalNotes: [],
      replies: []
    };

    this.data.budgetRequests.unshift(newBudgetReq);
    this.persist({ ...this.data });
    return newBudgetReq;
  }

  public updateBudgetRequest(id: string, updates: Partial<BudgetRequest>): BudgetRequest | null {
    const index = this.data.budgetRequests.findIndex((b) => b.id.toLowerCase() === id.trim().toLowerCase());
    if (index === -1) return null;

    const updated = {
      ...this.data.budgetRequests[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.budgetRequests[index] = updated;
    this.persist({ ...this.data });
    return updated;
  }

  public addBudgetReply(id: string, reply: { from: 'admin' | 'customer'; message: string }): BudgetRequest | null {
    const req = this.getBudgetRequestById(id);
    if (!req) return null;

    const newReply = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      from: reply.from,
      message: reply.message,
      timestamp: new Date().toISOString()
    };

    req.replies.push(newReply);
    req.updatedAt = new Date().toISOString();
    this.persist({ ...this.data });
    return req;
  }

  public addBudgetInternalNote(id: string, note: string): BudgetRequest | null {
    const req = this.getBudgetRequestById(id);
    if (!req) return null;

    req.internalNotes.push(`[${new Date().toLocaleDateString()}] ${note}`);
    req.updatedAt = new Date().toISOString();
    this.persist({ ...this.data });
    return req;
  }

  public deleteBudgetRequest(id: string): boolean {
    const index = this.data.budgetRequests.findIndex((b) => b.id.toLowerCase() === id.trim().toLowerCase());
    if (index === -1) return false;
    this.data.budgetRequests.splice(index, 1);
    this.persist({ ...this.data });
    return true;
  }

  // ---------------- EMAIL LOGS & SETTINGS ----------------

  public logEmail(log: Omit<EmailLog, 'id' | 'sentAt'>): EmailLog {
    const fullLog: EmailLog = {
      ...log,
      id: `eml_${crypto.randomBytes(8).toString('hex')}`,
      sentAt: new Date().toISOString()
    };
    this.data.emailLogs.unshift(fullLog);
    if (this.data.emailLogs.length > 500) {
      this.data.emailLogs = this.data.emailLogs.slice(0, 500);
    }
    this.persist({ ...this.data });
    return fullLog;
  }

  public addEmailLog(log: Omit<EmailLog, 'id' | 'sentAt'>): EmailLog {
    return this.logEmail(log);
  }

  public updateEmailLog(id: string, updates: Partial<EmailLog>) {
    const entry = this.data.emailLogs.find((l) => l.id === id);
    if (entry) {
      Object.assign(entry, updates);
      this.persist({ ...this.data });
    }
  }

  public getEmailLogs(): EmailLog[] {
    return this.data.emailLogs;
  }

  public getEmailLogById(id: string): EmailLog | undefined {
    return this.data.emailLogs.find((l) => l.id === id);
  }

  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<DatabaseSchema['settings']>) {
    this.data.settings = {
      ...this.data.settings,
      ...settings
    };
    this.persist({ ...this.data });
    return this.data.settings;
  }
}

export const db = new Database();
