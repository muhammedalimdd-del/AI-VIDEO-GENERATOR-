import { Sparkles, ArrowRight, Film, ShieldCheck, Gift, CreditCard, Video, User, Clock } from 'lucide-react';
import { UserAccount } from '../types/client.ts';

interface HeroSectionProps {
  currentUser?: UserAccount | null;
  onRequestClick: () => void;
  onExploreStylesClick: () => void;
  onMyRequestsClick?: () => void;
  onProfileClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentUser,
  onRequestClick,
  onExploreStylesClick,
  onMyRequestsClick,
  onProfileClick
}) => {
  const visualCards = [
    {
      title: 'Cinematic Videos',
      desc: 'Anamorphic widescreen, dramatic lighting & thrilling high-stakes blockbuster scenes',
      imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
      badge: 'Cinematic 4K'
    },
    {
      title: 'Realistic Videos',
      desc: 'Photorealistic character likeness, natural skin tones, lighting & real-world acoustics',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      badge: 'Photorealistic'
    },
    {
      title: 'Cartoon Videos',
      desc: 'Classic and modern hand-drawn cel-shaded aesthetics with lively motion & vibrant colors',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      badge: '2D Cel Animation'
    },
    {
      title: 'Adventure Videos',
      desc: 'Wild expeditions, dense jungles, ancient ruins & heart-pounding epic journeys',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      badge: 'Epic Adventure'
    },
    {
      title: 'Superhero Videos',
      desc: 'Superhuman abilities, glowing cosmic energy, dynamic flight & action showdowns',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      badge: 'VFX Action'
    },
    {
      title: 'Travel Videos',
      desc: 'Golden hour drone sweeps across mountain ranges, tropical beaches & heritage cities',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      badge: 'Scenic 4K'
    },
    {
      title: 'Animated Stories',
      desc: 'Expressive 3D characters, heartfelt storytelling, fantasy worlds & emotional arcs',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      badge: 'Stylized 3D'
    }
  ];

  return (
    <section id="hero" className="relative w-full overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-[#050811]">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none opacity-30">
        <div className="w-[600px] h-[350px] absolute -top-20 left-1/4 bg-indigo-600/30 rounded-full blur-[130px]" />
        <div className="w-[500px] h-[300px] absolute top-10 right-1/4 bg-purple-600/25 rounded-full blur-[140px]" />
        <div className="w-[400px] h-[250px] absolute top-32 left-1/3 bg-cyan-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Tag */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Welcome User Badge */}
          {currentUser && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 mb-4 shadow-lg shadow-black/40">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>Welcome back, <strong className="text-white">{currentUser.displayName || 'Creator'}</strong></span>
              {currentUser.trialStatus === 'eligible' && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-700/50">
                  🎁 1 Free Trial
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-semibold backdrop-blur-sm shadow-lg shadow-indigo-950/40">
              <img
                src="/assets/aistudio/Neon_Zenvora_Logo_in_Cosmic_Glow__1__84e2a1d9.png"
                alt="ZENVORA"
                className="w-5 h-5 rounded-full object-cover border border-purple-500/50"
              />
              <span className="font-black tracking-wider text-white">ZENVORA</span>
              <span className="text-slate-500">·</span>
              <span>AI &bull; Creativity &bull; Innovation &mdash; Imagine Beyond Reality</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] mb-6">
            Turn Your Imagination Into{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              AI Videos
            </span>
          </h1>

          {/* Supporting text */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
            Create personalized AI videos with your own ideas, characters, photos, and stories.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={onRequestClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <span>Create Your Video</span>
              <ArrowRight className="w-4 h-4 text-white/80" />
            </button>

            <button
              onClick={onExploreStylesClick}
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Explore Video Styles</span>
            </button>
          </div>

          {/* Authenticated Fast Links: My Requests & My Profile */}
          <div className="flex items-center justify-center gap-3 mb-10 text-xs">
            {onMyRequestsClick && (
              <button
                onClick={onMyRequestsClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>My Requests</span>
              </button>
            )}

            {onProfileClick && (
              <button
                onClick={onProfileClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>My Profile</span>
              </button>
            )}
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pb-12">
            <div className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>1-Time Free Trial for Eligible New Accounts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>The payment will be based on the video</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Verified Google Account Delivery</span>
            </div>
          </div>
        </div>

        {/* Visual Cards Grid */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-400">
                Explore Video Styles
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                Popular AI Video Categories
              </h3>
            </div>
            <button
              onClick={onExploreStylesClick}
              className="text-xs font-semibold text-indigo-400 hover:text-white transition-colors cursor-pointer"
            >
              View all styles &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {visualCards.map((cat, idx) => (
              <div
                key={idx}
                onClick={onRequestClick}
                className="group relative rounded-2xl bg-[#0B101D] border border-slate-800/80 overflow-hidden hover:border-indigo-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/40 cursor-pointer flex flex-col"
              >
                {/* Thumbnail Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B101D] via-[#0B101D]/30 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900/90 text-cyan-300 border border-slate-700/60 backdrop-blur-sm">
                    {cat.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {cat.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-indigo-400 group-hover:text-cyan-300">
                    <span>Request this style</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
