// lib/types/archive.ts
import type { DeviceInstance } from './devices';
import type { TrackProduction } from './production';
import type { Lang, TokenAnalysis } from './phonetics';

export interface ArchiveArtist {
  id: string;
  name: string;
  aka: string[];
  origin: string;
  activeSince: number;
  /** Why they matter technically, not biographically. */
  thesis: string;
  albums: Album[];
  accentColor: string;
}

export interface Album {
  id: string;
  title: string;
  year: number;
  kind: 'album' | 'mixtape' | 'ep' | 'compilation';
  label: string;
  tracks: Track[];
}

export interface Track {
  id: string;
  title: string;
  trackNumber: number;
  features: string[];
  /** Present only for the fully dissected reference song per artist. */
  lyrics?: LyricLine[];
  production?: TrackProduction;
  isReference: boolean;
}

export interface LyricLine {
  id: string;
  /** Bar index within the song, so 4-bar blocks can be selected as a unit. */
  barIndex: number;
  sectionId: string;
  text: string;
  /** Dominant language of the line; individual tokens may differ. */
  lang: Lang;
  dissection: Dissection | null;
}

export interface Entendre {
  reading: string;
  layer: 'literal' | 'figurative' | 'cultural' | 'meta';
  /** Span within LyricLine.text that carries this reading. */
  charStart: number;
  charEnd: number;
}

/** Tier 1 output — every field here is computed, never generated. */
export interface RhythmAnalysis {
  syllableCount: number;
  tokens: TokenAnalysis[];
  /** Rhyme-scheme letter for the line end, e.g. 'A'. */
  schemeLetter: string;
  internalRhymes: { aSpan: [number, number]; bSpan: [number, number]; score: number }[];
  assonanceChains: { key: string; spans: [number, number][] }[];
  /** Syllables per bar — the objective measure of "dense" vs "spacious". */
  density: number;
  /** Where the syllables actually land against the grid. */
  slotMap: (string | null)[];
  pocket: 'ahead' | 'in' | 'behind' | 'mixed';
  articulation: 'staccato' | 'legato' | 'mixed';
}

export interface Dissection {
  lineId: string;
  /** Tier 1, deterministic. Always present, even with no API key. */
  rhythm: RhythmAnalysis;
  /** Tier 2, interpretive. Null until generated or authored. */
  meaning: string | null;
  entendres: Entendre[];
  flowMechanics: string | null;
  rhymeScience: string | null;
  why: string | null;
  devices: DeviceInstance[];
  provenance: 'authored' | 'engine' | 'engine+llm';
  schemaVersion: number;
  generatedAt: string | null;
}
