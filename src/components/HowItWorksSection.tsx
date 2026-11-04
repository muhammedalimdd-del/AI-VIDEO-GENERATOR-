import React from 'react';
import { UserCheck, Edit3, Send, Gift, Video, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onRequestClick: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ onRequestClick }) => {
  const steps = [
    {
      number: '01',
      title: 'Sign in with Google',
      description: 'Authenticate with your real Google account to verify your delivery address and check your one-time free trial eligibility.',
      icon: UserCheck,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      number: '02',
      title: 'Describe the video you want',
      description: 'Detail your story, specify characters, upload reference photos, select duration, aspect ratio, and preferred language.',
      icon: Edit3,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      number: '03',
      title: 'Submit your request',
      description: 'Review your complete creative brief and confirm delivery details. Your brief is saved securely to our studio production database.',
      icon: Send,
      color: 'from-purple-500 to-pink-600'
    },
    {
      number: '04',
      title: 'Choose trial or paid option',
      description: 'Eligible accounts can claim their one-time free trial. Otherwise, select paid request where the payment is based on the video complexity.',
      icon: Gift,
      color: 'from-pink-500 to-amber-500'
    },
    {
      number: '05',
      title: 'Receive completed video by email',
      description: 'Our team creates and curates your video using advanced AI tools. When ready, a high-definition download link is sent to your Gmail.',
      icon: Video,
      color: 'from-emerald-500 to-cyan-500'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#070B14] border-t border-b border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2">
            Simple 5-Step Process
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How ZENVORA Works
          </h3>
          <p className="mt-4 text-sm sm:text-base text-slate-300">
            From your concept to finished video delivery, follow our transparent human-curated workflow.
          </p>
        </div>

        {/* 5-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-[#0B101D] border border-slate-800/90 p-5 flex flex-col justify-between hover:border-indigo-600/60 transition-all duration-300 group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-700 group-hover:text-indigo-400 transition-colors">
                      {step.number}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${step.color} p-[1px] shadow-md`}
                    >
                      <div className="w-full h-full bg-[#0B101D] rounded-[11px] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
                    {step.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Step {idx + 1} of 5
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={onRequestClick}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Your Video Request Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
