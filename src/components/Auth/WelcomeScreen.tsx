import React, { useState } from 'react';
import { AiVideoCameraLogo } from '../Brand/AiVideoCameraLogo.tsx';
import {
  registerDeviceAccount,
  loginDeviceAccount
} from '../../services/deviceIdentity.ts';
import {
  Sparkles,
  ShieldCheck,
  Film,
  Gift,
  AlertCircle,
  Lock,
  User,
  UserPlus,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface WelcomeScreenProps {
  onSuccess: (user: any) => void;
}

type AuthMode = 'welcome' | 'register' | 'login';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuccess }) => {
  // Auth flow states
  const [authMode, setAuthMode] = useState<AuthMode>('welcome');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Open Returning User Sign In Screen
  const handleUserSignInClick = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setUsername('');
    setPassword('');
    setAuthMode('login');
  };

  // Open Create New Account Screen
  const handleCreateNewAccountClick = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setFullName('');
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setAuthMode('register');
  };

  // Handle New User Registration
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUser = username.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid Email Address.');
      return;
    }
    if (!trimmedUser) {
      setErrorMessage('Please choose your own username.');
      return;
    }
    if (trimmedUser.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUser)) {
      setErrorMessage('Username may only contain letters, numbers, underscores, dots, and hyphens.');
      return;
    }
    if (!password) {
      setErrorMessage('Please create your own password.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and try again.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerDeviceAccount({
        fullName: trimmedName,
        email: trimmedEmail,
        contactEmail: trimmedEmail,
        username: trimmedUser,
        password,
        confirmPassword
      });

      setSuccessMessage('Account created successfully! Entering your studio...');

      setTimeout(() => {
        onSuccess(result.user);
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Returning User Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setErrorMessage('Invalid username or password. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginDeviceAccount({
        username: trimmedUser,
        password
      });

      setSuccessMessage('Login successful! Redirecting to your account...');
      setTimeout(() => {
        onSuccess(result.user);
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid username or password. Please try again.');
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
              <span>Next-Generation AI Video Creation Studio</span>
            </div>

            {/* Exact Required Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                ZENVORA
              </span>
            </h1>

            {/* Exact Required Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Imagine Beyond Reality. Create amazing AI videos with your own imagination.
            </p>
          </div>

          {/* Mini Gallery Showcase Preview Grid */}
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
                <p className="text-[10px] text-slate-400 mt-0.5">Free sample video request for new registered accounts</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090D18]/90 border border-slate-800/80 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Private Accounts</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Every creator gets their own private username & dashboard</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090D18]/90 border border-slate-800/80 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-700/60 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Salted Passwords</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Encrypted with secure cryptographic hashing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#090E1B]/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40 relative overflow-hidden">
            {/* Top accent light */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* SECTION 1: WELCOME SCREEN (INITIAL STATE WITH BOTH OPTIONS) */}
              {authMode === 'welcome' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-800/60 text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      <span>Personal Studio Account</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Welcome to ZENVORA
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      Sign in with your existing account or create a new personal account with your own username and password.
                    </p>
                  </div>

                  {/* Free Trial Highlight Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-indigo-950/50 to-slate-900 border border-emerald-700/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>One-Time Free Trial System</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Every new account is eligible for 1 free trial video request. Create your own private account or sign in below.
                    </p>
                  </div>

                  {/* Two Prominent Options: "User Sign In" and "Create New Account" */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleUserSignInClick}
                      className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <User className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
                      <span>User Sign In</span>
                      <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={handleCreateNewAccountClick}
                      className="w-full py-4 px-5 rounded-2xl bg-slate-900/95 hover:bg-slate-800 border-2 border-emerald-500/60 hover:border-emerald-400 text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <UserPlus className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Create New Account</span>
                      <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Private & Isolated Personal Accounts · Unique Usernames</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: CREATE NEW ACCOUNT SCREEN */}
              {authMode === 'register' && (
                <form onSubmit={handleCreateAccount} className="space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('welcome')}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                      Create New Account
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Create New Account
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Enter your details and choose your own unique username and password.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* 1. Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-200">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* 2. Email Address */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-200">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* 3. Choose Your Own Username */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-200">
                      Choose Your Own Username <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a unique username"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* 4. Create Your Own Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-200">
                      Create Your Own Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create your own password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 5. Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-200">
                      Confirm Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password to confirm"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 6. Create Account Button */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-75"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating Your Account...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                          <span>Create Account</span>
                        </>
                      )}
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleUserSignInClick}
                        className="text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        Already have an account? <span className="font-bold text-indigo-300 underline">User Sign In</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* SECTION 3: USER SIGN IN SCREEN */}
              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('welcome')}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> User Sign In
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      User Sign In
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Enter your personal username and password to access your account.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-semibold">{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Field: Username */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">
                      Username <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Field: Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-200">
                      Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-75"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-cyan-200" />
                          <span>Login</span>
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleCreateNewAccountClick}
                        className="text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        New user? <span className="font-bold text-emerald-400 underline">Create New Account</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Security info footer */}
              <div className="pt-4 border-t border-slate-800 text-center">
                <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Personal Accounts
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Scrypt Encrypted
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
