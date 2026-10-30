import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the AI Video Request process work?',
      a: 'You fill out our comprehensive 8-step creative brief, selecting your video style, format (landscape 16:9 or vertical 9:16), characters, reference photos, dialogue, and duration. Once submitted, our production team reviews the brief for feasibility, programs the prompt engineering and character consistency pipeline, renders keyframes and motion, completes post-production quality checks, and delivers the finalized video to your email.'
    },
    {
      q: 'Can I upload reference photos of myself or specific characters?',
      a: 'Yes! Step 4 allows you to upload reference photos for each character. You can choose whether you want our studio to strictly match the reference photos, generate fictional characters inspired by your descriptions, or combine both. To protect privacy and rights, you must confirm that you have permission to upload and use the photos provided.'
    },
    {
      q: 'How long does production take to deliver my video?',
      a: 'Because each video is individually reviewed and rendered through multi-stage generative models with character preservation and sound design, production typically takes between 2 to 4 business days. Complex requests with many characters or scenes may take a little longer. You will receive real-time status updates through your private tracking page.'
    },
    {
      q: 'How will I receive my finished video?',
      a: 'As soon as your video passes quality inspection, we upload it to secure private storage and send you an email with a direct viewing and download link. You can also preview and download the video at any time on the "My Request" tracking page.'
    },
    {
      q: 'Can I request videos in languages other than English?',
      a: 'Absolutely! Our creative builder supports multiple languages including Malayalam, English, Hindi, Arabic, Spanish, Tamil, Urdu, and more. You can specify dialogue lines and phonetics directly in the brief.'
    },
    {
      q: 'Are videos generated automatically or manually reviewed?',
      a: 'Every request is human-reviewed by our studio director before rendering to guarantee artistic direction, character consistency, and sound synchronization. We do not claim instant one-click delivery; quality AI video production requires dedicated attention to detail.'
    },
    {
      q: 'What if the studio needs clarification on my brief?',
      a: 'If a scene description or character requirement is ambiguous, our director will send a clarification note to your email. You can reply directly through your secure "My Request" portal with one click.'
    },
    {
      q: 'What happens to my uploaded photos after production?',
      a: 'Your uploaded photos are stored in secure, private directories accessible only to authorized studio staff. They are never published publicly or shared with third parties. You can submit a data erasure request at any time to purge your assets.'
    }
  ];

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#090D16] border-t border-slate-800/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h3>
          <p className="mt-3 text-sm text-slate-300">
            Everything you need to know about requesting, tracking, and receiving your custom AI video.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-[#0C1220] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-100">
                    {item.q}
                  </span>
                  <span className="text-slate-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
