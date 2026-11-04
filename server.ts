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

// Middleware: admin auth check
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const adminKey = req.headers['x-admin-key'] as string;

  if (adminKey === ADMIN_PASSWORD || authHeader === `Bearer ${ADMIN_PASSWORD}`) {
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

// 1. Check Device Registration Status
app.post('/api/device/status', (req, res) => {
  try {
    const { deviceId, fingerprintHash } = req.body;
    const status = db.checkDeviceStatus(deviceId, fingerprintHash);
    res.json({
      success: true,
      ...status
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. First-Time Device Account Creation
app.post('/api/auth/register-device', (req, res) => {
  try {
    const { username, password, confirmPassword, deviceId, fingerprintHash, contactEmail } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match. Please verify and try again.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const result = db.registerDeviceAccount({
      username,
      password,
      deviceId,
      fingerprintHash,
      ipSubnet: String(clientIp).split(',')[0].trim(),
      userAgent: String(userAgent),
      contactEmail
    });

    res.json({
      success: true,
      user: result.user,
      token: result.session.token,
      deviceId: result.device.deviceId,
      message: 'Account created and device locked successfully.'
    });
  } catch (err: any) {
    const isConflict = err.message && (err.message.includes('already permanently registered') || err.message.includes('already taken'));
    res.status(isConflict ? 403 : 400).json({
      error: err.message || 'Failed to create account.'
    });
  }
});

// 3. Returning User Device Login
app.post('/api/auth/login-device', (req, res) => {
  try {
    const { username, password, deviceId, fingerprintHash } = req.body;

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
});

// 4. Validate Current Session
app.get('/api/auth/session', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (req.headers['x-session-token'] as string) ||
      (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

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
});

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
    const finalCustomerEmail = (customerEmail || userEmail || '').trim().toLowerCase();
    if (!finalCustomerEmail || !finalCustomerEmail.includes('@')) {
      return res.status(400).json({ error: 'A valid verified Google email address is required.' });
    }
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }
    if (!termsAccepted) {
      return res.status(400).json({ error: 'You must agree to the Terms and Privacy Policy.' });
    }

    const type: 'free_trial' | 'paid' = requestType === 'free_trial' ? 'free_trial' : 'paid';

    // Synchronize or find user account
    let user = db.getUserByEmail(finalCustomerEmail);
    if (!user && userId) {
      user = db.getUserByUid(userId);
    }
    if (!user) {
      user = db.syncUser({
        uid: userId || `g-user-${crypto.randomBytes(6).toString('hex')}`,
        email: finalCustomerEmail,
        displayName: customerName
      });
    }

    // Atomic creation with Free Trial verification
    const { request: created, isFreeTrial } = db.createRequest({
      userId: user.uid,
      userEmail: user.email,
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

    // Send emails asynchronously
    const ownerEmailPromise = emailService
      .sendOwnerNewRequestNotification(created, baseUrl)
      .catch((e) => {
        console.error('Owner notification email failed:', e);
      });
    const customerEmailPromise = emailService
      .sendCustomerConfirmation(created, baseUrl)
      .catch((e) => {
        console.error('Customer confirmation email failed:', e);
      });

    await Promise.allSettled([ownerEmailPromise, customerEmailPromise]);

    return res.status(201).json({
      success: true,
      request: created,
      isFreeTrial
    });
  } catch (err: any) {
    console.error('Error submitting video request:', err);
    return res.status(400).json({ error: err.message || 'Failed to submit video request' });
  }
});

// 7. Get Customer Requests (My Requests)
app.get('/api/user/requests', (req, res) => {
  const email = (req.query.email as string) || (req.headers['x-user-email'] as string);
  const uid = (req.query.uid as string) || (req.headers['x-user-uid'] as string);

  if (!email && !uid) {
    return res.status(400).json({ error: 'User email or UID is required' });
  }

  const requests = db.getUserRequests(email || uid);
  res.json({
    success: true,
    requests
  });
});

// 8. Public Track Video Request by ID and Token
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

    const created = db.createBudgetRequest({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
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
    const ownerEmailPromise = emailService
      .sendOwnerBudgetRequestNotification(created, baseUrl)
      .catch((e) => console.error('Owner budget notification failed:', e));
    const customerEmailPromise = emailService
      .sendCustomerBudgetConfirmation(created)
      .catch((e) => console.error('Customer budget confirmation failed:', e));

    await Promise.allSettled([ownerEmailPromise, customerEmailPromise]);

    res.status(201).json({
      success: true,
      budgetRequest: created
    });
  } catch (err: any) {
    console.error('Failed to submit budget request:', err);
    res.status(400).json({ error: err.message || 'Failed to submit budget request.' });
  }
});

// ================= ADMIN API ROUTES =================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
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

// 15. Admin Deliver Completed Video
app.post('/api/admin/requests/:id/deliver-video', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { directLink, message } = req.body;

    if (!directLink || !directLink.trim()) {
      return res.status(400).json({ error: 'Video direct download/streaming link is required.' });
    }

    const updated = db.deliverVideo(id, { directLink, message });
    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const baseUrl = getBaseUrl(req);
    emailService
      .sendVideoDelivery(
        updated,
        {
          downloadUrl: directLink,
          customMessage: message
        },
        baseUrl
      )
      .catch((e) => console.error('Video delivery email failed:', e));

    res.json({
      success: true,
      request: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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
    const result = await emailService.sendOwnerNewRequestNotification(request, baseUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/devices', requireAdmin, (_req, res) => {
  res.json({ success: true, devices: db.getAllDevices() });
});

app.get('/api/admin/settings', requireAdmin, (_req, res) => {
  res.json({ success: true, settings: db.getSettings() });
});

app.post('/api/admin/settings', requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
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
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Video Maker running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
