import React, { useState, useEffect } from 'react';
import { RequestFormData, CharacterItem, UserAccount } from '../../types/client.ts';
import { Step1Basic } from './Step1Basic.tsx';
import { Step2Style } from './Step2Style.tsx';
import { Step3Format } from './Step3Format.tsx';
import { Step4Characters } from './Step4Characters.tsx';
import { Step5StoryScenes } from './Step5StoryScenes.tsx';
import { Step6DurationQuality } from './Step6DurationQuality.tsx';
import { Step7CustomerDelivery } from './Step7CustomerDelivery.tsx';
import { Step8ReviewSubmit } from './Step8ReviewSubmit.tsx';
import { ArrowLeft, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { saveVideoRequestToFirestore } from '../../services/firestoreService.ts';

interface RequestBuilderProps {
  initialStyle?: string;
  onSuccess: (createdRequest: any) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  currentUser?: UserAccount | null;
}

const STORAGE_KEY = 'ai_video_maker_draft_v2';

const DEFAULT_FORM_DATA: RequestFormData = {
  requestType: 'free_trial',
  title: '',
  videoType: 'Cinematic Story / Viral Short',
  purpose: 'Entertainment',
  summary: '',
  style: 'Realistic cinematic',
  customStyle: '',
  format: 'portrait',
  aspectRatio: '9:16',
  resolution: '1080 × 1920',
  targetPlatform: 'YouTube Shorts & Instagram Reels',
  characters: [
    {
      id: 'char_default_1',
      name: 'Main Character',
      role: 'Protagonist',
      ageRange: 'Late 20s',
      appearance: '',
      clothing: '',
      hairstyle: '',
      personality: '',
      dialogue: '',
      actions: '',
      sceneAppearances: 'All scenes',
      referencePhotoUrl: '',
      referencePhotoName: ''
    }
  ],
  characterMode: 'both',
  characterConsistencyNote: 'Ensure consistent facial likeness, wardrobe, and hairstyle throughout the sequence.',
  photoConsentConfirmed: true,
  storyDescription: '',
  scenes: [],
  dialogueLines: [],
  additionalInstructions: '',
  language: 'English',
  duration: '30 seconds',
  customDuration: '',
  outputResolution: '1080p Full HD (Recommended)',
  visualFinish: 'Photorealistic Film (Natural Grain & Lighting)',
  cameraMovementPref: 'Smooth Cinematic Gimbal & Pan',
  voiceOverPref: 'Character Dialogue Only (No Narrator)',
  dialoguePref: 'Standard natural speech',
  subtitles: true,
  backgroundMusic: 'Dark Synthwave / Cyberpunk Electronic',
  soundEffects: true,
  endingText: '',
  customerName: '',
  customerEmail: '',
  confirmEmail: '',
  customerPhone: '',
  emailNotifications: true,
  termsAccepted: false
};

export const RequestBuilder: React.FC<RequestBuilderProps> = ({
  initialStyle,
  onSuccess,
  onOpenPrivacy,
  onOpenTerms,
  currentUser
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<RequestFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (initialStyle) parsed.style = initialStyle;
        return { ...DEFAULT_FORM_DATA, ...parsed };
      }
    } catch (e) {
      console.warn('Could not read autosaved draft', e);
    }
    return initialStyle ? { ...DEFAULT_FORM_DATA, style: initialStyle } : DEFAULT_FORM_DATA;
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync authenticated Google user into form data
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        customerEmail: currentUser.email,
        confirmEmail: currentUser.email,
        customerName: prev.customerName || currentUser.displayName || ''
      }));
    }
  }, [currentUser]);

  // Autosave to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      // ignore
    }
  }, [formData]);

  // Update initial style if provided from gallery
  useEffect(() => {
    if (initialStyle && initialStyle !== formData.style) {
      setFormData((prev) => ({ ...prev, style: initialStyle }));
    }
  }, [initialStyle]);

  const updateData = (fields: Partial<RequestFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setValidationError(null);
  };

  const stepsList = [
    { num: 1, title: 'Basics' },
    { num: 2, title: 'Style' },
    { num: 3, title: 'Format' },
    { num: 4, title: 'Characters' },
    { num: 5, title: 'Story' },
    { num: 6, title: 'Length & Audio' },
    { num: 7, title: 'Delivery' },
    { num: 8, title: 'Review & Submit' }
  ];

  const validateStep = (step: number): boolean => {
    setValidationError(null);

    if (step === 1) {
      if (!formData.title.trim()) {
        setValidationError('Please enter a descriptive title for your video request.');
        return false;
      }
      if (!formData.purpose.trim()) {
        setValidationError('Please select the main purpose or destination platform.');
        return false;
      }
    }

    if (step === 4) {
      if (formData.characters.length === 0) {
        setValidationError('Please add at least one character or specify a scene without characters.');
        return false;
      }
      for (const char of formData.characters) {
        if (!char.name.trim()) {
          setValidationError('All characters must have a name.');
          return false;
        }
      }
    }

    if (step === 5) {
      if (!formData.storyDescription.trim() && formData.scenes.length === 0) {
        setValidationError('Please write a story description or add at least one scene breakdown.');
        return false;
      }
    }

    if (step === 7) {
      if (!formData.customerName.trim()) {
        setValidationError('Please enter your full contact name.');
        return false;
      }
      if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
        setValidationError('A valid email address is required for delivery.');
        return false;
      }
      if (!formData.termsAccepted) {
        setValidationError('You must accept the Terms of Service and Privacy Policy to proceed.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 8));
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleResetDraft = () => {
    if (window.confirm('Reset all fields in this video request draft?')) {
      localStorage.removeItem(STORAGE_KEY);
      setFormData({
        ...DEFAULT_FORM_DATA,
        customerEmail: currentUser?.email || '',
        confirmEmail: currentUser?.email || '',
        customerName: currentUser?.displayName || ''
      });
      setCurrentStep(1);
      setValidationError(null);
    }
  };

  // Submit to server with trial vs paid plan
  const handleSubmit = async (planType: 'free_trial' | 'paid') => {
    for (let s = 1; s <= 7; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const submissionPayload = {
      ...formData,
      requestType: planType,
      userId: currentUser?.uid,
      userEmail: currentUser?.email || formData.customerEmail,
      customerEmail: currentUser?.email || formData.customerEmail
    };

    try {
      let result: any = null;
      let usedStaticFallback = false;

      try {
        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionPayload)
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || 'Server rejected request submission.');
          }
        } else {
          usedStaticFallback = true;
        }
      } catch (netErr: any) {
        if (netErr.message && netErr.message.includes('Server rejected')) {
          throw netErr;
        }
        usedStaticFallback = true;
      }

      if (usedStaticFallback || !result?.request) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const reqId = `VR-2026-${randomNum}`;
        const accessToken = `sec_${Math.random().toString(36).substring(2, 12)}`;
        const fallbackRequest = {
          id: reqId,
          accessToken,
          status: 'pending_review',
          requestType: planType,
          createdAt: new Date().toISOString(),
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          title: formData.title,
          style: formData.style,
          aspectRatio: formData.aspectRatio,
          duration: formData.duration,
          language: formData.language,
          storyPrompt: formData.storyDescription,
          scenes: formData.scenes,
          characters: formData.characters,
          specialInstructions: formData.additionalInstructions,
          pricing: {
            type: planType,
            currency: '₹',
            estimatedAmount: planType === 'free_trial' ? 0 : 499,
            paymentStatus: planType === 'free_trial' ? 'free_trial' : 'quote_pending'
          }
        };

        try {
          const existing = JSON.parse(localStorage.getItem('studio_local_requests') || '[]');
          existing.unshift(fallbackRequest);
          localStorage.setItem('studio_local_requests', JSON.stringify(existing));
        } catch (e) {
          // ignore
        }

        result = { request: fallbackRequest };
      }

      // Persist to Firebase Firestore database
      try {
        await saveVideoRequestToFirestore(result.request);
      } catch (fsErr) {
        console.warn('Notice: Background Firestore video request save:', fsErr);
      }

      localStorage.removeItem(STORAGE_KEY);
      onSuccess(result.request);
    } catch (e: any) {
      setSubmitError(e.message || 'An error occurred while submitting your video request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="request-builder" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-3xl bg-[#090D16] border border-slate-800 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Ambient background highlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Builder Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                Creative Brief Builder
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-medium">
                Step {currentStep} of 8
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Craft Your AI Video Request
            </h2>
          </div>

          <button
            type="button"
            onClick={handleResetDraft}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors self-start sm:self-auto py-1 px-2.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
            title="Reset form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-10">
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {stepsList.map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (isCompleted || step.num < currentStep) {
                      setCurrentStep(step.num);
                    }
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm shadow-indigo-500/50'
                      : isCompleted
                      ? 'bg-indigo-700/80'
                      : 'bg-slate-800'
                  }`}
                  title={`Step ${step.num}: ${step.title}`}
                />
              );
            })}
          </div>

          <div className="hidden sm:flex justify-between text-[11px] font-medium text-slate-400 px-1">
            {stepsList.map((step) => (
              <span
                key={step.num}
                className={currentStep === step.num ? 'text-indigo-300 font-bold' : ''}
              >
                {step.num}. {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[420px]">
          {currentStep === 1 && <Step1Basic data={formData} updateData={updateData} />}
          {currentStep === 2 && <Step2Style data={formData} updateData={updateData} />}
          {currentStep === 3 && <Step3Format data={formData} updateData={updateData} />}
          {currentStep === 4 && <Step4Characters data={formData} updateData={updateData} />}
          {currentStep === 5 && <Step5StoryScenes data={formData} updateData={updateData} />}
          {currentStep === 6 && <Step6DurationQuality data={formData} updateData={updateData} />}
          {currentStep === 7 && (
            <Step7CustomerDelivery
              data={formData}
              updateData={updateData}
              onOpenPrivacy={onOpenPrivacy}
              onOpenTerms={onOpenTerms}
              currentUser={currentUser}
            />
          )}
          {currentStep === 8 && (
            <Step8ReviewSubmit
              data={formData}
              goToStep={setCurrentStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
              currentUser={currentUser}
            />
          )}
        </div>

        {/* Bottom Navigation Controls (Steps 1 to 7) */}
        {currentStep < 8 && (
          <div className="mt-10 pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handleBack}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                currentStep === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
