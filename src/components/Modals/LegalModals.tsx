import React, { useState } from 'react';
import { X, Shield, Lock, FileText, Trash2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { safeFetchJson } from '../../services/apiClient.ts';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] bg-[#090D16] border border-slate-800 rounded-2xl flex flex-col shadow-2xl animate-fadeIn">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Privacy Policy</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          <p>
            At <strong>ZENVORA</strong>, your creative concepts, personal details, and reference photos are treated with the highest degree of confidentiality and technical protection.
          </p>

          <h4 className="font-bold text-white text-sm">1. Customer Information We Collect</h4>
          <p>
            When you submit a creative brief, we collect your name, email address, optional contact telephone number, project titles, character descriptions, scene layouts, and any reference photos you choose to provide.
          </p>

          <h4 className="font-bold text-white text-sm">2. Use of Reference Photos & Likenesses</h4>
          <p>
            Any photos uploaded to our platform are stored on private, encrypted server disks. They are accessed exclusively by authorized production personnel to train character consistency embeddings or provide visual guidance for your specific video. We never publish your photos publicly, sell your biometric likenesses, or share them with third-party advertisers.
          </p>

          <h4 className="font-bold text-white text-sm">3. Email Communications</h4>
          <p>
            Your email address is strictly used for transactional production updates: confirming receipt of your brief, sending director questions or clarifications, and delivering your completed video link. We never send unsolicited spam.
          </p>

          <h4 className="font-bold text-white text-sm">4. Data Deletion & Retention</h4>
          <p>
            You retain the absolute right to have your creative brief, reference photos, and contact records permanently erased at any time using our automated Data Erasure Request tool.
          </p>
        </div>

        <div className="p-4 border-t border-slate-800 text-right">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] bg-[#090D16] border border-slate-800 rounded-2xl flex flex-col shadow-2xl animate-fadeIn">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Terms of Service</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          <h4 className="font-bold text-white text-sm">1. Production Workflow & Feasibility</h4>
          <p>
            ZENVORA produces custom, human-directed AI video renders according to the customer's submitted creative brief. All submitted briefs undergo director review for feasibility, technical coherence, and compliance with ethical guidelines.
          </p>

          <h4 className="font-bold text-white text-sm">2. Realistic Delivery Expectations</h4>
          <p>
            Turnaround times depend on current studio queue volume, scene count, and complexity. Typical turnaround is between 2 to 4 business days. We do not claim instantaneous automated delivery because our pipeline incorporates manual review and quality inspection.
          </p>

          <h4 className="font-bold text-white text-sm">3. Permitted Content & Upload Rights</h4>
          <p>
            You represent and warrant that you own or possess legal license and permission to upload all photographs, likenesses, and scripts provided in your brief. Content depicting harassment, illegal activity, non-consensual deepfakes, or hate speech will be immediately rejected and permanently deleted.
          </p>

          <h4 className="font-bold text-white text-sm">4. Ownership of Final Video</h4>
          <p>
            Upon delivery, the customer is granted the right to use, distribute, broadcast, and publish the finalized video file for personal and commercial purposes.
          </p>
        </div>

        <div className="p-4 border-t border-slate-800 text-right">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700">
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export const DataDeletionModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await safeFetchJson<{ message?: string; error?: string }>('/api/privacy/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), requestId: requestId.trim() })
      });
      setMessage(result.data?.message || result.data?.error || result.error || 'Deletion request processed.');
    } catch (err: any) {
      setMessage('Error processing request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#090D16] border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Data Erasure Request</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          In accordance with data protection rights, you can request the immediate and permanent deletion of your creative brief, customer records, and uploaded character reference photos.
        </p>

        {message ? (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2.5 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Registered Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 bg-[#0C1220] border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Request ID (Optional)
              </label>
              <input
                type="text"
                value={requestId}
                onChange={e => setRequestId(e.target.value)}
                placeholder="e.g. VR-2026-8941"
                className="w-full px-3 py-2 bg-[#0C1220] border border-slate-800 rounded-lg text-white text-xs font-mono uppercase focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Verifying & Purging...' : 'Execute Permanent Erasure &rarr;'}
            </button>
          </form>
        )}

        <div className="text-right">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const ContactModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    if (!name.trim() || !email.trim() || !message.trim()) {
      setSubmitError('Please fill in your name, email, and message.');
      return;
    }
    setIsSending(true);
    setSubmitError(null);
    try {
      const res = await safeFetchJson<{ budgetRequest?: any; error?: string }>('/api/budget-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name.trim(),
          email: email.trim().toLowerCase(),
          videoIdea: message.trim(),
          preferredVideoType: 'custom',
          videoFormat: 'landscape',
          preferredDuration: 'Custom',
          budgetCategory: 'FREE'
        })
      });

      if (!res.ok && res.data?.error) {
        setSubmitError(res.data.error);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to submit inquiry right now. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#090D16] border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Contact Studio Production</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Request Sent to muhammedalimdd@gmail.com</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Thank you for getting in touch. Your inquiry has been forwarded via Resend to our studio inbox (<span className="text-indigo-300 font-mono">muhammedalimdd@gmail.com</span>) and we will reply to <span className="text-white">{email}</span>.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setSubmitError(null);
                setName('');
                setEmail('');
                setMessage('');
                onClose();
              }}
              className="mt-4 px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <p className="text-xs text-slate-400">
              Have questions about enterprise production, commercial rights, or custom AI video requests? Your inquiry is sent directly to <span className="text-indigo-300 font-mono">muhammedalimdd@gmail.com</span>.
            </p>

            {submitError && (
              <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full px-3 py-2 bg-[#0C1220] border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 bg-[#0C1220] border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Message / Production Inquiry
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Tell us about your custom video goals..."
                className="w-full px-3 py-2 bg-[#0C1220] border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
              >
                {isSending ? 'Sending...' : 'Send Inquiry →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
