import React, { useState } from 'react';
import {
  Sparkles, Send, CheckCircle2, AlertCircle, Upload, X, Image as ImageIcon,
  Check, Smartphone, Monitor, Square, Clock, ShieldCheck, ArrowRight, HelpCircle
} from 'lucide-react';

interface BudgetContactFormProps {
  onBackToHome?: () => void;
}

export const BudgetContactForm: React.FC<BudgetContactFormProps> = ({ onBackToHome }) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [videoIdea, setVideoIdea] = useState('');
  const [detailedMessage, setDetailedMessage] = useState('');
  const [preferredVideoType, setPreferredVideoType] = useState('cinematic');
  const [videoFormat, setVideoFormat] = useState<'portrait' | 'landscape' | 'square'>('portrait');
  const [preferredDuration, setPreferredDuration] = useState('30 seconds');
  const [customDuration, setCustomDuration] = useState('');

  // Budget State (FREE is first and selected by default!)
  const [budgetCategory, setBudgetCategory] = useState<'FREE' | 'BASIC' | 'STANDARD' | 'PREMIUM' | 'CUSTOM'>('FREE');
  const [customBudgetAmount, setCustomBudgetAmount] = useState('');

  // Upload State
  const [referencePhotoUrl, setReferencePhotoUrl] = useState('');
  const [referencePhotoName, setReferencePhotoName] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Additional instructions
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const budgetOptions = [
    {
      id: 'FREE' as const,
      title: 'FREE',
      price: '₹0',
      badge: 'Free Review · Selected by Default',
      description: 'Share your idea and request a review.',
      tag: 'No Payment Needed',
      popular: true
    },
    {
      id: 'BASIC' as const,
      title: 'BASIC',
      price: '₹99',
      badge: 'Starter Project',
      description: 'Small video project with short scene composition.',
      tag: 'Budget Friendly'
    },
    {
      id: 'STANDARD' as const,
      title: 'STANDARD',
      price: '₹299',
      badge: 'Most Popular Choice',
      description: 'More detailed video project with multiple actions.',
      tag: 'Enhanced Detailing'
    },
    {
      id: 'PREMIUM' as const,
      title: 'PREMIUM',
      price: '₹499',
      badge: 'Full Production Pipeline',
      description: 'Advanced custom video project with character consistency.',
      tag: 'Studio Grade'
    },
    {
      id: 'CUSTOM' as const,
      title: 'CUSTOM BUDGET',
      price: 'Flexible',
      badge: 'Custom Allocation',
      description: 'Enter your preferred budget amount for tailored requirements.',
      tag: 'Your Choice'
    }
  ];

  const videoTypes = [
    { id: 'realistic', label: 'Realistic' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'cartoon', label: 'Cartoon' },
    { id: 'animation', label: 'Animation' },
    { id: 'travel', label: 'Travel' },
    { id: 'educational', label: 'Educational' },
    { id: 'custom', label: 'Custom' }
  ];

  const durations = ['10 seconds', '30 seconds', '1 minute', '3 minutes', 'custom'];

  const handlePhotoUpload = async (file: File) => {
    setUploadError(null);
    setIsUploadingPhoto(true);

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image exceeds 15MB limit.');
      setIsUploadingPhoto(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setReferencePhotoUrl(data.fileUrl);
      setReferencePhotoName(file.name);
    } catch (e: any) {
      setUploadError(e.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!fullName.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSubmitError('Please enter a valid email address.');
      return;
    }
    if (!videoIdea.trim()) {
      setSubmitError('Please describe your video idea.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        videoIdea: videoIdea.trim(),
        detailedMessage: detailedMessage.trim() || undefined,
        preferredVideoType,
        videoFormat,
        preferredDuration: preferredDuration === 'custom' ? (customDuration || 'Custom') : preferredDuration,
        budgetCategory,
        customBudgetAmount: budgetCategory === 'CUSTOM' ? customBudgetAmount : undefined,
        referencePhotoUrl: referencePhotoUrl || undefined,
        referencePhotoName: referencePhotoName || undefined,
        additionalInstructions: additionalInstructions.trim() || undefined
      };

      const res = await fetch('/api/budget-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit request.');
      }

      setSubmittedData(json.budgetRequest);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (submittedData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-fadeIn">
        <div className="rounded-3xl bg-[#090D16] border border-slate-800 shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Success Check Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-[2px] mx-auto mb-6 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-[#060911] rounded-[14px] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Your Request Has Been Sent Successfully!
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            Thank you for sharing your video idea. We have received your request and will review it. If your project is accepted, we will contact you using the email address you provided.
          </p>

          {/* Request ID & Budget Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Assigned Request ID
              </span>
              <span className="font-mono font-bold text-lg text-indigo-300">
                {submittedData.id}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Selected Budget
              </span>
              <span className="font-bold text-lg text-emerald-400">
                {submittedData.budgetCategory} ({submittedData.budgetAmount})
              </span>
            </div>
          </div>

          {/* Free request specific badge */}
          {submittedData.isFree ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-200 text-left max-w-lg mx-auto mb-8 flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-semibold">Free request submitted — no payment was collected.</strong>
                <span>Selecting FREE allows you to submit a request without paying through this form. Video creation is subject to review, feasibility, and confirmation by the service owner.</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 text-xs text-indigo-200 text-left max-w-lg mx-auto mb-8 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-semibold">Budget Category Registered: {submittedData.budgetAmount}</strong>
                <span>No payment has been charged through this form. The owner will review your creative idea and contact you directly with next steps.</span>
              </div>
            </div>
          )}

          {/* Summary table */}
          <div className="rounded-2xl bg-[#0C1220] border border-slate-800 p-6 text-left mb-8 text-xs space-y-2 max-w-lg mx-auto">
            <div>
              <span className="text-slate-400">Customer:</span>{' '}
              <strong className="text-white">{submittedData.fullName}</strong> ({submittedData.email})
            </div>
            <div>
              <span className="text-slate-400">Preferred Type:</span>{' '}
              <span className="text-white capitalize">{submittedData.preferredVideoType}</span> · Format: <span className="text-white">{submittedData.videoFormat.toUpperCase()}</span> ({submittedData.aspectRatio})
            </div>
            <div>
              <span className="text-slate-400">Duration:</span>{' '}
              <span className="text-white">{submittedData.preferredDuration}</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block mb-1">Your Video Idea:</span>
              <p className="text-slate-300 italic">"{submittedData.videoIdea}"</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmittedData(null);
                setVideoIdea('');
                setDetailedMessage('');
                setReferencePhotoUrl('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Submit Another Video Idea &rarr;
            </button>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Return to Homepage
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="budget-contact" className="py-12 sm:py-20 bg-[#060911]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Direct Gmail Contact & Budget Proposal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Us & Request a Custom AI Video
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Have an idea for an AI video? Submit your concept directly to our studio director with your preferred budget. Every submission is reviewed individually.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-3xl bg-[#090D16] border border-slate-800 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          {/* Ambient Corner Flare */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Contact Information */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                1. Your Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    We'll email our review response and status directly here.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Video Idea & Detailed Message */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                2. Your Video Concept & Message
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Video Idea <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={videoIdea}
                  onChange={e => setVideoIdea(e.target.value)}
                  rows={4}
                  placeholder="Describe your video idea in detail: what happens in the story, who the characters are, visual atmosphere, lighting, action beats, or desired mood..."
                  className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Detailed Message to Owner (Optional)
                </label>
                <textarea
                  value={detailedMessage}
                  onChange={e => setDetailedMessage(e.target.value)}
                  rows={2}
                  placeholder="Any background notes, target deadline, where you plan to publish, or personal context..."
                  className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* 3. Preferred Style, Format & Duration */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                3. Creative Specifications
              </h3>

              {/* Preferred Video Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Preferred Video Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {videoTypes.map(vt => {
                    const isSelected = preferredVideoType === vt.id;
                    return (
                      <button
                        type="button"
                        key={vt.id}
                        onClick={() => setPreferredVideoType(vt.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-[#0C1220] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {vt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Video Format (Orientation) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Video Format & Canvas
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'portrait' as const, label: 'PORTRAIT (9:16)', sub: '1080 × 1920 · Shorts/Reels', icon: Smartphone },
                    { id: 'landscape' as const, label: 'LANDSCAPE (16:9)', sub: '1920 × 1080 · YouTube/Cinema', icon: Monitor },
                    { id: 'square' as const, label: 'SQUARE (1:1)', sub: '1080 × 1080 · Feed Post', icon: Square }
                  ].map(f => {
                    const Icon = f.icon;
                    const isSelected = videoFormat === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => setVideoFormat(f.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-950/70 border-indigo-500 text-white ring-1 ring-indigo-500'
                            : 'bg-[#0C1220] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-white">{f.label}</span>
                          <span className="text-[10px] text-slate-400">{f.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Preferred Video Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  {durations.map(dur => {
                    const isSelected = preferredDuration === dur;
                    return (
                      <button
                        type="button"
                        key={dur}
                        onClick={() => setPreferredDuration(dur)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-[#0C1220] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {dur}
                      </button>
                    );
                  })}
                </div>

                {preferredDuration === 'custom' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={customDuration}
                      onChange={e => setCustomDuration(e.target.value)}
                      placeholder="Specify runtime (e.g. 45 seconds, 2 minutes, 5 minutes)"
                      className="w-full px-3 py-2 bg-[#0C1220] border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4. BUDGET SELECTION (CRITICAL: FREE is first and selected by default!) */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                  4. Budget Category <span className="text-rose-400">*</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  First option is FREE · No payment charged on this form
                </span>
              </div>

              {/* Budget Explanation Notice */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900 border border-emerald-900/40 text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Transparent Budget Guidelines
                </p>
                Choose your preferred budget. Selecting FREE allows you to submit a request without paying through this form. Video creation is subject to review, feasibility, and confirmation by the service owner.
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {budgetOptions.map(opt => {
                  const isSelected = budgetCategory === opt.id;
                  const isFreeOpt = opt.id === 'FREE';

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setBudgetCategory(opt.id)}
                      className={`rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between relative group ${
                        isSelected
                          ? isFreeOpt
                            ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500'
                            : 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/50 ring-2 ring-indigo-500'
                          : 'bg-[#0C1220] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        {/* Top tag & badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isFreeOpt ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {opt.tag}
                          </span>

                          {isSelected && (
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                              isFreeOpt ? 'bg-emerald-600' : 'bg-indigo-600'
                            }`}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Title & Price */}
                        <div className="mb-2">
                          <h4 className="text-base font-extrabold text-white">
                            {opt.title}
                          </h4>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className={`text-2xl font-black font-mono ${isFreeOpt ? 'text-emerald-400' : 'text-white'}`}>
                              {opt.price}
                            </span>
                            {opt.id !== 'CUSTOM' && (
                              <span className="text-[11px] text-slate-400">suggested</span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {opt.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                        <span>{opt.badge}</span>
                        <span className={isSelected ? (isFreeOpt ? 'text-emerald-400' : 'text-indigo-400') : 'text-slate-500'}>
                          {isSelected ? 'Active Selection' : 'Click to Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom budget input if CUSTOM is selected */}
              {budgetCategory === 'CUSTOM' && (
                <div className="p-4 rounded-xl bg-[#0C1220] border border-slate-800 space-y-2 animate-fadeIn">
                  <label className="block text-xs font-semibold text-slate-200">
                    Enter Preferred Budget Amount (in ₹ INR or currency)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="text"
                      value={customBudgetAmount}
                      onChange={e => setCustomBudgetAmount(e.target.value)}
                      placeholder="e.g. 750 or 1500"
                      className="flex-1 px-4 py-2.5 bg-[#090D16] border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. Optional Reference Photo Upload */}
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                5. Reference Photo (Optional)
              </h3>
              <p className="text-xs text-slate-400">
                Have a visual reference, character look, product photo, or storyboard sketch? Upload it here (JPG, PNG, WebP up to 15MB).
              </p>

              {uploadError && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {uploadError}
                </p>
              )}

              {referencePhotoUrl ? (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0C1220] border border-slate-800 max-w-md">
                  <img
                    src={referencePhotoUrl}
                    alt="Uploaded reference"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {referencePhotoName || 'reference-photo.jpg'}
                    </p>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Attached securely
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReferencePhotoUrl('');
                      setReferencePhotoName('');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-[#0C1220] hover:bg-indigo-950/20 cursor-pointer transition-all max-w-md">
                  <ImageIcon className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div className="text-xs text-slate-300 flex-1">
                    {isUploadingPhoto ? (
                      <span className="text-indigo-400 animate-pulse">Uploading reference photo...</span>
                    ) : (
                      <span>Click to upload optional reference image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]);
                    }}
                  />
                </label>
              )}
            </div>

            {/* 6. Additional Instructions */}
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                6. Additional Instructions (Optional)
              </h3>
              <textarea
                value={additionalInstructions}
                onChange={e => setAdditionalInstructions(e.target.value)}
                rows={2}
                placeholder="Any special notes regarding audio, color grading, pacing, or delivery format..."
                className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-800 flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-10 py-4 rounded-xl text-sm font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  isSubmitting
                    ? 'bg-slate-700 opacity-75 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Request & Dispatching Notifications...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-cyan-300" />
                    <span>Send Video Idea & Request Review &rarr;</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center max-w-md">
                Dispatches your concept directly to the studio director. If accepted, you will receive a response at your registered email address.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
