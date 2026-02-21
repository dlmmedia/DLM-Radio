export type AppTier = 1 | 2 | 3;

export interface AppPromo {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  cta: string;
  url: string;
  image: string;
  accent: string;
  tier: AppTier;
}

export interface AffiliateItem {
  id: string;
  brand: string;
  category: "music-gear" | "streaming" | "tech" | "lifestyle";
  tagline: string;
  cta: string;
  url: string;
  accent: string;
}

export interface HintItem {
  id: string;
  icon: string;
  text: string;
}

export interface TickerMessage {
  id: string;
  text: string;
  type: "trivia" | "promo" | "fact" | "quote" | "history" | "wellness";
}

export interface ContextFact {
  id: string;
  countryCode?: string;
  genre?: string;
  fact: string;
  source?: string;
}

// ── DLM App Promos ──────────────────────────────────────────────────────

export const APP_PROMOS: AppPromo[] = [
  // Tier 1 — Flagship
  {
    id: "dlm-director",
    name: "DLM Director",
    subtitle: "Elite Cinematic Video Generation",
    tagline: "Direct the impossible. AI cinematography that thinks in scenes.",
    cta: "Start Directing",
    url: "https://dlm-director-production.up.railway.app/",
    image: "/promo/dlm-director.png",
    accent: "#D4A843",
    tier: 1,
  },
  {
    id: "powerwrite",
    name: "PowerWrite",
    subtitle: "AI-Powered Book Creation",
    tagline: "From idea to published book. Ten minutes, not ten months.",
    cta: "Create Your Book",
    url: "https://power-write-web-production.up.railway.app/",
    image: "/promo/powerwrite.png",
    accent: "#F5C518",
    tier: 1,
  },
  {
    id: "nebula-x",
    name: "Nebula X",
    subtitle: "AI Coding Agent",
    tagline: "A senior engineer that never sleeps. 75+ AI providers. One agent.",
    cta: "Meet Nebula",
    url: "https://website-three-blond-yzb07ohcba.vercel.app/",
    image: "/promo/nebula-x.png",
    accent: "#7C5CFC",
    tier: 1,
  },
  // Tier 2 — Core Creative Tools
  {
    id: "video-agent",
    name: "DLM Video Agent",
    subtitle: "Code to Cinema",
    tagline: "Your code. Their screen. Ship motion graphics at the speed of thought.",
    cta: "Start Creating",
    url: "https://dlm-video-agent.vercel.app/",
    image: "/promo/video-agent.png",
    accent: "#A855F7",
    tier: 2,
  },
  {
    id: "music-gen",
    name: "AI Music Generator",
    subtitle: "Create Original Music",
    tagline: "Generate tracks that move people. AI-composed, human-felt.",
    cta: "Compose Now",
    url: "https://dl-mgen.vercel.app/",
    image: "/promo/music-gen.png",
    accent: "#DC2626",
    tier: 2,
  },
  {
    id: "video-editor",
    name: "DLM Video Editor",
    subtitle: "Professional Video Editor",
    tagline: "From idea to export. In your browser. No downloads, no limits.",
    cta: "Open Editor",
    url: "https://dlm-video-editor-production.up.railway.app/",
    image: "/promo/video-editor.png",
    accent: "#22C55E",
    tier: 2,
  },
  {
    id: "voice-designer",
    name: "Voice Designer",
    subtitle: "AI Voice Creation & Casting",
    tagline: "Where clarity meets creativity. Broadcast-ready voices in seconds.",
    cta: "Design a Voice",
    url: "https://dlm-voice-designer.vercel.app/",
    image: "/promo/voice-designer.png",
    accent: "#60A5FA",
    tier: 2,
  },
  // Tier 3 — Ecosystem
  {
    id: "audio-workstation",
    name: "Audio Workstation X",
    subtitle: "Professional Audio Suite",
    tagline: "$4,000 of production power. Starting at $8.25/month.",
    cta: "Start Free Trial",
    url: "https://audiox-five.vercel.app/",
    image: "/promo/audio-workstation.png",
    accent: "#2DD4BF",
    tier: 3,
  },
  {
    id: "dlm-broadcast",
    name: "DLM Broadcast",
    subtitle: "Software-Defined TV",
    tagline: "100+ live channels. Zero subscriptions. The future of broadcast.",
    cta: "Browse Channels",
    url: "https://dlm-broadcast-frontend-production.up.railway.app/",
    image: "/promo/dlm-broadcast.png",
    accent: "#3B82F6",
    tier: 3,
  },
  {
    id: "dlm-books",
    name: "DLM Books",
    subtitle: "AI-Generated Publications & Audiobooks",
    tagline: "27 titles. 171K reviews. Stories that transform how you think.",
    cta: "Explore Collection",
    url: "https://www.dlmbooks.store",
    image: "/promo/dlm-books.png",
    accent: "#D97706",
    tier: 3,
  },
  {
    id: "nebula-web",
    name: "Nebula X Web",
    subtitle: "AI Web App Builder",
    tagline: "Describe what you want to build. Watch it materialize.",
    cta: "Build Something",
    url: "https://architect-ver-5-sdk.vercel.app/",
    image: "/promo/nebula-web.png",
    accent: "#6366F1",
    tier: 3,
  },
  {
    id: "video-editor-basic",
    name: "DLM Video Editor",
    subtitle: "Browser-Based Video Editing",
    tagline: "Simple. Powerful. Edit video anywhere, on any platform.",
    cta: "Try Beta",
    url: "https://dlm-video-editor.vercel.app/",
    image: "/promo/video-editor-basic.png",
    accent: "#EAB308",
    tier: 3,
  },
];

// ── Affiliate Content ───────────────────────────────────────────────────

export const AFFILIATE_ITEMS: AffiliateItem[] = [
  // Music Gear
  {
    id: "aff-sony-xm5",
    brand: "Sony WH-1000XM5",
    category: "music-gear",
    tagline: "Silence the world. Hear only music.",
    cta: "See Price",
    url: "#",
    accent: "#F59E0B",
  },
  {
    id: "aff-focal-utopia",
    brand: "Focal Utopia",
    category: "music-gear",
    tagline: "The last pair of headphones you will ever need.",
    cta: "Explore",
    url: "#",
    accent: "#EF4444",
  },
  {
    id: "aff-schiit-modi",
    brand: "Schiit Modi DAC",
    category: "music-gear",
    tagline: "Audiophile-grade for under $100.",
    cta: "Learn More",
    url: "#",
    accent: "#8B5CF6",
  },
  {
    id: "aff-yamaha-hs5",
    brand: "Yamaha HS5",
    category: "music-gear",
    tagline: "Studio monitors trusted by producers worldwide.",
    cta: "See Price",
    url: "#",
    accent: "#1D4ED8",
  },
  {
    id: "aff-focusrite-scarlett",
    brand: "Focusrite Scarlett 2i2",
    category: "music-gear",
    tagline: "The world's best-selling audio interface. Plug in and create.",
    cta: "Learn More",
    url: "#",
    accent: "#DC2626",
  },
  {
    id: "aff-at-lp120",
    brand: "Audio-Technica LP120X",
    category: "music-gear",
    tagline: "Direct-drive turntable. Vinyl, the way it was meant to be heard.",
    cta: "Explore",
    url: "#",
    accent: "#374151",
  },
  {
    id: "aff-beyerdynamic-dt770",
    brand: "Beyerdynamic DT 770 Pro",
    category: "music-gear",
    tagline: "Reference-class studio headphones. Built in Germany since 1985.",
    cta: "See Price",
    url: "#",
    accent: "#6B7280",
  },
  {
    id: "aff-shure-sm7b",
    brand: "Shure SM7B",
    category: "music-gear",
    tagline: "The microphone behind the world's biggest podcasts and vocals.",
    cta: "Learn More",
    url: "#",
    accent: "#059669",
  },
  // Streaming
  {
    id: "aff-tidal",
    brand: "TIDAL HiFi",
    category: "streaming",
    tagline: "Lossless audio. The way artists intended.",
    cta: "Try Free",
    url: "#",
    accent: "#06B6D4",
  },
  {
    id: "aff-spotify",
    brand: "Spotify Premium",
    category: "streaming",
    tagline: "Ad-free music, offline listening, everywhere.",
    cta: "Get Premium",
    url: "#",
    accent: "#22C55E",
  },
  {
    id: "aff-apple-music",
    brand: "Apple Music",
    category: "streaming",
    tagline: "100 million songs. Spatial Audio. Zero ads.",
    cta: "Listen Now",
    url: "#",
    accent: "#F43F5E",
  },
  {
    id: "aff-amazon-music",
    brand: "Amazon Music Unlimited",
    category: "streaming",
    tagline: "HD and Ultra HD audio. Alexa-ready. 100 million songs.",
    cta: "Start Free",
    url: "#",
    accent: "#2563EB",
  },
  {
    id: "aff-deezer",
    brand: "Deezer HiFi",
    category: "streaming",
    tagline: "Flow. Your personal soundtrack, powered by AI.",
    cta: "Try Free",
    url: "#",
    accent: "#A855F7",
  },
  // Tech
  {
    id: "aff-arc",
    brand: "Arc Browser",
    category: "tech",
    tagline: "The internet, redesigned. Browse beautifully.",
    cta: "Download",
    url: "#",
    accent: "#6366F1",
  },
  {
    id: "aff-notion",
    brand: "Notion",
    category: "tech",
    tagline: "Your second brain. Notes, docs, projects. Unified.",
    cta: "Get Started",
    url: "#",
    accent: "#F5F5F5",
  },
  {
    id: "aff-raycast",
    brand: "Raycast",
    category: "tech",
    tagline: "Supercharged productivity for your Mac.",
    cta: "Try Free",
    url: "#",
    accent: "#F97316",
  },
  {
    id: "aff-linear",
    brand: "Linear",
    category: "tech",
    tagline: "Issue tracking built for modern software teams.",
    cta: "Get Started",
    url: "#",
    accent: "#5E6AD2",
  },
  {
    id: "aff-figma",
    brand: "Figma",
    category: "tech",
    tagline: "Design, prototype, develop. All in the browser.",
    cta: "Try Free",
    url: "#",
    accent: "#A259FF",
  },
  // Lifestyle
  {
    id: "aff-aesop",
    brand: "Aesop",
    category: "lifestyle",
    tagline: "Formulations for the skin, hair, and body.",
    cta: "Discover",
    url: "#",
    accent: "#A3A3A3",
  },
  {
    id: "aff-bo",
    brand: "Bang & Olufsen",
    category: "lifestyle",
    tagline: "Where sound meets Scandinavian craft.",
    cta: "Explore",
    url: "#",
    accent: "#D4D4D8",
  },
  {
    id: "aff-rimowa",
    brand: "Rimowa",
    category: "lifestyle",
    tagline: "Engineered for the modern traveler.",
    cta: "Shop Now",
    url: "#",
    accent: "#78716C",
  },
  {
    id: "aff-sonos-era",
    brand: "Sonos Era 300",
    category: "lifestyle",
    tagline: "Spatial audio that fills the room. Sound reimagined.",
    cta: "Explore",
    url: "#",
    accent: "#18181B",
  },
  {
    id: "aff-marshall-stanmore",
    brand: "Marshall Stanmore III",
    category: "lifestyle",
    tagline: "Iconic rock heritage. Legendary Bluetooth sound.",
    cta: "Shop Now",
    url: "#",
    accent: "#B91C1C",
  },
];

// ── Hints ────────────────────────────────────────────────────────────────

export const HINTS: HintItem[] = [
  { id: "hint-visualizer", icon: "monitor-play", text: "Press V to enter the visualizer" },
  { id: "hint-random", icon: "shuffle", text: "Press R \u2014 let the radio surprise you" },
  { id: "hint-fullscreen", icon: "maximize", text: "Press F for fullscreen immersion" },
  { id: "hint-mute", icon: "volume-x", text: "Press M to toggle mute" },
  { id: "hint-mood", icon: "palette", text: "Press B to shift the visual mood" },
  { id: "hint-navigate", icon: "arrow-left-right", text: "Arrow keys \u2014 skip stations, adjust volume" },
  { id: "hint-explore", icon: "globe", text: "Click any point on the globe to discover local stations" },
  { id: "hint-search", icon: "search", text: "Press 4 to open search \u2014 find any station on earth" },
];

// ── Ticker Messages ──────────────────────────────────────────────────────

export const TICKER_MESSAGES: TickerMessage[] = [
  // Radio Trivia
  { id: "tick-1", text: "More than 44,000 radio stations broadcast across the globe every single day, connecting listeners in every time zone from Tokyo to Toronto to Timbuktu", type: "trivia" },
  { id: "tick-2", text: "The very first radio broadcast took place on Christmas Eve, 1906 \u2014 Canadian inventor Reginald Fessenden transmitted voice and violin music to stunned ship operators across the Atlantic", type: "trivia" },
  { id: "tick-3", text: "FM radio was invented by Edwin Armstrong in 1933, promising clearer sound and less static \u2014 yet it took decades for the format to overtake AM as the dominant broadcast standard", type: "trivia" },
  { id: "tick-4", text: "BBC Radio 2 holds the title of the most listened-to radio station on the planet, drawing over 14 million weekly listeners with its eclectic mix of music, talk, and culture", type: "trivia" },
  { id: "tick-5", text: "Internet radio first emerged in the early 1990s, and today thousands of online stations stream 24/7, letting anyone with a connection tune into broadcasts from the other side of the world", type: "trivia" },
  { id: "tick-6", text: "The word 'radio' traces back to the Latin 'radius,' meaning a ray of light \u2014 a fitting origin for a technology that beams invisible waves across continents at the speed of light", type: "trivia" },
  { id: "tick-7", text: "Radio reaches an estimated 3.9 billion people worldwide, making it the single most accessible medium on Earth \u2014 more than television, more than the internet, more than print", type: "trivia" },
  { id: "tick-8", text: "The Grand Ole Opry has been broadcasting live from Nashville since 1925, making it the longest-running radio program in history and a cornerstone of American country music", type: "trivia" },
  { id: "tick-9", text: "Shortwave radio signals can travel around the entire globe by bouncing off the ionosphere, which is why Cold War\u2013era broadcasts could reach listeners thousands of miles from any transmitter", type: "trivia" },
  { id: "tick-10", text: "Community radio stations now operate in over 130 countries, giving a voice to local communities, indigenous cultures, and underrepresented groups who are often overlooked by mainstream media", type: "trivia" },
  { id: "tick-11", text: "During its golden age from the 1920s through the 1950s, radio was the centerpiece of family entertainment \u2014 families gathered around the receiver for dramas, comedies, news, and live music before television arrived", type: "trivia" },
  { id: "tick-12", text: "Studies show that over 85% of the US population still tunes into radio at least once per week, proving that even in the streaming era, broadcast radio remains deeply woven into daily life", type: "trivia" },

  // DLM Promos
  { id: "tick-p1", text: "DLM Director brings elite AI cinematography to your fingertips \u2014 direct the impossible with an engine that thinks in scenes, not just frames, and transforms your creative vision into cinematic reality", type: "promo" },
  { id: "tick-p2", text: "PowerWrite turns your ideas into fully published books \u2014 what used to take ten months now takes ten minutes, with AI-powered writing, formatting, and publishing built into a single seamless workflow", type: "promo" },
  { id: "tick-p3", text: "Nebula X is the AI coding agent that never sleeps \u2014 access 75+ AI providers through a single intelligent agent that writes, debugs, and ships production code with the precision of a senior engineer", type: "promo" },
  { id: "tick-p4", text: "DLM Broadcast delivers 100+ live channels with zero subscriptions and zero ads \u2014 the future of software-defined television is here, bringing you curated content from around the world on demand", type: "promo" },
  { id: "tick-p5", text: "The AI Music Generator lets you compose original tracks that genuinely move people \u2014 describe a mood, set a genre, and watch as AI creates studio-quality compositions in moments", type: "promo" },
  { id: "tick-p6", text: "Voice Designer crafts broadcast-ready voices in seconds \u2014 where clarity meets creativity, you can design, refine, and cast AI voices for any project from podcasts to audiobooks to film", type: "promo" },
  { id: "tick-p7", text: "Audio Workstation X packs $4,000 worth of professional production power starting at just $8.25 a month \u2014 a full-featured audio suite built for musicians, producers, and podcasters", type: "promo" },
  { id: "tick-p8", text: "DLM Books presents a curated collection of 27 AI-generated titles with over 171,000 reviews \u2014 stories, guides, and ideas that transform how you think about the world", type: "promo" },
  { id: "tick-p9", text: "DLM Video Agent lets you ship professional motion graphics at the speed of thought \u2014 go from code to cinema with an intelligent pipeline that handles rendering, effects, and export", type: "promo" },
  { id: "tick-p10", text: "Nebula X Web is the AI app builder that turns descriptions into working applications \u2014 simply describe what you want to build and watch it materialize in your browser in real time", type: "promo" },
  { id: "tick-p11", text: "DLM Video Editor brings professional-grade editing directly to your browser \u2014 no downloads, no installs, no limits, just powerful tools that work anywhere on any platform", type: "promo" },

  // Music & Audio Science
  { id: "tick-f1", text: "Neuroscience has revealed that music activates every known region of the brain simultaneously \u2014 no other human activity lights up the auditory, motor, emotional, and memory centers all at once", type: "fact" },
  { id: "tick-f2", text: "When you listen to music you love, your brain releases dopamine, the same neurochemical triggered by food, romance, and reward \u2014 explaining why a perfect song can feel genuinely euphoric", type: "fact" },
  { id: "tick-f3", text: "The average person listens to roughly 18 hours of music every week, which adds up to nearly 40 full days each year spent immersed in melody, rhythm, and harmony", type: "fact" },
  { id: "tick-f4", text: "The human ear is a remarkable instrument \u2014 it can distinguish over 400,000 distinct sounds, detect frequencies from 20 Hz to 20,000 Hz, and perceive timing differences as small as 10 microseconds", type: "fact" },
  { id: "tick-f10", text: "A blue whale\u2019s call registers at 188 decibels and can travel over 800 kilometers through the ocean \u2014 making it the loudest sound produced by any living creature on Earth", type: "fact" },
  { id: "tick-f5", text: "The warmth of vinyl comes from subtle harmonic distortion that compresses and rounds the sound wave \u2014 imperfections that our ears perceive as rich, full, and naturally pleasing", type: "fact" },
  { id: "tick-f6", text: "Your heartbeat naturally synchronizes with the tempo of the music you\u2019re listening to \u2014 fast tempos raise your pulse while slow, ambient tracks can lower it into a state of deep relaxation", type: "fact" },
  { id: "tick-f7", text: "The cochlea in your inner ear is roughly the size of a pea, yet it contains over 15,000 microscopic hair cells that translate vibrations into electrical signals your brain interprets as sound", type: "fact" },
  { id: "tick-f8", text: "Sound cannot travel through a vacuum, making outer space completely, absolutely silent \u2014 astronauts report that the quiet of space is one of the most profound experiences a human can have", type: "fact" },
  { id: "tick-f9", text: "Binaural beats create a fascinating auditory illusion \u2014 when each ear hears a slightly different frequency, the brain perceives a third, phantom tone that can influence focus, relaxation, and sleep", type: "fact" },

  // Music History Milestones
  { id: "tick-h1", text: "In a remarkable cultural reversal, vinyl records outsold CDs for the first time since 1986 when the year 2020 saw collectors and audiophiles drive a resurgence in analog music", type: "history" },
  { id: "tick-h2", text: "The Beatles hold the record for the most number-one hits on the Billboard Hot 100 \u2014 a legacy that continues to influence songwriters, producers, and musicians more than sixty years later", type: "history" },
  { id: "tick-h3", text: "Ludwig van Beethoven composed many of his greatest masterpieces, including the Ninth Symphony, while nearly completely deaf \u2014 a testament to the power of inner musical vision", type: "history" },
  { id: "tick-h4", text: "Spotify launched in 2008 from a small apartment in Stockholm, Sweden, and has since grown to serve over 600 million users worldwide, fundamentally reshaping how humanity discovers and consumes music", type: "history" },
  { id: "tick-h5", text: "The Sony Walkman, released in July 1979, forever changed the relationship between music and movement \u2014 for the first time, people could carry their personal soundtrack wherever they went", type: "history" },
  { id: "tick-h6", text: "The very first music video aired on MTV was 'Video Killed the Radio Star' by The Buggles on August 1, 1981 \u2014 a prophetic title that ushered in the visual music revolution", type: "history" },
  { id: "tick-h7", text: "The oldest known musical instrument is a 40,000-year-old bone flute discovered in a cave in southern Germany, proving that music has been central to human culture since the Ice Age", type: "history" },
  { id: "tick-h8", text: "The Columbia Records introduction of the 33\u2153 RPM long-playing record in 1948 transformed music forever \u2014 for the first time, an entire symphony or album could fit on a single disc", type: "history" },

  // Famous Quotes About Music
  { id: "tick-q1", text: "\u201cWhere words fail, music speaks.\u201d \u2014 Hans Christian Andersen, capturing the timeless truth that melody reaches places language never can", type: "quote" },
  { id: "tick-q2", text: "\u201cWithout music, life would be a mistake.\u201d \u2014 Friedrich Nietzsche, a philosopher who believed that art and music were humanity\u2019s highest forms of expression and meaning", type: "quote" },
  { id: "tick-q3", text: "\u201cOne good thing about music: when it hits you, you feel no pain.\u201d \u2014 Bob Marley, whose reggae rhythms proved that music could heal, unite, and inspire movements around the world", type: "quote" },
  { id: "tick-q4", text: "\u201cMusic gives a soul to the universe, wings to the mind, flight to the imagination, and life to everything.\u201d \u2014 Plato, who understood over two millennia ago that sound shapes reality itself", type: "quote" },
  { id: "tick-q5", text: "\u201cMusic expresses that which cannot be said and on which it is impossible to be silent.\u201d \u2014 Victor Hugo, articulating why we turn to song in moments of joy, grief, love, and longing", type: "quote" },
  { id: "tick-q6", text: "\u201cAfter silence, that which comes nearest to expressing the inexpressible is music.\u201d \u2014 Aldous Huxley, who saw music as the bridge between human emotion and the infinite", type: "quote" },

  // Listening Wellness
  { id: "tick-w1", text: "Research shows that listening to music for just 30 minutes a day can measurably lower blood pressure, reduce cortisol levels, and contribute to long-term cardiovascular health", type: "wellness" },
  { id: "tick-w2", text: "Music therapy is now clinically proven to reduce anxiety, accelerate recovery after surgery, and help manage chronic pain \u2014 hospitals worldwide are integrating it into standard patient care", type: "wellness" },
  { id: "tick-w3", text: "Slow-tempo music between 60 and 80 BPM can naturally reduce your heart rate, slow breathing, and calm the nervous system \u2014 making it one of the most accessible relaxation tools available", type: "wellness" },
  { id: "tick-w4", text: "Studies have found that playing background music during focused work can boost productivity by up to 15 percent, particularly on repetitive tasks that benefit from sustained attention and rhythm", type: "wellness" },
  { id: "tick-w5", text: "Singing along to your favorite songs does more than lift your mood \u2014 it strengthens the immune system by increasing production of immunoglobulin A, an antibody that helps fight infections", type: "wellness" },
  { id: "tick-w6", text: "Music with a tempo around 60 BPM can synchronize brain waves into the alpha frequency range, producing a calm, meditative state similar to what\u2019s achieved through deep breathing exercises", type: "wellness" },
];

// ── Context Facts (keyed by country code or genre) ───────────────────────

export const CONTEXT_FACTS: ContextFact[] = [
  // Country facts
  { id: "ctx-us", countryCode: "US", fact: "The United States has over 15,000 licensed radio stations, more than any other country." },
  { id: "ctx-gb", countryCode: "GB", fact: "The BBC began radio broadcasts in 1922, making it one of the oldest broadcasters on Earth." },
  { id: "ctx-jp", countryCode: "JP", fact: "Japan\u2019s NHK radio has broadcast continuously since 1925, surviving earthquakes and wars." },
  { id: "ctx-br", countryCode: "BR", fact: "Brazil\u2019s R\u00e1dio Nacional has been broadcasting since 1936 and reaches every corner of the country." },
  { id: "ctx-de", countryCode: "DE", fact: "Germany has 385 registered radio stations and is home to some of the world\u2019s finest electronic music." },
  { id: "ctx-fr", countryCode: "FR", fact: "France Musique broadcasts classical, jazz, and world music 24/7 across the entire country." },
  { id: "ctx-in", countryCode: "IN", fact: "All India Radio broadcasts in 23 languages and 179 dialects, reaching 99.19% of the population." },
  { id: "ctx-au", countryCode: "AU", fact: "Australia\u2019s Triple J has launched the careers of countless artists through its annual Hottest 100." },
  { id: "ctx-ng", countryCode: "NG", fact: "Nigeria has over 200 radio stations, and radio remains the most trusted source of information." },
  { id: "ctx-mx", countryCode: "MX", fact: "Mexico\u2019s XEW, the \u201cVoice of Latin America,\u201d has been broadcasting since 1930." },
  { id: "ctx-kr", countryCode: "KR", fact: "South Korea\u2019s KBS radio has been the heartbeat of Korean culture since 1927." },
  { id: "ctx-za", countryCode: "ZA", fact: "South Africa broadcasts radio in 11 official languages across its diverse population." },
  { id: "ctx-eg", countryCode: "EG", fact: "Egypt\u2019s Um Kalthoum radio concerts in the 1960s brought entire cities to a standstill." },
  { id: "ctx-it", countryCode: "IT", fact: "Italy has over 1,200 local radio stations, more per capita than nearly any country in Europe." },
  { id: "ctx-se", countryCode: "SE", fact: "Sweden\u2019s music exports per capita are the highest in the world, behind only the US and UK in total." },
  { id: "ctx-ca", countryCode: "CA", fact: "Canadian content regulations require at least 35% of music on commercial radio to be by Canadian artists." },
  { id: "ctx-ar", countryCode: "AR", fact: "Argentina\u2019s tango was declared an Intangible Cultural Heritage by UNESCO in 2009." },
  { id: "ctx-nl", countryCode: "NL", fact: "The Netherlands is the birthplace of hardstyle and a global hub for electronic dance music festivals." },
  { id: "ctx-es", countryCode: "ES", fact: "Spain\u2019s flamenco tradition dates back over 500 years and is recognized by UNESCO as a cultural masterpiece." },
  { id: "ctx-tr", countryCode: "TR", fact: "Turkey bridges East and West musically, blending Ottoman classical traditions with modern Anatolian rock." },
  { id: "ctx-ru", countryCode: "RU", fact: "Russia\u2019s classical tradition produced Tchaikovsky, Rachmaninoff, and Stravinsky \u2014 pillars of orchestral music." },
  { id: "ctx-th", countryCode: "TH", fact: "Thailand\u2019s Luk Thung genre has been the country\u2019s most popular music style for over 50 years." },
  { id: "ctx-co", countryCode: "CO", fact: "Colombia gave the world cumbia and vallenato \u2014 rhythms that shaped Latin music across the Americas." },
  { id: "ctx-ke", countryCode: "KE", fact: "Kenya\u2019s radio stations broadcast in over 60 languages, connecting one of Africa\u2019s most diverse nations." },
  { id: "ctx-pt", countryCode: "PT", fact: "Portugal\u2019s Fado music, known as the soul of Lisbon, became a UNESCO heritage in 2011." },
  { id: "ctx-pl", countryCode: "PL", fact: "Poland has one of Europe\u2019s richest classical traditions, from Chopin to Penderecki." },
  { id: "ctx-ie", countryCode: "IE", fact: "Ireland\u2019s traditional music sessions in pubs have kept Celtic melodies alive for centuries." },
  { id: "ctx-jm", countryCode: "JM", fact: "Jamaica\u2019s musical influence per capita is unmatched \u2014 ska, rocksteady, reggae, and dancehall all originated here." },
  { id: "ctx-cu", countryCode: "CU", fact: "Cuba\u2019s Buena Vista Social Club brought the island\u2019s son and bolero traditions to a worldwide audience." },
  { id: "ctx-gh", countryCode: "GH", fact: "Ghana\u2019s highlife music pioneered the fusion of African rhythms with Western instruments in the early 1900s." },
  // Genre facts
  { id: "ctx-jazz", genre: "jazz", fact: "Jazz originated in New Orleans in the early 20th century, blending African rhythms with European harmony." },
  { id: "ctx-electronic", genre: "electronic", fact: "Kraftwerk\u2019s 1974 album Autobahn is considered the birth of electronic music as a genre." },
  { id: "ctx-classical", genre: "classical", fact: "Mozart composed over 600 works before his death at 35, including 41 symphonies." },
  { id: "ctx-rock", genre: "rock", fact: "Rock and roll emerged in the 1950s from rhythm and blues, country, and gospel traditions." },
  { id: "ctx-hiphop", genre: "hip-hop", fact: "Hip-hop was born in the Bronx in 1973 at a back-to-school party hosted by DJ Kool Herc." },
  { id: "ctx-pop", genre: "pop", fact: "Pop music accounts for over 30% of global music consumption, making it the most listened-to genre." },
  { id: "ctx-reggae", genre: "reggae", fact: "Reggae originated in Jamaica in the late 1960s and was declared a UNESCO cultural treasure in 2018." },
  { id: "ctx-blues", genre: "blues", fact: "The blues originated in the Mississippi Delta and is the foundation of virtually all modern Western music." },
  { id: "ctx-country", genre: "country", fact: "Country music traces its roots to Appalachian folk songs brought by Scots-Irish immigrants in the 1700s." },
  { id: "ctx-rnb", genre: "r&b", fact: "R&B evolved from gospel, jazz, and blues in the 1940s and remains the backbone of modern pop and hip-hop." },
  { id: "ctx-latin", genre: "latin", fact: "Latin music became the fastest-growing genre globally, with reggaeton driving a 30% annual streaming increase." },
  { id: "ctx-folk", genre: "folk", fact: "Folk music is humanity\u2019s oldest genre, passed through oral tradition for thousands of years before recording." },
  { id: "ctx-metal", genre: "metal", fact: "Heavy metal was pioneered by Black Sabbath in 1970, and Finland has the most metal bands per capita on Earth." },
  { id: "ctx-ambient", genre: "ambient", fact: "Brian Eno coined the term \u2018ambient music\u2019 in 1978, designing it to be \u2018as ignorable as it is interesting.\u2019" },
  { id: "ctx-funk", genre: "funk", fact: "Funk was born in the mid-1960s when James Brown shifted the musical emphasis from melody to rhythm." },
  { id: "ctx-world", genre: "world", fact: "World music encompasses traditional and contemporary sounds from every continent, celebrating cultural diversity." },
];
