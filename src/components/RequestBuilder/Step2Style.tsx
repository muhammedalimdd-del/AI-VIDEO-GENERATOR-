import React from 'react';
import { RequestFormData } from '../../types/client.ts';
import { VIDEO_STYLES } from '../../data/styles.ts';
import { Sparkles, Palette, Check, Info } from 'lucide-react';

interface Step2Props {
  data: RequestFormData;
  updateData: (fields: Partial<RequestFormData>) => void;
}

export const Step2Style: React.FC<Step2Props> = ({ data, updateData }) => {
  const selectedStyleObj = VIDEO_STYLES.find(s => s.title === data.style);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-400" />
          Step 2: Video Style
        </h3>
        <p className="text-sm text-slate-400">
          Select one primary visual aesthetic. Every style informs camera lenses, color grading, and generative rendering models.
        </p>
      </div>

      {/* Selected Style Spotlight Preview */}
      {selectedStyleObj && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-800/40 p-5 flex flex-col sm:flex-row items-center gap-5">
          <img
            src={selectedStyleObj.imageUrl}
            alt={selectedStyleObj.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-700 shadow-md shrink-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Selected Aesthetic
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-900/60 text-indigo-200">
                {selectedStyleObj.category}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white">{selectedStyleObj.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {selectedStyleObj.description}
            </p>
          </div>
        </div>
      )}

      {/* Grid of 12 Style Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VIDEO_STYLES.map(style => {
          const isSelected = data.style === style.title;
          return (
            <div
              key={style.id}
              onClick={() => updateData({ style: style.title })}
              className={`rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-500/80'
                  : 'bg-[#0C1220] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="relative h-28 rounded-lg overflow-hidden mb-3 bg-slate-950">
                  <img
                    src={style.imageUrl}
                    alt={style.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 text-[10px] text-slate-300 font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                    {style.category}
                  </div>
                </div>

                <h4 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {style.title}
                </h4>
                <p className="text-xs text-indigo-400/90 font-medium mt-0.5 line-clamp-1">
                  {style.tagline}
                </p>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                  {style.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{style.aspectSupport.split(' ')[0]}</span>
                <span className={isSelected ? 'text-indigo-400 font-semibold' : 'text-slate-400'}>
                  {isSelected ? 'Active Selection' : 'Click to Select'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Custom Style Card */}
        <div
          onClick={() => updateData({ style: 'Custom style' })}
          className={`rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
            data.style === 'Custom style'
              ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-950/50 ring-2 ring-purple-500/80'
              : 'bg-[#0C1220] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          <div>
            <div className="h-28 rounded-lg bg-gradient-to-tr from-purple-900/60 to-indigo-900/40 border border-purple-800/30 flex flex-col items-center justify-center p-3 text-center mb-3">
              <Sparkles className="w-7 h-7 text-purple-400 mb-1" />
              <span className="text-xs font-bold text-white">Custom Visual Style</span>
              <span className="text-[10px] text-purple-300">Your unique design direction</span>
            </div>
            <h4 className="text-sm font-bold text-white">Custom Style Description</h4>
            <p className="text-xs text-slate-400 mt-1">
              Specify your own bespoke visual preferences, lighting references, and color palette.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-purple-400 font-semibold">
            {data.style === 'Custom style' ? 'Active Selection' : 'Click to specify custom'}
          </div>
        </div>
      </div>

      {/* Custom Style Description Field */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Custom Style & Visual Preferences {data.style === 'Custom style' && <span className="text-rose-400">*</span>}
        </label>
        <textarea
          value={data.customStyle}
          onChange={e => updateData({ customStyle: e.target.value })}
          rows={3}
          placeholder="Describe any particular visual cues: e.g. Vintage 1980s VHS tape texture with chromatic aberration, or Studio Ghibli lush green watercolors, or moody Neo-Noir with neon reflections in rain puddles..."
          className="w-full px-4 py-3 bg-[#0C1220] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
        />
        <p className="text-xs text-slate-500 mt-1.5">
          You can provide custom notes for any style, or detailed instructions if you chose "Custom style".
        </p>
      </div>
    </div>
  );
};
