// lib/types/production.ts

export interface GenreWeight {
  genre: string;                // 'boom bap', 'jazz', 'gospel', 'trap', 'psych rock'
  weight: number;               // 0-1, weights sum to 1
  /** What specifically comes from this genre — instrument, rhythm, or texture. */
  contribution: string;
}

export interface SampleSource {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  flipType: 'chop' | 'loop' | 'pitch-shift' | 'interpolation' | 'replay';
  /** Exactly what was taken: 'the four-bar horn stab', 'the vocal ad-lib'. */
  whatWasTaken: string;
  timestampInOriginal?: string;
  /** Samples can themselves sample — this makes the graph a graph, not a list. */
  sampledFrom?: string[];
}

export interface SongSection {
  id: string;
  kind: 'intro' | 'verse' | 'pre' | 'hook' | 'bridge' | 'outro' | 'skit';
  label: string;                // 'Verse 2'
  startBar: number;
  endBar: number;
  lineIds: string[];            // aligns the lyric column to song structure
  /** Where the beat changes under the same verse — flow switches usually land here. */
  beatSwitch?: boolean;
}

export interface TrackProduction {
  producers: string[];
  bpm: number;
  musicalKey: string;           // 'F# minor'
  timeSignature: string;        // '4/4'
  /** Rendered as an interactive stacked bar, not a sentence. */
  genreBlend: GenreWeight[];
  samples: SampleSource[];
  drumPalette: string[];        // '808', 'live kit', 'SP-1200 swing', 'no snare'
  instrumentation: string[];
  /** 'dry vocal, heavy sidechain, no reverb tail' — how the record was mixed. */
  mixCharacter: string;
  /** What was happening in rap production that year, so the choices have context. */
  eraContext: string;
  sections: SongSection[];
  /** How the rapping sits against the drums, tying the archive back to the sequencer. */
  vocalPlacement: string;
}
