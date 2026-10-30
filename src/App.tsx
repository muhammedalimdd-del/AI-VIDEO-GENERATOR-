/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { HowItWorksSection } from './components/HowItWorksSection.tsx';
import { StylesGallerySection } from './components/StylesGallerySection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { RequestBuilder } from './components/RequestBuilder/RequestBuilder.tsx';
import { SuccessScreen } from './components/SuccessScreen.tsx';
import { CustomerTracker } from './components/CustomerTracker.tsx';
import { AdminDashboard } from './components/Admin/AdminDashboard.tsx';
import { BudgetContactForm } from './components/BudgetContactForm/BudgetContactForm.tsx';
import { WelcomeScreen } from './components/Auth/WelcomeScreen.tsx';
import { LoadingScreen } from './components/LoadingScreen.tsx';
import { MyRequestsView } from './components/Customer/MyRequestsView.tsx';
import { PrivacyModal, TermsModal, DataDeletionModal, ContactModal } from './components/Modals/LegalModals.tsx';
import { initAuthListener, signOutGoogle, signInWithGoogle } from './services/firebaseAuth.ts';
import { UserAccount } from './types/client.ts';

type MainView = 'landing' | 'builder' | 'success' | 'tracker' | 'budget_contact' | 'my_requests';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(false);
  const [pendingActionAfterAuth, setPendingActionAfterAuth] = useState<'builder' | null>(null);

  const [currentView, setCurrentView] = useState<MainView>('landing');
  const [selectedStyle, setSelectedStyle] = useState<string>('Realistic cinematic');
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  // Tracker state
  const [trackParams, setTrackParams] = useState<{ id?: string; token?: string }>({});

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Setup Firebase Auth listener with guaranteed safety timeout
  useEffect(() => {
    // Guaranteed safety timeout: Never keep users stuck on loading screen longer than 800ms
    const safetyTimer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 800);

    const unsubscribe = initAuthListener((_firebaseUser, profile) => {
      setCurrentUser(profile);
      setIsAuthLoading(false);
      clearTimeout(safetyTimer);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  // Check URL query parameters on load (e.g. ?id=VR-2026-8941&token=sec_... or ?admin=true or ?budget=true)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      const token = urlParams.get('token');
      const admin = urlParams.get('admin');
      const budget = urlParams.get('budget');
      const myReq = urlParams.get('my-requests');

      if (admin === 'true' || window.location.pathname === '/admin') {
        setIsAdminOpen(true);
      }

      if (budget === 'true') {
        setCurrentView('budget_contact');
        setShowWelcomeScreen(false);
      }

      if (myReq === 'true') {
        setCurrentView('my_requests');
        setShowWelcomeScreen(false);
      }

      if (id) {
        setTrackParams({ id, token: token || '' });
        setCurrentView('tracker');
        setShowWelcomeScreen(false);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleNavigate = (sectionId: string) => {
    setShowWelcomeScreen(false);
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartRequest = (styleName?: string) => {
    if (styleName) {
      setSelectedStyle(styleName);
    }
    // If not signed in, prompt Google sign-in
    if (!currentUser) {
      setPendingActionAfterAuth('builder');
      setShowWelcomeScreen(true);
      return;
    }
    setShowWelcomeScreen(false);
    setCurrentView('builder');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleOpenBudgetContact = () => {
    setShowWelcomeScreen(false);
    setCurrentView('budget_contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTracker = (id?: string, token?: string) => {
    setShowWelcomeScreen(false);
    if (id) {
      setTrackParams({ id, token: token || '' });
    }
    setCurrentView('tracker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMyRequests = () => {
    if (!currentUser) {
      setPendingActionAfterAuth(null);
      setShowWelcomeScreen(true);
      return;
    }
    setShowWelcomeScreen(false);
    setCurrentView('my_requests');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await signOutGoogle();
    setCurrentUser(null);
    setCurrentView('landing');
    setShowWelcomeScreen(false);
  };

  const handleGoogleSuccess = (userProfile: UserAccount) => {
    setCurrentUser(userProfile);
    setShowWelcomeScreen(false);
    if (pendingActionAfterAuth === 'builder') {
      setPendingActionAfterAuth(null);
      setCurrentView('builder');
    } else {
      setCurrentView('landing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExplorePreview = () => {
    sessionStorage.setItem('aivm_preview_mode', 'true');
    setShowWelcomeScreen(false);
    if (pendingActionAfterAuth === 'builder') {
      setPendingActionAfterAuth(null);
      setCurrentView('builder');
    } else {
      setCurrentView('landing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestSubmitted = (created: any) => {
    setSubmittedRequest(created);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render dedicated temporary loading screen while app initializes
  if (isAuthLoading) {
    return <LoadingScreen onTimeout={() => setIsAuthLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-indigo-600/30 selection:text-white">
      {/* Global Navbar */}
      <Navbar
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onRequestClick={() => handleStartRequest()}
        onTrackClick={() => handleOpenTracker()}
        onMyRequestsClick={handleOpenMyRequests}
        onAdminClick={() => setIsAdminOpen(true)}
        onContactClick={() => setIsContactOpen(true)}
        onBudgetContactClick={handleOpenBudgetContact}
        onSignInClick={() => setShowWelcomeScreen(true)}
        onSignOutClick={handleSignOut}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <>
            <HeroSection
              onRequestClick={() => handleStartRequest()}
              onExploreStylesClick={() => handleNavigate('video-styles')}
            />
            <HowItWorksSection onRequestClick={() => handleStartRequest()} />
            <StylesGallerySection
              onSelectStyle={(styleTitle) => handleStartRequest(styleTitle)}
            />

            {/* Direct Contact & Budget Form Section */}
            <div className="border-t border-slate-800/80">
              <BudgetContactForm />
            </div>

            {/* Embedded direct builder teaser */}
            <div className="py-16 bg-[#070B14] border-t border-slate-800/80 text-center px-4">
              <div className="max-w-2xl mx-auto space-y-4">
                <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
                  Ready to Craft Your Custom AI Video?
                </span>
                <h3 className="text-3xl font-black text-white">
                  Launch the Studio Video Request Builder
                </h3>
                <p className="text-sm text-slate-300">
                  Describe your idea, specify character consistency photos, and choose between a 1-time free trial or video-based payment.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleStartRequest()}
                    className="px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Create My AI Video Request &rarr;
                  </button>
                </div>
              </div>
            </div>

            <FaqSection />
          </>
        )}

        {currentView === 'budget_contact' && (
          <div className="py-8 bg-[#050811]">
            <BudgetContactForm onBackToHome={() => setCurrentView('landing')} />
          </div>
        )}

        {currentView === 'my_requests' && currentUser && (
          <div className="py-8 bg-[#050811]">
            <MyRequestsView
              currentUser={currentUser}
              onBackToHome={() => setCurrentView('landing')}
              onRequestNewVideo={() => handleStartRequest()}
            />
          </div>
        )}

        {currentView === 'builder' && (
          <div className="py-8 bg-[#050811]">
            <RequestBuilder
              initialStyle={selectedStyle}
              onSuccess={handleRequestSubmitted}
              onOpenPrivacy={() => setIsPrivacyOpen(true)}
              onOpenTerms={() => setIsTermsOpen(true)}
              currentUser={currentUser}
            />
          </div>
        )}

        {currentView === 'success' && submittedRequest && (
          <SuccessScreen
            request={submittedRequest}
            onTrack={(id, token) => handleOpenTracker(id, token)}
            onHome={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNewRequest={() => {
              setCurrentView('builder');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'tracker' && (
          <CustomerTracker
            initialRequestId={trackParams.id}
            initialToken={trackParams.token}
            onBack={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onRequestClick={() => handleStartRequest()}
        onTrackClick={() => handleOpenTracker()}
        onMyRequestsClick={handleOpenMyRequests}
        onPrivacyClick={() => setIsPrivacyOpen(true)}
        onTermsClick={() => setIsTermsOpen(true)}
        onDeleteRequestClick={() => setIsDeleteOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onContactClick={() => setIsContactOpen(true)}
        onBudgetContactClick={handleOpenBudgetContact}
      />

      {/* Private Admin Dashboard Modal */}
      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}

      {/* Trust & Legal Modals */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <DataDeletionModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {/* Google Authentication Modal */}
      {showWelcomeScreen && !currentUser && (
        <WelcomeScreen
          onSuccess={handleGoogleSuccess}
          onExplorePreview={handleExplorePreview}
          onClose={() => {
            setShowWelcomeScreen(false);
            setPendingActionAfterAuth(null);
          }}
        />
      )}
    </div>
  );
}
