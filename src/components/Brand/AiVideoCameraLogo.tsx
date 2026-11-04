import React from 'react';

export const ZENVORA_LOGO_URL = '/assets/aistudio/Neon_Zenvora_Logo_in_Cosmic_Glow__1__84e2a1d9.png';

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
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* ZENVORA Cosmic Neon Logo */}
      <div
        className={`${sizeClasses[size]} relative rounded-full p-[1.5px] bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 shadow-xl shadow-purple-500/30 shrink-0 group overflow-hidden`}
      >
        <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative overflow-hidden">
          <img
            src={ZENVORA_LOGO_URL}
            alt="ZENVORA Logo"
            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-wider bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent ${textSizes[size]}`}
            >
              ZENVORA
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold tracking-widest uppercase mt-1">
            AI &bull; Creativity &bull; Innovation
          </p>
        </div>
      )}
    </div>
  );
};

