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
  { id: "tick-1", text: "Over 44,000 radio stations broadcast worldwide every day", type: "trivia" },
  { id: "tick-2", text: "The first radio broadcast was on Christmas Eve, 1906", type: "trivia" },
  { id: "tick-3", text: "FM radio was invented by Edwin Armstrong in 1933", type: "trivia" },
  { id: "tick-4", text: "The most listened-to radio station in the world is BBC Radio 2", type: "trivia" },
  { id: "tick-5", text: "Internet radio began streaming in the early 1990s", type: "trivia" },
  { id: "tick-6", text: "The word 'radio' comes from the Latin 'radius', meaning ray of light", type: "trivia" },
  { id: "tick-7", text: "Japan has over 1,200 registered radio stations", type: "trivia" },
  { id: "tick-8", text: "Brazil has the second-most radio stations in the world, after the United States", type: "trivia" },
  { id: "tick-9", text: "Radio reaches 3.9 billion people worldwide \u2014 more than any other medium", type: "trivia" },
  { id: "tick-10", text: "The longest-running radio show is the Grand Ole Opry, broadcasting since 1925", type: "trivia" },
  { id: "tick-11", text: "Shortwave radio signals can travel around the entire globe by bouncing off the ionosphere", type: "trivia" },
  { id: "tick-12", text: "Community radio stations operate in over 130 countries as a voice for local communities", type: "trivia" },
  { id: "tick-13", text: "The golden age of radio spanned the 1920s through the 1950s, before television took over", type: "trivia" },
  { id: "tick-14", text: "Over 85% of the US population listens to radio at least once per week", type: "trivia" },

  // DLM Promos
  { id: "tick-p1", text: "DLM Director \u2014 AI cinematography that thinks in scenes", type: "promo" },
  { id: "tick-p2", text: "PowerWrite \u2014 from idea to published book in minutes", type: "promo" },
  { id: "tick-p3", text: "Nebula X \u2014 the AI coding agent that thinks in nebulae", type: "promo" },
  { id: "tick-p4", text: "DLM Broadcast \u2014 100+ live channels, zero subscriptions", type: "promo" },
  { id: "tick-p5", text: "AI Music Generator \u2014 compose original tracks that move people", type: "promo" },
  { id: "tick-p6", text: "Voice Designer \u2014 broadcast-ready voices crafted in seconds", type: "promo" },
  { id: "tick-p7", text: "Audio Workstation X \u2014 $4,000 of production power from $8.25/mo", type: "promo" },
  { id: "tick-p8", text: "DLM Books \u2014 stories that transform how you think", type: "promo" },
  { id: "tick-p9", text: "DLM Video Agent \u2014 ship motion graphics at the speed of thought", type: "promo" },
  { id: "tick-p10", text: "Nebula X Web \u2014 describe what you want to build, watch it materialize", type: "promo" },
  { id: "tick-p11", text: "DLM Video Editor \u2014 professional editing in your browser, no downloads", type: "promo" },

  // Music & Audio Science
  { id: "tick-f1", text: "Music activates every known area of the brain simultaneously", type: "fact" },
  { id: "tick-f2", text: "Listening to music releases dopamine, the same chemical triggered by food and love", type: "fact" },
  { id: "tick-f3", text: "The average person listens to 18 hours of music per week", type: "fact" },
  { id: "tick-f4", text: "Sound travels at 343 meters per second through air at room temperature", type: "fact" },
  { id: "tick-f5", text: "The human ear can distinguish over 400,000 different sounds", type: "fact" },
  { id: "tick-f6", text: "A blue whale\u2019s call at 188 dB can be heard over 800 kilometers away", type: "fact" },
  { id: "tick-f7", text: "Vinyl warmth comes from harmonic distortion that our ears find naturally pleasing", type: "fact" },
  { id: "tick-f8", text: "Your heartbeat synchronizes to the tempo of the music you\u2019re listening to", type: "fact" },
  { id: "tick-f9", text: "The cochlea in your inner ear is roughly the size of a pea but contains 15,000 hair cells", type: "fact" },
  { id: "tick-f10", text: "Sound cannot travel through a vacuum \u2014 space is completely silent", type: "fact" },
  { id: "tick-f11", text: "The quietest place on earth is an anechoic chamber at Microsoft, measuring \u22120.5 dB", type: "fact" },
  { id: "tick-f12", text: "Binaural beats occur when each ear hears a slightly different frequency, creating a perceived third tone", type: "fact" },

  // Music History Milestones
  { id: "tick-h1", text: "Vinyl records outsold CDs for the first time since 1986 in the year 2020", type: "history" },
  { id: "tick-h2", text: "The Beatles hold the record for most No. 1 hits on the Billboard Hot 100", type: "history" },
  { id: "tick-h3", text: "Beethoven composed his greatest works while almost completely deaf", type: "history" },
  { id: "tick-h4", text: "The first commercial MP3 player was released in 1998 by SaeHan Information Systems", type: "history" },
  { id: "tick-h5", text: "Spotify launched in 2008 in Sweden and now serves over 600 million users worldwide", type: "history" },
  { id: "tick-h6", text: "The 33\u2153 RPM vinyl record was introduced by Columbia Records in 1948", type: "history" },
  { id: "tick-h7", text: "The Walkman, released by Sony in 1979, changed how the world experienced portable music", type: "history" },
  { id: "tick-h8", text: "The first music video aired on MTV was 'Video Killed the Radio Star' on August 1, 1981", type: "history" },
  { id: "tick-h9", text: "The oldest known musical instrument is a 40,000-year-old bone flute found in a German cave", type: "history" },
  { id: "tick-h10", text: "The global music industry surpassed $28 billion in annual revenue in 2023", type: "history" },

  // Famous Quotes About Music
  { id: "tick-q1", text: "\u201cWhere words fail, music speaks.\u201d \u2014 Hans Christian Andersen", type: "quote" },
  { id: "tick-q2", text: "\u201cMusic is the universal language of mankind.\u201d \u2014 Henry Wadsworth Longfellow", type: "quote" },
  { id: "tick-q3", text: "\u201cWithout music, life would be a mistake.\u201d \u2014 Friedrich Nietzsche", type: "quote" },
  { id: "tick-q4", text: "\u201cOne good thing about music: when it hits you, you feel no pain.\u201d \u2014 Bob Marley", type: "quote" },
  { id: "tick-q5", text: "\u201cMusic expresses that which cannot be said and on which it is impossible to be silent.\u201d \u2014 Victor Hugo", type: "quote" },
  { id: "tick-q6", text: "\u201cAfter silence, that which comes nearest to expressing the inexpressible is music.\u201d \u2014 Aldous Huxley", type: "quote" },
  { id: "tick-q7", text: "\u201cMusic gives a soul to the universe, wings to the mind, flight to the imagination.\u201d \u2014 Plato", type: "quote" },
  { id: "tick-q8", text: "\u201cI don\u2019t sing because I\u2019m happy; I\u2019m happy because I sing.\u201d \u2014 William James", type: "quote" },

  // Listening Wellness
  { id: "tick-w1", text: "Listening to music for 30 minutes a day has been shown to lower blood pressure", type: "wellness" },
  { id: "tick-w2", text: "Music therapy is clinically proven to reduce anxiety and improve recovery after surgery", type: "wellness" },
  { id: "tick-w3", text: "Slow-tempo music can reduce your heart rate and calm the nervous system", type: "wellness" },
  { id: "tick-w4", text: "Playing background music can boost productivity by up to 15% on repetitive tasks", type: "wellness" },
  { id: "tick-w5", text: "Singing along to music strengthens the immune system by increasing immunoglobulin A", type: "wellness" },
  { id: "tick-w6", text: "Music with 60 BPM can synchronize brain waves to produce alpha-wave relaxation", type: "wellness" },
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
