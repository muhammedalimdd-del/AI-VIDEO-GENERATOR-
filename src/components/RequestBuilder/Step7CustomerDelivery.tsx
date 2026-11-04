import React from 'react';
import { RequestFormData, UserAccount } from '../../types/client.ts';
import { Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Step7Props {
  data: RequestFormData;
  updateData: (fields: Partial<RequestFormData>) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  currentUser?: UserAccount | null;
}

export const Step7CustomerDelivery: React.FC<Step7Props> = ({
  data,
  updateData,
  onOpenPrivacy,
  onOpenTerms,
  currentUser
}) => {
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((data.customerEmail || '').trim()) &&
    !(data.customerEmail || '').trim().toLowerCase().endsWith('@aivideomaker.local');

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-400" />
          <span>Step 7: Customer Contact & Delivery Channel</span>
        </h3>
        <p className="text-sm text-slate-400">
          Your completed video and request updates will be sent directly to your preferred delivery email address.
        </p>
      </div>

      {/* Secure Delivery Banner */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-950/50 via-purple-950/40 to-slate-900 border border-indigo-700/60 p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-indigo-900/60 text-cyan-300 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-white">
              Direct Email Video Delivery
            </p>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Protected
            </span>
          </div>
          Enter any email address where you want to receive your completed AI video and secure download link. No Google Sign-in or email password is ever required.
        </div>
      </div>

      <div className="space-y-5">
        {/* Customer Full Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Your Contact Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={data.customerName}
            onChange={(e) => updateData({ customerName: e.target.value })}
            placeholder="e.g. Alex Morgan"
            className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
            required
          />
          {currentUser?.username && (
            <p className="text-[11px] text-slate-500 mt-1">
              Signed in as device account: <span className="text-indigo-400 font-mono">@{currentUser.username}</span>
            </p>
          )}
        </div>

        {/* Mandatory Email Address for Video Delivery */}
        <div>
          <label htmlFor="delivery-email-input" className="block text-sm font-semibold text-slate-200 mb-2">
            Email Address for Video Delivery <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              id="delivery-email-input"
              type="email"
              value={data.customerEmail}
              onChange={(e) => updateData({ customerEmail: e.target.value, confirmEmail: e.target.value })}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all font-mono"
              required
            />
            {isEmailValid && (
              <span className="absolute right-3 top-3 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                Valid Email
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Your completed video, director updates, and secure download links will be delivered to this email address. You can edit this email anytime before submitting.
          </p>
        </div>

        {/* Optional Additional Contact (Phone / WhatsApp) */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Optional Phone / WhatsApp Contact
          </label>
          <input
            type="tel"
            value={data.customerPhone || ''}
            onChange={(e) => updateData({ customerPhone: e.target.value })}
            placeholder="+1 555-019-2834 or WhatsApp number"
            className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Terms Checkbox */}
        <div className="pt-4 border-t border-slate-800">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.termsAccepted}
              onChange={(e) => updateData({ termsAccepted: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              required
            />
            <span className="text-xs text-slate-300 leading-relaxed">
              I agree to the{' '}
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-indigo-400 underline hover:text-white"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-indigo-400 underline hover:text-white"
              >
                Privacy Policy
              </button>
              . I understand that ZENVORA is a human-curated video creation service where requests are reviewed, produced with AI video creation tools, and delivered to my chosen delivery email address.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

