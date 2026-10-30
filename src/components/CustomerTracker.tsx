import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, Send, Video, Download, ArrowLeft, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';

interface CustomerTrackerProps {
  initialRequestId?: string;
  initialToken?: string;
  onBack: () => void;
}

export const CustomerTracker: React.FC<CustomerTrackerProps> = ({
  initialRequestId,
  initialToken,
  onBack
}) => {
  const [requestId, setRequestId] = useState(initialRequestId || '');
  const [emailOrToken, setEmailOrToken] = useState(initialToken || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<any | null>(null);

  // Customer clarification response state
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  // Auto-fetch if initial props are provided
  useEffect(() => {
    if (initialRequestId && initialToken) {
      handleLookup(initialRequestId, initialToken);
    }
  }, [initialRequestId, initialToken]);

  const handleLookup = async (idToLook: string, keyToLook: string) => {
    if (!idToLook.trim() || !keyToLook.trim()) {
      setError('Please provide both your Request ID and your email or tracking token.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let foundRequest: any = null;

      try {
        const res = await fetch('/api/requests/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: idToLook.trim(),
            emailOrToken: keyToLook.trim()
          })
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok && data.request) {
            foundRequest = data.request;
          }
        }
      } catch (netErr) {
        // Fallback for static hosting
      }

      // If not found from server (e.g. GitHub Pages static deployment), search localStorage
      if (!foundRequest) {
        try {
          const localRequests = JSON.parse(localStorage.getItem('studio_local_requests') || '[]');
          const match = localRequests.find((r: any) => 
            r.id.toLowerCase() === idToLook.trim().toLowerCase() &&
            (r.customerEmail.toLowerCase() === keyToLook.trim().toLowerCase() || r.accessToken === keyToLook.trim())
          );
          if (match) {
            foundRequest = match;
          }
        } catch (e) {
          // ignore
        }
      }

      if (!foundRequest) {
        throw new Error('Request not found. Please verify your Request ID and email.');
      }

      setRequestData(foundRequest);
    } catch (e: any) {
      setError(e.message || 'Failed to locate request.');
      setRequestData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendClarificationReply = async () => {
    if (!replyMessage.trim() || !requestData) return;

    setIsSendingReply(true);
    setReplySuccess(null);

    try {
      const res = await fetch(`/api/requests/${requestData.id}/customer-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage.trim(),
          token: requestData.accessToken,
          email: requestData.customerEmail
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit response.');

      setReplyMessage('');
      setReplySuccess('Your reply has been forwarded directly to the studio director!');
      // Refresh request
      handleLookup(requestData.id, requestData.accessToken);
    } catch (e: any) {
      alert(e.message || 'Error submitting response');
    } finally {
      setIsSendingReply(false);
    }
  };

  const getStatusStepIndex = (status: string): number => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Awaiting Customer Information': return 1;
      case 'Approved': return 2;
      case 'In Production': return 3;
      case 'Quality Check': return 4;
      case 'Completed': return 5;
      case 'Delivered': return 6;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const statusMilestones = [
    'Submitted',
    'Under Review',
    'Approved',
    'In Production',
    'Quality Check',
    'Completed',
    'Delivered'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      {/* Top navigation */}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Homepage</span>
      </button>

      {/* Header card */}
      <div className="rounded-3xl bg-[#090D16] border border-slate-800 p-6 sm:p-10 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Track Your Video Request
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Check real-time production status, review studio notes, and download your finished video.
            </p>
          </div>
        </div>

        {/* Lookup form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleLookup(requestId, emailOrToken);
          }}
          className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Request ID
            </label>
            <input
              type="text"
              value={requestId}
              onChange={e => setRequestId(e.target.value)}
              placeholder="e.g. VR-2026-8941"
              className="w-full px-3.5 py-2.5 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Registered Email or Secret Token
            </label>
            <input
              type="text"
              value={emailOrToken}
              onChange={e => setEmailOrToken(e.target.value)}
              placeholder="e.g. yourname@gmail.com or sec_..."
              className="w-full px-3.5 py-2.5 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Look Up</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Request Details View */}
      {requestData && (
        <div className="space-y-6">
          {/* Status Header Banner */}
          <div className="rounded-2xl bg-[#090D16] border border-slate-800 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider block mb-1">
                  {requestData.id}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {requestData.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted on {new Date(requestData.createdAt).toLocaleDateString()} at{' '}
                  {new Date(requestData.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                  Current Status
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  {requestData.status}
                </span>
              </div>
            </div>

            {/* Production Milestones Bar */}
            <div className="mt-8">
              <span className="text-xs font-semibold text-slate-400 block mb-4">
                Milestone Progress
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                {statusMilestones.map((milestone, idx) => {
                  const currentIdx = getStatusStepIndex(requestData.status);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;
                  return (
                    <div
                      key={milestone}
                      className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                        isCurrent
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold ring-1 ring-indigo-500'
                          : isDone
                          ? 'bg-slate-900 border-slate-700 text-slate-200'
                          : 'bg-[#060911] border-slate-900 text-slate-600'
                      }`}
                    >
                      <div className="text-[10px] text-slate-500 font-mono mb-0.5">
                        0{idx + 1}
                      </div>
                      <div className="truncate">{milestone}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Turnaround & Studio Notes */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0C1220] border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">Estimated Completion Date:</span>
                <span className="text-white font-semibold text-sm">
                  {requestData.estimatedCompletionDate || 'Under evaluation by production staff'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0C1220] border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">Studio Director Updates:</span>
                <span className="text-indigo-200 leading-relaxed block">
                  {requestData.customerVisibleNotes || 'No notes currently posted. Your brief is progressing according to schedule.'}
                </span>
              </div>
            </div>
          </div>

          {/* COMPLETED VIDEO DELIVERY SECTION */}
          {requestData.completedVideo && (
            <div className="rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-800/60 p-6 sm:p-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-900/60 text-emerald-400">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Your Video Is Ready!</h4>
                  <p className="text-xs text-emerald-300">
                    Production and quality verification are complete.
                  </p>
                </div>
              </div>

              {requestData.completedVideo.message && (
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-900/40 text-xs text-slate-200 mb-6 leading-relaxed">
                  <strong>Studio Message:</strong> {requestData.completedVideo.message}
                </div>
              )}

              {/* Video Player Preview if direct MP4 */}
              <div className="mb-6 rounded-xl overflow-hidden bg-black border border-slate-800 max-w-xl mx-auto shadow-2xl">
                <video
                  controls
                  className="w-full max-h-[450px] object-contain"
                  src={requestData.completedVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={requestData.completedVideo.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Definition Video</span>
                </a>

                <a
                  href={requestData.completedVideo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Video in New Tab</span>
                </a>
              </div>
            </div>
          )}

          {/* Interactive Clarification Thread */}
          <div className="rounded-2xl bg-[#090D16] border border-slate-800 p-6 sm:p-8">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Production Clarifications & Questions
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              If the director needs extra details on characters or scenes, you can respond directly here.
            </p>

            {requestData.clarifications?.length > 0 ? (
              <div className="space-y-3 mb-6">
                {requestData.clarifications.map((item: any) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl text-xs max-w-xl ${
                      item.from === 'admin'
                        ? 'bg-indigo-950/60 border border-indigo-800/80 text-white mr-auto'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 ml-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-indigo-300">
                        {item.from === 'admin' ? 'Studio Director' : 'You (Customer)'}
                      </span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0C1220] border border-slate-800/80 text-xs text-slate-500 mb-6 text-center">
                No clarification messages currently pending. Everything in your brief is clear.
              </div>
            )}

            {/* Reply Input Form */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Send a Message or Clarification to the Studio
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Type your response or additional instruction..."
                  className="flex-1 px-4 py-2.5 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  disabled={isSendingReply || !replyMessage.trim()}
                  onClick={handleSendClarificationReply}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSendingReply ? 'Sending...' : 'Send Reply'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {replySuccess && (
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {replySuccess}
                </p>
              )}
            </div>
          </div>

          {/* Brief Summary Recap */}
          <div className="rounded-2xl bg-[#090D16] border border-slate-800 p-6 sm:p-8 text-xs space-y-4">
            <h4 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Registered Brief Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 block mb-1">Visual Style:</span>
                <span className="text-white font-semibold">{requestData.style}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Format:</span>
                <span className="text-white font-semibold">{requestData.format.toUpperCase()} ({requestData.aspectRatio})</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Duration:</span>
                <span className="text-white font-semibold">{requestData.duration}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Characters:</span>
                <span className="text-white font-semibold">{requestData.charactersCount} defined</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
