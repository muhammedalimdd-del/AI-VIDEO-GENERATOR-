import React, { useState } from 'react';
import { AiVideoCameraLogo } from '../Brand/AiVideoCameraLogo.tsx';
import { signInWithGoogle } from '../../services/firebaseAuth.ts';
import { Sparkles, ShieldCheck, Film, Gift, AlertCircle, Play, CheckCircle2, Lock } from 'lucide-react';

interface WelcomeScreenProps {
  onSuccess: (user: any) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuccess }) => {
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
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. Please click "Continue with Google" to complete authentication.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(
          `Domain (${window.location.hostname}) is not yet authorized in Firebase Console. Add it to Firebase Console > Authentication > Settings > Authorized domains.`
        );
      } else {
        setErrorMessage(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const previewShowcases = [
    {
      title: 'Cinematic Videos',
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
      badge: '4K Blockbuster'
    },
    {
      title: 'Realistic Videos',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      badge: 'Photorealistic'
    },
    {
      title: 'Superhero & VFX',
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      badge: 'Action VFX'
    },
    {
      title: 'Animated Stories',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      badge: 'Stylized 3D'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden selection:bg-indigo-600/40 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Cinematic Brand Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          {/* Logo with camera symbol */}
          <div className="flex justify-center lg:justify-start">
            <AiVideoCameraLogo size="lg" />
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs font-semibold text-indigo-300 shadow-lg shadow-indigo-950/50">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Next-Generation AI Video Creation Platform</span>
            </div>

            {/* Exact Required Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                AI Video Maker
              </span>
            </h1>

            {/* Exact Required Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Create amazing AI videos with your own imagination.
            </p>
          </div>

          {/* Cinematic Mini Gallery Preview Grid */}
          <div className="pt-2">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center justify-center lg:justify-start gap-1.5">
              <Film className="w-3.5 h-3.5 text-indigo-400" />
              <span>What You Can Create in the Studio</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto lg:mx-0">
              {previewShowcases.map((cat, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl bg-[#090D18] border border-slate-800/80 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-md"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900 relative">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090D18] via-transparent to-transparent" />
                  </div>
                  <div className="p-2 text-left">
                    <p className="text-[11px] font-bold text-white truncate">{cat.title}</p>
                    <span className="text-[9px] text-cyan-300 font-medium">{cat.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Value Prop Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-2xl mx-auto lg:mx-0 text-left">
            <div className="p-3 rounded-xl bg-[#090D18]/90 border border-slate-800/80 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center shrink-0 mt-0.5">
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">1-Time Free Trial</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Test studio with your real Google account</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090D18]/90 border border-slate-800/80 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center shrink-0 mt-0.5">
                <Film className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Based on Video</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Custom quote based on your scene brief</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090D18]/90 border border-slate-800/80 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-700/60 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Email Delivery</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Completed video sent to your Google inbox</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Google Sign-in Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#090E1B]/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-purple-950/40 relative overflow-hidden">
            {/* Top accent light */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Header inside card */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-800/60 text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Secure Studio Access</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Sign In
                </h2>
                {/* Required Notice */}
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Sign in to access your personal AI Video Maker studio.
                </p>
              </div>

              {/* Free Trial Highlight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-indigo-950/50 to-slate-900 border border-emerald-700/40 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>New Customer Free Trial Available</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  First-time eligible Google accounts can request a free sample video. Verified Google delivery protects your project.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Official Google Sign-In Button */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
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
                  {/* Required Exact Label */}
                  <span>{isLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real Google OAuth 2.0 · Verified delivery email</span>
                </div>
              </div>

              {/* Security and privacy assurances */}
              <div className="pt-4 border-t border-slate-800 text-center space-y-2">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  We only request your verified email and profile name to manage video creations and deliver completed files. We never access passwords.
                </p>
                <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Safe & Private
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Instant Setup
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
