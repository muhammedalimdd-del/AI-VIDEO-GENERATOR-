import nodemailer from 'nodemailer';
import { VideoRequest, BudgetRequest, EmailLog, QuoteDetails } from './types.ts';
import { db } from './db.ts';

export const OWNER_GMAIL_ADDRESS = 'muhammedalimdd@gmail.com';

export interface SendResult {
  success: boolean;
  status: 'sent' | 'simulated' | 'failed';
  error?: string;
  emailLogId: string;
}

export class EmailService {
  /**
   * Builds an authenticated nodemailer Transporter based on database settings or environment variables.
   * Supports Google / Gmail App Password, Custom SMTP, or falls back to API providers.
   */
  private getTransporter() {
    const settings = db.getSettings();
    const provider = settings.emailProvider || 'gmail';

    const host = settings.smtpHost || process.env.SMTP_HOST || (provider === 'gmail' ? 'smtp.gmail.com' : undefined);
    const port = settings.smtpPort || parseInt(process.env.SMTP_PORT || (provider === 'gmail' ? '465' : '587'), 10);
    const user = settings.smtpUser || process.env.SMTP_USER;
    const pass = settings.smtpPass || process.env.SMTP_PASS;
    const secure = settings.smtpSecure !== undefined ? settings.smtpSecure : (port === 465);

    if (user && pass) {
      if (provider === 'gmail' || (host && host.toLowerCase().includes('gmail.com'))) {
        return nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass }
        });
      }
      if (host) {
        return nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });
      }
    }
    return null;
  }

  /**
   * Dispatches email using SMTP, Resend API, SendGrid API, or FormSubmit relay for owner notifications.
   * Logs every email in Email Logs so it is always stored and retryable.
   */
  public async dispatchEmail(options: {
    requestId: string;
    type: EmailLog['type'];
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<SendResult> {
    const settings = db.getSettings();
    const fromAddress =
      process.env.EMAIL_FROM_ADDRESS || settings.emailFromAddress || settings.ownerNotificationEmail || OWNER_GMAIL_ADDRESS;
    const transporter = this.getTransporter();

    // First save the log entry with initial pending state
    const log = db.logEmail({
      requestId: options.requestId,
      type: options.type,
      recipient: options.to,
      subject: options.subject,
      status: 'failed',
      htmlBody: options.html,
      textBody: options.text,
      error: undefined
    });

    // 1. Try SMTP (Gmail or custom SMTP)
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"AI Video Maker" <${fromAddress}>`,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html
        });

        db.updateEmailLog(log.id, { status: 'sent', error: undefined });
        return { success: true, status: 'sent', emailLogId: log.id };
      } catch (err: any) {
        const errorMsg = err.message || 'SMTP transmission error';
        console.error('Failed to send email via SMTP:', errorMsg);
        db.updateEmailLog(log.id, { status: 'failed', error: errorMsg });
        return { success: false, status: 'failed', error: errorMsg, emailLogId: log.id };
      }
    }

    // 2. Try Resend API
    const apiKey = settings.apiKey || process.env.EMAIL_PROVIDER_API_KEY || process.env.RESEND_API_KEY;
    if (apiKey && (apiKey.startsWith('re_') || settings.emailProvider === 'resend')) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            from: `AI Video Maker <${fromAddress}>`,
            to: [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text
          })
        });

        if (res.ok) {
          db.updateEmailLog(log.id, { status: 'sent', error: undefined });
          return { success: true, status: 'sent', emailLogId: log.id };
        } else {
          const errJson = await res.json().catch(() => ({ message: res.statusText }));
          const errMsg = errJson.message || 'Resend API error';
          db.updateEmailLog(log.id, { status: 'failed', error: errMsg });
          return { success: false, status: 'failed', error: errMsg, emailLogId: log.id };
        }
      } catch (e: any) {
        db.updateEmailLog(log.id, { status: 'failed', error: e.message });
        return { success: false, status: 'failed', error: e.message, emailLogId: log.id };
      }
    }

    // 3. Try SendGrid API
    if (apiKey && (apiKey.startsWith('SG.') || settings.emailProvider === 'sendgrid')) {
      try {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: options.to }] }],
            from: { email: fromAddress, name: 'AI Video Maker' },
            subject: options.subject,
            content: [
              { type: 'text/plain', value: options.text },
              { type: 'text/html', value: options.html }
            ]
          })
        });

        if (res.status >= 200 && res.status < 300) {
          db.updateEmailLog(log.id, { status: 'sent', error: undefined });
          return { success: true, status: 'sent', emailLogId: log.id };
        } else {
          const errMsg = `SendGrid error status: ${res.status} ${res.statusText}`;
          db.updateEmailLog(log.id, { status: 'failed', error: errMsg });
          return { success: false, status: 'failed', error: errMsg, emailLogId: log.id };
        }
      } catch (e: any) {
        db.updateEmailLog(log.id, { status: 'failed', error: e.message });
        return { success: false, status: 'failed', error: e.message, emailLogId: log.id };
      }
    }

    // 4. Fast FormSubmit Relay attempt when delivering to muhammedalimdd@gmail.com
    if (options.to.toLowerCase().includes(OWNER_GMAIL_ADDRESS)) {
      try {
        const relayRes = await fetch(`https://formsubmit.co/ajax/${OWNER_GMAIL_ADDRESS}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            _subject: options.subject,
            _template: 'table',
            _captcha: 'false',
            request_id: options.requestId,
            recipient: OWNER_GMAIL_ADDRESS,
            message: options.text
          }),
          signal: AbortSignal.timeout(2500)
        });

        if (relayRes.ok) {
          db.updateEmailLog(log.id, { status: 'sent', error: undefined });
          return { success: true, status: 'sent', emailLogId: log.id };
        }
      } catch {
        // Ignore timeout/network error on external relay and record in email queue
      }
    }

    // No credentials configured: record in email queue so it can be retried or opened in Gmail
    const unconfiguredMsg =
      'Queued for muhammedalimdd@gmail.com: Configure Gmail App Password in Admin Settings > Email Configuration for automatic SMTP, or click "Retry" / "Open in Gmail".';
    db.updateEmailLog(log.id, {
      status: 'failed',
      error: unconfiguredMsg
    });
    return { success: false, status: 'failed', error: unconfiguredMsg, emailLogId: log.id };
  }

  /**
   * Retries sending a previously logged email.
   */
  public async retryEmail(emailLogId: string): Promise<SendResult> {
    const log = db.getEmailLogById(emailLogId);
    if (!log) {
      return { success: false, status: 'failed', error: 'Email log not found', emailLogId };
    }

    const settings = db.getSettings();
    const fromAddress =
      process.env.EMAIL_FROM_ADDRESS || settings.emailFromAddress || settings.ownerNotificationEmail || 'muhammedalimdd@gmail.com';
    const transporter = this.getTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"AI Video Maker" <${fromAddress}>`,
          to: log.recipient,
          subject: log.subject,
          text: log.textBody,
          html: log.htmlBody
        });

        db.updateEmailLog(log.id, { status: 'sent', error: undefined, sentAt: new Date().toISOString() });
        return { success: true, status: 'sent', emailLogId: log.id };
      } catch (err: any) {
        const errorMsg = err.message || 'SMTP retry error';
        db.updateEmailLog(log.id, { status: 'failed', error: errorMsg, sentAt: new Date().toISOString() });
        return { success: false, status: 'failed', error: errorMsg, emailLogId: log.id };
      }
    }

    const apiKey = settings.apiKey || process.env.EMAIL_PROVIDER_API_KEY || process.env.RESEND_API_KEY;
    if (apiKey && (apiKey.startsWith('re_') || settings.emailProvider === 'resend')) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            from: `AI Video Maker <${fromAddress}>`,
            to: [log.recipient],
            subject: log.subject,
            html: log.htmlBody,
            text: log.textBody
          })
        });

        if (res.ok) {
          db.updateEmailLog(log.id, { status: 'sent', error: undefined, sentAt: new Date().toISOString() });
          return { success: true, status: 'sent', emailLogId: log.id };
        } else {
          const errJson = await res.json().catch(() => ({ message: res.statusText }));
          const errMsg = errJson.message || 'Resend API retry error';
          db.updateEmailLog(log.id, { status: 'failed', error: errMsg, sentAt: new Date().toISOString() });
          return { success: false, status: 'failed', error: errMsg, emailLogId: log.id };
        }
      } catch (e: any) {
        db.updateEmailLog(log.id, { status: 'failed', error: e.message, sentAt: new Date().toISOString() });
        return { success: false, status: 'failed', error: e.message, emailLogId: log.id };
      }
    }

    const sendgridKey = settings.apiKey || process.env.SENDGRID_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
    if (sendgridKey && (sendgridKey.startsWith('SG.') || settings.emailProvider === 'sendgrid')) {
      try {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sendgridKey}`
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: log.recipient }] }],
            from: { email: fromAddress, name: 'AI Video Maker' },
            subject: log.subject,
            content: [
              { type: 'text/plain', value: log.textBody },
              { type: 'text/html', value: log.htmlBody }
            ]
          })
        });

        if (res.status >= 200 && res.status < 300) {
          db.updateEmailLog(log.id, { status: 'sent', error: undefined, sentAt: new Date().toISOString() });
          return { success: true, status: 'sent', emailLogId: log.id };
        } else {
          const errMsg = `SendGrid retry error status: ${res.status} ${res.statusText}`;
          db.updateEmailLog(log.id, { status: 'failed', error: errMsg, sentAt: new Date().toISOString() });
          return { success: false, status: 'failed', error: errMsg, emailLogId: log.id };
        }
      } catch (e: any) {
        db.updateEmailLog(log.id, { status: 'failed', error: e.message, sentAt: new Date().toISOString() });
        return { success: false, status: 'failed', error: e.message, emailLogId: log.id };
      }
    }

    const errMsg = 'Cannot retry: SMTP or API credentials are not yet configured on the server.';
    db.updateEmailLog(log.id, { status: 'failed', error: errMsg, sentAt: new Date().toISOString() });
    return { success: false, status: 'failed', error: errMsg, emailLogId: log.id };
  }

  /**
   * TEST GMAIL CONNECTION
   * Sends a test email to muhammedalimdd@gmail.com with the exact subject and message required.
   */
  public async sendTestEmail(targetEmail?: string): Promise<{
    success: boolean;
    recipient: string;
    subject: string;
    message: string;
    error?: string;
  }> {
    const settings = db.getSettings();
    const recipient = targetEmail || settings.ownerNotificationEmail || 'muhammedalimdd@gmail.com';
    const subject = 'AI VIDEO MAKER — TEST EMAIL';
    const message =
      'Congratulations! Your AI Video Maker email notification system is connected. New customer video requests will be delivered to this Gmail inbox.';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:24px; background-color:#0B0F19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#F1F5F9; line-height:1.6;">
  <div style="max-width:600px; margin:0 auto; background-color:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
    <div style="background:linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%); padding:28px; border-bottom:1px solid #1E293B; text-align:center;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#818CF8; font-weight:700;">AI Video Maker</div>
      <h1 style="margin:8px 0 0; font-size:22px; color:#FFFFFF; font-weight:700;">Gmail Connection Test</h1>
    </div>
    <div style="padding:28px;">
      <div style="background:#064E3B; border:1px solid #059669; border-radius:8px; padding:18px; margin-bottom:20px; text-align:center;">
        <span style="font-size:24px;">🎉</span>
        <p style="margin:8px 0 0; font-size:16px; font-weight:700; color:#A7F3D0;">
          ${message}
        </p>
      </div>

      <div style="background:#131B2E; border:1px solid #1E293B; border-radius:8px; padding:16px; font-size:13px; color:#94A3B8; line-height:1.8;">
        <p style="margin:0;"><strong style="color:#E2E8F0;">Destination Inbox:</strong> ${escapeHtml(recipient)}</p>
        <p style="margin:0;"><strong style="color:#E2E8F0;">Timestamp:</strong> ${new Date().toUTCString()}</p>
        <p style="margin:0;"><strong style="color:#E2E8F0;">Status:</strong> Successfully verified connection</p>
      </div>
    </div>
    <div style="padding:16px 28px; background:#0B0F19; border-top:1px solid #1E293B; font-size:12px; color:#64748B; text-align:center;">
      AI Video Maker &bull; Automatic Request Notification System
    </div>
  </div>
</body>
</html>
    `;

    const text = `
AI VIDEO MAKER — TEST EMAIL

${message}

Destination Inbox: ${recipient}
Timestamp: ${new Date().toUTCString()}
Status: Verified
    `.trim();

    const dispatchResult = await this.dispatchEmail({
      requestId: 'SYS-TEST-CONN',
      type: 'test_connection',
      to: recipient,
      subject,
      html,
      text
    });

    // Update settings test status
    db.updateSettings({
      lastTestedAt: new Date().toISOString(),
      lastTestStatus: dispatchResult.success ? 'success' : 'failed',
      lastTestError: dispatchResult.error
    });

    return {
      success: dispatchResult.success,
      recipient,
      subject,
      message,
      error: dispatchResult.error
    };
  }

  // 1. Email A: New Request Notification to Owner (muhammedalimdd@gmail.com)
  // Exact Subject: NEW AI VIDEO REQUEST — [CUSTOMER NAME] — [REQUEST ID]
  public async sendOwnerNewRequestNotification(request: VideoRequest, baseUrl: string): Promise<SendResult> {
    const configuredOwner = process.env.OWNER_NOTIFICATION_EMAIL || db.getSettings().ownerNotificationEmail || OWNER_GMAIL_ADDRESS;
    const ownerEmail = configuredOwner.toLowerCase().includes(OWNER_GMAIL_ADDRESS)
      ? configuredOwner
      : OWNER_GMAIL_ADDRESS;
    const adminLink = `${baseUrl}/admin?request=${request.id}`;
    const isTrial = request.requestType === 'free_trial';
    const customerUsername = request.customerUsername || request.userId || request.customerName;

    const uploadedPhotoLinks = request.characters
      .filter((c) => !!c.referencePhotoUrl)
      .map((c) => {
        const fullUrl = c.referencePhotoUrl!.startsWith('http')
          ? c.referencePhotoUrl!
          : `${baseUrl}${c.referencePhotoUrl!.startsWith('/') ? '' : '/'}${c.referencePhotoUrl!}`;
        return { characterName: c.name, url: fullUrl };
      });

    const charactersHtml =
      request.characters.length > 0
        ? request.characters
            .map((c) => {
              const fullPhotoUrl = c.referencePhotoUrl
                ? c.referencePhotoUrl.startsWith('http')
                  ? c.referencePhotoUrl
                  : `${baseUrl}${c.referencePhotoUrl.startsWith('/') ? '' : '/'}${c.referencePhotoUrl}`
                : null;

              return `
          <div style="background:#131B2E; border:1px solid #1E293B; border-radius:8px; padding:14px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <strong style="color:#60A5FA; font-size:15px;">${escapeHtml(c.name)}</strong>
                <span style="color:#94A3B8; font-size:13px;"> &mdash; ${escapeHtml(c.role || 'Character')}${c.ageRange ? `, Age: ${escapeHtml(c.ageRange)}` : ''}</span>
              </div>
            </div>
            <div style="margin-top:8px; font-size:13px; color:#E2E8F0; line-height:1.7;">
              <p style="margin:2px 0;"><span style="color:#94A3B8;">Appearance:</span> ${escapeHtml(c.appearance || 'N/A')}</p>
              ${c.clothing ? `<p style="margin:2px 0;"><span style="color:#94A3B8;">Clothing:</span> ${escapeHtml(c.clothing)}</p>` : ''}
              ${c.hairstyle ? `<p style="margin:2px 0;"><span style="color:#94A3B8;">Hairstyle:</span> ${escapeHtml(c.hairstyle)}</p>` : ''}
              ${c.personality ? `<p style="margin:2px 0;"><span style="color:#94A3B8;">Personality:</span> ${escapeHtml(c.personality)}</p>` : ''}
              ${c.actions ? `<p style="margin:2px 0;"><span style="color:#94A3B8;">Actions / Movements:</span> ${escapeHtml(c.actions)}</p>` : ''}
              ${c.dialogue ? `<p style="margin:2px 0;"><span style="color:#94A3B8;">Spoken Dialogue:</span> <strong style="color:#38BDF8;">"${escapeHtml(c.dialogue)}"</strong></p>` : ''}
            </div>
            ${
              fullPhotoUrl
                ? `<div style="margin-top:10px; padding:10px; background:#0B0F19; border-radius:6px; border:1px solid #1E293B;">
                     <span style="color:#94A3B8; font-size:12px; font-weight:600; display:block; margin-bottom:4px;">Uploaded Reference Photo Link:</span>
                     <a href="${fullPhotoUrl}" target="_blank" style="color:#38BDF8; font-size:13px; font-weight:700; text-decoration:underline; word-break:break-all;">${escapeHtml(fullPhotoUrl)}</a>
                   </div>`
                : ''
            }
          </div>
        `;
            })
            .join('')
        : '<p style="color:#94A3B8;">No character specifications provided.</p>';

    const scenesHtml =
      request.scenes.length > 0
        ? request.scenes
            .map(
              (s) => `
          <div style="background:#131B2E; border:1px solid #1E293B; border-radius:8px; padding:12px; margin-bottom:10px;">
            <strong style="color:#A78BFA; font-size:14px;">Scene ${s.sceneNumber}: ${escapeHtml(s.location || 'Location')}</strong>
            <span style="color:#94A3B8; font-size:12px;"> (${escapeHtml(s.estimatedDuration || 'Est. Duration')})</span><br/>
            <div style="margin-top:6px; font-size:13px; color:#E2E8F0; line-height:1.6;">
              <span style="color:#94A3B8;">Time / Atmosphere:</span> ${escapeHtml(s.timeOfDay || '')} &bull; ${escapeHtml(s.lightingAtmosphere || '')}<br/>
              <span style="color:#94A3B8;">Characters Present:</span> ${escapeHtml(s.charactersPresent || 'None specified')}<br/>
              <span style="color:#94A3B8;">Scene Action:</span> ${escapeHtml(s.actions || '')}<br/>
              <span style="color:#94A3B8;">Camera Movement:</span> ${escapeHtml(s.cameraMovement || 'Standard')}
              ${s.dialogue ? `<br/><span style="color:#94A3B8;">Scene Dialogue:</span> <strong style="color:#38BDF8;">"${escapeHtml(s.dialogue)}"</strong>` : ''}
            </div>
          </div>
        `
            )
            .join('')
        : '<p style="color:#94A3B8;">Standard narrative flow provided in Story & Creative Vision.</p>';

    const dialoguesHtml =
      request.dialogueLines.length > 0
        ? request.dialogueLines
            .map(
              (d) => `
          <div style="background:#131B2E; border:1px solid #1E293B; border-radius:6px; padding:10px; margin-bottom:8px; font-size:13px;">
            <strong style="color:#38BDF8;">${escapeHtml(d.character)}:</strong>
            <span style="color:#FFFFFF;"> "${escapeHtml(d.text)}"</span>
            <span style="color:#94A3B8; font-size:11px;"> (${escapeHtml(d.language || 'English')}${d.pronunciationNotes ? `, Notes: ${escapeHtml(d.pronunciationNotes)}` : ''})</span>
          </div>
        `
            )
            .join('')
        : '<p style="color:#94A3B8;">No separate dialogue lines registered.</p>';

    // EXACT SUBJECT FORMAT REQUIRED: NEW AI VIDEO REQUEST — [CUSTOMER NAME] — [REQUEST ID]
    const subject = `NEW AI VIDEO REQUEST — ${request.customerName.toUpperCase()} — ${request.id}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:24px; background-color:#0B0F19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#F1F5F9; line-height:1.6;">
  <div style="max-width:700px; margin:0 auto; background-color:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
    
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%); padding:28px; border-bottom:1px solid #1E293B;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#818CF8; font-weight:700;">AI Video Maker &bull; Automatic Request Dispatch</div>
      <h1 style="margin:8px 0 0; font-size:24px; color:#FFFFFF; font-weight:800;">${escapeHtml(subject)}</h1>
      <p style="margin:6px 0 0; color:#94A3B8; font-size:14px;">
        Request ID: <span style="color:#38BDF8; font-family:monospace; font-weight:700;">${request.id}</span>
      </p>
    </div>

    <div style="padding:28px;">

      <!-- REQUEST TYPE & CURRENT STATUS -->
      <div style="margin-bottom:24px; padding:18px; background:#131B2E; border-left:5px solid ${isTrial ? '#10B981' : '#F59E0B'}; border-radius:6px;">
        <div style="font-size:15px; font-weight:800; color:${isTrial ? '#34D399' : '#F59E0B'}; letter-spacing:0.5px;">
          REQUEST TYPE: ${isTrial ? 'FREE TRIAL' : 'PAID REQUEST'}
        </div>
        <p style="margin:6px 0 0; font-size:14px; color:#FFFFFF;">
          ${
            isTrial
              ? '✓ Free Trial Request (1-Time Free Trial per registered account).'
              : '⚡ Paid Request — "The payment will be based on the video."'
          }
        </p>
        <p style="margin:6px 0 0; font-size:13px; color:#94A3B8;">
          <strong>Current Request Status:</strong> <span style="color:#60A5FA; font-weight:700;">${escapeHtml(request.status)}</span>
        </p>
      </div>

      <!-- CUSTOMER INFORMATION -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#818CF8; font-weight:700;">Customer Information</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px; background:#0B0F19; border:1px solid #1E293B; border-radius:8px; padding:12px;">
          <tr>
            <td style="padding:8px 12px; color:#94A3B8; width:200px;">Customer Name:</td>
            <td style="padding:8px 12px; color:#FFFFFF; font-weight:700;">${escapeHtml(request.customerName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Customer Username:</td>
            <td style="padding:8px 12px; color:#A78BFA; font-family:monospace; font-weight:700;">@${escapeHtml(customerUsername)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Customer Email Address (Delivery):</td>
            <td style="padding:8px 12px; color:#38BDF8; font-weight:700;">${escapeHtml(request.customerEmail)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Request ID:</td>
            <td style="padding:8px 12px; color:#38BDF8; font-family:monospace; font-weight:700;">${escapeHtml(request.id)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Request Submission Date & Time:</td>
            <td style="padding:8px 12px; color:#FFFFFF;">${new Date(request.createdAt).toLocaleString()} (${new Date(request.createdAt).toUTCString()})</td>
          </tr>
          ${request.customerPhone ? `<tr><td style="padding:8px 12px; color:#94A3B8;">Phone / WhatsApp:</td><td style="padding:8px 12px; color:#FFFFFF;">${escapeHtml(request.customerPhone)}</td></tr>` : ''}
        </table>
      </div>

      <!-- VIDEO SPECIFICATIONS -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#94A3B8; font-weight:700;">Video Specifications & Preferences</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px; background:#0B0F19; border:1px solid #1E293B; border-radius:8px;">
          <tr>
            <td style="padding:8px 12px; color:#94A3B8; width:200px;">Video Title:</td>
            <td style="padding:8px 12px; color:#FFFFFF; font-weight:700;">${escapeHtml(request.title)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Video Category & Style:</td>
            <td style="padding:8px 12px; color:#FFFFFF; font-weight:600;">${escapeHtml(request.videoType || 'Custom AI Video')} &bull; ${escapeHtml(request.purpose || 'General')} &bull; ${escapeHtml(request.style)}${request.customStyle ? ` (${escapeHtml(request.customStyle)})` : ''}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Portrait or Landscape Format:</td>
            <td style="padding:8px 12px; color:#FFFFFF; font-weight:600;">${request.format.toUpperCase()} (${escapeHtml(request.aspectRatio)}) &mdash; ${escapeHtml(request.outputResolution || request.resolution)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Requested Duration:</td>
            <td style="padding:8px 12px; color:#FFFFFF; font-weight:600;">${escapeHtml(request.duration)}${request.customDuration ? ` (${escapeHtml(request.customDuration)})` : ''}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Video Language:</td>
            <td style="padding:8px 12px; color:#38BDF8; font-weight:700;">${escapeHtml(request.language || 'English')}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Dialogue & Voice-Over Preferences:</td>
            <td style="padding:8px 12px; color:#FFFFFF;">Voice-Over: ${escapeHtml(request.voiceOverPref || 'None')} &bull; Dialogue: ${escapeHtml(request.dialoguePref || 'Standard')} &bull; Subtitles: ${request.subtitles ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; color:#94A3B8;">Music Preferences:</td>
            <td style="padding:8px 12px; color:#FFFFFF;">Background Music: ${escapeHtml(request.backgroundMusic || 'Cinematic Ambient')} &bull; Sound Effects: ${request.soundEffects ? 'Enabled' : 'Disabled'}</td>
          </tr>
        </table>
      </div>

      <!-- VIDEO IDEA & DESCRIPTION -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#94A3B8; font-weight:700;">Video Idea & Description</h3>
        <div style="background:#090D16; padding:16px; border-radius:8px; border:1px solid #1E293B; font-size:14px; color:#E2E8F0; white-space:pre-wrap; line-height:1.7;">
          ${escapeHtml(request.summary || request.storyDescription || 'No summary entered.')}
        </div>
      </div>

      <!-- STORY & SCENE DESCRIPTIONS -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#94A3B8; font-weight:700;">Story & Scene Descriptions (${request.scenes.length} Scenes)</h3>
        <div style="background:#090D16; padding:16px; border-radius:8px; border:1px solid #1E293B; font-size:14px; color:#E2E8F0; white-space:pre-wrap; line-height:1.7; margin-bottom:12px;">
          ${escapeHtml(request.storyDescription || request.summary || 'No story narrative entered.')}
        </div>
        ${scenesHtml}
      </div>

      <!-- CHARACTERS & UPLOADED REFERENCE PHOTO LINKS -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#94A3B8; font-weight:700;">Character Names, Descriptions & Uploaded Reference Photo Links (${request.characters.length})</h3>
        ${charactersHtml}
      </div>

      <!-- CHARACTER DIALOGUES -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#94A3B8; font-weight:700;">Character Dialogues</h3>
        ${dialoguesHtml}
      </div>

      <!-- SPECIAL INSTRUCTIONS -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#94A3B8; font-weight:700;">Special Instructions</h3>
        <div style="background:#131B2E; padding:14px; border-radius:6px; font-size:13px; color:#E2E8F0; border:1px solid #1E293B;">
          ${escapeHtml(request.additionalInstructions || 'None provided by customer.')}
        </div>
      </div>

      <!-- ADMIN ACTION BUTTON -->
      <div style="text-align:center; padding:24px 0 12px;">
        <a href="${adminLink}" style="display:inline-block; background:linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color:#FFFFFF; text-decoration:none; padding:14px 36px; border-radius:8px; font-weight:700; font-size:15px; box-shadow:0 4px 14px rgba(99, 102, 241, 0.4);">
          Open Request in Admin Dashboard &rarr;
        </a>
      </div>

    </div>

    <!-- FOOTER -->
    <div style="padding:16px 28px; background:#0B0F19; border-top:1px solid #1E293B; font-size:12px; color:#64748B; text-align:center;">
      AI Video Maker &bull; Automatic Request Delivery to ${escapeHtml(ownerEmail)} &bull; ${request.id}
    </div>
  </div>
</body>
</html>
    `;

    const text = `
${subject}

1. Customer Name: ${request.customerName}
2. Customer Username: @${customerUsername}
3. Customer Email Address: ${request.customerEmail}
4. Request ID: ${request.id}
5. Request Submission Date and Time: ${request.createdAt}
6. Video Title: ${request.title}
7. Video Idea and Description: ${request.summary || request.storyDescription}
8. Video Category and Style: ${request.videoType || 'Custom AI Video'} / ${request.purpose || 'General'} / ${request.style}${request.customStyle ? ` (${request.customStyle})` : ''}
9. Portrait or Landscape Format: ${request.format.toUpperCase()} (${request.aspectRatio}) — ${request.outputResolution || request.resolution}
10. Requested Duration: ${request.duration}${request.customDuration ? ` (${request.customDuration})` : ''}
11. Video Language: ${request.language || 'English'}
12. Character Names and Descriptions:
${
  request.characters.length > 0
    ? request.characters
        .map(
          (c) =>
            `- ${c.name} (${c.role || 'Character'}): Appearance: ${c.appearance || 'N/A'}${
              c.clothing ? ` | Clothing: ${c.clothing}` : ''
            }${c.actions ? ` | Actions: ${c.actions}` : ''}${c.dialogue ? ` | Dialogue: "${c.dialogue}"` : ''}`
        )
        .join('\n')
    : 'None specified'
}
13. Uploaded Reference Photo Links:
${
  uploadedPhotoLinks.length > 0
    ? uploadedPhotoLinks.map((p) => `- ${p.characterName}: ${p.url}`).join('\n')
    : 'No reference photos uploaded'
}
14. Story and Scene Descriptions:
Story: ${request.storyDescription || request.summary || 'N/A'}
${
  request.scenes.length > 0
    ? request.scenes
        .map(
          (s) =>
            `Scene ${s.sceneNumber} (${s.location || 'Location'}): Action: ${s.actions} | Camera: ${s.cameraMovement} | Lighting: ${s.lightingAtmosphere}`
        )
        .join('\n')
    : ''
}
15. Dialogue and Voice-Over Preferences:
Voice-Over: ${request.voiceOverPref || 'None'} | Dialogue Preference: ${request.dialoguePref || 'Standard'} | Subtitles: ${request.subtitles ? 'Yes' : 'No'}
${
  request.dialogueLines.length > 0
    ? request.dialogueLines.map((d) => `- ${d.character}: "${d.text}" (${d.language})`).join('\n')
    : ''
}
16. Music Preferences:
Background Music: ${request.backgroundMusic || 'Cinematic Ambient'} | Sound Effects: ${request.soundEffects ? 'Yes' : 'No'}
17. Free Trial or Paid Request Type: ${isTrial ? 'FREE TRIAL' : 'PAID REQUEST'}
18. Current Request Status: ${request.status}

Special Instructions:
${request.additionalInstructions || 'None provided.'}

Open in Admin Dashboard:
${adminLink}
    `.trim();

    return this.dispatchEmail({
      requestId: request.id,
      type: 'owner_new_request',
      to: ownerEmail,
      subject,
      html,
      text
    });
  }

  // 2. Email B: Customer Submission Confirmation
  // Exact Subject: YOUR AI VIDEO REQUEST HAS BEEN RECEIVED
  // Exact Message: "Thank you for submitting your AI video request! We have received your requirements and will review your idea. You will receive further updates and your completed video through email when it is ready."
  public async sendCustomerConfirmation(request: VideoRequest, baseUrl: string): Promise<SendResult> {
    const isTrial = request.requestType === 'free_trial';
    const trackingLink = `${baseUrl}/my-requests?id=${request.id}&token=${request.accessToken}`;

    const subject = 'YOUR AI VIDEO REQUEST HAS BEEN RECEIVED';
    const primaryMessage =
      'Thank you for submitting your AI video request! We have received your requirements and will review your idea. You will receive further updates and your completed video through email when it is ready.';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:24px; background-color:#0B0F19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#F1F5F9; line-height:1.6;">
  <div style="max-width:600px; margin:0 auto; background-color:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
    <div style="background:linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%); padding:28px; border-bottom:1px solid #1E293B; text-align:center;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#818CF8; font-weight:700;">AI Video Maker</div>
      <h1 style="margin:8px 0 0; font-size:22px; color:#FFFFFF; font-weight:800;">YOUR AI VIDEO REQUEST HAS BEEN RECEIVED</h1>
      <p style="margin:8px 0 0; color:#94A3B8; font-size:14px;">Unique Request ID: <span style="color:#60A5FA; font-family:monospace; font-weight:700;">${request.id}</span></p>
    </div>

    <div style="padding:28px;">
      <p style="font-size:15px; color:#E2E8F0; margin-top:0;">Hello <strong>${escapeHtml(request.customerName)}</strong>,</p>

      <div style="background:#0F243E; border-left:4px solid #38BDF8; padding:16px; border-radius:4px; margin:16px 0;">
        <p style="margin:0; font-size:15px; color:#FFFFFF; font-weight:600; line-height:1.6;">
          "${primaryMessage}"
        </p>
      </div>

      <div style="background:#131B2E; border:1px solid #1E293B; border-radius:8px; padding:18px; margin:20px 0;">
        <h4 style="margin:0 0 10px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#818CF8;">Summary of Your Video Request</h4>
        <ul style="margin:0; padding-left:20px; font-size:14px; color:#E2E8F0; line-height:1.8;">
          <li><strong>Video Title:</strong> ${escapeHtml(request.title)}</li>
          <li><strong>Request Type:</strong> <span style="color:${isTrial ? '#34D399' : '#F59E0B'}; font-weight:700;">${isTrial ? 'FREE TRIAL' : 'PAID VIDEO REQUEST'}</span></li>
          <li><strong>Pricing Note:</strong> ${isTrial ? 'One-Time Free Trial' : 'The payment will be based on the video.'}</li>
          <li><strong>Style:</strong> ${escapeHtml(request.style)}</li>
          <li><strong>Orientation:</strong> ${request.format.toUpperCase()} (${escapeHtml(request.aspectRatio)})</li>
          <li><strong>Duration:</strong> ${escapeHtml(request.duration)}</li>
          <li><strong>Language:</strong> ${escapeHtml(request.language || 'English')}</li>
          <li><strong>Current Status:</strong> <span style="color:#38BDF8; font-weight:700;">${request.status}</span></li>
        </ul>
      </div>

      <div style="text-align:center; padding:12px 0 20px;">
        <a href="${trackingLink}" style="display:inline-block; background:linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color:#FFFFFF; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:700; font-size:14px; box-shadow:0 4px 12px rgba(99, 102, 241, 0.3);">
          View Request Status in My Portal &rarr;
        </a>
      </div>

      <p style="font-size:12px; color:#94A3B8; text-align:center; margin:0;">
        Delivery updates will be sent to your verified Google account: <strong>${escapeHtml(request.customerEmail)}</strong>
      </p>
    </div>

    <div style="padding:16px 28px; background:#0B0F19; border-top:1px solid #1E293B; font-size:12px; color:#64748B; text-align:center;">
      AI Video Maker &bull; Studio Dispatch &bull; Request ${request.id}
    </div>
  </div>
</body>
</html>
    `;

    const text = `
YOUR AI VIDEO REQUEST HAS BEEN RECEIVED

Hello ${request.customerName},

${primaryMessage}

Unique Request ID: ${request.id}
Video Title: ${request.title}
Request Type: ${isTrial ? 'FREE TRIAL' : 'PAID VIDEO REQUEST'}
Pricing: ${isTrial ? 'One-Time Free Trial' : 'The payment will be based on the video.'}
Style: ${request.style}
Format: ${request.format} (${request.aspectRatio})
Duration: ${request.duration}
Status: ${request.status}

Track status anytime:
${trackingLink}

AI Video Maker
    `.trim();

    return this.dispatchEmail({
      requestId: request.id,
      type: 'customer_confirmation',
      to: request.customerEmail,
      subject,
      html,
      text
    });
  }

  // 3. Email C: Custom Quote Sent to Customer
  public async sendCustomerQuoteNotification(
    request: VideoRequest,
    quote: QuoteDetails,
    baseUrl: string
  ): Promise<SendResult> {
    const quoteReviewLink = `${baseUrl}/my-requests?id=${request.id}&token=${request.accessToken}`;
    const subject = `Proposed Custom Quote for Your AI Video Request — [${request.id}]`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:24px; background-color:#0B0F19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#F1F5F9; line-height:1.6;">
  <div style="max-width:600px; margin:0 auto; background-color:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden;">
    <div style="background:linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%); padding:28px; border-bottom:1px solid #1E293B; text-align:center;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#A78BFA; font-weight:700;">AI Video Maker</div>
      <h1 style="margin:8px 0 0; font-size:22px; color:#FFFFFF; font-weight:700;">Proposed Quote for "${escapeHtml(request.title)}"</h1>
      <p style="margin:8px 0 0; color:#94A3B8; font-size:14px;">Request ID: <span style="color:#60A5FA; font-family:monospace; font-weight:600;">${request.id}</span></p>
    </div>

    <div style="padding:28px;">
      <p style="font-size:15px; color:#E2E8F0; margin-top:0;">Hello <strong>${escapeHtml(request.customerName)}</strong>,</p>

      <p style="font-size:14px; color:#CBD5E1;">
        Our studio director has reviewed your creative brief and prepared a personalized quote based on your video requirements:
      </p>

      <div style="background:#131B2E; border:1px solid #3B82F6; border-radius:8px; padding:20px; margin:20px 0; text-align:center;">
        <span style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#94A3B8;">Proposed Video Production Cost</span>
        <div style="font-size:32px; font-weight:800; color:#38BDF8; margin:8px 0;">
          ${escapeHtml(quote.formattedAmount)}
        </div>
        ${quote.breakdown ? `<p style="margin:8px 0 0; font-size:13px; color:#CBD5E1;">${escapeHtml(quote.breakdown)}</p>` : ''}
        ${quote.validUntil ? `<p style="margin:8px 0 0; font-size:11px; color:#94A3B8;">Valid until: ${new Date(quote.validUntil).toLocaleDateString()}</p>` : ''}
      </div>

      <p style="font-size:13px; color:#94A3B8;">
        Paid production will begin only after you accept this quote. You can review the breakdown and choose to accept or decline directly from your account dashboard.
      </p>

      <div style="text-align:center; padding:18px 0;">
        <a href="${quoteReviewLink}" style="display:inline-block; background:linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color:#FFFFFF; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:700; font-size:15px; box-shadow:0 4px 14px rgba(99, 102, 241, 0.4);">
          Review & Respond to Quote &rarr;
        </a>
      </div>
    </div>

    <div style="padding:16px 28px; background:#0B0F19; border-top:1px solid #1E293B; font-size:12px; color:#64748B; text-align:center;">
      AI Video Maker &bull; Studio Quote Notice &bull; Request ${request.id}
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hello ${request.customerName},

We have prepared a custom quote for your video request "${request.title}" (${request.id}):
Proposed Amount: ${quote.formattedAmount}
Scope Breakdown: ${quote.breakdown || 'Comprehensive video production and curation'}

Review, accept or decline this quote:
${quoteReviewLink}

AI Video Maker
    `.trim();

    return this.dispatchEmail({
      requestId: request.id,
      type: 'quote_sent',
      to: request.customerEmail,
      subject,
      html,
      text
    });
  }

  // 4. Email D: Payment Confirmed & Production Started
  public async sendPaymentConfirmedNotification(request: VideoRequest, baseUrl: string): Promise<SendResult> {
    const trackingLink = `${baseUrl}/my-requests?id=${request.id}&token=${request.accessToken}`;
    const subject = `Payment Confirmed & Production Started — [${request.id}]`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:24px; background-color:#0B0F19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#F1F5F9; line-height:1.6;">
  <div style="max-width:600px; margin:0 auto; background-color:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden;">
    <div style="background:linear-gradient(135deg, #065F46 0%, #0F172A 100%); padding:28px; border-bottom:1px solid #1E293B; text-align:center;">
      <h1 style="margin:0; font-size:22px; color:#FFFFFF; font-weight:700;">Payment Confirmed! Production Has Started</h1>
      <p style="margin:8px 0 0; color:#A7F3D0; font-size:14px;">Request ID: <span style="font-family:monospace; font-weight:600;">${request.id}</span></p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:15px; color:#E2E8F0; margin-top:0;">Hello <strong>${escapeHtml(request.customerName)}</strong>,</p>
      <p style="font-size:14px; color:#CBD5E1;">
        Thank you! Your payment has been successfully recorded and verified. Our production artists have officially started generating, curating, and compiling your custom AI video for <strong>"${escapeHtml(request.title)}"</strong>.
      </p>
      <div style="background:#131B2E; border-left:4px solid #10B981; border-radius:4px; padding:16px; margin:20px 0;">
        <p style="margin:0; font-size:14px; color:#E2E8F0;">
          <strong>Next Step:</strong> You will receive a direct delivery link by email once quality check and rendering are completed.
        </p>
      </div>
      <div style="text-align:center; padding:12px 0;">
        <a href="${trackingLink}" style="display:inline-block; background:#10B981; color:#FFFFFF; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; font-size:14px;">Track Production Progress &rarr;</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hello ${request.customerName},

Payment for request ${request.id} ("${request.title}") has been confirmed!
Production has officially started. You will receive an email with the video link once complete.

Track progress:
${trackingLink}

AI Video Maker
    `.trim();

    return this.dispatchEmail({
      requestId: request.id,
      type: 'payment_confirmed',
      to: request.customerEmail,
      subject,
      html,
      text
    });
  }

  // 5. Email E: Video Delivery to Customer
  public async sendVideoDelivery(
    request: VideoRequest,
    options: {
      downloadUrl: string;
      customMessage?: string;
      expirationNote?: string;
    },
    baseUrl: string
  ): Promise<SendResult> {
    const trackingLink = `${baseUrl}/my-requests?id=${request.id}&token=${request.accessToken}`;
    const fullDownloadUrl = options.downloadUrl.startsWith('http')
      ? options.downloadUrl
      : `${baseUrl}${options.downloadUrl.startsWith('/') ? '' : '/'}${options.downloadUrl}`;
    const subject = `Your AI Video "${request.title}" is Ready! — [${request.id}]`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:24px; background-color:#0B0F19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#F1F5F9; line-height:1.6;">
  <div style="max-width:600px; margin:0 auto; background-color:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
    <div style="background:linear-gradient(135deg, #065F46 0%, #0F172A 100%); padding:28px; border-bottom:1px solid #1E293B; text-align:center;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#6EE7B7; font-weight:700;">AI Video Maker</div>
      <h1 style="margin:8px 0 0; font-size:24px; color:#FFFFFF; font-weight:700;">Your Completed AI Video is Ready!</h1>
      <p style="margin:6px 0 0; color:#A7F3D0; font-size:14px;">Request ID: <span style="font-family:monospace; font-weight:600;">${escapeHtml(request.id)}</span></p>
    </div>

    <div style="padding:28px;">
      <p style="font-size:15px; color:#E2E8F0; margin-top:0;">Hello <strong>${escapeHtml(request.customerName)}</strong>,</p>

      <p style="font-size:14px; color:#CBD5E1;">
        Exciting news! Production on your custom AI video <strong>"${escapeHtml(request.title)}"</strong> (Request ID: <strong>${escapeHtml(request.id)}</strong>) is complete and ready for download.
      </p>

      ${options.customMessage ? `
      <div style="background:#131B2E; border-left:4px solid #10B981; border-radius:4px; padding:16px; margin:20px 0;">
        <h4 style="margin:0 0 6px; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#34D399;">Note from the Studio Director</h4>
        <p style="margin:0; font-size:14px; color:#E2E8F0;">${escapeHtml(options.customMessage)}</p>
      </div>` : ''}

      <div style="text-align:center; padding:24px 0;">
        <a href="${fullDownloadUrl}" style="display:inline-block; background:linear-gradient(135deg, #10B981 0%, #059669 100%); color:#FFFFFF; text-decoration:none; padding:16px 36px; border-radius:8px; font-weight:700; font-size:16px; box-shadow:0 4px 16px rgba(16, 185, 129, 0.4);">
          Download & View Your Completed Video &rarr;
        </a>
      </div>

      <div style="background:#0E1726; border:1px solid #1E293B; border-radius:8px; padding:14px; font-size:13px; color:#94A3B8;">
        <p style="margin:0 0 6px;"><strong style="color:#E2E8F0;">Video Title:</strong> ${escapeHtml(request.title)}</p>
        <p style="margin:0 0 6px;"><strong style="color:#E2E8F0;">Request ID:</strong> ${escapeHtml(request.id)}</p>
        <p style="margin:0 0 6px;"><strong style="color:#E2E8F0;">Delivery Status:</strong> <span style="color:#34D399; font-weight:700;">Delivered</span></p>
        <strong style="color:#E2E8F0;">Secure Video Download Link:</strong><br/>
        <a href="${fullDownloadUrl}" style="color:#38BDF8; word-break:break-all;">${escapeHtml(fullDownloadUrl)}</a>
        ${options.expirationNote ? `<p style="margin:8px 0 0; color:#F59E0B; font-size:12px;"><strong>Notice:</strong> ${escapeHtml(options.expirationNote)}</p>` : ''}
      </div>

      <div style="margin-top:24px; text-align:center;">
        <a href="${trackingLink}" style="color:#818CF8; font-size:13px; text-decoration:underline;">View full request history & details on My Requests portal</a>
      </div>
    </div>

    <div style="padding:16px 28px; background:#0B0F19; border-top:1px solid #1E293B; font-size:12px; color:#64748B; text-align:center;">
      AI Video Maker &bull; Delivered to ${escapeHtml(request.customerEmail)}
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hello ${request.customerName},

Your AI Video "${request.title}" is ready!
Request ID: ${request.id}
Status: Delivered

${options.customMessage ? `Studio Note: ${options.customMessage}\n\n` : ''}Secure Video Download Link:
${fullDownloadUrl}

${options.expirationNote ? `Notice: ${options.expirationNote}\n` : ''}
Thank you for creating with AI Video Maker!
    `.trim();

    return this.dispatchEmail({
      requestId: request.id,
      type: 'video_delivery',
      to: request.customerEmail,
      subject,
      html,
      text
    });
  }

  // 6. Email F: Budget Request Notification to Owner (muhammedalimdd@gmail.com)
  public async sendOwnerBudgetRequestNotification(budgetReq: BudgetRequest, baseUrl: string): Promise<SendResult> {
    const configuredOwner = process.env.OWNER_NOTIFICATION_EMAIL || db.getSettings().ownerNotificationEmail || OWNER_GMAIL_ADDRESS;
    const ownerEmail = configuredOwner.toLowerCase().includes(OWNER_GMAIL_ADDRESS)
      ? configuredOwner
      : OWNER_GMAIL_ADDRESS;
    const adminLink = `${baseUrl}/admin?budget=${budgetReq.id}`;
    const subject = `NEW AI VIDEO REQUEST — ${budgetReq.fullName.toUpperCase()} — ${budgetReq.id}`;

    const fullPhotoUrl = budgetReq.referencePhotoUrl
      ? budgetReq.referencePhotoUrl.startsWith('http')
        ? budgetReq.referencePhotoUrl
        : `${baseUrl}${budgetReq.referencePhotoUrl.startsWith('/') ? '' : '/'}${budgetReq.referencePhotoUrl}`
      : null;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:24px; background-color:#0B0F19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#F1F5F9; line-height:1.6;">
  <div style="max-width:680px; margin:0 auto; background-color:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden;">
    <div style="background:linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%); padding:28px; border-bottom:1px solid #1E293B;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#818CF8; font-weight:700;">AI Video Maker &bull; Direct Request Notification</div>
      <h2 style="margin:6px 0 0; font-size:22px; color:#FFFFFF;">${escapeHtml(subject)}</h2>
      <p style="margin:4px 0 0; color:#94A3B8; font-size:14px;">Request ID: <span style="color:#60A5FA; font-family:monospace;">${budgetReq.id}</span> &bull; Budget: <strong style="color:#34D399;">${budgetReq.budgetCategory} (${budgetReq.budgetAmount})</strong></p>
    </div>
    <div style="padding:28px;">
      <div style="background:#131B2E; padding:16px; border-radius:8px; margin-bottom:20px; border:1px solid #1E293B;">
        <h4 style="margin:0 0 10px; color:#818CF8; font-size:13px; text-transform:uppercase;">Customer &amp; Request Details</h4>
        <p style="margin:3px 0; font-size:14px;"><strong>Customer Name:</strong> ${escapeHtml(budgetReq.fullName)}</p>
        <p style="margin:3px 0; font-size:14px;"><strong>Customer Email:</strong> <a href="mailto:${escapeHtml(budgetReq.email)}" style="color:#38BDF8;">${escapeHtml(budgetReq.email)}</a></p>
        <p style="margin:3px 0; font-size:14px;"><strong>Request ID:</strong> ${escapeHtml(budgetReq.id)}</p>
        <p style="margin:3px 0; font-size:14px;"><strong>Submitted At:</strong> ${new Date(budgetReq.createdAt).toUTCString()}</p>
        <p style="margin:3px 0; font-size:14px;"><strong>Preferred Video Type:</strong> ${escapeHtml(budgetReq.preferredVideoType)}</p>
        <p style="margin:3px 0; font-size:14px;"><strong>Video Format / Aspect Ratio:</strong> ${escapeHtml(budgetReq.videoFormat.toUpperCase())} (${escapeHtml(budgetReq.aspectRatio)})</p>
        <p style="margin:3px 0; font-size:14px;"><strong>Requested Duration:</strong> ${escapeHtml(budgetReq.preferredDuration)}</p>
        <p style="margin:3px 0; font-size:14px;"><strong>Budget Tier:</strong> ${escapeHtml(budgetReq.budgetCategory)} (${escapeHtml(budgetReq.budgetAmount)})</p>
        <p style="margin:3px 0; font-size:14px;"><strong>Current Status:</strong> ${escapeHtml(budgetReq.status)}</p>
      </div>
      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 6px; color:#94A3B8; font-size:13px; text-transform:uppercase;">Video Idea &amp; Concept</h4>
        <div style="background:#090D16; padding:14px; border-radius:8px; font-size:14px; color:#F1F5F9; white-space:pre-wrap; border:1px solid #1E293B;">${escapeHtml(budgetReq.videoIdea)}</div>
      </div>
      ${
        budgetReq.detailedMessage
          ? `<div style="margin-bottom:20px;">
        <h4 style="margin:0 0 6px; color:#94A3B8; font-size:13px; text-transform:uppercase;">Detailed Story / Scene Description</h4>
        <div style="background:#090D16; padding:14px; border-radius:8px; font-size:14px; color:#F1F5F9; white-space:pre-wrap; border:1px solid #1E293B;">${escapeHtml(budgetReq.detailedMessage)}</div>
      </div>`
          : ''
      }
      ${
        budgetReq.additionalInstructions
          ? `<div style="margin-bottom:20px;">
        <h4 style="margin:0 0 6px; color:#94A3B8; font-size:13px; text-transform:uppercase;">Additional Instructions</h4>
        <div style="background:#090D16; padding:14px; border-radius:8px; font-size:14px; color:#F1F5F9; white-space:pre-wrap; border:1px solid #1E293B;">${escapeHtml(budgetReq.additionalInstructions)}</div>
      </div>`
          : ''
      }
      ${
        fullPhotoUrl
          ? `<div style="margin-bottom:20px; padding:12px; background:#090D16; border:1px solid #1E293B; border-radius:8px;">
        <h4 style="margin:0 0 6px; color:#94A3B8; font-size:13px; text-transform:uppercase;">Uploaded Reference Photo Link</h4>
        <a href="${fullPhotoUrl}" target="_blank" style="color:#38BDF8; font-size:13px; word-break:break-all;">${escapeHtml(fullPhotoUrl)}</a>
      </div>`
          : ''
      }
      <div style="text-align:center; padding-top:16px;">
        <a href="${adminLink}" style="display:inline-block; background:#6366F1; color:#FFFFFF; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600;">Open Request in Admin &rarr;</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const text = [
      subject,
      '============================================================',
      `Customer Name: ${budgetReq.fullName}`,
      `Customer Email: ${budgetReq.email}`,
      `Request ID: ${budgetReq.id}`,
      `Submission Date & Time: ${new Date(budgetReq.createdAt).toUTCString()}`,
      `Preferred Video Type: ${budgetReq.preferredVideoType}`,
      `Format / Aspect Ratio: ${budgetReq.videoFormat.toUpperCase()} (${budgetReq.aspectRatio})`,
      `Requested Duration: ${budgetReq.preferredDuration}`,
      `Budget Category: ${budgetReq.budgetCategory} (${budgetReq.budgetAmount})`,
      `Current Status: ${budgetReq.status}`,
      '',
      'VIDEO IDEA:',
      budgetReq.videoIdea,
      budgetReq.detailedMessage ? `\nDETAILED MESSAGE:\n${budgetReq.detailedMessage}` : '',
      budgetReq.additionalInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${budgetReq.additionalInstructions}` : '',
      fullPhotoUrl ? `\nREFERENCE PHOTO LINK:\n${fullPhotoUrl}` : '',
      `\nAdmin Link: ${adminLink}`
    ]
      .filter(Boolean)
      .join('\n');

    return this.dispatchEmail({
      requestId: budgetReq.id,
      type: 'budget_request_owner',
      to: ownerEmail,
      subject,
      html,
      text
    });
  }

  // 7. Email G: Customer Budget Confirmation
  public async sendCustomerBudgetConfirmation(budgetReq: BudgetRequest): Promise<SendResult> {
    const subject = `Your AI Video Idea & Budget Request Has Been Received — [${budgetReq.id}]`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:24px; background-color:#0B0F19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#F1F5F9; line-height:1.6;">
  <div style="max-width:600px; margin:0 auto; background-color:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden;">
    <div style="background:linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%); padding:24px; text-align:center;">
      <h2 style="margin:0; color:#FFFFFF;">Your Request Has Been Sent Successfully!</h2>
      <p style="margin:6px 0 0; color:#94A3B8; font-size:14px;">Request ID: <span style="color:#60A5FA;">${budgetReq.id}</span></p>
    </div>
    <div style="padding:24px;">
      <p style="color:#CBD5E1; font-size:14px; margin-top:0;">Hello <strong>${escapeHtml(budgetReq.fullName)}</strong>,</p>
      <p style="color:#CBD5E1; font-size:14px;">
        Thank you for sharing your video idea with AI Video Maker. We have received your request and will review it.
      </p>
      ${budgetReq.isFree ? `
      <div style="background:#064E3B; border:1px solid #059669; padding:12px; border-radius:6px; color:#A7F3D0; font-size:13px; margin:16px 0;">
        <strong>Free request submitted — no payment was collected.</strong> Video creation is subject to review, feasibility, and confirmation by our studio owner.
      </div>` : ''}
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchEmail({
      requestId: budgetReq.id,
      type: 'budget_request_customer',
      to: budgetReq.email,
      subject,
      html,
      text: `Hello ${budgetReq.fullName},\n\nWe received your request [${budgetReq.id}].\n\nAI Video Maker`
    });
  }

  // 8. Reply from Owner to Customer regarding Budget Request
  public async sendBudgetRequestReply(budgetReq: BudgetRequest, message: string, baseUrl: string): Promise<SendResult> {
    const subject = `Update regarding your AI Video Request — [${budgetReq.id}]`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:24px; background-color:#0B0F19; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#F1F5F9; line-height:1.6;">
  <div style="max-width:600px; margin:0 auto; background-color:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden;">
    <div style="padding:24px;">
      <h3 style="margin:0 0 12px; color:#FFFFFF;">Update Regarding Your Request: ${budgetReq.id}</h3>
      <p style="color:#CBD5E1; font-size:14px;">Hello <strong>${escapeHtml(budgetReq.fullName)}</strong>,</p>
      <div style="background:#131B2E; padding:14px; border-radius:6px; color:#FFFFFF; font-size:14px; margin:14px 0; white-space:pre-wrap;">${escapeHtml(message)}</div>
      <p style="color:#94A3B8; font-size:12px;">AI Video Maker</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchEmail({
      requestId: budgetReq.id,
      type: 'budget_request_reply',
      to: budgetReq.email,
      subject,
      html,
      text: `Update regarding your request [${budgetReq.id}]:\n\n${message}\n\nAI Video Maker`
    });
  }

  public async sendCustomerReplyNotification(
    request: VideoRequest,
    message: string,
    baseUrl: string
  ): Promise<SendResult> {
    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || db.getSettings().ownerNotificationEmail || 'muhammedalimdd@gmail.com';
    const subject = `CUSTOMER REPLY — ${request.customerName || request.customerEmail} — [${request.id}]`;
    const adminLink = `${baseUrl}/admin?request=${request.id}`;

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #050811; color: #FFFFFF; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #0B0F19; border: 1px solid #1E293B; border-radius: 12px; padding: 24px;">
    <h2 style="color: #A855F7; margin-top: 0;">New Customer Clarification Reply</h2>
    <p style="color: #94A3B8;">Request: <strong>${escapeHtml(request.id)}</strong> &mdash; ${escapeHtml(request.title || 'Video Project')}</p>
    <p style="color: #94A3B8;">Customer: <strong>${escapeHtml(request.customerName || 'Customer')}</strong> (${escapeHtml(request.customerEmail)})</p>
    <div style="background: #131B2E; border-left: 4px solid #A855F7; padding: 14px; margin: 16px 0; border-radius: 6px;">
      <p style="margin: 0; color: #E2E8F0; font-size: 14px; line-height: 1.6;">${escapeHtml(message)}</p>
    </div>
    <div style="margin-top: 24px; text-align: center;">
      <a href="${adminLink}" style="display: inline-block; background: #6366F1; color: #FFFFFF; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px;">Open Request in Admin Dashboard</a>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchEmail({
      requestId: request.id,
      type: 'clarification',
      to: ownerEmail,
      subject,
      html,
      text: `Customer ${request.customerName} (${request.customerEmail}) replied to request [${request.id}]:\n\n"${message}"\n\nView details: ${adminLink}`
    });
  }
}

function escapeHtml(str: string = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const emailService = new EmailService();
