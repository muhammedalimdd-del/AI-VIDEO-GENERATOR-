import React, { useState } from 'react';
import { RequestFormData, UserAccount } from '../../types/client.ts';
import {
  CheckCircle,
  Edit3,
  Film,
  Palette,
  Monitor,
  Users,
  Clapperboard,
  Clock,
  Mail,
  AlertTriangle,
  Gift,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';

interface Step8Props {
  data: RequestFormData;
  updateData?: (fields: Partial<RequestFormData>) => void;
  goToStep: (stepNumber: number) => void;
  onSubmit: (requestType: 'free_trial' | 'paid') => void;
  isSubmitting: boolean;
  submitError: string | null;
  currentUser?: UserAccount | null;
}

export const Step8ReviewSubmit: React.FC<Step8Props> = ({
  data,
  updateData,
  goToStep,
  onSubmit,
  isSubmitting,
  submitError,
  currentUser
}) => {
  const isEligibleForTrial = currentUser?.trialStatus === 'eligible';
  const [selectedPlan, setSelectedPlan] = useState<'free_trial' | 'paid'>(
    isEligibleForTrial ? 'free_trial' : 'paid'
  );

  const handleFinalSubmit = () => {
    onSubmit(selectedPlan);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>Step 8: Review & Submit Video Request</span>
        </h3>
        <p className="text-sm text-slate-400">
          Review your creative brief, confirm your delivery email address, and choose your submission option.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Review Summary Cards */}
      <div className="space-y-4">
        {/* Project Overview */}
        <div className="rounded-xl bg-[#0C1220] border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              1. Project Overview & Style
            </span>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Title:</span>{' '}
              <span className="text-white font-semibold">{data.title || '(Untitled)'}</span>
            </div>
            <div>
              <span className="text-slate-400">Video Type:</span>{' '}
              <span className="text-white">{data.videoType}</span>
            </div>
            <div>
              <span className="text-slate-400">Visual Style:</span>{' '}
              <span className="text-white font-semibold">{data.style}</span>
            </div>
            <div>
              <span className="text-slate-400">Language:</span>{' '}
              <span className="text-cyan-300 font-semibold">{data.language || 'English'}</span>
            </div>
            {data.summary && (
              <div className="sm:col-span-2">
                <span className="text-slate-400">Concept Summary:</span>{' '}
                <p className="text-slate-300 mt-1">{data.summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Format, Orientation & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#0C1220] border border-slate-800 p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                2. Orientation & Output
              </span>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="text-xs space-y-1.5 text-slate-300">
              <p>Orientation: <strong className="text-white uppercase">{data.format}</strong> ({data.aspectRatio})</p>
              <p>Resolution: <span className="text-white">{data.outputResolution}</span></p>
              <p>Platform: <span className="text-white">{data.targetPlatform}</span></p>
            </div>
          </div>

          <div className="rounded-xl bg-[#0C1220] border border-slate-800 p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                3. Duration & Audio
              </span>
              <button
                type="button"
                onClick={() => goToStep(6)}
                className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="text-xs space-y-1.5 text-slate-300">
              <p>Runtime: <strong className="text-white">{data.duration === 'custom' ? data.customDuration : data.duration}</strong></p>
              <p>Voiceover: <span className="text-white">{data.voiceOverPref}</span></p>
              <p>Music: <span className="text-white">{data.backgroundMusic}</span></p>
              <p>Subtitles: <span className="text-white">{data.subtitles ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>

        {/* Characters & Story */}
        <div className="rounded-xl bg-[#0C1220] border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              4. Characters & Story Vision
            </span>
            <button
              type="button"
              onClick={() => goToStep(4)}
              className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Characters ({data.characters.length}):</span>{' '}
              <span className="text-white font-medium">
                {data.characters.map((c) => c.name).join(', ') || 'None specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Story Narrative:</span>
              <p className="text-slate-300 mt-1 whitespace-pre-wrap line-clamp-3">
                {data.storyDescription || 'No narrative provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Contact Information (Editable directly before submitting) */}
        <div className="rounded-xl bg-[#0C1220] border border-indigo-500/40 p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              5. Customer Contact & Delivery Channel
            </span>
            <button
              type="button"
              onClick={() => goToStep(7)}
              className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Step 7 Details
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Customer Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={data.customerName}
                onChange={(e) => updateData?.({ customerName: e.target.value })}
                placeholder="Your contact name"
                className="w-full px-3.5 py-2.5 bg-[#080D1A] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address for Video Delivery <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={data.customerEmail}
                onChange={(e) => updateData?.({ customerEmail: e.target.value, confirmEmail: e.target.value })}
                placeholder="Enter your email address"
                className="w-full px-3.5 py-2.5 bg-[#080D1A] border border-slate-700 rounded-xl text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            Your completed video download link will be sent to <strong className="text-indigo-300 font-mono">{data.customerEmail || 'your delivery email address'}</strong>.
          </p>
        </div>
      </div>

      {/* ---------------- SECTION 5 & 6: ONE-TIME FREE TRIAL & PAYMENT CHOICE ---------------- */}
      <div className="pt-6 border-t border-slate-800">
        <div className="mb-4 text-center sm:text-left">
          <h4 className="text-lg font-black text-white">Select Your Submission Option</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose how you would like our production team to review and fulfill your video request.
          </p>
        </div>

        {/* IF USER IS ELIGIBLE FOR ONE-TIME FREE TRIAL: SHOW BOTH OPTIONS */}
        {isEligibleForTrial ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* OPTION 1: FREE TRIAL */}
            <div
              onClick={() => setSelectedPlan('free_trial')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                selectedPlan === 'free_trial'
                  ? 'bg-gradient-to-b from-emerald-950/60 to-[#0B101D] border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/30'
                  : 'bg-[#0B101D] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-900/80 text-emerald-300 border border-emerald-700/60">
                  🎁 One-Time Offer
                </span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'free_trial'
                      ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                      : 'border-slate-700'
                  }`}
                >
                  {selectedPlan === 'free_trial' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                </div>
              </div>

              <h5 className="text-base font-black text-white">
                Try Your First AI Video Request for Free
              </h5>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Submit your first eligible AI video request using your one-time free trial.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400/90 font-medium space-y-1">
                <p>✓ Exactly 1 free video request per registered account</p>
                <p>✓ Human-curated AI video generation</p>
                <p>✓ Delivered directly to your chosen email address</p>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan('free_trial');
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    selectedPlan === 'free_trial'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Use My Free Trial
                </button>
              </div>
            </div>

            {/* OPTION 2: PAID VIDEO REQUEST */}
            <div
              onClick={() => setSelectedPlan('paid')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                selectedPlan === 'paid'
                  ? 'bg-gradient-to-b from-indigo-950/60 to-[#0B101D] border-indigo-500 shadow-xl shadow-indigo-950/50 ring-2 ring-indigo-500/30'
                  : 'bg-[#0B101D] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-900/80 text-indigo-300 border border-indigo-700/60">
                  ⚡ Custom Production
                </span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'paid'
                      ? 'border-indigo-400 bg-indigo-500 text-slate-950'
                      : 'border-slate-700'
                  }`}
                >
                  {selectedPlan === 'paid' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                </div>
              </div>

              <h5 className="text-base font-black text-white">Paid Video Request</h5>

              <p className="text-xs text-slate-300 mt-2 font-semibold text-indigo-300">
                The payment will be based on the video.
              </p>

              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Your video request will be reviewed first. The cost will depend on the video's complexity, duration, characters, scenes, and production requirements. We will contact you with the proposed price before proceeding with paid production.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan('paid');
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    selectedPlan === 'paid'
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Continue with Paid Request
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* IF USER HAS ALREADY CONSUMED THEIR FREE TRIAL: SHOW ONLY PAID OPTION */
          <div className="mb-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-[#0B101D] border border-indigo-500/80 shadow-xl shadow-indigo-950/40">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-900/80 text-indigo-300 border border-indigo-700/60">
                  Custom Video Request
                </span>
              </div>

              <h5 className="text-lg font-black text-white">Submit Your Video Request</h5>

              <p className="text-sm font-bold text-indigo-300 mt-1">
                The payment will be based on the video.
              </p>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-2xl">
                Your video request will be reviewed first. The cost will depend on the video's complexity, duration, characters, scenes, and production requirements. We will contact you with the proposed price before proceeding with paid production.
              </p>
            </div>
          </div>
        )}

        {/* Final Submission Button */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinalSubmit}
            className={`w-full sm:w-auto px-12 py-4 rounded-xl text-base font-extrabold text-white shadow-2xl transition-all flex items-center justify-center gap-3 cursor-pointer ${
              isSubmitting
                ? 'bg-slate-700 cursor-not-allowed opacity-75'
                : selectedPlan === 'free_trial'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Request & Sending to Studio...</span>
              </>
            ) : selectedPlan === 'free_trial' ? (
              <>
                <Gift className="w-5 h-5 text-emerald-200" />
                <span>SUBMIT FREE TRIAL VIDEO REQUEST</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-cyan-300" />
                <span>SUBMIT PAID VIDEO REQUEST</span>
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 text-center max-w-lg">
            {selectedPlan === 'free_trial'
              ? 'Your one-time free trial will be reserved upon submission. The studio director reviews each request individually.'
              : 'The payment will be based on the video. No payment is charged now. You will receive a proposed quote before paid production begins.'}
          </p>
        </div>
      </div>
    </div>
  );
};
