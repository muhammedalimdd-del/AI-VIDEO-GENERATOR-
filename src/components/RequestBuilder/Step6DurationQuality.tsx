import React from 'react';
import { RequestFormData } from '../../types/client.ts';
import { DURATION_OPTIONS } from '../../data/styles.ts';
import { Clock, Sliders, Volume2, Music, Type, Check, AlertCircle, Sparkles } from 'lucide-react';

interface Step6Props {
  data: RequestFormData;
  updateData: (fields: Partial<RequestFormData>) => void;
}

export const Step6DurationQuality: React.FC<Step6Props> = ({ data, updateData }) => {
  const resolutions = ['1080p Full HD (Recommended)', '4K Ultra HD (High Bitrate)', '720p HD (Fast Delivery)'];

  const finishes = [
    'Photorealistic Film (Natural Grain & Lighting)',
    'Stylized 3D CGI (Vibrant Pixar Aesthetic)',
    'Anime / Hand-Drawn Finish',
    'Dark Cinematic Noir / Gritty Contrast'
  ];

  const cameraMoves = [
    'Smooth Cinematic Gimbal & Pan',
    'Dynamic Handheld & Action Tracking',
    'Epic Drone & Wide Establishing Shots',
    'Slow Creeping Push-In & Steady Macro'
  ];

  const voiceovers = [
    'Deep Cinematic Male Voiceover',
    'Warm Natural Female Voiceover',
    'Character Dialogue Only (No Narrator)',
    'Instrumental Ambience Only (No Spoken Voices)'
  ];

  const musicStyles = [
    'Epic Orchestral & Heavy Percussion',
    'Dark Synthwave / Cyberpunk Electronic',
    'Soothing Lo-Fi Ambient & Strings',
    'Traditional / Cultural Acoustic Melodies',
    'High-Energy Modern Beat',
    'Subtle Atmospheric Soundscape Only'
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Step 6: Video Duration, Audio, & Quality Finish
        </h3>
        <p className="text-sm text-slate-400">
          Set runtime expectations, audio design, resolution, and subtitles.
        </p>
      </div>

      {/* Duration Options */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Preferred Video Duration <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DURATION_OPTIONS.map(opt => {
            const isSelected = data.duration === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => updateData({ duration: opt.value })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                    : 'bg-[#0C1220] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {opt.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                </div>
                <p className="text-xs text-slate-400">{opt.desc}</p>
              </div>
            );
          })}
        </div>

        {data.duration === 'custom' && (
          <div className="mt-3">
            <input
              type="text"
              value={data.customDuration}
              onChange={e => updateData({ customDuration: e.target.value })}
              placeholder="Specify custom runtime (e.g. 45 seconds, 90 seconds, 4 minutes)"
              className="w-full px-4 py-2.5 bg-[#0C1220] border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Turnaround feasibility note */}
        <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            <strong>Production Feasibility Note:</strong> Requested duration is recorded as your creative preference. Final runtime feasibility depends on generative model coherence, scene density, and complexity.
          </span>
        </div>
      </div>

      {/* Output Resolution & Visual Finish */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Target Output Resolution
          </label>
          <div className="space-y-2">
            {resolutions.map(res => (
              <button
                type="button"
                key={res}
                onClick={() => updateData({ outputResolution: res })}
                className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                  data.outputResolution === res
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : 'bg-[#0C1220] border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Visual Finish & Grading
          </label>
          <div className="space-y-2">
            {finishes.map(fin => (
              <button
                type="button"
                key={fin}
                onClick={() => updateData({ visualFinish: fin })}
                className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                  data.visualFinish === fin
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : 'bg-[#0C1220] border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {fin}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio & Music Design */}
      <div className="pt-2 border-t border-slate-800/80 space-y-6">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-indigo-400" />
          Sound Design, Voiceover & Music
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Voice-over / Narration Preference
            </label>
            <div className="space-y-2">
              {voiceovers.map(vo => (
                <button
                  type="button"
                  key={vo}
                  onClick={() => updateData({ voiceOverPref: vo })}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                    data.voiceOverPref === vo
                      ? 'bg-indigo-950/60 border-indigo-500 text-white'
                      : 'bg-[#0C1220] border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {vo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Background Music Genre
            </label>
            <div className="space-y-2">
              {musicStyles.map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => updateData({ backgroundMusic: m })}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                    data.backgroundMusic === m
                      ? 'bg-indigo-950/60 border-indigo-500 text-white'
                      : 'bg-[#0C1220] border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles: Subtitles & Sound FX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="p-3.5 rounded-xl bg-[#0C1220] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
            <div>
              <span className="text-xs font-bold text-white block">Generate Embedded Subtitles</span>
              <span className="text-[11px] text-slate-400 block">Render clean, modern captions for social engagement</span>
            </div>
            <input
              type="checkbox"
              checked={data.subtitles}
              onChange={e => updateData({ subtitles: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-950"
            />
          </label>

          <label className="p-3.5 rounded-xl bg-[#0C1220] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
            <div>
              <span className="text-xs font-bold text-white block">Immersive Sound Effects (Foley)</span>
              <span className="text-[11px] text-slate-400 block">Footsteps, whooshes, ambient weather & room tones</span>
            </div>
            <input
              type="checkbox"
              checked={data.soundEffects}
              onChange={e => updateData({ soundEffects: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-950"
            />
          </label>
        </div>

        {/* Ending Title / Credits */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            Final Title or Ending Card Text (Optional)
          </label>
          <input
            type="text"
            value={data.endingText}
            onChange={e => updateData({ endingText: e.target.value })}
            placeholder="e.g. 'Directed by Studio Apex', 'Subscribe for Part 2', or your brand handle '@MyHandle'"
            className="w-full px-3 py-2 bg-[#0C1220] border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <p className="text-[11px] text-slate-400">
          * Voice and music audio tracks are provided under commercial-safe creative commons and royalty-free studio licenses.
        </p>
      </div>
    </div>
  );
};
