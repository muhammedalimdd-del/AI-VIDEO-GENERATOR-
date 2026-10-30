import React, { useState } from 'react';
import { VIDEO_STYLES } from '../data/styles.ts';
import { VideoStyleOption } from '../types/client.ts';
import { Film, Check, ArrowRight, Sparkles, Filter } from 'lucide-react';

interface StylesGalleryProps {
  onSelectStyle: (styleTitle: string) => void;
}

export const StylesGallerySection: React.FC<StylesGalleryProps> = ({ onSelectStyle }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [previewStyle, setPreviewStyle] = useState<VideoStyleOption | null>(null);

  const categories = ['All', 'Cinematic', 'Animation', 'Storytelling', 'Stylized'];

  const filteredStyles = activeCategory === 'All'
    ? VIDEO_STYLES
    : VIDEO_STYLES.filter(s => s.category === activeCategory);

  return (
    <section id="video-styles" className="py-20 lg:py-28 bg-[#060911]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2">
              Visual Direction Catalog
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Our Signature Video Styles
            </h3>
            <p className="mt-3 text-sm text-slate-300 max-w-xl">
              Choose the visual language for your video. Each style has calibrated lighting models, camera lenses, and rendering workflows.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Styles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStyles.map(style => (
            <div
              key={style.id}
              className="rounded-2xl bg-[#090D16] border border-slate-800/80 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-950/30 flex flex-col justify-between group"
            >
              <div>
                {/* Image Frame */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={style.imageUrl}
                    alt={style.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-black/30" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                      {style.category}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {style.title}
                  </h4>
                  <p className="text-xs text-indigo-400/90 font-medium mt-1 mb-3">
                    {style.tagline}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {style.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-400">Best for:</span>{' '}
                      <span className="text-slate-200">{style.recommendedFor}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Supported:</span>{' '}
                      <span className="text-slate-200">{style.aspectSupport}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => onSelectStyle(style.title)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-800 hover:border-indigo-500 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:bg-indigo-600 group-hover:text-white"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Request in {style.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Style Callout */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-900/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Need a Custom or Hybrid Art Style?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Don't see your exact aesthetic? Our request builder includes a dedicated custom style field where you can describe color palettes, visual references, lighting moods, and cinematography rules.
            </p>
          </div>
          <button
            onClick={() => onSelectStyle('Custom style')}
            className="shrink-0 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            Create Custom Style Request &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};
