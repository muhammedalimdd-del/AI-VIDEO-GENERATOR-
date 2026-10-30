import React, { useState } from 'react';
import { AiVideoCameraLogo } from '../Brand/AiVideoCameraLogo.tsx';
import { signInWithGoogle } from '../../services/firebaseAuth.ts';
import { Sparkles, ShieldCheck, Film, Gift, CheckCircle, ArrowRight, AlertCircle, Play, X } from 'lucide-react';

interface WelcomeScreenProps {
  onSuccess: (user: any) => void;
  onExplorePreview?: () => void;
  onClose?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuccess, onExplorePreview, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithGoogle();
      if (result && result.profile) {
        onSuccess(result.profile);
      }
    } catch (err: any) {
      console.error('Google sign-in failed:', err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. Please click "Continue with Google" to complete authentication.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage('This domain is not yet authorized in Firebase Console. Add your GitHub Pages domain (' + window.location.hostname + ') to Firebase Console > Authentication > Settings > Authorized domains. You can also explore the studio in demo mode below!');
      } else {
        setErrorMessage(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-900/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left / Top: Cinematic Brand & Value Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <AiVideoCameraLogo size="lg" />
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/60 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Human-Curated AI Video Making Service</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Turn Your Imagination Into an{' '}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                AI Video
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Describe your dream video, choose custom characters, upload photo references, and specify your scene narrative. Our team uses state-of-the-art AI creation tools to bring your story to life.
            </p>
          </div>

          {/* Value Prop Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-xl mx-auto lg:mx-0 text-left">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0B101D] border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">1-Time Free Trial</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Eligible first-time Google accounts can test our studio completely free.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0B101D] border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center shrink-0">
                <Film className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Payment Based on Video</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Custom quotes based on complexity. No blind upfront charges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0B101D] border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Real Google Auth</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Secure sign-in. Your finished video is delivered to your verified Gmail.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0B101D] border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">10+ Cinematic Styles</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Realistic, Anime, Superhero, Adventure, Malayalam, Hindi & more.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Google Sign-in Card (5 cols) */}
        <div className="lg:col-span-5 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-lg"
              title="Close and return to homepage"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="bg-[#0B101D]/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 relative">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-400">
                  Welcome to the Studio
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Sign in with Google
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your verified Google account to submit your AI video request and check your free trial eligibility.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Free Trial Highlight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-700/40 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>New Customer Free Trial</span>
                </div>
                <p className="text-[12px] text-slate-300">
                  First-time eligible users receive <strong className="text-white">1 Free Trial Request</strong> upon sign-in. No credit card required.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>{isLoading ? 'Verifying with Google...' : 'Continue with Google'}</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  By continuing, you agree to our Terms of Service & Privacy Policy. We never ask for your Google password.
                </p>
              </div>

              {/* Optional Preview Link */}
              {onExplorePreview && (
                <div className="pt-4 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={onExplorePreview}
                    className="text-xs text-indigo-400 hover:text-white transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Preview video styles & platform features</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
