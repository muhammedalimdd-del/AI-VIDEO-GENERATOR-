import React, { useState } from 'react';
import { AiVideoCameraLogo } from './Brand/AiVideoCameraLogo.tsx';
import { UserAccount } from '../types/client.ts';
import {
  Sparkles,
  Menu,
  X,
  Clock,
  HelpCircle,
  Mail,
  Gift,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount | null;
  onNavigate: (sectionId: string) => void;
  onRequestClick: () => void;
  onTrackClick: () => void;
  onMyRequestsClick: () => void;
  onProfileClick?: () => void;
  onAdminClick: () => void;
  onContactClick: () => void;
  onBudgetContactClick: () => void;
  onSignInClick: () => void;
  onSignOutClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onNavigate,
  onRequestClick,
  onTrackClick,
  onMyRequestsClick,
  onProfileClick,
  onAdminClick,
  onContactClick,
  onBudgetContactClick,
  onSignInClick,
  onSignOutClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const isTrialEligible = currentUser?.trialStatus === 'eligible';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050811]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('hero')}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-95 cursor-pointer"
        >
          <AiVideoCameraLogo size="md" showText={true} />
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNav('hero')}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('video-styles')}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Video Styles
          </button>
          {currentUser && (
            <button
              onClick={onMyRequestsClick}
              className="flex items-center gap-1.5 text-indigo-300 hover:text-white transition-colors cursor-pointer py-1 font-semibold"
            >
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>My Requests</span>
            </button>
          )}
          <button
            onClick={onBudgetContactClick}
            className="flex items-center gap-1.5 text-cyan-300 hover:text-white transition-colors cursor-pointer py-1 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Contact & Budget</span>
          </button>
          <button
            onClick={() => handleNav('faq')}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            FAQ
          </button>
        </nav>

        {/* Right CTA / Profile */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#0D1322] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-indigo-500/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="text-left hidden xl:block leading-tight max-w-[130px] truncate">
                  <span className="text-xs font-bold text-white block truncate">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {currentUser.email}
                  </span>
                </div>
                {isTrialEligible && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    <Gift className="w-2.5 h-2.5" /> 1 Free
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#090D16] border border-slate-800 shadow-2xl p-2 z-50 text-xs animate-fadeIn">
                  <div className="p-3 border-b border-slate-800 mb-1">
                    <p className="font-bold text-white text-sm truncate">{currentUser.displayName}</p>
                    <p className="text-slate-400 font-mono text-[11px] truncate mt-0.5">{currentUser.email}</p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isTrialEligible
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isTrialEligible ? '🎁 1 Free Trial Available' : '⚡ Standard Account'}
                      </span>
                    </div>
                  </div>

                  {onProfileClick && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onProfileClick();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-left text-slate-200 hover:text-white flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-cyan-400" />
                      <span>My Profile</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onMyRequestsClick();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-left text-slate-200 hover:text-white flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>My Video Requests</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onRequestClick();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-left text-slate-200 hover:text-white flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Create AI Video</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onAdminClick();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-left text-slate-400 hover:text-white flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Studio Admin</span>
                  </button>

                  <div className="pt-1 mt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSignOutClick();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-rose-950/40 text-left text-rose-300 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 flex items-center gap-2 transition-all shadow-md shadow-black/40 cursor-pointer group"
            >
              <UserIcon className="w-4 h-4 text-cyan-400" />
              <span>User Sign In</span>
              <span className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                1 Free
              </span>
            </button>
          )}

          {/* Primary CTA */}
          <button
            onClick={onRequestClick}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Create Your Video</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser && isTrialEligible && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              1 Free
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070B14] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {currentUser ? (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-2">
              <p className="font-bold text-white text-sm">{currentUser.displayName}</p>
              <p className="text-slate-400 text-xs font-mono">{currentUser.email}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-400">
                  {isTrialEligible ? '🎁 1 Free Trial Available' : '⚡ Standard Account'}
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOutClick();
                  }}
                  className="text-xs text-rose-400 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSignInClick();
              }}
              className="w-full py-3 rounded-xl text-xs font-bold text-slate-900 bg-white flex items-center justify-center gap-2"
            >
              <UserIcon className="w-4 h-4 text-indigo-600" />
              <span>User Sign In</span>
            </button>
          )}

          <button
            onClick={() => handleNav('hero')}
            className="w-full text-left py-2 text-sm text-slate-300 font-medium hover:text-white"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="w-full text-left py-2 text-sm text-slate-300 font-medium hover:text-white"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('video-styles')}
            className="w-full text-left py-2 text-sm text-slate-300 font-medium hover:text-white"
          >
            Video Styles
          </button>
          {currentUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onMyRequestsClick();
              }}
              className="w-full text-left py-2 text-sm text-indigo-400 font-semibold hover:text-white"
            >
              My Video Requests
            </button>
          )}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onBudgetContactClick();
            }}
            className="w-full text-left py-2 text-sm text-cyan-300 font-semibold hover:text-white"
          >
            Contact & Video Budget
          </button>
          <button
            onClick={() => handleNav('faq')}
            className="w-full text-left py-2 text-sm text-slate-300 font-medium hover:text-white"
          >
            FAQ
          </button>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestClick();
              }}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Create My AI Video</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
