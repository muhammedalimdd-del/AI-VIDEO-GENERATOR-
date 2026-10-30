import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Send,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Video,
  Mail,
  ChevronRight,
  ExternalLink,
  X,
  Plus,
  Sparkles,
  AlertCircle,
  DollarSign,
  Gift,
  CreditCard,
  UserCheck,
  Check,
  Download,
  RotateCcw,
  Key,
  CheckCircle2
} from 'lucide-react';
import { VideoStatus } from '../../types/client.ts';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem('studio_admin_token') || '');

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'budget' | 'emails' | 'settings'>('requests');

  // Video Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    freeTrial: 0,
    paid: 0,
    awaitingReview: 0,
    awaitingCustomerQuoteApproval: 0,
    inProduction: 0,
    completed: 0,
    failedEmails: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Selected Video Request modal / drawer
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Edit / Action fields inside Video Request Drawer
  const [statusToSet, setStatusToSet] = useState<VideoStatus>('Under Review');
  const [estDateToSet, setEstDateToSet] = useState('');
  const [customerNotesToSet, setCustomerNotesToSet] = useState('');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [videoDeliveryUrl, setVideoDeliveryUrl] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('Your AI video has been produced and quality checked.');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Custom Quote Fields
  const [quoteAmount, setQuoteAmount] = useState<number>(1500);
  const [quoteCurrency, setQuoteCurrency] = useState<string>('₹');
  const [quoteBreakdown, setQuoteBreakdown] = useState<string>('Comprehensive scene generation, character likeness consistency, and professional audio/color grading');
  const [quoteValidUntil, setQuoteValidUntil] = useState<string>('');
  const [quotePaymentLink, setQuotePaymentLink] = useState<string>('');
  const [isSendingQuote, setIsSendingQuote] = useState<boolean>(false);

  // User Accounts & Audit logs state
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Idea & Budget Requests state
  const [budgetRequests, setBudgetRequests] = useState<any[]>([]);
  const [budgetStats, setBudgetStats] = useState<any>({
    total: 0,
    free: 0,
    paid: 0,
    submitted: 0,
    underReview: 0,
    accepted: 0,
    declined: 0,
    completed: 0
  });
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [budgetSearch, setBudgetSearch] = useState('');
  const [selectedBudgetRequest, setSelectedBudgetRequest] = useState<any | null>(null);
  const [budgetStatusToSet, setBudgetStatusToSet] = useState<string>('Under Review');
  const [budgetInternalNote, setBudgetInternalNote] = useState('');
  const [budgetReplyMessage, setBudgetReplyMessage] = useState('');
  const [isSendingBudgetReply, setIsSendingBudgetReply] = useState(false);

  // Email Logs State
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [previewEmailLog, setPreviewEmailLog] = useState<any | null>(null);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [isResendingOwnerEmail, setIsResendingOwnerEmail] = useState(false);

  // Email Testing & Configuration States
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    recipient: string;
    subject: string;
    message: string;
    error?: string;
  } | null>(null);

  // Studio Settings Form State
  const [settings, setSettings] = useState<any>(null);
  const [settingsOwnerEmail, setSettingsOwnerEmail] = useState('muhammedalimdd@gmail.com');
  const [settingsFromEmail, setSettingsFromEmail] = useState('muhammedalimdd@gmail.com');
  const [settingsProvider, setSettingsProvider] = useState<'gmail' | 'smtp' | 'resend' | 'sendgrid'>('gmail');
  const [settingsSmtpHost, setSettingsSmtpHost] = useState('smtp.gmail.com');
  const [settingsSmtpPort, setSettingsSmtpPort] = useState(465);
  const [settingsSmtpSecure, setSettingsSmtpSecure] = useState(true);
  const [settingsSmtpUser, setSettingsSmtpUser] = useState('muhammedalimdd@gmail.com');
  const [settingsSmtpPass, setSettingsSmtpPass] = useState('');
  const [settingsApiKey, setSettingsApiKey] = useState('');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Auto-login if token stored
  useEffect(() => {
    if (adminToken) {
      verifyToken(adminToken);
    }
  }, [adminToken]);

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        headers: { 'x-admin-key': token }
      });
      if (res.ok) {
        setIsAuthenticated(true);
        loadData(token);
      } else {
        localStorage.removeItem('studio_admin_token');
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');

      setAdminToken(data.token);
      localStorage.setItem('studio_admin_token', data.token);
      setIsAuthenticated(true);
      loadData(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const loadData = async (token = adminToken) => {
    setIsLoading(true);
    try {
      const [reqRes, bgtRes, emlRes, setRes, usrRes, audRes] = await Promise.all([
        fetch(`/api/admin/requests?filter=${statusFilter}`, { headers: { 'x-admin-key': token } }),
        fetch(`/api/admin/budget-requests?filter=${budgetFilter}`, { headers: { 'x-admin-key': token } }),
        fetch('/api/admin/email-logs', { headers: { 'x-admin-key': token } }),
        fetch('/api/admin/settings', { headers: { 'x-admin-key': token } }),
        fetch('/api/admin/users', { headers: { 'x-admin-key': token } }),
        fetch('/api/admin/audit-logs', { headers: { 'x-admin-key': token } })
      ]);

      if (reqRes.ok) {
        const d = await reqRes.json();
        setRequests(d.requests || []);
        if (d.stats) setStats(d.stats);
      }
      if (bgtRes.ok) {
        const b = await bgtRes.json();
        setBudgetRequests(b.budgetRequests || []);
        if (b.stats) setBudgetStats(b.stats);
      }
      if (emlRes.ok) {
        const eml = await emlRes.json();
        setEmailLogs(eml.emailLogs || []);
      }
      if (setRes.ok) {
        const st = await setRes.json();
        setSettings(st.settings);
        if (st.settings) {
          setSettingsOwnerEmail(st.settings.ownerNotificationEmail || 'muhammedalimdd@gmail.com');
          setSettingsFromEmail(st.settings.emailFromAddress || 'muhammedalimdd@gmail.com');
          setSettingsProvider(st.settings.emailProvider || 'gmail');
          setSettingsSmtpHost(st.settings.smtpHost || 'smtp.gmail.com');
          setSettingsSmtpPort(st.settings.smtpPort || 465);
          setSettingsSmtpSecure(st.settings.smtpSecure !== undefined ? st.settings.smtpSecure : true);
          setSettingsSmtpUser(st.settings.smtpUser || st.settings.ownerNotificationEmail || 'muhammedalimdd@gmail.com');
          setSettingsSmtpPass(st.settings.smtpPass || '');
          setSettingsApiKey(st.settings.apiKey || '');
        }
      }
      if (usrRes.ok) {
        const u = await usrRes.json();
        setUsers(u.users || []);
      }
      if (audRes.ok) {
        const a = await audRes.json();
        setAuditLogs(a.auditLogs || []);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Video Request Details
  const openRequestDrawer = async (reqId: string) => {
    setDrawerLoading(true);
    try {
      const res = await fetch(`/api/admin/requests/${reqId}`, {
        headers: { 'x-admin-key': adminToken }
      });
      const json = await res.json();
      if (res.ok && json.request) {
        setSelectedRequest(json.request);
        setStatusToSet(json.request.status);
        setEstDateToSet(json.request.estimatedCompletionDate || '');
        setCustomerNotesToSet(json.request.customerVisibleNotes || '');
        setVideoDeliveryUrl(json.request.completedVideo?.directLink || '');
        if (json.request.quote?.amount) {
          setQuoteAmount(json.request.quote.amount);
          setQuoteCurrency(json.request.quote.currency || '₹');
          setQuoteBreakdown(json.request.quote.breakdown || '');
          setQuotePaymentLink(json.request.quote.paymentLink || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken
        },
        body: JSON.stringify({
          status: statusToSet,
          estimatedCompletionDate: estDateToSet,
          customerVisibleNotes: customerNotesToSet,
          internalNote: newInternalNote ? newInternalNote.trim() : undefined
        })
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedRequest(json.request);
        setNewInternalNote('');
        loadData();
        alert('Request updated successfully.');
      } else {
        alert(json.error || 'Update failed');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Quote Workflow
  const handleSendCustomQuote = async () => {
    if (!selectedRequest || !quoteAmount) return;
    setIsSendingQuote(true);
    try {
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken
        },
        body: JSON.stringify({
          amount: Number(quoteAmount),
          currency: quoteCurrency,
          breakdown: quoteBreakdown,
          validUntil: quoteValidUntil,
          paymentLink: quotePaymentLink
        })
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedRequest(json.request);
        alert(`Custom quote of ${quoteCurrency}${quoteAmount} dispatched to customer email!`);
        loadData();
      } else {
        alert(json.error || 'Failed to send quote');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSendingQuote(false);
    }
  };

  // Payment Workflow
  const handleConfirmPayment = async () => {
    if (!selectedRequest) return;
    const ref = prompt('Enter transaction reference / payment confirmation ID:', 'TXN-' + Date.now().toString().slice(-6));
    try {
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken
        },
        body: JSON.stringify({
          status: 'verified',
          transactionRef: ref || 'Verified in Admin'
        })
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedRequest(json.request);
        alert('Payment verified! Production officially begun and customer notified.');
        loadData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Video Delivery Workflow
  const handleDeliverVideo = async () => {
    if (!selectedRequest || !videoDeliveryUrl.trim()) {
      alert('Please enter or upload a valid video download link.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}/deliver-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken
        },
        body: JSON.stringify({
          directLink: videoDeliveryUrl.trim(),
          message: deliveryMessage.trim()
        })
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedRequest(json.request);
        alert('Completed video delivered to customer email successfully!');
        loadData();
      } else {
        alert(json.error || 'Delivery failed');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // User Trial Reset Workflow
  const handleResetTrial = async (uid: string, userEmail: string) => {
    const reason = prompt(`Reset 1-time free trial for ${userEmail}? Enter reason for audit log:`, 'Complimentary trial granted by studio director');
    if (!reason) return;

    try {
      const res = await fetch(`/api/admin/users/${uid}/trial-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken
        },
        body: JSON.stringify({
          newStatus: 'eligible',
          reason
        })
      });
      const json = await res.json();
      if (res.ok) {
        alert(`Trial status for ${userEmail} reset to eligible.`);
        loadData();
      } else {
        alert(json.error || 'Failed to update trial status.');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Idea & Budget Request Drawer
  const openBudgetDrawer = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/budget-requests/${id}`, {
        headers: { 'x-admin-key': adminToken }
      });
      const json = await res.json();
      if (res.ok && json.budgetRequest) {
        setSelectedBudgetRequest(json.budgetRequest);
        setBudgetStatusToSet(json.budgetRequest.status);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendBudgetReply = async () => {
    if (!selectedBudgetRequest || !budgetReplyMessage.trim()) return;
    setIsSendingBudgetReply(true);
    try {
      const res = await fetch(`/api/admin/budget-requests/${selectedBudgetRequest.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken
        },
        body: JSON.stringify({ message: budgetReplyMessage.trim() })
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedBudgetRequest(json.budgetRequest);
        setBudgetReplyMessage('');
        loadData();
        alert('Reply email dispatched to customer successfully!');
      } else {
        alert(json.error || 'Failed to send reply');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSendingBudgetReply(false);
    }
  };

  // Gmail Connection Test Workflow
  const handleTestGmailConnection = async () => {
    setIsTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/admin/email/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken
        },
        body: JSON.stringify({
          recipientEmail: settingsOwnerEmail.trim() || 'muhammedalimdd@gmail.com'
        })
      });
      const data = await res.json();
      setTestEmailResult({
        success: data.success,
        recipient: data.recipient || settingsOwnerEmail || 'muhammedalimdd@gmail.com',
        subject: data.subject || 'AI VIDEO MAKER — TEST EMAIL',
        message: data.message || 'Congratulations! Your AI Video Maker email notification system is connected. New customer video requests will be delivered to this Gmail inbox.',
        error: data.error
      });
      loadData();
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        recipient: settingsOwnerEmail || 'muhammedalimdd@gmail.com',
        subject: 'AI VIDEO MAKER — TEST EMAIL',
        message: 'Connection attempt failed',
        error: err.message
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Email Retry Workflow
  const handleRetryEmail = async (logId: string) => {
    setRetryingLogId(logId);
    try {
      const res = await fetch(`/api/admin/email/${logId}/retry`, {
        method: 'POST',
        headers: { 'x-admin-key': adminToken }
      });
      const data = await res.json();
      if (data.success) {
        alert('Email successfully sent to recipient!');
      } else {
        alert(`Retry failed: ${data.error || 'Check SMTP / App Password credentials in Settings'}`);
      }
      loadData();
    } catch (e: any) {
      alert(`Retry error: ${e.message}`);
    } finally {
      setRetryingLogId(null);
    }
  };

  // Resend Owner Notification for specific request
  const handleResendOwnerEmail = async (requestId: string) => {
    setIsResendingOwnerEmail(true);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/resend-owner-email`, {
        method: 'POST',
        headers: { 'x-admin-key': adminToken }
      });
      const data = await res.json();
      if (data.success) {
        alert(`Complete video request brief dispatched to ${settingsOwnerEmail || 'muhammedalimdd@gmail.com'}!`);
      } else {
        alert(`Failed to send email: ${data.error || 'Please configure SMTP in settings.'}`);
      }
      loadData();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsResendingOwnerEmail(false);
    }
  };

  // Save Settings Workflow
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken
        },
        body: JSON.stringify({
          ownerNotificationEmail: settingsOwnerEmail.trim(),
          emailFromAddress: settingsFromEmail.trim(),
          emailProvider: settingsProvider,
          smtpHost: settingsSmtpHost.trim(),
          smtpPort: Number(settingsSmtpPort),
          smtpSecure: settingsSmtpSecure,
          smtpUser: settingsSmtpUser.trim(),
          smtpPass: settingsSmtpPass.trim(),
          apiKey: settingsApiKey.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Email settings saved successfully! You can now test the Gmail connection.');
        loadData();
      } else {
        alert(data.error || 'Failed to save settings');
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-[#090D16] border border-slate-800 p-8 shadow-2xl relative text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">AI Video Maker Studio Admin</h3>
          <p className="text-xs text-slate-400 mb-6">
            Enter your studio admin passphrase to manage video briefs, custom quotes, users, and deliveries.
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Admin passphrase..."
              className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm cursor-pointer transition-all"
              >
                Access Dashboard
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#060911] text-slate-100 flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Admin Bar */}
      <header className="h-16 border-b border-slate-800 bg-[#090D16] px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            AVM
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>AI Video Maker Studio Admin</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                LIVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Notification recipient: <span className="text-indigo-300 font-mono">{settings?.ownerNotificationEmail || 'muhammedalimdd@gmail.com'}</span>
            </p>
          </div>
        </div>

        {/* Tab Controls & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Video Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Users & Trials ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'budget' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>Budget Ideas ({budgetRequests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'emails' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Email Logs ({emailLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>

          <button
            onClick={handleTestGmailConnection}
            disabled={isTestingEmail}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Test real email dispatch to muhammedalimdd@gmail.com"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isTestingEmail ? 'Testing...' : 'TEST GMAIL CONNECTION'}</span>
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('studio_admin_token');
              setIsAuthenticated(false);
            }}
            className="text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1.5 cursor-pointer"
          >
            Logout
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        {/* TAB 1: VIDEO REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Requests</span>
                <p className="text-2xl font-black text-white mt-1">{stats.total || requests.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                  <Gift className="w-3 h-3" /> Free Trials
                </span>
                <p className="text-2xl font-black text-emerald-300 mt-1">{stats.freeTrial || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Paid Requests
                </span>
                <p className="text-2xl font-black text-indigo-300 mt-1">{stats.paid || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-amber-400">Under Review</span>
                <p className="text-2xl font-black text-amber-300 mt-1">{stats.awaitingReview || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-cyan-400">Quote Awaiting</span>
                <p className="text-2xl font-black text-cyan-300 mt-1">{stats.awaitingCustomerQuoteApproval || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-purple-400">In Production</span>
                <p className="text-2xl font-black text-purple-300 mt-1">{stats.inProduction || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-teal-400">Completed</span>
                <p className="text-2xl font-black text-teal-300 mt-1">{stats.completed || 0}</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#090D16] border border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {['all', 'free_trial', 'paid', 'quoted', 'in_production', 'completed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setStatusFilter(f);
                      setTimeout(() => loadData(), 50);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
                      statusFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <button
                onClick={() => loadData()}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Requests Table */}
            <div className="rounded-2xl bg-[#090D16] border border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0C1220] text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Project Title</th>
                    <th className="py-3 px-4">Style & Platform</th>
                    <th className="py-3 px-4">Quote / Pricing</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No video requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => {
                      const isTrial = r.requestType === 'free_trial';
                      return (
                        <tr
                          key={r.id}
                          onClick={() => openRequestDrawer(r.id)}
                          className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                            {r.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isTrial
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                  : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800'
                              }`}
                            >
                              {isTrial ? <Gift className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                              <span>{isTrial ? 'Free Trial' : 'Paid'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block group-hover:text-indigo-200">
                              {r.customerName}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {r.customerEmail}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                            {r.title}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {r.style} <span className="text-slate-500">· {r.format}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {isTrial ? (
                              <span className="text-emerald-400 font-semibold">1-Time Free Trial</span>
                            ) : r.quote?.status === 'sent' ? (
                              <span className="text-cyan-300 font-bold">{r.quote.formattedAmount} (Sent)</span>
                            ) : r.quote?.status === 'accepted' ? (
                              <span className="text-emerald-300 font-bold">{r.quote.formattedAmount} (Accepted)</span>
                            ) : (
                              <span className="text-slate-400">Needs Custom Quote</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.status === 'Completed' || r.status === 'Delivered'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : r.status === 'In Production'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : r.status === 'Approved'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRequestDrawer(r.id);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs cursor-pointer"
                            >
                              Manage &rarr;
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE USERS & FREE TRIAL MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <span>Authenticated Google Users & 1-Time Free Trial Accounts</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Every user registers with their real Google account. You can review trial usage and reset eligibility if necessary with an audit record.
                </p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user email or name..."
                  className="w-full px-3 py-2 bg-[#0C1220] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-[#090D16] border border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0C1220] text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Verified Google Email</th>
                    <th className="py-3 px-4">First Joined</th>
                    <th className="py-3 px-4">Trial Status</th>
                    <th className="py-3 px-4">Trial Request ID</th>
                    <th className="py-3 px-4 text-right">Trial Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No Google users registered yet.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isEligible = u.trialStatus === 'eligible';
                      return (
                        <tr key={u.uid} className="hover:bg-slate-800/30">
                          <td className="py-3.5 px-4 flex items-center gap-2.5">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.displayName} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-xs">
                                {u.displayName?.[0] || 'U'}
                              </div>
                            )}
                            <span className="font-bold text-white">{u.displayName}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                          <td className="py-3.5 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isEligible
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {isEligible ? '🎁 1 Free Available' : 'Trial Consumed'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-indigo-400">
                            {u.trialRequestId || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isEligible ? (
                              <button
                                onClick={() => handleResetTrial(u.uid, u.email)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                              >
                                Reset Free Trial &rarr;
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-400 font-semibold">Ready for 1st Video</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Audit Logs */}
            {auditLogs.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#090D16] border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">Trial Status Audit Trail</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                  {auditLogs.map((a) => (
                    <div key={a.id} className="p-2.5 rounded-lg bg-[#0C1220] border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-indigo-400 font-mono font-semibold">{a.targetUserEmail}</span>: {a.details}
                      </div>
                      <span className="text-slate-500 text-[10px]">{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: IDEA & BUDGET REQUESTS */}
        {activeTab === 'budget' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Direct Contact & Video Budget Inquiries</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Submissions from the "Contact Us & Request a Custom AI Video" form.
                </p>
              </div>
              <button
                onClick={() => loadData()}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Budget Table */}
            <div className="rounded-2xl bg-[#090D16] border border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0C1220] text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Video Idea</th>
                    <th className="py-3 px-4">Budget Tier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {budgetRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No budget inquiries yet.
                      </td>
                    </tr>
                  ) : (
                    budgetRequests.map((b) => (
                      <tr key={b.id} onClick={() => openBudgetDrawer(b.id)} className="hover:bg-slate-800/30 cursor-pointer">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{b.id}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{b.fullName} ({b.email})</td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{b.videoIdea}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">{b.budgetCategory} ({b.budgetAmount})</td>
                        <td className="py-3.5 px-4 text-slate-300">{b.status}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openBudgetDrawer(b.id);
                            }}
                            className="px-3 py-1 rounded bg-indigo-600 text-white font-bold"
                          >
                            Reply &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EMAIL LOGS */}
        {activeTab === 'emails' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Connection Test Result Banner */}
            {testEmailResult && (
              <div
                className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                  testEmailResult.success
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-600 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {testEmailResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {testEmailResult.success ? 'TEST EMAIL DISPATCHED SUCCESSFULLY' : 'GMAIL CONNECTION TEST FAILED'}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90">{testEmailResult.message}</p>
                    <p className="text-[11px] mt-1 font-mono">
                      Destination: <strong>{testEmailResult.recipient}</strong> &bull; Subject: <em>{testEmailResult.subject}</em>
                    </p>
                    {testEmailResult.error && (
                      <p className="text-xs text-rose-300 bg-black/40 p-2 rounded mt-2 font-mono">
                        Error: {testEmailResult.error}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setTestEmailResult(null)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <span>Automatic Request Email Delivery Logs</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Every request submitted by a user is automatically dispatched to <strong className="text-indigo-300 font-mono">{settingsOwnerEmail || 'muhammedalimdd@gmail.com'}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleTestGmailConnection}
                  disabled={isTestingEmail}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isTestingEmail ? 'Sending Test...' : 'TEST GMAIL CONNECTION'}</span>
                </button>
                <button
                  onClick={() => loadData()}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                  title="Refresh logs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Email Logs Table */}
            <div className="rounded-2xl bg-[#090D16] border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0C1220] text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Email Type</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No email transmission logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((l) => {
                      const isSuccess = l.status === 'sent';
                      const isFailed = l.status === 'failed';
                      return (
                        <tr key={l.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isSuccess
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : isFailed
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {isSuccess ? '✓ Delivered' : isFailed ? '✕ Failed' : '⚡ Logged'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                            {l.requestId}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {l.type === 'owner_new_request' && 'Owner Alert'}
                            {l.type === 'customer_confirmation' && 'Customer Confirmation'}
                            {l.type === 'video_delivery' && 'Video Delivery'}
                            {l.type === 'quote_sent' && 'Custom Quote'}
                            {l.type === 'payment_confirmed' && 'Payment Verified'}
                            {l.type === 'budget_request_owner' && 'Budget Inq (Owner)'}
                            {l.type === 'budget_request_customer' && 'Budget Inq (Customer)'}
                            {l.type === 'test_connection' && 'Connection Test'}
                            {!['owner_new_request', 'customer_confirmation', 'video_delivery', 'quote_sent', 'payment_confirmed', 'budget_request_owner', 'budget_request_customer', 'test_connection'].includes(l.type) && l.type}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-white font-medium">
                            {l.recipient}
                          </td>
                          <td className="py-3.5 px-4 text-slate-200 max-w-xs truncate" title={l.subject}>
                            {l.subject}
                            {l.error && (
                              <p className="text-[10px] text-rose-400 truncate mt-0.5" title={l.error}>
                                Error: {l.error}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {new Date(l.sentAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => setPreviewEmailLog(l)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-[11px] cursor-pointer"
                            >
                              View
                            </button>
                            {(!isSuccess || isFailed) && (
                              <button
                                onClick={() => handleRetryEmail(l.id)}
                                disabled={retryingLogId === l.id}
                                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                              >
                                <RotateCcw className={`w-3 h-3 ${retryingLogId === l.id ? 'animate-spin' : ''}`} />
                                <span>{retryingLogId === l.id ? 'Retrying...' : 'Retry'}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <span>Automatic Gmail Request Notification Settings</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your Gmail or SMTP delivery parameters so every customer request arrives directly in your Gmail inbox at <strong className="text-indigo-300 font-mono">muhammedalimdd@gmail.com</strong>.
              </p>
            </div>

            {/* Test Connection Banner */}
            {testEmailResult && (
              <div
                className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                  testEmailResult.success
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-600 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {testEmailResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {testEmailResult.success ? 'TEST EMAIL DELIVERED TO GMAIL' : 'TEST CONNECTION FAILED'}
                    </h4>
                    <p className="text-xs mt-0.5">{testEmailResult.message}</p>
                    <p className="text-[11px] mt-1 font-mono">
                      Destination: <strong>{testEmailResult.recipient}</strong>
                    </p>
                    {testEmailResult.error && (
                      <p className="text-xs text-rose-300 bg-black/40 p-2 rounded mt-2 font-mono">
                        Error: {testEmailResult.error}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setTestEmailResult(null)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* QUICK TEST PANEL */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900 border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                  1-Click Direct Verification
                </span>
                <h4 className="text-sm font-bold text-white">Test Gmail Connection</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sends an immediate test email to <strong className="text-indigo-300 font-mono">{settingsOwnerEmail || 'muhammedalimdd@gmail.com'}</strong> with subject <em className="text-white">"AI VIDEO MAKER — TEST EMAIL"</em>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestGmailConnection}
                disabled={isTestingEmail}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                <span>{isTestingEmail ? 'Sending Test...' : 'TEST GMAIL CONNECTION'}</span>
              </button>
            </div>

            {/* FORM CONFIGURATION */}
            <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-[#090D16] border border-slate-800 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Owner's Destination Gmail Address (Required)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  All new video requests and customer briefs will be delivered directly to this Gmail address.
                </p>
                <input
                  type="email"
                  value={settingsOwnerEmail}
                  onChange={(e) => setSettingsOwnerEmail(e.target.value)}
                  placeholder="muhammedalimdd@gmail.com"
                  required
                  className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-sm font-mono font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Verified Sender Address (From)
                </label>
                <input
                  type="text"
                  value={settingsFromEmail}
                  onChange={(e) => setSettingsFromEmail(e.target.value)}
                  placeholder="muhammedalimdd@gmail.com or studio@aivideomaker.com"
                  className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Delivery Service / Protocol
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'gmail', label: 'Gmail (App Password)', desc: 'Direct Google SMTP' },
                    { id: 'smtp', label: 'Custom SMTP', desc: 'Any SMTP host' },
                    { id: 'resend', label: 'Resend API', desc: 'Transactional API' },
                    { id: 'sendgrid', label: 'SendGrid API', desc: 'Transactional API' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSettingsProvider(p.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        settingsProvider === p.id
                          ? 'bg-indigo-950/60 border-indigo-500 text-white shadow'
                          : 'bg-[#0C1220] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">{p.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GMAIL & SMTP CONFIGURATION FIELDS */}
              {(settingsProvider === 'gmail' || settingsProvider === 'smtp') && (
                <div className="p-4 rounded-xl bg-[#0C1220] border border-slate-800/80 space-y-4">
                  {settingsProvider === 'gmail' && (
                    <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-lg text-xs text-indigo-200 leading-relaxed">
                      <strong className="text-white block mb-1">How to use Gmail with AI Video Maker:</strong>
                      1. Go to your <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-cyan-300 underline font-semibold">Google Account Security</a> settings.<br/>
                      2. Ensure <strong>2-Step Verification</strong> is ON.<br/>
                      3. Click <strong>App Passwords</strong> and generate a new password named <em>"AI Video Maker"</em>.<br/>
                      4. Paste the 16-character password into the <strong>Google App Password</strong> field below.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settingsSmtpHost}
                        onChange={(e) => setSettingsSmtpHost(e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        SMTP Port (465 for SSL, 587 for TLS)
                      </label>
                      <input
                        type="number"
                        value={settingsSmtpPort}
                        onChange={(e) => setSettingsSmtpPort(Number(e.target.value))}
                        placeholder="465"
                        className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Google / SMTP User (Email)
                      </label>
                      <input
                        type="email"
                        value={settingsSmtpUser}
                        onChange={(e) => setSettingsSmtpUser(e.target.value)}
                        placeholder="muhammedalimdd@gmail.com"
                        className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span>{settingsProvider === 'gmail' ? 'Google App Password' : 'SMTP Password'}</span>
                        <button
                          type="button"
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="text-[10px] text-indigo-400 hover:underline"
                        >
                          {showSmtpPass ? 'Hide' : 'Show'}
                        </button>
                      </label>
                      <input
                        type={showSmtpPass ? 'text' : 'password'}
                        value={settingsSmtpPass}
                        onChange={(e) => setSettingsSmtpPass(e.target.value)}
                        placeholder="16-character app password..."
                        className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* API KEY CONFIGURATION (RESEND / SENDGRID) */}
              {(settingsProvider === 'resend' || settingsProvider === 'sendgrid') && (
                <div className="p-4 rounded-xl bg-[#0C1220] border border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    {settingsProvider === 'resend' ? 'Resend API Key (re_...)' : 'SendGrid API Key (SG...)'}
                  </label>
                  <input
                    type="password"
                    value={settingsApiKey}
                    onChange={(e) => setSettingsApiKey(e.target.value)}
                    placeholder={settingsProvider === 'resend' ? 're_123456789...' : 'SG.xxxxxxxxxxxx'}
                    className="w-full px-4 py-3 bg-[#090D16] border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {isSavingSettings ? 'Saving...' : 'Save Configuration'}
                </button>

                <button
                  type="button"
                  onClick={handleTestGmailConnection}
                  disabled={isTestingEmail}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isTestingEmail ? 'Testing...' : 'TEST GMAIL CONNECTION'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* DETAIL DRAWER FOR VIDEO BRIEFS */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-3xl h-full bg-[#090D16] border-l border-slate-800 flex flex-col justify-between overflow-y-auto p-6 sm:p-8 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{selectedRequest.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedRequest.requestType === 'free_trial' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'}`}>
                      {selectedRequest.requestType === 'free_trial' ? '🎁 One-Time Free Trial' : '💳 Paid Video Request'}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">{selectedRequest.title}</h3>
                  <p className="text-xs text-slate-400">
                    Customer: {selectedRequest.customerName} · <span className="text-indigo-400 font-mono">{selectedRequest.customerEmail}</span>
                  </p>
                  <div className="mt-2.5">
                    <button
                      onClick={() => handleResendOwnerEmail(selectedRequest.id)}
                      disabled={isResendingOwnerEmail}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow transition-all disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isResendingOwnerEmail ? 'Dispatching to Gmail...' : 'Resend Request to Owner Gmail (muhammedalimdd@gmail.com)'}</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update & Date controls */}
              <div className="p-4 rounded-xl bg-[#0C1220] border border-slate-800 mb-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Production Controls
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Set Status</label>
                    <select
                      value={statusToSet}
                      onChange={(e) => setStatusToSet(e.target.value as VideoStatus)}
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="In Production">In Production</option>
                      <option value="Quality Check">Quality Check</option>
                      <option value="Completed">Completed</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Estimated Completion Date</label>
                    <input
                      type="date"
                      value={estDateToSet}
                      onChange={(e) => setEstDateToSet(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Customer-Visible Notes</label>
                  <input
                    type="text"
                    value={customerNotesToSet}
                    onChange={(e) => setCustomerNotesToSet(e.target.value)}
                    placeholder="e.g. Scene 1 rendered. Currently rendering final shots..."
                    className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Add Private Internal Note</label>
                  <input
                    type="text"
                    value={newInternalNote}
                    onChange={(e) => setNewInternalNote(e.target.value)}
                    placeholder="Staff notes (never shown to customer)..."
                    className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <button
                  onClick={handleUpdateRequest}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save Status & Notes
                </button>
              </div>

              {/* CUSTOM QUOTE SECTION (FOR PAID REQUESTS) */}
              {selectedRequest.requestType === 'paid' && (
                <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-700/60 mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <span>Prepare & Send Custom Video Quote</span>
                    </h4>
                    {selectedRequest.quote && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        Quote Status: {selectedRequest.quote.status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">
                    The customer was informed: <strong className="text-indigo-300">"The payment will be based on the video."</strong> Enter your proposed production cost and send the quote to their email.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">Quote Amount (Numeric)</label>
                      <div className="flex gap-1.5">
                        <select
                          value={quoteCurrency}
                          onChange={(e) => setQuoteCurrency(e.target.value)}
                          className="px-2.5 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white font-bold"
                        >
                          <option value="₹">₹ (INR)</option>
                          <option value="$">$ (USD)</option>
                        </select>
                        <input
                          type="number"
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(Number(e.target.value))}
                          className="flex-1 px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">Payment Link (UPI / Stripe / Custom)</label>
                      <input
                        type="text"
                        value={quotePaymentLink}
                        onChange={(e) => setQuotePaymentLink(e.target.value)}
                        placeholder="https://buy.stripe.com/... or upi://pay?..."
                        className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">Scope & Production Breakdown</label>
                    <textarea
                      rows={2}
                      value={quoteBreakdown}
                      onChange={(e) => setQuoteBreakdown(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleSendCustomQuote}
                      disabled={isSendingQuote}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
                    >
                      {isSendingQuote ? 'Sending Quote...' : 'Send Custom Quote to Customer Email &rarr;'}
                    </button>

                    <button
                      onClick={handleConfirmPayment}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Confirm Payment & Begin Production
                    </button>
                  </div>
                </div>
              )}

              {/* VIDEO DELIVERY WORKFLOW */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-800/60 mb-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Deliver Completed Video</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Direct Video URL (Cloud Storage, Google Drive, or CDN)
                    </label>
                    <input
                      type="text"
                      value={videoDeliveryUrl}
                      onChange={(e) => setVideoDeliveryUrl(e.target.value)}
                      placeholder="https://storage.googleapis.com/... or drive.google.com/..."
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Delivery Message to Customer
                    </label>
                    <input
                      type="text"
                      value={deliveryMessage}
                      onChange={(e) => setDeliveryMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090D16] border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <button
                    onClick={handleDeliverVideo}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Delivery Email & Mark Completed</span>
                  </button>
                </div>
              </div>

              {/* STORY & CHARACTERS PREVIEW */}
              <div className="p-4 rounded-xl bg-[#0C1220] border border-slate-800 space-y-3 text-xs mb-6">
                <h4 className="font-bold text-white">Story & Creative Brief</h4>
                <div className="p-3 bg-[#090D16] rounded border border-slate-800 whitespace-pre-wrap text-slate-200">
                  {selectedRequest.storyDescription}
                </div>
                <div className="space-y-3">
                  <span className="font-bold text-indigo-400">Characters ({selectedRequest.characters?.length || 0}):</span>
                  {selectedRequest.characters?.map((c: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-white text-sm">{c.name}</strong>
                          <span className="text-slate-400 text-xs ml-1">({c.role || 'Character'}{c.ageRange ? `, Age ${c.ageRange}` : ''})</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs"><strong className="text-slate-400">Appearance:</strong> {c.appearance}</p>
                      {c.clothing && <p className="text-slate-300 text-xs"><strong className="text-slate-400">Clothing:</strong> {c.clothing}</p>}
                      {c.actions && <p className="text-slate-300 text-xs"><strong className="text-slate-400">Actions:</strong> {c.actions}</p>}
                      {c.dialogue && <p className="text-cyan-300 text-xs font-medium">"{c.dialogue}"</p>}
                      {c.referencePhotoUrl && (
                        <div className="mt-2 p-2 bg-[#090D16] rounded-lg border border-slate-800 flex items-center gap-3">
                          <img
                            src={c.referencePhotoUrl}
                            alt={c.name}
                            className="w-14 h-14 rounded object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="text-[11px] font-semibold text-slate-300 block">Uploaded Reference Photo</span>
                            <a
                              href={c.referencePhotoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 underline text-xs font-bold inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>Open High-Resolution Image</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER FOR BUDGET REQUESTS */}
      {selectedBudgetRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl h-full bg-[#090D16] border-l border-slate-800 p-6 overflow-y-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-cyan-400 font-bold text-xs">{selectedBudgetRequest.id}</span>
                <h3 className="text-lg font-bold text-white">{selectedBudgetRequest.fullName}</h3>
                <p className="text-xs text-slate-400">{selectedBudgetRequest.email}</p>
              </div>
              <button onClick={() => setSelectedBudgetRequest(null)} className="p-2 rounded bg-slate-800 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded bg-[#0C1220] border border-slate-800 space-y-2 text-xs">
              <span className="text-indigo-400 font-bold">Video Idea:</span>
              <p className="text-white whitespace-pre-wrap">{selectedBudgetRequest.videoIdea}</p>
              <div className="pt-2 flex gap-4 text-slate-300">
                <span>Budget: <strong className="text-emerald-400">{selectedBudgetRequest.budgetCategory} ({selectedBudgetRequest.budgetAmount})</strong></span>
                <span>Type: <strong>{selectedBudgetRequest.preferredVideoType}</strong></span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Reply to Customer via Email</label>
              <textarea
                rows={3}
                value={budgetReplyMessage}
                onChange={(e) => setBudgetReplyMessage(e.target.value)}
                placeholder="Type your reply message..."
                className="w-full p-3 rounded-xl bg-[#0C1220] border border-slate-800 text-xs text-white"
              />
              <button
                onClick={handleSendBudgetReply}
                disabled={isSendingBudgetReply}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                {isSendingBudgetReply ? 'Sending...' : 'Send Reply Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL PREVIEW MODAL */}
      {previewEmailLog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] bg-[#090D16] border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0C1220]">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                  {previewEmailLog.type} &bull; {previewEmailLog.requestId}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{previewEmailLog.subject}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recipient: <strong className="text-indigo-300 font-mono">{previewEmailLog.recipient}</strong> &bull; {new Date(previewEmailLog.sentAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRetryEmail(previewEmailLog.id)}
                  disabled={retryingLogId === previewEmailLog.id}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${retryingLogId === previewEmailLog.id ? 'animate-spin' : ''}`} />
                  <span>Retry Dispatch</span>
                </button>
                <button
                  onClick={() => setPreviewEmailLog(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/60">
              <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800">
                <div
                  className="text-xs text-slate-200"
                  dangerouslySetInnerHTML={{ __html: previewEmailLog.htmlBody }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
