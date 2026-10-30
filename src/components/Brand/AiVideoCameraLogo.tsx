import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const AiVideoCameraLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Cinematic AI Camera Symbol */}
      <div
        className={`${sizeClasses[size]} relative rounded-2xl p-[1.5px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 shadow-xl shadow-indigo-500/25 shrink-0 group`}
      >
        <div className="w-full h-full bg-[#080C16] rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle background neural grid glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:8px_8px] opacity-20 pointer-events-none" />

          {/* SVG Camera Symbol with AI Lens Aperture & Play glyph */}
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/5 h-3/5 relative z-10"
          >
            {/* Top Cine Viewfinder / Digital Reel */}
            <rect
              x="8"
              y="5"
              width="10"
              height="3"
              rx="1.5"
              className="fill-indigo-400 opacity-80"
            />
            <rect
              x="20"
              y="5"
              width="6"
              height="3"
              rx="1.5"
              className="fill-cyan-400 opacity-80"
            />

            {/* Camera Body */}
            <rect
              x="5"
              y="10"
              width="19"
              height="18"
              rx="4"
              className="fill-slate-900 stroke-indigo-500/70"
              strokeWidth="1.5"
            />

            {/* Glowing Aperture / AI Lens Outer Ring */}
            <circle
              cx="14.5"
              cy="19"
              width="12"
              height="12"
              r="6"
              className="stroke-purple-400"
              strokeWidth="1.5"
            />

            {/* AI Aperture Inner Iris with Cyan Center */}
            <circle
              cx="14.5"
              cy="19"
              r="3.5"
              className="fill-indigo-600/50 stroke-cyan-300"
              strokeWidth="1"
            />

            {/* Central glowing pupil spark */}
            <circle cx="14.5" cy="19" r="1.5" className="fill-cyan-300" />

            {/* Lens Cone projecting to Right */}
            <path
              d="M24 14.5L30 11.5C30.8 11.1 31.8 11.7 31.8 12.6V25.4C31.8 26.3 30.8 26.9 30 26.5L24 23.5V14.5Z"
              className="fill-gradient-to-r from-purple-600 to-indigo-600 stroke-purple-400"
              strokeWidth="1.2"
              fill="url(#lensGrad)"
            />

            {/* Subtle AI sparkle accent on upper right */}
            <path
              d="M29 7.5L29.7 9L31.2 9.7L29.7 10.4L29 11.9L28.3 10.4L26.8 9.7L28.3 9L29 7.5Z"
              className="fill-cyan-300"
            />

            <defs>
              <linearGradient id="lensGrad" x1="24" y1="19" x2="32" y2="19" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-white ${textSizes[size]}`}>
              AI Video
            </span>
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent ${textSizes[size]}`}
            >
              Maker
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide mt-1">
            Your Idea. Your Characters. Your AI Video.
          </p>
        </div>
      )}
    </div>
  );
};
