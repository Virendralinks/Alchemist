// lib/mock/dissections/zero-to-100.ts
// Drake — "0 to 100 / The Catch Up" (2014), prod. Boi-1da, Nineteen85, Frank Dukes, Vinylz.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 90;
const TRACK_ID = '0-to-100-1';

export const zeroToHundredLines = authoredLines(TRACK_ID, BPM, [
  {
    text: "That's when they smile in my face",
    sectionId: 'verse-1',
    meaning:
      'Success converts hostility into friendliness, which he reads as evidence of the hostility rather than its end.',
    flowMechanics:
      'A short entry bar that sits well behind the beat, establishing the unhurried pocket the verse then breaks.',
    rhymeScience:
      'Opens the /eɪ/ tail that runs through the next several bars.',
    why: 'Starting on other people\'s behaviour rather than his own makes the boast a diagnosis.',
    devices: [
      {
        deviceId: 'irony',
        span: 'smile in my face',
        explanation:
          'The friendly gesture is presented as the proof of its own insincerity.',
      },
    ],
  },
  {
    text: 'Whole time they wanna take my place',
    sectionId: 'verse-1',
    meaning:
      'The motive behind the smile, stated flatly — no accusation, just the mechanism.',
    flowMechanics:
      'Matches the previous bar\'s length and stress placement exactly, which makes the pair read as one thought.',
    rhymeScience:
      '"Place" closes a clean /eɪs/ pair with "face", the tightest rhyme in the section.',
    why: 'The symmetry between the two bars is what makes the reversal feel like it was always there.',
    devices: [
      {
        deviceId: 'perfect-rhyme',
        span: 'place',
        explanation:
          'Full rhyme with "face" — identical from the stressed vowel onward.',
      },
      {
        deviceId: 'parallelism',
        span: 'Whole time they wanna take my place',
        explanation:
          'Same shape as the preceding bar, which is what lets the content flip without the form changing.',
      },
    ],
    entendres: [
      {
        span: 'take my place',
        layer: 'literal',
        reading: 'Physically occupy the position he stands in.',
      },
      {
        span: 'take my place',
        layer: 'meta',
        reading:
          'Assume his rank in the genre — the chart position and the cultural role.',
      },
    ],
  },
  {
    text: "I'm just feelin' like the throne is for the taking, watch me take it",
    sectionId: 'verse-1',
    meaning:
      'A direct claim on the top position, framed as observation rather than ambition and then converted to an instruction.',
    flowMechanics:
      'The bar runs long and then stops hard on a three-syllable tag, so the claim and the dare are rhythmically separate.',
    rhymeScience:
      '"Taking" and "take it" are the same sound in different grammar, which closes the bar on itself rather than on a new word.',
    why: 'Ending on the imperative turns a boast into a challenge, which is what the second half of the record is built to answer.',
    devices: [
      {
        deviceId: 'polyptoton',
        span: 'taking, watch me take it',
        explanation:
          'The same verb in two forms adjacent, so the rhyme and the escalation are the same event.',
      },
      {
        deviceId: 'metonymy',
        span: 'the throne',
        explanation:
          'The seat stands for the rank, and for a specific prior record that claimed it.',
      },
      {
        deviceId: 'sample-reference',
        span: 'the throne',
        explanation:
          'Points at Watch the Throne, which makes the following "watch me" a deliberate echo.',
        confidence: 'arguable',
      },
    ],
    entendres: [
      {
        span: 'watch me take it',
        layer: 'literal',
        reading: 'An invitation to observe him claim the position.',
      },
      {
        span: 'watch me take it',
        layer: 'meta',
        reading:
          'Reads "Watch the Throne" back at its authors — watch, and watch me take that too.',
      },
    ],
  },
  {
    text: '0 to 100, real quick',
    sectionId: 'hook',
    meaning:
      "Escalation with no intermediate stage, used as the record's organising image for both temper and career.",
    flowMechanics:
      'Four heavy syllables and then a two-syllable tag, which is short enough to function as a chant rather than a line.',
    rhymeScience:
      'No rhyme at all — the phrase works on rhythm and repetition, which is why it detached from the song entirely.',
    why: 'A hook with no rhyme obligation can be repeated at any point in the record without needing a partner bar.',
    devices: [
      {
        deviceId: 'refrain',
        span: '0 to 100, real quick',
        explanation:
          "The record's recurring anchor, returning between verses and inside them.",
      },
      {
        deviceId: 'metaphor',
        span: '0 to 100',
        explanation:
          'Acceleration borrowed from a car speedometer and applied to temperament and career trajectory at once.',
      },
      {
        deviceId: 'aave-grammar',
        span: 'real quick',
        explanation:
          'Adverbial "real" without the standard -ly, which is what keeps the phrase spoken rather than written.',
        confidence: 'arguable',
      },
    ],
  },
]);

export const zeroToHundredProduction: TrackProduction = {
  producers: ['Boi-1da', 'Nineteen85', 'Frank Dukes', 'Vinylz'],
  bpm: BPM,
  musicalKey: 'G minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'trap',
      weight: 0.4,
      contribution:
        'The 808 pattern and hat subdivisions carrying the first half.',
    },
    {
      genre: 'soul',
      weight: 0.35,
      contribution:
        'The sampled vocal and keys that the second half hands the record over to.',
    },
    {
      genre: 'boom bap',
      weight: 0.25,
      contribution:
        'The snare placement in "The Catch Up", which drops the trap grid entirely.',
    },
  ],
  samples: [
    {
      id: 'zero-to-100-jaded',
      title: 'Come Live With Me Angel',
      artist: 'James Brown',
      year: 1976,
      genre: 'soul',
      flipType: 'chop',
      whatWasTaken:
        'A vocal and keyboard phrase, chopped into the beat behind the hook.',
    },
  ],
  drumPalette: ['808 sub', 'rolling hats', 'clap'],
  instrumentation: ['bass synth', 'sampled keys', 'sustained pad'],
  mixCharacter:
    'Sub-heavy in the first half, then almost drumless in the second — the record is two mixes stitched at the switch.',
  eraContext:
    'Released as the two-part single became a standard format, letting an aggressive record and a reflective one share one title.',
  sections: [],
  vocalPlacement:
    'Drake sits behind the beat in the verse and moves onto the grid for the hook, which is what makes the hook feel like an interruption.',
};

zeroToHundredProduction.sections = [
  {
    id: 'verse-1',
    kind: 'verse',
    label: 'Verse 1',
    startBar: 0,
    endBar: 2,
    lineIds: lineIdsFor(zeroToHundredLines, 'verse-1'),
  },
  {
    id: 'hook',
    kind: 'hook',
    label: 'Hook',
    startBar: 3,
    endBar: zeroToHundredLines.length - 1,
    lineIds: lineIdsFor(zeroToHundredLines, 'hook'),
  },
];
