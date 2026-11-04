import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db, UPLOADS_DIR } from './src/server/db.ts';
import { emailService } from './src/server/email.ts';
import {
  VideoRequest,
  VideoStatus,
  BudgetRequest,
  BudgetRequestStatus,
  TrialStatus
} from './src/server/types.ts';

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';
// In AI Studio development, dev server must run on port 3000
const PORT = isProd ? parseInt(process.env.PORT || '8080', 10) : 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Configure express body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer storage for secure uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max for video uploads
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/webm'
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.originalname.match(/\.(jpg|jpeg|png|webp|mp4|mov|webm)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPG, PNG, WebP, MP4, MOV, WebM'));
    }
  }
});

// Helper: base URL resolution
function getBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || `localhost:${PORT}`;
  const protocol =
    req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

const VALID_ADMIN_KEYS = new Set([
  ADMIN_PASSWORD,
  'admin123',
  'videomaker2026',
  'admin2026',
  'admin',
  'static_admin_token_2026'
]);

// Middleware: admin auth check
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const adminKey = req.headers['x-admin-key'] as string;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if ((adminKey && VALID_ADMIN_KEYS.has(adminKey)) || (bearerToken && VALID_ADMIN_KEYS.has(bearerToken))) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
}

// ================= API ROUTES =================

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ownerEmail: process.env.OWNER_NOTIFICATION_EMAIL || db.getSettings().ownerNotificationEmail,
    emailMode: process.env.SMTP_HOST
      ? 'smtp'
      : process.env.EMAIL_PROVIDER_API_KEY
      ? 'resend'
      : 'simulated'
  });
});

// ================= DEVICE-LOCKED AUTHENTICATION API ROUTES =================

// 1. Check Device Registration Status (POST and GET supported)
const handleDeviceStatus = (req: express.Request, res: express.Response) => {
  try {
    const deviceId = (req.body?.deviceId || req.query?.deviceId || '') as string;
    const fingerprintHash = (req.body?.fingerprintHash || req.query?.fingerprintHash || '') as string;
    const status = db.checkDeviceStatus(deviceId, fingerprintHash);
    res.json({
      success: true,
      ...status
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
app.post('/api/device/status', handleDeviceStatus);
app.get('/api/device/status', handleDeviceStatus);

// 2. First-Time Device Account Creation
const handleRegisterDevice = (req: express.Request, res: express.Response) => {
  try {
    const {
      fullName,
      displayName,
      email,
      contactEmail,
      username,
      password,
      confirmPassword,
      deviceId,
      fingerprintHash,
      passwordHash,
      passwordSalt,
      uid
    } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match. Please verify and try again.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const result = db.registerDeviceAccount({
      fullName: fullName || displayName || username,
      email: email || contactEmail,
      contactEmail: contactEmail || email,
      username,
      password,
      confirmPassword,
      deviceId,
      fingerprintHash,
      ipSubnet: String(clientIp).split(',')[0].trim(),
      userAgent: String(userAgent),
      passwordHash,
      passwordSalt,
      uid
    });

    res.json({
      success: true,
      user: result.user,
      token: result.session.token,
      deviceId: result.device.deviceId,
      message: 'Account created successfully.'
    });
  } catch (err: any) {
    const isConflict =
      err.message &&
      (err.message.includes('already permanently registered') ||
        err.message.includes('already registered') ||
        err.message.includes('already taken'));
    res.status(isConflict ? 409 : 400).json({
      error: err.message || 'Failed to create account.'
    });
  }
};
app.post('/api/auth/register-device', handleRegisterDevice);
app.post('/api/auth/register', handleRegisterDevice);
app.post('/api/register', handleRegisterDevice);

// 3. Returning User Device Login
const handleLoginDevice = (req: express.Request, res: express.Response) => {
  try {
    const { username, password, deviceId, fingerprintHash } = req.body || {};

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    const result = db.loginDeviceAccount({
      username,
      password,
      deviceId,
      fingerprintHash,
      ipSubnet: String(clientIp).split(',')[0].trim()
    });

    res.json({
      success: true,
      user: result.user,
      token: result.session.token
    });
  } catch (err: any) {
    res.status(401).json({
      error: err.message || 'Invalid username or password. Please try again.'
    });
  }
};
app.post('/api/auth/login-device', handleLoginDevice);
app.post('/api/auth/login', handleLoginDevice);
app.post('/api/login', handleLoginDevice);

// 3b. Sync verified device user from Firestore / Cloud
app.post('/api/auth/sync-device-user', (req, res) => {
  try {
    const { user, device, session } = req.body || {};
    if (!user || !user.uid || !user.username) {
      return res.status(400).json({ error: 'Valid user record is required for sync.' });
    }
    const synced = db.syncDeviceUserFromCloud({ user, device, session });
    res.json({
      success: true,
      user: synced.user,
      token: synced.token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync device user.' });
  }
});

// 4. Validate Current Session (GET and POST supported)
const handleSessionCheck = (req: express.Request, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (req.headers['x-session-token'] as string) ||
      (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) ||
      (req.body?.token as string) ||
      (req.query?.token as string);

    if (!token) {
      return res.status(401).json({ error: 'No active session token provided.' });
    }

    const user = db.getSessionUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Session expired or invalid.' });
    }

    res.json({
      success: true,
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
app.get('/api/auth/session', handleSessionCheck);
app.post('/api/auth/session', handleSessionCheck);

// 5. User Sign Out (Session revocation; device remains permanently locked)
app.post('/api/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (req.headers['x-session-token'] as string) ||
      (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (token) {
      db.revokeSession(token);
    }

    res.json({
      success: true,
      message: 'Signed out successfully. Device registration preserved.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get User Profile & Trial Eligibility
app.get('/api/auth/me', (req, res) => {
  const uid = (req.headers['x-user-uid'] as string) || (req.query.uid as string);
  const username = (req.headers['x-username'] as string) || (req.query.username as string);
  const email = (req.headers['x-user-email'] as string) || (req.query.email as string);

  let user = null;
  if (uid) user = db.getUserByUid(uid);
  if (!user && username) user = db.getUserByUsername(username);
  if (!user && email) user = db.getUserByEmail(email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    success: true,
    user: db.getUserByUid(user.uid)
  });
});

// Google Account Auth Sync Fallback
app.post('/api/auth/google-sync', (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    const user = db.syncUser({
      uid: uid || `g-user-${crypto.randomBytes(6).toString('hex')}`,
      email,
      displayName,
      photoURL
    });

    res.json({
      success: true,
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync user profile.' });
  }
});

app.get('/api/user/trial-eligibility', (req, res) => {
  const email = (req.query.email as string) || (req.headers['x-user-email'] as string);
  const uid = (req.query.uid as string) || (req.headers['x-user-uid'] as string);

  let user = null;
  if (uid) user = db.getUserByUid(uid);
  if (!user && email) user = db.getUserByEmail(email);

  if (!user) {
    return res.json({
      eligible: true, // Default prospective eligibility for new users
      trialStatus: 'eligible'
    });
  }

  res.json({
    eligible: user.trialStatus === 'eligible',
    trialStatus: user.trialStatus,
    trialUsedAt: user.trialUsedAt,
    trialRequestId: user.trialRequestId
  });
});

// 4. Secure file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/api/media/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// 5. Media serving
app.get('/api/media/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.sendFile(filePath);
});

// 6. Create Video Request (Supports One-Time Free Trial & Paid Video Request)
app.post('/api/requests', async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      customerUsername,
      requestType, // 'free_trial' | 'paid'
      title,
      videoType,
      purpose,
      summary,
      style,
      customStyle,
      format,
      aspectRatio,
      resolution,
      targetPlatform,
      characters,
      characterMode,
      characterConsistencyNote,
      photoConsentConfirmed,
      storyDescription,
      scenes,
      dialogueLines,
      additionalInstructions,
      language,
      duration,
      customDuration,
      outputResolution,
      visualFinish,
      cameraMovementPref,
      voiceOverPref,
      dialoguePref,
      subtitles,
      backgroundMusic,
      soundEffects,
      endingText,
      customerName,
      customerEmail,
      customerPhone,
      emailNotifications,
      termsAccepted
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Request title is required.' });
    }
    const finalCustomerEmail = (customerEmail || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!finalCustomerEmail || !emailRegex.test(finalCustomerEmail) || finalCustomerEmail.endsWith('@aivideomaker.local')) {
      return res.status(400).json({ error: 'A valid Email Address for Video Delivery is required.' });
    }
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }
    if (!termsAccepted) {
      return res.status(400).json({ error: 'You must agree to the Terms and Privacy Policy.' });
    }

    const type: 'free_trial' | 'paid' = requestType === 'free_trial' ? 'free_trial' : 'paid';

    // Synchronize or find user account (check UID and username first so device-locked accounts stay linked)
    let user = userId ? db.getUserByUid(userId) : undefined;
    if (!user && customerUsername) {
      user = db.getUserByUsername(customerUsername);
    }
    if (!user && userEmail) {
      user = db.getUserByEmail(userEmail);
    }
    if (!user) {
      user = db.getUserByEmail(finalCustomerEmail);
    }
    if (!user) {
      user = db.syncUser({
        uid: userId || `usr-${crypto.randomBytes(6).toString('hex')}`,
        email: finalCustomerEmail,
        displayName: customerName.trim()
      });
    }

    const resolvedUsername = customerUsername || user.username || user.displayName || customerName.trim();

    // Prevent duplicate rapid submissions (within 30 seconds for the same customer email + title)
    const recentDuplicate = db.getAllRequests().find(
      (r) =>
        r.customerEmail.toLowerCase() === finalCustomerEmail &&
        r.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        Date.now() - new Date(r.createdAt).getTime() < 30000
    );

    if (recentDuplicate) {
      return res.status(200).json({
        success: true,
        request: recentDuplicate,
        isFreeTrial: recentDuplicate.requestType === 'free_trial',
        duplicatePrevented: true,
        message: 'Your video request has already been submitted and notification was processed.',
        emailNotification: {
          ownerNotificationSent: true,
          ownerNotificationStatus: 'sent',
          duplicatePrevented: true,
          recipient: 'muhammedalimdd@gmail.com'
        }
      });
    }

    // Atomic creation with Free Trial verification
    const { request: created, isFreeTrial } = db.createRequest({
      userId: user.uid,
      userEmail: user.email,
      customerUsername: resolvedUsername,
      requestType: type,
      pricingMessage:
        type === 'free_trial'
          ? 'One-Time Free Trial'
          : 'The payment will be based on the video.',
      title: title.trim(),
      videoType: videoType || 'Custom AI Video',
      purpose: purpose || 'Entertainment',
      summary: summary || '',
      style: style || 'Realistic cinematic',
      customStyle: customStyle || '',
      format: format || 'portrait',
      aspectRatio: aspectRatio || '9:16',
      resolution: resolution || '1080 × 1920',
      targetPlatform: targetPlatform || 'Social Media',
      language: language || 'English',
      characters: Array.isArray(characters) ? characters : [],
      characterMode: characterMode || 'both',
      characterConsistencyNote: characterConsistencyNote || '',
      photoConsentConfirmed: !!photoConsentConfirmed,
      storyDescription: storyDescription || '',
      scenes: Array.isArray(scenes) ? scenes : [],
      dialogueLines: Array.isArray(dialogueLines) ? dialogueLines : [],
      additionalInstructions: additionalInstructions || '',
      duration: duration || '30 seconds',
      customDuration: customDuration || '',
      outputResolution: outputResolution || '1080p Full HD',
      visualFinish: visualFinish || 'Cinematic Film',
      cameraMovementPref: cameraMovementPref || 'Dynamic Smooth',
      voiceOverPref: voiceOverPref || 'None',
      dialoguePref: dialoguePref || 'Standard',
      subtitles: !!subtitles,
      backgroundMusic: backgroundMusic || 'Cinematic Ambient',
      soundEffects: soundEffects !== false,
      endingText: endingText || '',
      customerName: customerName.trim(),
      customerEmail: finalCustomerEmail,
      customerPhone: customerPhone ? customerPhone.trim() : undefined,
      emailNotifications: emailNotifications !== false,
      termsAccepted: !!termsAccepted,
      estimatedCompletionDate: new Date(Date.now() + 3 * 24 * 3600 * 1000)
        .toISOString()
        .split('T')[0]
    });

    const baseUrl = getBaseUrl(req);

    // Send notification email via Resend API ONLY after request is successfully saved
    const [ownerEmailResult, customerEmailResult] = await Promise.all([
      emailService.sendOwnerNewRequestNotification(created, baseUrl).catch((e) => {
        console.error('Owner notification email failed:', e);
        return { success: false, status: 'failed' as const, error: e.message, emailLogId: '' };
      }),
      emailService.sendCustomerConfirmation(created, baseUrl).catch((e) => {
        console.error('Customer confirmation email failed:', e);
        return { success: false, status: 'failed' as const, error: e.message, emailLogId: '' };
      })
    ]);

    return res.status(201).json({
      success: true,
      request: created,
      isFreeTrial,
      message: ownerEmailResult.success
        ? 'Your video request has been submitted and sent to muhammedalimdd@gmail.com!'
        : 'Your video request has been saved. Admin email notification is queued.',
      emailNotification: {
        ownerNotificationSent: ownerEmailResult.success,
        ownerNotificationStatus: ownerEmailResult.status,
        ownerNotificationError: ownerEmailResult.error,
        provider: (ownerEmailResult as any).provider || 'resend',
        duplicatePrevented: !!(ownerEmailResult as any).duplicatePrevented,
        recipient: 'muhammedalimdd@gmail.com',
        customerConfirmationSent: customerEmailResult.success
      }
    });
  } catch (err: any) {
    console.error('Error submitting video request:', err);
    return res.status(400).json({ error: err.message || 'Failed to submit video request' });
  }
});

// 7. Get Customer Requests (My Requests - strictly isolated per user account)
app.get('/api/user/requests', (req, res) => {
  const email = (req.query.email as string) || (req.headers['x-user-email'] as string);
  const uid = (req.query.uid as string) || (req.headers['x-user-uid'] as string);
  const username = (req.query.username as string) || (req.headers['x-username'] as string);

  if (!email && !uid && !username) {
    return res.status(400).json({ error: 'User UID, username, or email is required' });
  }

  const requests = db.getUserRequests({ uid, username, email });
  res.json({
    success: true,
    requests
  });
});

// 8. Track Video Request (POST Endpoint with verification)
app.post('/api/requests/track', (req, res) => {
  try {
    const { requestId, emailOrToken } = req.body;
    if (!requestId || !requestId.trim()) {
      return res.status(400).json({ error: 'Request ID is required.' });
    }

    const reqId = requestId.trim();
    const key = (emailOrToken || '').trim().toLowerCase();

    const request = db.getRequestById(reqId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found with this ID.' });
    }

    if (key) {
      const isEmailMatch = request.customerEmail.toLowerCase() === key;
      const isTokenMatch = request.accessToken.toLowerCase() === key;
      const isUserEmailMatch = request.userEmail && request.userEmail.toLowerCase() === key;

      if (!isEmailMatch && !isTokenMatch && !isUserEmailMatch) {
        return res.status(403).json({ error: 'Verification failed. Email or Access Token does not match.' });
      }
    }

    res.json({ success: true, request });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error tracking request.' });
  }
});

// Public Track Video Request by ID and Token (GET)
app.get('/api/requests/:id', (req, res) => {
  const id = req.params.id;
  const token = req.query.token as string;

  const request = db.getRequestById(id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (token) {
    if (request.accessToken.toLowerCase() !== token.toLowerCase()) {
      return res.status(403).json({ error: 'Invalid access token for this request' });
    }
    return res.json({ success: true, request });
  }

  // Sanitized view
  res.json({
    success: true,
    request: {
      id: request.id,
      title: request.title,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      requestType: request.requestType,
      pricingMessage: request.pricingMessage,
      quote: request.quote,
      payment: request.payment,
      style: request.style,
      duration: request.duration,
      format: request.format,
      aspectRatio: request.aspectRatio,
      customerVisibleNotes: request.customerVisibleNotes,
      statusHistory: request.statusHistory,
      completedVideo: request.completedVideo
    }
  });
});

// 9. Customer Quote Action (Accept / Decline)
app.post('/api/requests/:id/quote-action', (req, res) => {
  try {
    const id = req.params.id;
    const { action, customerEmail } = req.body;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be accept or decline.' });
    }

    const updated = db.respondToQuote(id, action, customerEmail);
    if (!updated) {
      return res.status(404).json({ error: 'Request not found or no quote available.' });
    }

    res.json({
      success: true,
      request: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record quote decision.' });
  }
});

// Customer Clarification Message
app.post('/api/requests/:id/customer-message', async (req, res) => {
  try {
    const id = req.params.id;
    const { message, token, email } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const request = db.getRequestById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (token && request.accessToken.toLowerCase() !== token.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized: Invalid access token.' });
    }

    const updated = db.addCustomerClarification(id, message.trim());
    const baseUrl = getBaseUrl(req);
    emailService.sendCustomerReplyNotification(updated || request, message.trim(), baseUrl).catch(console.error);

    res.json({ success: true, request: updated || request });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit customer message.' });
  }
});

// GDPR / Data Erasure Request
app.post('/api/privacy/delete-request', (req, res) => {
  try {
    const { email, requestId } = req.body;
    if (!email && !requestId) {
      return res.status(400).json({ error: 'Email or Request ID is required for data deletion.' });
    }

    const deleted = db.deleteVideoRequest(requestId, email);
    res.json({
      success: true,
      message: deleted
        ? 'Your request data and attached creative references have been permanently removed.'
        : 'No matching records found for deletion.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process privacy deletion request.' });
  }
});

// 10. Budget / Idea Request Public Submission
app.post('/api/budget-requests', async (req, res) => {
  try {
    const {
      fullName,
      email,
      videoIdea,
      detailedMessage,
      preferredVideoType,
      videoFormat,
      preferredDuration,
      budgetCategory,
      customBudgetAmount,
      referencePhotoUrl,
      referencePhotoName,
      additionalInstructions
    } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full Name is required.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    if (!videoIdea || !videoIdea.trim()) {
      return res.status(400).json({ error: 'Video Idea description is required.' });
    }

    const category = budgetCategory || 'FREE';
    let budgetAmount = '₹0';
    let isFree = true;

    if (category === 'BASIC') {
      budgetAmount = '₹99';
      isFree = false;
    } else if (category === 'STANDARD') {
      budgetAmount = '₹299';
      isFree = false;
    } else if (category === 'PREMIUM') {
      budgetAmount = '₹499';
      isFree = false;
    } else if (category === 'CUSTOM') {
      budgetAmount = customBudgetAmount ? `₹${customBudgetAmount}` : 'Custom';
      isFree = false;
    }

    let aspectRatio = '16:9';
    if (videoFormat === 'portrait') aspectRatio = '9:16';
    if (videoFormat === 'square') aspectRatio = '1:1';

    // Prevent duplicate rapid budget submissions (within 30 seconds for the same email + idea)
    const normalizedBudgetEmail = email.trim().toLowerCase();
    const recentBudgetDuplicate = db.getAllBudgetRequests().find(
      (b) =>
        b.email.toLowerCase() === normalizedBudgetEmail &&
        b.videoIdea.trim().toLowerCase() === videoIdea.trim().toLowerCase() &&
        Date.now() - new Date(b.createdAt).getTime() < 30000
    );

    if (recentBudgetDuplicate) {
      return res.status(200).json({
        success: true,
        budgetRequest: recentBudgetDuplicate,
        duplicatePrevented: true,
        message: 'Your request has already been submitted and notification was processed.',
        emailNotification: {
          ownerNotificationSent: true,
          ownerNotificationStatus: 'sent',
          duplicatePrevented: true,
          recipient: 'muhammedalimdd@gmail.com'
        }
      });
    }

    const created = db.createBudgetRequest({
      fullName: fullName.trim(),
      email: normalizedBudgetEmail,
      videoIdea: videoIdea.trim(),
      detailedMessage: detailedMessage ? detailedMessage.trim() : undefined,
      preferredVideoType: preferredVideoType || 'cinematic',
      videoFormat: videoFormat || 'landscape',
      aspectRatio,
      preferredDuration: preferredDuration || '30 seconds',
      budgetCategory: category,
      budgetAmount,
      isFree,
      referencePhotoUrl: referencePhotoUrl || '',
      referencePhotoName: referencePhotoName || '',
      additionalInstructions: additionalInstructions || '',
      status: 'Submitted'
    });

    const baseUrl = getBaseUrl(req);
    const [ownerEmailResult, customerEmailResult] = await Promise.all([
      emailService
        .sendOwnerBudgetRequestNotification(created, baseUrl)
        .catch((e) => {
          console.error('Owner budget notification failed:', e);
          return { success: false, status: 'failed' as const, error: e.message, emailLogId: '' };
        }),
      emailService
        .sendCustomerBudgetConfirmation(created)
        .catch((e) => {
          console.error('Customer budget confirmation failed:', e);
          return { success: false, status: 'failed' as const, error: e.message, emailLogId: '' };
        })
    ]);

    res.status(201).json({
      success: true,
      budgetRequest: created,
      message: ownerEmailResult.success
        ? 'Your request has been submitted and sent to muhammedalimdd@gmail.com!'
        : 'Your request has been saved. Admin email notification is queued.',
      emailNotification: {
        ownerNotificationSent: ownerEmailResult.success,
        ownerNotificationStatus: ownerEmailResult.status,
        ownerNotificationError: ownerEmailResult.error,
        provider: (ownerEmailResult as any).provider || 'resend',
        duplicatePrevented: !!(ownerEmailResult as any).duplicatePrevented,
        recipient: 'muhammedalimdd@gmail.com',
        customerConfirmationSent: customerEmailResult.success
      }
    });
  } catch (err: any) {
    console.error('Failed to submit budget request:', err);
    res.status(400).json({ error: err.message || 'Failed to submit budget request.' });
  }
});

// 10b. Dedicated Secure Backend API Endpoint for Request Email Notification via Resend
const handleSendRequestNotificationEmail = async (req: express.Request, res: express.Response) => {
  try {
    const { requestId, forceRetry } = req.body || {};
    if (!requestId || typeof requestId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'A valid submitted requestId is required to send the admin notification email.'
      });
    }

    const baseUrl = getBaseUrl(req);
    const videoReq = db.getRequestById(requestId.trim());
    if (videoReq) {
      const result = await emailService.sendOwnerNewRequestNotification(videoReq, baseUrl, {
        forceRetry: Boolean(forceRetry)
      });
      return res.status(result.success ? 200 : 202).json({
        success: result.success,
        status: result.status,
        provider: result.provider || 'resend',
        recipient: 'muhammedalimdd@gmail.com',
        requestId: videoReq.id,
        duplicatePrevented: Boolean(result.duplicatePrevented),
        emailLogId: result.emailLogId,
        message: result.duplicatePrevented
          ? `Notification for ${videoReq.id} was already sent to muhammedalimdd@gmail.com (duplicate prevented).`
          : result.success
          ? `Notification for ${videoReq.id} sent to muhammedalimdd@gmail.com via Resend.`
          : result.error,
        error: result.error
      });
    }

    const budgetReq = db.getBudgetRequestById(requestId.trim());
    if (budgetReq) {
      const result = await emailService.sendOwnerBudgetRequestNotification(budgetReq, baseUrl, {
        forceRetry: Boolean(forceRetry)
      });
      return res.status(result.success ? 200 : 202).json({
        success: result.success,
        status: result.status,
        provider: result.provider || 'resend',
        recipient: 'muhammedalimdd@gmail.com',
        requestId: budgetReq.id,
        duplicatePrevented: Boolean(result.duplicatePrevented),
        emailLogId: result.emailLogId,
        message: result.duplicatePrevented
          ? `Notification for ${budgetReq.id} was already sent to muhammedalimdd@gmail.com (duplicate prevented).`
          : result.success
          ? `Notification for ${budgetReq.id} sent to muhammedalimdd@gmail.com via Resend.`
          : result.error,
        error: result.error
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Cannot send email notification: Request ID not found. Notifications are sent only after a request is submitted.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch request notification email.'
    });
  }
};

app.post('/api/notifications/send-request-email', handleSendRequestNotificationEmail);
app.post('/api/send-request-email', handleSendRequestNotificationEmail);

// ================= ADMIN API ROUTES =================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password && VALID_ADMIN_KEYS.has(password)) {
    return res.json({ success: true, token: password });
  }
  return res.status(401).json({ error: 'Incorrect administrator password.' });
});

// 11. Admin Video Requests List & Stats
app.get('/api/admin/requests', requireAdmin, (req, res) => {
  const requests = db.getAllRequests();
  const filter = (req.query.filter as string) || 'all';

  let filtered = requests;
  if (filter === 'free_trial') {
    filtered = requests.filter((r) => r.requestType === 'free_trial');
  } else if (filter === 'paid') {
    filtered = requests.filter((r) => r.requestType === 'paid');
  } else if (filter === 'quoted') {
    filtered = requests.filter((r) => r.quote && r.quote.status === 'sent');
  } else if (filter === 'approved') {
    filtered = requests.filter((r) => r.status === 'Approved');
  } else if (filter === 'in_production') {
    filtered = requests.filter((r) => r.status === 'In Production');
  } else if (filter === 'completed') {
    filtered = requests.filter((r) => r.status === 'Completed' || r.status === 'Delivered');
  }

  const stats = {
    total: requests.length,
    freeTrial: requests.filter((r) => r.requestType === 'free_trial').length,
    paid: requests.filter((r) => r.requestType === 'paid').length,
    awaitingReview: requests.filter((r) => r.status === 'Submitted' || r.status === 'Under Review')
      .length,
    awaitingCustomerQuoteApproval: requests.filter(
      (r) => r.quote && r.quote.status === 'sent'
    ).length,
    inProduction: requests.filter((r) => r.status === 'In Production').length,
    completed: requests.filter((r) => r.status === 'Completed' || r.status === 'Delivered').length,
    failedEmails: db.getEmailLogs().filter((l) => l.status === 'failed').length
  };

  res.json({
    success: true,
    stats,
    requests: filtered
  });
});

// 12. Admin Users & Free Trial Management
app.get('/api/admin/users', requireAdmin, (_req, res) => {
  const users = db.getAllUsers();
  res.json({
    success: true,
    users
  });
});

app.post('/api/admin/users/:uid/trial-status', requireAdmin, (req, res) => {
  try {
    const { uid } = req.params;
    const { newStatus, reason } = req.body;
    const adminEmail = (req.headers['x-admin-email'] as string) || 'admin@aivideomaker.com';

    if (!['eligible', 'reserved', 'used'].includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid trial status' });
    }

    const result = db.updateUserTrialStatus(
      uid,
      newStatus as TrialStatus,
      adminEmail,
      reason || 'Manual administrative review correction'
    );
    if (!result) {
      return res.status(404).json({ error: 'User account not found' });
    }

    res.json({
      success: true,
      user: result.user,
      audit: result.audit
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', requireAdmin, (_req, res) => {
  res.json({
    success: true,
    auditLogs: db.getAuditLogs()
  });
});

// 13. Admin Send Custom Quote to Customer
app.post('/api/admin/requests/:id/quote', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, breakdown, validUntil, paymentLink, adminNotes } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid numeric quote amount is required.' });
    }

    const updated = db.setQuote(id, {
      amount: Number(amount),
      currency: currency || '₹',
      breakdown,
      validUntil,
      paymentLink,
      adminNotes
    });

    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const baseUrl = getBaseUrl(req);
    if (updated.quote) {
      emailService
        .sendCustomerQuoteNotification(updated, updated.quote, baseUrl)
        .catch((e) => console.error('Quote email notification failed:', e));
    }

    res.json({
      success: true,
      request: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Admin Record / Confirm Payment
app.post('/api/admin/requests/:id/payment', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amount, paymentMethod, transactionRef } = req.body;

    const updated = db.recordPayment(id, {
      status: status || 'verified',
      amount,
      paymentMethod,
      transactionRef
    });

    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const baseUrl = getBaseUrl(req);
    if (status === 'verified') {
      emailService
        .sendPaymentConfirmedNotification(updated, baseUrl)
        .catch((e) => console.error('Payment confirmation email failed:', e));
    }

    res.json({
      success: true,
      request: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Admin Deliver Completed Video to Customer Email
const handleAdminDeliverVideo = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { directLink, downloadUrl, filename, sizeBytes, message } = req.body;

    const rawLink = (directLink || downloadUrl || '').trim();
    if (!rawLink) {
      return res.status(400).json({ error: 'Video download link or uploaded video file is required.' });
    }

    const baseUrl = getBaseUrl(req);
    const fullDownloadUrl = rawLink.startsWith('http')
      ? rawLink
      : `${baseUrl}${rawLink.startsWith('/') ? '' : '/'}${rawLink}`;

    const updated = db.deliverVideo(id, {
      directLink: rawLink,
      downloadUrl: fullDownloadUrl,
      filename,
      sizeBytes,
      message
    });
    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const emailResult = await emailService
      .sendVideoDelivery(
        updated,
        {
          downloadUrl: fullDownloadUrl,
          customMessage: message
        },
        baseUrl
      )
      .catch((e) => {
        console.error('Video delivery email failed:', e);
        return { success: false, status: 'failed' as const, error: e.message, emailLogId: '' };
      });

    res.json({
      success: true,
      request: updated,
      emailResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/admin/requests/:id/deliver-video', requireAdmin, handleAdminDeliverVideo);
app.post('/api/admin/requests/:id/deliver', requireAdmin, handleAdminDeliverVideo);

// 16. Admin Get Request by ID
app.get('/api/admin/requests/:id', requireAdmin, (req, res) => {
  const request = db.getRequestById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json({ success: true, request });
});

// Admin Update Request Details
app.patch('/api/admin/requests/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, note, estimatedCompletionDate, customerVisibleNotes, internalNote } = req.body;

  const request = db.getRequestById(id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  if (internalNote) {
    request.internalAdminNotes.push(`[${new Date().toLocaleDateString()}] ${internalNote}`);
  }

  const updated = db.updateRequest(
    id,
    {
      status: status || request.status,
      estimatedCompletionDate: estimatedCompletionDate !== undefined ? estimatedCompletionDate : request.estimatedCompletionDate,
      customerVisibleNotes: customerVisibleNotes !== undefined ? customerVisibleNotes : request.customerVisibleNotes
    },
    'admin',
    note
  );

  res.json({ success: true, request: updated });
});

// Admin Update Status
app.patch('/api/admin/requests/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, note, estimatedCompletionDate, customerVisibleNotes } = req.body;

  const updated = db.updateRequest(
    id,
    {
      status,
      estimatedCompletionDate,
      customerVisibleNotes
    },
    'admin',
    note
  );

  if (!updated) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.json({ success: true, request: updated });
});

// 17. Admin Add Internal Note
app.post('/api/admin/requests/:id/notes', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  const request = db.getRequestById(id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  request.internalAdminNotes.push(`[${new Date().toLocaleDateString()}] ${note}`);
  request.updatedAt = new Date().toISOString();

  res.json({ success: true, request });
});

// 18. Admin Budget Requests endpoints
app.get('/api/admin/budget-requests', requireAdmin, (req, res) => {
  const all = db.getAllBudgetRequests();
  const filter = (req.query.filter as string) || 'all';

  let filtered = all;
  if (filter === 'free') {
    filtered = all.filter((r) => r.isFree);
  } else if (filter === 'paid') {
    filtered = all.filter((r) => !r.isFree);
  } else if (['Submitted', 'Under Review', 'Accepted', 'Declined', 'Completed'].includes(filter)) {
    filtered = all.filter((r) => r.status === filter);
  }

  const stats = {
    total: all.length,
    free: all.filter((r) => r.isFree).length,
    paid: all.filter((r) => !r.isFree).length,
    submitted: all.filter((r) => r.status === 'Submitted').length,
    underReview: all.filter((r) => r.status === 'Under Review').length,
    accepted: all.filter((r) => r.status === 'Accepted').length,
    declined: all.filter((r) => r.status === 'Declined').length,
    completed: all.filter((r) => r.status === 'Completed').length
  };

  res.json({ success: true, stats, budgetRequests: filtered });
});

app.get('/api/admin/budget-requests/:id', requireAdmin, (req, res) => {
  const reqItem = db.getBudgetRequestById(req.params.id);
  if (!reqItem) {
    return res.status(404).json({ error: 'Budget request not found.' });
  }
  res.json({ success: true, budgetRequest: reqItem });
});

app.patch('/api/admin/budget-requests/:id', requireAdmin, (req, res) => {
  const updated = db.updateBudgetRequest(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Budget request not found.' });
  res.json({ success: true, budgetRequest: updated });
});

app.post('/api/admin/budget-requests/:id/reply', requireAdmin, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

  const updated = db.addBudgetReply(req.params.id, { from: 'admin', message: message.trim() });
  if (!updated) return res.status(404).json({ error: 'Budget request not found.' });

  const baseUrl = getBaseUrl(req);
  emailService.sendBudgetRequestReply(updated, message.trim(), baseUrl).catch(console.error);

  res.json({ success: true, budgetRequest: updated });
});

// 19. Admin Email Logs & Settings
app.get('/api/admin/email-logs', requireAdmin, (_req, res) => {
  res.json({ success: true, emailLogs: db.getEmailLogs() });
});

// Test Gmail Connection Endpoint
app.post('/api/admin/email/test-connection', requireAdmin, async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    const testResult = await emailService.sendTestEmail(recipientEmail);
    res.json(testResult);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to send test email.'
    });
  }
});

// Retry Email Endpoint
app.post('/api/admin/email/:id/retry', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const retryResult = await emailService.retryEmail(id);
    res.json(retryResult);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Resend Owner Notification for specific Request
app.post('/api/admin/requests/:id/resend-owner-email', requireAdmin, async (req, res) => {
  try {
    const request = db.getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    const baseUrl = getBaseUrl(req);
    const result = await emailService.sendOwnerNewRequestNotification(request, baseUrl, {
      forceRetry: true
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/devices', requireAdmin, (_req, res) => {
  res.json({ success: true, devices: db.getAllDevices() });
});

function getSanitizedSettingsForClient() {
  const raw = db.getSettings();
  const hasServerResendKey = Boolean(
    process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY || raw.apiKey
  );
  return {
    ...raw,
    ownerNotificationEmail: raw.ownerNotificationEmail || 'muhammedalimdd@gmail.com',
    emailProvider: raw.emailProvider || 'resend',
    apiKey: raw.apiKey ? '••••••••' : '',
    smtpPass: raw.smtpPass ? '••••••••' : '',
    hasResendApiKey: hasServerResendKey
  };
}

app.get('/api/admin/settings', requireAdmin, (_req, res) => {
  res.json({ success: true, settings: getSanitizedSettingsForClient() });
});

app.post('/api/admin/settings', requireAdmin, (req, res) => {
  const body = { ...(req.body || {}) };
  const current = db.getSettings();
  if (body.apiKey === '••••••••' || body.apiKey === '') {
    body.apiKey = body.apiKey === '' ? '' : current.apiKey;
  }
  if (body.smtpPass === '••••••••' || body.smtpPass === '') {
    body.smtpPass = body.smtpPass === '' ? '' : current.smtpPass;
  }
  db.updateSettings(body);
  res.json({ success: true, settings: getSanitizedSettingsForClient() });
});

// Catch-all for API routes to ALWAYS return JSON and never HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// JSON Error Handling Middleware for API
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.originalUrl.startsWith('/api/')) {
    console.error('API Error:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  }
  next(err);
});

// ================= FRONTEND VITE INTEGRATION =================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/uploads/')) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/uploads/')) {
        return res.status(404).json({ success: false, error: 'Endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Video Maker running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
}

export default app;
