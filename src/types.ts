export type Locale = 'en-US' | 'de-DE';

export interface Song {
  index: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  likes: number;
  coverSeed: number;
}

export interface LocaleData {
  titlePrefixes: string[];
  titleSuffixes: string[];
  artistFirst: string[];
  artistLast: string[];
  bandWords: string[];
  albumWords: string[];
  genres: string[];
  reviews: string[];
}
