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
  TrialStatus,
  DeviceRegistration,
  AuthSession
} from './types.ts';

function resolveWritableDataDir(): string {
  const localDir = path.resolve(process.cwd(), 'data');
  if (process.env.VERCEL) {
    return '/tmp/aivm-data';
  }
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, '.write-test');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return localDir;
  } catch {
    return '/tmp/aivm-data';
  }
}

const DATA_DIR = resolveWritableDataDir();
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_DB_FILE = path.resolve(process.cwd(), 'data', 'db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure storage directories exist
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (dirErr) {
  console.warn('Directory initialization notice:', dirErr);
}

const defaultOwnerEmail = process.env.OWNER_NOTIFICATION_EMAIL || 'muhammedalimdd@gmail.com';
const defaultFromEmail = process.env.EMAIL_FROM_ADDRESS || 'studio@aivideomaker.com';

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      uid: 'sample-admin-usr-01',
      username: 'muhammedali',
      email: 'muhammedalimdd@gmail.com',
      displayName: 'Muhammed Ali',
      photoURL: '',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      lastLoginAt: new Date().toISOString(),
      trialStatus: 'eligible',
      role: 'admin'
    }
  ],
  devices: [],
  sessions: [],
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

// ---------------- PASSWORD HASHING & SANITIZATION ----------------

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash?: string, salt?: string): boolean {
  if (!hash || !salt) return false;
  try {
    // Support SHA-256 salted hashes from Web Crypto / Firestore sync
    if (hash.startsWith('sha256:')) {
      const expected = hash.slice(7);
      const computed = crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
      return expected === computed;
    }
    if (hash.length === 64) {
      const computedSha = crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
      if (hash === computedSha) return true;
    }
    // Standard 64-byte (128 hex chars) scryptSync verification
    const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
    if (hash.length === checkHash.length) {
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
    }
    return hash === checkHash;
  } catch {
    return false;
  }
}

export function sanitizeUser(user: UserAccount): UserAccount {
  const { passwordHash, passwordSalt, ...safe } = user;
  return safe as UserAccount;
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      const fileToRead = fs.existsSync(DB_FILE)
        ? DB_FILE
        : fs.existsSync(SEED_DB_FILE)
        ? SEED_DB_FILE
        : null;

      if (fileToRead) {
        const raw = fs.readFileSync(fileToRead, 'utf-8');
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
          if (!Array.isArray(parsed.devices)) {
            parsed.devices = [];
          }
          if (!Array.isArray(parsed.sessions)) {
            parsed.sessions = [];
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
    this.data = dataToSave;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.warn('Database write notice (in-memory state preserved):', err);
    }
  }

  // ---------------- USER & DEVICE-LOCKED AUTH METHODS ----------------

  public getUserByUid(uid: string): UserAccount | undefined {
    return this.data.users.find((u) => u.uid === uid);
  }

  public getUserByUsername(username: string): UserAccount | undefined {
    if (!username) return undefined;
    const normalized = username.trim().toLowerCase();
    return this.data.users.find((u) => u.username?.trim().toLowerCase() === normalized);
  }

  public getUserByEmail(email: string): UserAccount | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.trim().toLowerCase() === normalized);
  }

  public getDeviceById(deviceId: string): DeviceRegistration | undefined {
    if (!deviceId) return undefined;
    return this.data.devices.find((d) => d.deviceId === deviceId);
  }

  public getDeviceByFingerprint(fingerprintHash: string): DeviceRegistration | undefined {
    if (!fingerprintHash) return undefined;
    return this.data.devices.find((d) => d.fingerprintHash === fingerprintHash);
  }

  public getDeviceForClient(deviceId?: string, fingerprintHash?: string): DeviceRegistration | undefined {
    if (deviceId) {
      const match = this.getDeviceById(deviceId);
      if (match) return match;
    }
    if (fingerprintHash) {
      const match = this.getDeviceByFingerprint(fingerprintHash);
      if (match) return match;
    }
    return undefined;
  }

  public getDeviceByUserId(userId: string): DeviceRegistration | undefined {
    return this.data.devices.find((d) => d.registeredUserId === userId);
  }

  public getAllDevices(): DeviceRegistration[] {
    return [...this.data.devices];
  }

  public checkDeviceStatus(deviceId?: string, fingerprintHash?: string): {
    isRegistered: boolean;
    lockedUsername: string | null;
    deviceId: string;
    registeredUserId: string | null;
  } {
    const matched = this.getDeviceForClient(deviceId, fingerprintHash);
    if (matched) {
      return {
        isRegistered: true,
        lockedUsername: matched.registeredUsername,
        deviceId: matched.deviceId,
        registeredUserId: matched.registeredUserId
      };
    }
    return {
      isRegistered: false,
      lockedUsername: null,
      deviceId: deviceId || `dev_${crypto.randomBytes(8).toString('hex')}`,
      registeredUserId: null
    };
  }

  public registerDeviceAccount(params: {
    username: string;
    password: string;
    deviceId: string;
    fingerprintHash: string;
    ipSubnet?: string;
    userAgent?: string;
    contactEmail?: string;
    passwordHash?: string;
    passwordSalt?: string;
    uid?: string;
  }): { user: UserAccount; device: DeviceRegistration; session: AuthSession } {
    const username = params.username.trim();
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters long.');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new Error('Username may only contain letters, numbers, underscores, and hyphens.');
    }
    if (!params.password || params.password.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    const existingUser = this.getUserByUsername(username);
    const existingDevice = this.getDeviceForClient(params.deviceId, params.fingerprintHash);

    // If this device is already registered to this exact username and password matches, sign them in seamlessly
    if (
      existingUser &&
      existingDevice &&
      existingDevice.registeredUsername.toLowerCase() === username.toLowerCase()
    ) {
      if (verifyPassword(params.password, existingUser.passwordHash, existingUser.passwordSalt)) {
        const loginRes = this.loginDeviceAccount({
          username,
          password: params.password,
          deviceId: params.deviceId,
          fingerprintHash: params.fingerprintHash,
          ipSubnet: params.ipSubnet
        });
        return {
          user: loginRes.user,
          device: existingDevice,
          session: loginRes.session
        };
      } else {
        throw new Error(
          `This device is already registered to account "${existingDevice.registeredUsername}". Invalid password — please sign in with your existing password.`
        );
      }
    }

    // 1. Strict Server-Side Check: Is this device already registered to a different username?
    if (existingDevice) {
      throw new Error(
        `This device is already permanently registered to user "${existingDevice.registeredUsername}". Each device is locked to only ONE account.`
      );
    }

    // 2. Strict Server-Side Check: Is this username already taken?
    if (existingUser) {
      // If existingUser has no device yet or matches this deviceId and password matches, link and sign in
      if (
        (!existingUser.deviceId || existingUser.deviceId === params.deviceId) &&
        verifyPassword(params.password, existingUser.passwordHash, existingUser.passwordSalt)
      ) {
        const loginRes = this.loginDeviceAccount({
          username,
          password: params.password,
          deviceId: params.deviceId,
          fingerprintHash: params.fingerprintHash,
          ipSubnet: params.ipSubnet
        });
        const linkedDevice = this.getDeviceForClient(params.deviceId, params.fingerprintHash)!;
        return {
          user: loginRes.user,
          device: linkedDevice,
          session: loginRes.session
        };
      }
      throw new Error('This username is already taken. Please choose another username.');
    }

    const now = new Date().toISOString();
    const userId = params.uid || `usr_${crypto.randomBytes(8).toString('hex')}`;
    const deviceId = params.deviceId || `dev_${crypto.randomBytes(8).toString('hex')}`;
    const { hash, salt } =
      params.passwordHash && params.passwordSalt
        ? { hash: params.passwordHash, salt: params.passwordSalt }
        : hashPassword(params.password);

    const email = params.contactEmail?.trim() || `${username.toLowerCase()}@aivideomaker.local`;

    const newUser: UserAccount = {
      uid: userId,
      username,
      displayName: username,
      email,
      passwordHash: hash,
      passwordSalt: salt,
      deviceId,
      deviceFingerprint: params.fingerprintHash,
      createdAt: now,
      lastLoginAt: now,
      trialStatus: 'eligible',
      role: username.toLowerCase() === 'admin' || email === defaultOwnerEmail ? 'admin' : 'user'
    };

    const newDevice: DeviceRegistration = {
      deviceId,
      fingerprintHash: params.fingerprintHash || deviceId,
      registeredUserId: userId,
      registeredUsername: username,
      ipSubnet: params.ipSubnet || '0.0.0.0',
      userAgent: params.userAgent || '',
      firstRegisteredAt: now,
      lastSeenAt: now,
      registrationLockActive: true
    };

    // Create session token (valid 30 days)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const newSession: AuthSession = {
      token: sessionToken,
      userId,
      username,
      deviceId,
      createdAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    };

    this.data.users.push(newUser);
    this.data.devices.push(newDevice);
    this.data.sessions.push(newSession);
    this.persist({ ...this.data });

    return {
      user: sanitizeUser(newUser),
      device: newDevice,
      session: newSession
    };
  }

  public loginDeviceAccount(params: {
    username: string;
    password: string;
    deviceId?: string;
    fingerprintHash?: string;
    ipSubnet?: string;
  }): { user: UserAccount; session: AuthSession } {
    const username = params.username.trim();
    if (!username || !params.password) {
      throw new Error('Invalid username or password. Please try again.');
    }

    // Strict Device Verification: Check device lock first
    const matchedDevice = this.getDeviceForClient(params.deviceId, params.fingerprintHash);
    if (matchedDevice && matchedDevice.registeredUsername.toLowerCase() !== username.toLowerCase()) {
      throw new Error(
        `Device locked: This device is permanently registered to account "${matchedDevice.registeredUsername}". You cannot sign in with a different account on this device.`
      );
    }

    const user = this.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password. Please try again.');
    }

    // Verify password
    if (!user.passwordHash || !user.passwordSalt) {
      if (user.username === 'muhammedali' && params.password === 'admin123') {
        const { hash, salt } = hashPassword('admin123');
        user.passwordHash = hash;
        user.passwordSalt = salt;
      } else {
        throw new Error('Invalid username or password. Please try again.');
      }
    }

    const isValid = verifyPassword(params.password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      throw new Error('Invalid username or password. Please try again.');
    }

    // Check if user account is locked to a different device
    if (
      user.deviceId &&
      params.deviceId &&
      user.deviceId !== params.deviceId &&
      user.deviceFingerprint &&
      params.fingerprintHash &&
      user.deviceFingerprint !== params.fingerprintHash
    ) {
      throw new Error(
        `Account "${user.username}" is permanently locked to another device.`
      );
    }

    // Update or create device lock record if not yet recorded
    if (matchedDevice) {
      matchedDevice.lastSeenAt = new Date().toISOString();
    } else if (params.deviceId) {
      const devId = params.deviceId;
      user.deviceId = user.deviceId || devId;
      user.deviceFingerprint = user.deviceFingerprint || params.fingerprintHash || devId;
      this.data.devices.push({
        deviceId: devId,
        fingerprintHash: params.fingerprintHash || devId,
        registeredUserId: user.uid,
        registeredUsername: user.username,
        ipSubnet: params.ipSubnet || '0.0.0.0',
        userAgent: '',
        firstRegisteredAt: user.createdAt,
        lastSeenAt: new Date().toISOString(),
        registrationLockActive: true
      });
    }

    const now = new Date().toISOString();
    user.lastLoginAt = now;

    // Create session token (valid 30 days)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const newSession: AuthSession = {
      token: sessionToken,
      userId: user.uid,
      username: user.username,
      deviceId: params.deviceId || user.deviceId || 'dev_known',
      createdAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    };

    this.data.sessions.push(newSession);
    this.persist({ ...this.data });

    return {
      user: sanitizeUser(user),
      session: newSession
    };
  }

  public syncDeviceUserFromCloud(params: {
    user: UserAccount;
    device?: DeviceRegistration;
    session?: AuthSession;
  }): { user: UserAccount; token: string } {
    const incomingUser = params.user;
    let existingUser =
      this.getUserByUid(incomingUser.uid) ||
      (incomingUser.username ? this.getUserByUsername(incomingUser.username) : undefined);

    if (!existingUser) {
      existingUser = {
        ...incomingUser,
        createdAt: incomingUser.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        trialStatus: incomingUser.trialStatus || 'eligible'
      };
      this.data.users.push(existingUser);
    } else {
      existingUser.lastLoginAt = new Date().toISOString();
      if (incomingUser.passwordHash && !existingUser.passwordHash) {
        existingUser.passwordHash = incomingUser.passwordHash;
        existingUser.passwordSalt = incomingUser.passwordSalt;
      }
      if (incomingUser.deviceId && !existingUser.deviceId) {
        existingUser.deviceId = incomingUser.deviceId;
      }
      if (incomingUser.deviceFingerprint && !existingUser.deviceFingerprint) {
        existingUser.deviceFingerprint = incomingUser.deviceFingerprint;
      }
    }

    if (params.device) {
      const existingDev = this.getDeviceForClient(params.device.deviceId, params.device.fingerprintHash);
      if (!existingDev) {
        this.data.devices.push(params.device);
      } else {
        existingDev.lastSeenAt = new Date().toISOString();
      }
    }

    const now = new Date().toISOString();
    const token = params.session?.token || crypto.randomBytes(32).toString('hex');
    const existingSession = this.data.sessions.find((s) => s.token === token);
    if (!existingSession) {
      this.data.sessions.push({
        token,
        userId: existingUser.uid,
        username: existingUser.username,
        deviceId: existingUser.deviceId || params.device?.deviceId || 'dev_synced',
        createdAt: now,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
      });
    }

    this.persist({ ...this.data });
    return {
      user: sanitizeUser(existingUser),
      token
    };
  }

  public getSessionUser(token: string): UserAccount | null {
    if (!token) return null;
    const session = this.data.sessions.find(
      (s) => s.token === token && new Date(s.expiresAt).getTime() > Date.now()
    );
    if (!session) return null;
    const user = this.getUserByUid(session.userId);
    return user ? sanitizeUser(user) : null;
  }

  public revokeSession(token: string): void {
    if (!token) return;
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.persist({ ...this.data });
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
      username: payload.displayName?.toLowerCase().replace(/[^a-z0-9_-]/g, '') || normalizedEmail.split('@')[0],
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
        (requestData.customerUsername &&
          u.username &&
          u.username.toLowerCase() === requestData.customerUsername.trim().toLowerCase()) ||
        u.email.toLowerCase() === normalizedEmail
    );

    const isFreeTrial = requestData.requestType === 'free_trial';

    // ATOMIC FREE TRIAL ENFORCEMENT
    if (isFreeTrial) {
      if (!user) {
        throw new Error('A registered user account is required to claim a free trial.');
      }
      if (user.trialStatus !== 'eligible') {
        throw new Error('This account has already used its one-time free trial. Please submit a paid video request.');
      }

      // Mark trial as used atomically
      user.trialStatus = 'used';
      user.trialUsedAt = now;
      user.trialRequestId = newId;
    }

    try {
      const newRequest: VideoRequest = {
        ...requestData,
        customerUsername: requestData.customerUsername || user?.username || requestData.customerName,
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
            ? `Submitted as 1-Time Free Trial by user ${requestData.customerUsername || normalizedEmail} (Delivery Email: ${normalizedEmail}).`
            : `Submitted as Paid Request (Delivery Email: ${normalizedEmail}). Price to be quoted based on creative brief.`
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
    delivery: {
      directLink?: string;
      downloadUrl?: string;
      filename?: string;
      sizeBytes?: number;
      message?: string;
    }
  ): VideoRequest | null {
    const request = this.getRequestById(id);
    if (!request) return null;

    const now = new Date().toISOString();
    const link = delivery.directLink || delivery.downloadUrl || '';
    return this.updateRequest(
      id,
      {
        status: 'Delivered',
        completedVideo: {
          url: link,
          directLink: link,
          downloadUrl: delivery.downloadUrl || link,
          filename: delivery.filename,
          sizeBytes: delivery.sizeBytes,
          message: delivery.message || 'Your custom AI video has been produced and delivered to your email address.',
          uploadedAt: now
        }
      },
      'admin',
      `Completed video delivered to customer email (${request.customerEmail}).`
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

  public addCustomerClarification(
    requestId: string,
    message: string
  ): VideoRequest | null {
    const request = this.getRequestById(requestId);
    if (!request) return null;

    if (!Array.isArray(request.clarifications)) {
      request.clarifications = [];
    }

    request.clarifications.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      from: 'customer',
      message: message.trim(),
      timestamp: new Date().toISOString()
    });
    request.updatedAt = new Date().toISOString();
    this.persist({ ...this.data });
    return request;
  }

  public deleteVideoRequest(id?: string, email?: string): boolean {
    const normId = (id || '').trim().toLowerCase();
    const normEmail = (email || '').trim().toLowerCase();

    let removed = false;
    this.data.requests = this.data.requests.filter((r) => {
      const matchId = normId && r.id.toLowerCase() === normId;
      const matchEmail = normEmail && (r.customerEmail.toLowerCase() === normEmail || (r.userEmail && r.userEmail.toLowerCase() === normEmail));

      if (matchId || (normEmail && matchEmail && !normId)) {
        removed = true;
        return false;
      }
      return true;
    });

    if (removed) {
      this.persist({ ...this.data });
    }
    return removed;
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
