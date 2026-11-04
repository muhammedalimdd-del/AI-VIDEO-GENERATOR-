import React, { useEffect, useState } from 'react';
import { AiVideoCameraLogo } from './Brand/AiVideoCameraLogo.tsx';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onTimeout?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onTimeout }) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(timer);
          return 95;
        }
        return prev + 15;
      });
    }, 120);

    // Guaranteed safety timeout: never keep user stuck more than 1.5s
    const safetyTimer = setTimeout(() => {
      if (onTimeout) onTimeout();
    }, 1500);

    return () => {
      clearInterval(timer);
      clearTimeout(safetyTimer);
    };
  }, [onTimeout]);

  return (
    <div className="fixed inset-0 z-50 bg-[#050811] flex flex-col items-center justify-center p-4 selection:bg-transparent overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-[130px] pointer-events-none animate-pulse" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto space-y-6">
        {/* Animated Camera Logo */}
        <div className="animate-bounce" style={{ animationDuration: '2s' }}>
          <AiVideoCameraLogo size="xl" showText={false} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="font-black text-2xl tracking-wider bg-gradient-to-r from-white via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              ZENVORA
            </span>
          </div>

          <p className="text-sm font-medium text-slate-300 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Preparing Your Creative Studio...</span>
          </p>
        </div>

        {/* Smooth Glowing Progress Bar */}
        <div className="w-56 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-500 font-mono tracking-wider uppercase">
          AI &bull; Creativity &bull; Innovation &mdash; Imagine Beyond Reality
        </p>
      </div>
    </div>
  );
};
