import React from 'react';
import { RequestFormData } from '../../types/client.ts';
import { Smartphone, Monitor, Square, Check, Tv, Globe } from 'lucide-react';

interface Step3Props {
  data: RequestFormData;
  updateData: (fields: Partial<RequestFormData>) => void;
}

export const Step3Format: React.FC<Step3Props> = ({ data, updateData }) => {
  const platforms = [
    'YouTube Shorts',
    'Instagram Reels',
    'TikTok',
    'YouTube (Standard Landscape)',
    'Website / Landing Page',
    'Presentation / TV',
    'Personal / Family Occasion'
  ];

  const handleSelectFormat = (format: 'portrait' | 'landscape' | 'square') => {
    if (format === 'portrait') {
      updateData({
        format: 'portrait',
        aspectRatio: '9:16',
        resolution: '1080 × 1920'
      });
    } else if (format === 'landscape') {
      updateData({
        format: 'landscape',
        aspectRatio: '16:9',
        resolution: '1920 × 1080'
      });
    } else {
      updateData({
        format: 'square',
        aspectRatio: '1:1',
        resolution: '1080 × 1080'
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-indigo-400" />
          Step 3: Video Format & Orientation
        </h3>
        <p className="text-sm text-slate-400">
          Choose your canvas orientation. Generative composition, camera panning, and framing will be calibrated to this ratio.
        </p>
      </div>

      {/* Two Large Visual Options + Square */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PORTRAIT VIDEO 9:16 */}
        <div
          onClick={() => handleSelectFormat('portrait')}
          className={`rounded-2xl border p-6 cursor-pointer transition-all flex flex-col justify-between ${
            data.format === 'portrait'
              ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/40 ring-2 ring-indigo-500'
              : 'bg-[#0C1220] border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-900/50 text-indigo-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">PORTRAIT VIDEO</h4>
                  <span className="text-xs text-indigo-400 font-semibold">Aspect Ratio: 9:16</span>
                </div>
              </div>
              {data.format === 'portrait' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Simulated Mobile Mockup */}
            <div className="py-6 flex justify-center">
              <div className="w-28 h-48 rounded-xl border-2 border-indigo-500/80 bg-slate-950 flex flex-col items-center justify-center p-2 relative shadow-lg overflow-hidden group">
                <div className="w-12 h-1 bg-slate-800 rounded-full mb-auto" />
                <div className="text-center my-auto">
                  <Smartphone className="w-6 h-6 text-indigo-400 mx-auto mb-1 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-400 block">9:16</span>
                  <span className="text-[9px] text-slate-500 block">1080 × 1920</span>
                </div>
                <div className="w-8 h-1 bg-slate-800 rounded-full mt-auto" />
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 mt-2">
              <p><strong>Suggested Resolution:</strong> 1080 × 1920 (Full HD Vertical)</p>
              <p className="text-slate-400">Suitable for YouTube Shorts, Instagram Reels, TikTok, and mobile viewing.</p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs font-semibold text-indigo-400 text-center">
            {data.format === 'portrait' ? 'Selected Orientation' : 'Select Portrait 9:16'}
          </div>
        </div>

        {/* LANDSCAPE VIDEO 16:9 */}
        <div
          onClick={() => handleSelectFormat('landscape')}
          className={`rounded-2xl border p-6 cursor-pointer transition-all flex flex-col justify-between ${
            data.format === 'landscape'
              ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/40 ring-2 ring-indigo-500'
              : 'bg-[#0C1220] border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-900/50 text-indigo-300">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">LANDSCAPE VIDEO</h4>
                  <span className="text-xs text-indigo-400 font-semibold">Aspect Ratio: 16:9</span>
                </div>
              </div>
              {data.format === 'landscape' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Simulated Landscape Screen Mockup */}
            <div className="py-6 flex justify-center items-center">
              <div className="w-52 h-28 rounded-xl border-2 border-indigo-500/80 bg-slate-950 flex flex-col items-center justify-center p-2 relative shadow-lg overflow-hidden">
                <Monitor className="w-6 h-6 text-indigo-400 mx-auto mb-1 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 block">16:9</span>
                <span className="text-[9px] text-slate-500 block">1920 × 1080</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 mt-2">
              <p><strong>Suggested Resolution:</strong> 1920 × 1080 (Cinematic Full HD)</p>
              <p className="text-slate-400">Suitable for YouTube videos, cinematic storytelling, television, and widescreen presentations.</p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs font-semibold text-indigo-400 text-center">
            {data.format === 'landscape' ? 'Selected Orientation' : 'Select Landscape 16:9'}
          </div>
        </div>
      </div>

      {/* Optional Square 1:1 Card */}
      <div
        onClick={() => handleSelectFormat('square')}
        className={`rounded-xl border p-4 cursor-pointer transition-all flex items-center justify-between ${
          data.format === 'square'
            ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500'
            : 'bg-[#0C1220] border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <Square className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-white">Square Video (1:1, 1080 × 1080)</h5>
            <p className="text-xs text-slate-400">Optional compact square format for Instagram feed posts and profile carousels.</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-indigo-400">
          {data.format === 'square' ? 'Selected' : 'Use Square'}
        </span>
      </div>

      {/* Publishing Platform */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-indigo-400" />
          Intended Publishing Platform
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {platforms.map(plat => {
            const isSelected = data.targetPlatform === plat;
            return (
              <button
                type="button"
                key={plat}
                onClick={() => updateData({ targetPlatform: plat })}
                className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-900/60 border-indigo-500 text-white'
                    : 'bg-[#0C1220] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                {plat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
