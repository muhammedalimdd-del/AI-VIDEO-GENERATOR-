import React, { useState, useEffect } from 'react';
import { VideoRequestClient, UserAccount } from '../../types/client.ts';
import {
  Film,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Gift,
  CreditCard,
  Download,
  Play,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { getVideoRequestsForUser, subscribeToUserRequests } from '../../services/firestoreService.ts';
import { safeFetchJson } from '../../services/apiClient.ts';

interface MyRequestsViewProps {
  currentUser: UserAccount;
  onBackToHome: () => void;
  onRequestNewVideo: () => void;
}

export const MyRequestsView: React.FC<MyRequestsViewProps> = ({
  currentUser,
  onBackToHome,
  onRequestNewVideo
}) => {
  const [requests, setRequests] = useState<VideoRequestClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUserRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let loadedRequests: VideoRequestClient[] | null = null;

      // 1. First attempt to load from Firestore database
      if (currentUser.uid) {
        try {
          const fsItems = await getVideoRequestsForUser(currentUser.uid);
          if (fsItems && fsItems.length > 0) {
            loadedRequests = fsItems;
          }
        } catch (fsErr) {
          console.warn('Notice: Reading from Firestore:', fsErr);
        }
      }

      // 2. Fetch from backend API
      if (!loadedRequests || loadedRequests.length === 0) {
        try {
          const result = await safeFetchJson<{ requests?: VideoRequestClient[] }>(`/api/user/requests?email=${encodeURIComponent(currentUser.email)}&uid=${currentUser.uid}`);
          if (result.ok && result.data?.requests && result.data.requests.length > 0) {
            loadedRequests = result.data.requests;
          }
        } catch (netErr) {
          // Fallback for static hosting
        }
      }

      // 3. Fallback: Read local storage
      if (loadedRequests === null || loadedRequests.length === 0) {
        try {
          const localRequests: VideoRequestClient[] = JSON.parse(localStorage.getItem('studio_local_requests') || '[]');
          loadedRequests = localRequests.filter(r => 
            r.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
            (currentUser.uid && (r as any).userId === currentUser.uid)
          );
        } catch (e) {
          loadedRequests = [];
        }
      }

      setRequests(loadedRequests || []);
    } catch (e: any) {
      setError(e.message || 'Network error fetching requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();

    // Setup real-time listener if user is authenticated with Firestore
    if (currentUser.uid) {
      try {
        const unsubscribe = subscribeToUserRequests(currentUser.uid, (firestoreRequests) => {
          if (firestoreRequests && firestoreRequests.length > 0) {
            setRequests(firestoreRequests);
            setIsLoading(false);
          }
        });
        return () => {
          unsubscribe();
        };
      } catch (subErr) {
        console.warn('Notice: Realtime Firestore subscription:', subErr);
      }
    }
  }, [currentUser]);

  const handleQuoteDecision = async (requestId: string, action: 'accept' | 'decline') => {
    setActionLoadingId(requestId);
    try {
      const result = await safeFetchJson<{ error?: string }>(`/api/requests/${requestId}/quote-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, customerEmail: currentUser.email })
      });

      if (result.ok) {
        await fetchUserRequests();
      } else {
        alert(result.data?.error || result.error || 'Failed to submit quote decision.');
      }
    } catch (e: any) {
      alert(e.message || 'Network error.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-white transition-colors mb-2 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio</span>
          </button>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Film className="w-7 h-7 text-indigo-400" />
            <span>My AI Video Requests</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tracking videos requested for <strong className="text-slate-200">{currentUser.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUserRequests}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh requests"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={onRequestNewVideo}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            + Create New Video Request
          </button>
        </div>
      </div>

      {/* Trial Status Summary Card */}
      <div className="p-5 rounded-2xl bg-[#0B101D] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              currentUser.trialStatus === 'eligible'
                ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-400'
                : 'bg-indigo-950/80 border border-indigo-700/60 text-indigo-400'
            }`}
          >
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Free Trial Status</h3>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  currentUser.trialStatus === 'eligible'
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {currentUser.trialStatus === 'eligible' ? '1 Free Request Available' : 'Trial Used'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.trialStatus === 'eligible'
                ? 'You are eligible to submit your first custom AI video for free!'
                : 'Your one-time free trial has been used. Subsequent requests follow our video-based quote workflow.'}
            </p>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && requests.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading your video requests...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && requests.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl p-8 space-y-5 bg-[#0B101D]/40">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center mx-auto text-indigo-400">
            <Film className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No Video Requests Yet</h3>
            <p className="text-xs text-slate-400">
              You haven't requested any custom AI videos yet. Describe your story idea, characters, and scenes to get started!
            </p>
          </div>
          <button
            onClick={onRequestNewVideo}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg cursor-pointer"
          >
            Create My First Video Request
          </button>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((req) => {
          const isExpanded = expandedId === req.id;
          const isTrial = req.requestType === 'free_trial';

          return (
            <div
              key={req.id}
              className="rounded-2xl bg-[#0B101D] border border-slate-800/90 overflow-hidden transition-all shadow-lg hover:border-slate-700/80"
            >
              {/* Card Header Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : req.id)}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                      {req.id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isTrial
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                          : 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                      }`}
                    >
                      {isTrial ? <Gift className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                      <span>{isTrial ? 'Free Trial' : 'Paid Request'}</span>
                    </span>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                        req.status === 'Completed' || req.status === 'Delivered'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                          : req.status === 'In Production'
                          ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/60'
                          : req.status === 'Approved'
                          ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{req.title}</h3>

                  <p className="text-xs text-slate-400">
                    Style: <strong className="text-slate-300">{req.style}</strong> · {req.format.toUpperCase()} ({req.aspectRatio}) · Duration: {req.duration} · Submitted: {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Right Quick Status / Action */}
                <div className="flex items-center gap-4 self-end md:self-center">
                  {req.quote && req.quote.status === 'sent' && (
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold animate-pulse">
                      Quote Received: {req.quote.formattedAmount}
                    </span>
                  )}

                  {req.completedVideo?.directLink && (
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      Video Ready
                    </span>
                  )}

                  <div className="text-slate-400 hover:text-white p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Card Details */}
              {isExpanded && (
                <div className="border-t border-slate-800 p-6 space-y-6 bg-[#080C16]">
                  {/* Custom Quote Review Area */}
                  {req.quote && req.quote.status === 'sent' && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-indigo-950/30 to-purple-950/40 border border-amber-600/50 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                            Studio Custom Quote Proposal
                          </span>
                          <h4 className="text-xl font-black text-white mt-0.5">
                            Production Price: {req.quote.formattedAmount}
                          </h4>
                        </div>
                        {req.quote.validUntil && (
                          <span className="text-xs text-slate-400">
                            Valid until: {new Date(req.quote.validUntil).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {req.quote.breakdown && (
                        <p className="text-xs text-slate-300 bg-[#0B101D] p-3 rounded-xl border border-slate-800">
                          {req.quote.breakdown}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleQuoteDecision(req.id, 'accept')}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md cursor-pointer transition-colors"
                        >
                          {actionLoadingId === req.id ? 'Processing...' : 'Accept Quote & Proceed'}
                        </button>

                        <button
                          type="button"
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleQuoteDecision(req.id, 'decline')}
                          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
                        >
                          Decline Quote
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Completed Video Player & Download */}
                  {req.completedVideo?.directLink && (
                    <div className="p-5 rounded-2xl bg-[#063C28]/40 border border-emerald-600/50 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span>Your Completed Video is Ready for Download</span>
                      </div>
                      {req.completedVideo.message && (
                        <p className="text-xs text-slate-200">{req.completedVideo.message}</p>
                      )}
                      <div>
                        <a
                          href={req.completedVideo.directLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download / Stream Video</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Story & Characters Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#0B101D] border border-slate-800 space-y-2">
                      <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                        Story & Concept
                      </span>
                      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {req.storyDescription || 'No narrative description provided.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0B101D] border border-slate-800 space-y-2">
                      <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                        Characters ({req.characters.length})
                      </span>
                      {req.characters.length > 0 ? (
                        <div className="space-y-2">
                          {req.characters.map((c) => (
                            <div key={c.id} className="p-2 rounded bg-slate-900 border border-slate-800">
                              <strong className="text-white">{c.name}</strong> ({c.role})
                              <p className="text-slate-400 text-[11px] mt-0.5">{c.appearance}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500">No individual character sheets.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
