import { Locale, Song, LocaleData } from '../types';

const dataTemplates: Record<Locale, LocaleData> = {
  "en-US": {
    titlePrefixes: ["Midnight", "Electric", "Shadow", "Golden", "Silent", "Wild", "Cosmic", "Neon", "Broken", "Eternal", "Crystal", "Thunder", "Velvet", "Stellar", "Phantom"],
    titleSuffixes: ["Dreams", "Fire", "Rain", "Love", "Heart", "Soul", "Beat", "Echo", "Rise", "Fall", "Waves", "Stars", "Night", "Horizon", "Pulse"],
    artistFirst: ["John", "Emma", "Michael", "Sophia", "David", "Olivia", "James", "Ava", "Robert", "Isabella", "Ethan", "Mia"],
    artistLast: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Taylor"],
    bandWords: ["The", "Rock", "Soul", "Jazz", "Metal", "Folk", "Blues", "Punk", "Indie", "Electro", "Quantum", "Nova"],
    albumWords: ["Journey", "Echoes", "Horizons", "Shadows", "Vibes", "Pulse", "Harmony", "Rhythm", "Melody", "Symphony", "Legacy", "Reverie"],
    genres: ["Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", "Country", "R&B", "Folk", "Heavy Metal", "Indie", "House"],
    reviews: [
      "This track hits different 🔥 Pure vibes!",
      "Insanely catchy. Already on repeat.",
      "Masterpiece. The production is next level.",
      "Gave me chills from the first second.",
      "Best song I've heard this year. Period."
    ]
  },
  "de-DE": {
    titlePrefixes: ["Mitternacht", "Elektrisch", "Schatten", "Goldener", "Stille", "Wilder", "Kosmischer", "Neon", "Zerbrochener", "Ewiger", "Kristall", "Donner", "Samt", "Sternen", "Phantom"],
    titleSuffixes: ["Träume", "Feuer", "Regen", "Liebe", "Herz", "Seele", "Schlag", "Echo", "Aufstieg", "Fall", "Wellen", "Sterne", "Nacht", "Horizont", "Puls"],
    artistFirst: ["Hans", "Emma", "Michael", "Sophie", "David", "Olivia", "Jakob", "Anna", "Robert", "Isabella", "Lukas", "Mia"],
    artistLast: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Richter", "Wolf"],
    bandWords: ["Die", "Rock", "Seele", "Jazz", "Metall", "Folk", "Blues", "Punk", "Indie", "Elektro", "Quantum", "Nova"],
    albumWords: ["Reise", "Echos", "Horizonte", "Schatten", "Vibes", "Puls", "Harmonie", "Rhythmus", "Melodie", "Symphonie", "Vermächtnis", "Träumerei"],
    genres: ["Rock", "Pop", "Hip Hop", "Elektronisch", "Jazz", "Klassik", "Country", "R&B", "Folk", "Heavy Metal", "Indie", "House"],
    reviews: [
      "Dieser Track ist anders 🔥 Pure Vibes!",
      "Unfassbar eingängig. Schon im Loop.",
      "Meisterwerk. Die Produktion ist Weltklasse.",
      "Hat mir vom ersten Ton Gänsehaut gegeben.",
      "Bester Song des Jahres. Punkt."
    ]
  }
};

// Mulberry32 PRNG
export function createRng(seed: number) {
  return function() {
    seed = seed + 0x6D2B79F5 | 0;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function generateSong(globalIndex: number, userSeed: number, lang: Locale, avgLikes: number): Song {
  const templates = dataTemplates[lang];
  // Deterministic combined seed
  const combined = (BigInt(userSeed) * BigInt(6364136223846793005) + BigInt(globalIndex)) % BigInt(4294967296);
  const rng = createRng(Number(combined));

  const title = `${templates.titlePrefixes[Math.floor(rng() * templates.titlePrefixes.length)]} ${templates.titleSuffixes[Math.floor(rng() * templates.titleSuffixes.length)]}`;
  
  let artist = "";
  if (rng() < 0.65) {
    const first = templates.artistFirst[Math.floor(rng() * templates.artistFirst.length)];
    const last = templates.artistLast[Math.floor(rng() * templates.artistLast.length)];
    artist = `${first} ${last}${rng() < 0.25 ? " Jr." : ""}`;
  } else {
    artist = `The ${templates.bandWords[Math.floor(rng() * templates.bandWords.length)]} Band`;
  }

  let album = "Single";
  if (rng() >= 0.35) {
    const w1 = templates.albumWords[Math.floor(rng() * templates.albumWords.length)];
    const w2 = templates.albumWords[Math.floor(rng() * templates.albumWords.length)];
    album = `${w1} ${w2}`;
  }

  const genre = templates.genres[Math.floor(rng() * templates.genres.length)];
  
  // Deterministic likes based on average
  const likesRng = createRng(globalIndex + 987654321);
  const intPart = Math.floor(avgLikes);
  const frac = avgLikes - intPart;
  const likes = Math.min(intPart + (likesRng() < frac ? 1 : 0), 10);

  return {
    index: globalIndex,
    title,
    artist,
    album,
    genre,
    likes,
    coverSeed: (userSeed + globalIndex * 77) >>> 0
  };
}

export function getReview(index: number, lang: Locale): string {
  const templates = dataTemplates[lang];
  const rng = createRng(index + 555);
  return templates.reviews[Math.floor(rng() * templates.reviews.length)];
}
