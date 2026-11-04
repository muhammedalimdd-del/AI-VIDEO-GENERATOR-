import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Gift,
  CreditCard,
  Mail,
  ShieldCheck,
  Film
} from 'lucide-react';

interface SuccessScreenProps {
  request: {
    id: string;
    accessToken: string;
    title: string;
    status: string;
    requestType?: 'free_trial' | 'paid';
    pricingMessage?: string;
    customerName: string;
    customerEmail: string;
    createdAt: string;
    estimatedCompletionDate?: string;
    style?: string;
    duration?: string;
    format?: string;
    aspectRatio?: string;
    emailNotification?: {
      sent?: boolean;
      status?: string;
      provider?: string;
      error?: string;
      duplicatePrevented?: boolean;
    };
    notificationMessage?: string;
  };
  onTrack: (id: string, token: string) => void;
  onHome: () => void;
  onNewRequest: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  request,
  onTrack,
  onHome,
  onNewRequest
}) => {
  const [copied, setCopied] = useState(false);
  const isTrial = request.requestType === 'free_trial';

  const copyId = () => {
    navigator.clipboard.writeText(request.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-fadeIn">
      <div className="rounded-3xl bg-[#090D16] border border-slate-800 shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full blur-[90px] pointer-events-none ${
            isTrial ? 'bg-emerald-500/15' : 'bg-indigo-500/15'
          }`}
        />

        {/* Success Icon */}
        <div
          className={`w-20 h-20 rounded-2xl p-[2px] mx-auto mb-6 shadow-xl ${
            isTrial
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/25'
              : 'bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-indigo-500/25'
          }`}
        >
          <div className="w-full h-full bg-[#060911] rounded-[14px] flex items-center justify-center">
            {isTrial ? (
              <Gift className="w-10 h-10 text-emerald-400" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-indigo-400" />
            )}
          </div>
        </div>

        {/* Exact Headline as Specified */}
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
          {isTrial
            ? 'Your Free Trial Request Has Been Submitted!'
            : 'Your Video Request Has Been Submitted!'}
        </h2>

        {/* Exact Supporting Text as Specified */}
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
          {isTrial
            ? 'Thank you for sharing your idea. We have received your request and will review it. Your completed video will be delivered to your registered email address when production is completed.'
            : 'The payment will be based on the video. We will review your requirements and contact you with the proposed price before starting paid production.'}
        </p>

        {/* Request ID Badge with Copy */}
        <div className="inline-flex items-center gap-3 p-3 px-5 rounded-2xl bg-slate-900 border border-slate-800 mb-8 shadow-inner">
          <div className="text-left">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Unique Request ID
            </span>
            <span className="font-mono font-bold text-lg text-indigo-300">
              {request.id}
            </span>
          </div>

          <button
            type="button"
            onClick={copyId}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Copy Request ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Status Card */}
        <div className="rounded-2xl bg-[#0C1220] border border-slate-800/90 p-6 text-left mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Request Details & Status
            </span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>{request.status || 'Submitted'} — In Review</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Project Title:</span>
              <span className="text-white font-semibold text-sm">{request.title}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Request Type:</span>
              <span
                className={`font-semibold inline-flex items-center gap-1.5 ${
                  isTrial ? 'text-emerald-400' : 'text-indigo-300'
                }`}
              >
                {isTrial ? <Gift className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                {isTrial ? 'One-Time Free Trial' : 'Paid Video Request'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Registered Delivery Email:</span>
              <span className="text-indigo-300 font-mono text-sm">{request.customerEmail}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Studio Owner Notification Inbox:</span>
              <span className="text-emerald-400 font-mono text-sm">muhammedalimdd@gmail.com</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-0.5">Pricing Note:</span>
              <span className="text-slate-200">
                {request.pricingMessage || (isTrial ? 'One-Time Free Trial' : 'The payment will be based on the video.')}
              </span>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left mb-8">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                {request.emailNotification?.sent
                  ? 'Automatic Resend Email Notification Sent to Studio Owner'
                  : 'Request Routed to Studio Owner Gmail'}
              </p>
              <p className="text-slate-400">
                {request.notificationMessage || (
                  <>
                    Your request notification has been dispatched via Resend to{' '}
                    <strong className="text-indigo-300 font-mono">muhammedalimdd@gmail.com</strong> and your completed video will be delivered to{' '}
                    <strong className="text-slate-200">{request.customerEmail}</strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=muhammedalimdd@gmail.com&su=${encodeURIComponent(
              `NEW AI VIDEO REQUEST — ${(request.customerName || 'CUSTOMER').toUpperCase()} — ${request.id}`
            )}&body=${encodeURIComponent(
              [
                `NEW AI VIDEO REQUEST — ${(request.customerName || 'CUSTOMER').toUpperCase()} — ${request.id}`,
                '============================================================',
                `Customer Name: ${request.customerName}`,
                `Customer Email: ${request.customerEmail}`,
                `Request ID: ${request.id}`,
                `Video Title: ${request.title}`,
                `Request Type: ${isTrial ? 'One-Time Free Trial' : 'Paid Video Request'}`,
                `Style: ${request.style || 'Cinematic'}`,
                `Format: ${request.format || 'Landscape'} (${request.aspectRatio || '16:9'})`,
                `Duration: ${request.duration || 'Standard'}`,
                `Submitted At: ${new Date(request.createdAt).toUTCString()}`
              ].join('\n')
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3.5 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Open in Gmail</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onTrack(request.id, request.accessToken)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Track This Request in My Requests</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onHome}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white transition-all cursor-pointer"
          >
            Return to Studio Home
          </button>

          <button
            type="button"
            onClick={onNewRequest}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white transition-all cursor-pointer"
          >
            + Submit Another Idea
          </button>
        </div>
      </div>
    </div>
  );
};
