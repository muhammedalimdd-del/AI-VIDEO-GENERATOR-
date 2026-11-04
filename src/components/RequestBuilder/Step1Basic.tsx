import React from 'react';
import { RequestFormData } from '../../types/client.ts';
import { PURPOSE_OPTIONS } from '../../data/styles.ts';
import { Sparkles, HelpCircle, Film, Target, FileText, Mail } from 'lucide-react';

interface Step1Props {
  data: RequestFormData;
  updateData: (fields: Partial<RequestFormData>) => void;
}

export const Step1Basic: React.FC<Step1Props> = ({ data, updateData }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Film className="w-5 h-5 text-indigo-400" />
          Step 1: Basic Information
        </h3>
        <p className="text-sm text-slate-400">
          Give your project an identity, define its core purpose, and provide your delivery email address.
        </p>
      </div>

      <div className="space-y-6">
        {/* Request Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Request Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={data.title}
            onChange={e => updateData({ title: e.target.value })}
            placeholder="e.g. Neon Cyberpunk Detective Short, Kerala Monsoon Travel Story, Superhero Origin"
            className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
            required
          />
          <p className="text-xs text-slate-500 mt-1.5">
            A clear working title that describes the concept.
          </p>
        </div>

        {/* Email Address for Video Delivery */}
        <div>
          <label htmlFor="step1-delivery-email" className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-indigo-400" />
            <span>Email Address for Video Delivery</span> <span className="text-rose-400">*</span>
          </label>
          <input
            id="step1-delivery-email"
            type="email"
            value={data.customerEmail}
            onChange={e => updateData({ customerEmail: e.target.value, confirmEmail: e.target.value })}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all font-mono"
            required
          />
          <p className="text-xs text-slate-500 mt-1.5">
            We will send your completed AI video and secure download link to this email address. You can also review or edit it before submitting.
          </p>
        </div>

        {/* Video Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            What kind of video do you want?
          </label>
          <input
            type="text"
            value={data.videoType}
            onChange={e => updateData({ videoType: e.target.value })}
            placeholder="e.g. Viral Shorts teaser, Cinematic trailer, Short film sequence"
            className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" />
            Main Purpose of the Video <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PURPOSE_OPTIONS.map(purpose => {
              const isSelected = data.purpose === purpose;
              return (
                <button
                  type="button"
                  key={purpose}
                  onClick={() => updateData({ purpose })}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                      : 'bg-[#0C1220] border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{purpose}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Short Summary */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            Short Summary of the Idea
          </label>
          <textarea
            value={data.summary}
            onChange={e => updateData({ summary: e.target.value })}
            rows={4}
            placeholder="In 2-4 sentences, summarize what this video is about, the main emotional tone, and what feeling you want the audience to walk away with..."
            className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>
      </div>
    </div>
  );
};

