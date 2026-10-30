import { VideoStyleOption } from '../types/client.ts';

export const VIDEO_STYLES: VideoStyleOption[] = [
  {
    id: 'realistic-cinematic',
    title: 'Realistic Cinematic',
    tagline: 'Hollywood 35mm film look with natural lighting and depth',
    description: 'Ultra-photorealistic film look with shallow depth of field, subtle film grain, natural skin textures, and balanced atmospheric grading.',
    category: 'Cinematic',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Drama, commercial trailers, emotional stories, luxury brand showcases',
    aspectSupport: '16:9 Landscape or 9:16 Portrait'
  },
  {
    id: 'movie-trailer',
    title: 'Epic Movie Trailer',
    tagline: 'High-octane blockbusters with anamorphic lens flares & heavy contrast',
    description: 'Dynamic pacing, dramatic lighting, sweeping camera crane motions, volumetric smoke, and high-impact punchy scene transitions.',
    category: 'Cinematic',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Action teasers, product launch reveals, sci-fi concepts',
    aspectSupport: '16:9 Landscape & 9:16 Reels'
  },
  {
    id: '3d-animation',
    title: '3D Pixar-Style Animation',
    tagline: 'Expressive characters with rich subsurface scattering and vibrant colors',
    description: 'Warm, stylized 3D animation featuring lively facial expressions, soft studio lighting, appealing proportions, and family-friendly appeal.',
    category: 'Animation',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Children stories, joyful branding, mascots, moral narratives',
    aspectSupport: '9:16 Portrait & 16:9 Landscape'
  },
  {
    id: 'cartoon-2d',
    title: 'Vibrant 2D Cartoon',
    tagline: 'Playful cel-shaded illustration with dynamic line art',
    description: 'Classic and modern hand-drawn aesthetics with bold outlines, vivid color palettes, expressive squash-and-stretch motion, and energetic comedic timing.',
    category: 'Animation',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Social explainers, lighthearted skits, comic adaptations',
    aspectSupport: 'All formats'
  },
  {
    id: 'anime-inspired',
    title: 'Anime-Inspired',
    tagline: 'Japanese animation aesthetic with radiant lighting and emotive eyes',
    description: 'Shinkai-inspired sky gradients, detailed architectural backgrounds, glowing bloom effects, and emotive character close-ups.',
    category: 'Animation',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Fantasy, romantic drama, adventure lore, music video sequences',
    aspectSupport: '16:9 Landscape or 9:16 Portrait'
  },
  {
    id: 'fantasy-adventure',
    title: 'Fantasy & Mythic Adventure',
    tagline: 'Enchanted forests, mythical creatures, magic spells & ancient castles',
    description: 'Atmospheric fantasy worlds with mystical bioluminescence, floating particles, arcane energy runes, and grand sweeping kingdom vistas.',
    category: 'Storytelling',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Worldbuilding lore, roleplaying campaigns, epic book trailers',
    aspectSupport: '16:9 Landscape preferred'
  },
  {
    id: 'superhero',
    title: 'Superhero & Comic Action',
    tagline: 'Dynamic heroic poses, comic book punch, and cosmic particle bursts',
    description: 'Bold color contrasts, cinematic slow-motion impact frames, electric energy auras, and iconic hero silhouettes against city skylines.',
    category: 'Cinematic',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Superhero origin scenes, fitness motivators, high-energy clips',
    aspectSupport: '9:16 Shorts or 16:9 Landscape'
  },
  {
    id: 'documentary',
    title: 'Documentary Realism',
    tagline: 'Naturalistic observational realism with archival documentary texture',
    description: 'Authentic handheld or steady tripod framing, grounded natural sound design, candid human behavior, and unvarnished realism.',
    category: 'Storytelling',
    imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Biographical chronicles, historical reviews, nature pieces',
    aspectSupport: '16:9 Landscape'
  },
  {
    id: 'travel-vlog',
    title: 'Cinematic Travel Vlog',
    tagline: 'Golden hour drone sweeps, serene ocean waters & bustling street markets',
    description: 'Vibrant tourism aesthetic with fluid FPV drone flythroughs, sunburst flares, warm color temperature, and wanderlust atmosphere.',
    category: 'Storytelling',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Travel inspiration, resort highlights, cultural explorations',
    aspectSupport: '9:16 Vertical Reels & 16:9 Landscape'
  },
  {
    id: 'historical-story',
    title: 'Historical Story & Period Piece',
    tagline: 'Sepia, vintage textures, period costumes, and heritage architecture',
    description: 'Intricately researched period aesthetics, candlelight warmth, vintage film grain, textured garments, and authentic historical settings.',
    category: 'Storytelling',
    imageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Historical reenactments, heritage documentaries, cultural roots',
    aspectSupport: '16:9 Landscape or 9:16 Portrait'
  },
  {
    id: 'educational-explainer',
    title: 'Educational Explainer',
    tagline: 'Clean visual metaphors, structured breakdowns, and clear focal cues',
    description: 'Clear, engaging visual storytelling that illustrates complex ideas, scientific concepts, or historical milestones with utmost clarity.',
    category: 'Stylized',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Tech explainers, educational YouTube channels, science tutorials',
    aspectSupport: '16:9 Landscape or 9:16 Shorts'
  },
  {
    id: 'horror-mystery',
    title: 'Horror & Psychological Mystery',
    tagline: 'Chiaroscuro shadows, eerie mist, desaturated cold tones and suspense',
    description: 'Moody fog, deep crushing shadows, flickering halogen bulbs, uncanny atmospheric tension, and haunting cinematic pacing.',
    category: 'Cinematic',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=800&q=80',
    recommendedFor: 'Creepy short films, mystery teasers, suspenseful storytelling',
    aspectSupport: '16:9 Landscape or 9:16 Portrait'
  }
];

export const PURPOSE_OPTIONS = [
  'Entertainment',
  'YouTube video',
  'YouTube Shorts',
  'Instagram Reels',
  'Educational video',
  'Islamic or inspirational video',
  'Storytelling',
  'Advertisement',
  'Birthday or special occasion',
  'Travel adventure',
  'Other'
];

export const DURATION_OPTIONS = [
  { value: '10 seconds', label: '10 Seconds', desc: 'Ideal for snappy punchlines & high-energy loops' },
  { value: '15 seconds', label: '15 Seconds', desc: 'Standard length for viral Instagram Reels & TikTok hooks' },
  { value: '30 seconds', label: '30 Seconds', desc: 'Recommended: Full arc narrative with intro, conflict & climax' },
  { value: '60 seconds', label: '60 Seconds', desc: 'Extended story with multiple scene changes & dialogue' },
  { value: '2 minutes', label: '2 Minutes', desc: 'Mini-short film with multi-character development' },
  { value: '3 minutes', label: '3 Minutes', desc: 'In-depth cinematic journey or comprehensive explainer' },
  { value: 'custom', label: 'Custom Duration', desc: 'Specify exact runtime requirements in creative brief' },
];

export const LANGUAGE_OPTIONS = [
  'English',
  'Malayalam',
  'Hindi',
  'Arabic',
  'Spanish',
  'Tamil',
  'Urdu',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Other / Instrument Only'
];
