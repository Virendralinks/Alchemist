// lib/types/devices.ts

export type DeviceFamily =
  | 'sound'        // assonance, consonance, internal rhyme, mosaic, holorime
  | 'figurative'   // metaphor, metonymy, synecdoche, conceit, litotes
  | 'structural'   // anaphora, epistrophe, chiasmus, enjambment, caesura, volta
  | 'wordplay'     // entendres, homophone puns, zeugma, paraprosdokian
  | 'cultural';    // signifyin', braggadocio, the dozens, code-switching, flips

/** How deep you have to be looking to notice it. Drives the "small or deep or big" filter. */
export type DeviceDepth = 'surface' | 'craft' | 'esoteric';

export interface LiteraryDevice {
  id: string;                   // 'extended-metaphor', kebab-case, stable forever
  name: string;
  family: DeviceFamily;
  depth: DeviceDepth;
  /** Technical definition, using the real terminology. */
  definition: string;
  /** One line, no jargon. Shown first; the technical definition is a disclosure. */
  plainDefinition: string;
  canonicalExample: {
    text: string;
    attribution: string;
    /** Why this example is the canonical one — what to notice. */
    note: string;
  };
  relatedDeviceIds: string[];
  /** Non-null means "Practice this device" appears, loading this into the sequencer. */
  practiceTemplateId: string | null;
  /**
   * True if lib/engine/detect-devices.ts can find it with certainty.
   * False means it is LLM territory and always renders as arguable.
   */
  detectable: boolean;
  /** Devices that only apply to bilingual writing, e.g. cross-language slant rhyme. */
  bilingualOnly?: boolean;
}

export interface DeviceInstance {
  deviceId: string;
  /** Span within the line's text. This is what enables hover-to-highlight. */
  charStart: number;
  charEnd: number;
  /** Why *this* text is *that* device. Never a restatement of the definition. */
  explanation: string;
  detectedBy: 'engine' | 'llm' | 'author';
  confidence: 'certain' | 'arguable';
}
