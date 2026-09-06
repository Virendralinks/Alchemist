// lib/mock/dissections/no-idea.ts
// Don Toliver — "No Idea" (2019), prod. Wallis Lane, Cardo, Yung Exclusive.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 152;
const TRACK_ID = 'no-idea-2';

export const noIdeaLines = authoredLines(TRACK_ID, BPM, [
  {
    text: 'She go crazy when she notice',
    sectionId: 'hook',
    meaning:
      'The reaction is described from outside, with the cause left unnamed — the hook works by withholding its own subject.',
    flowMechanics:
      'Sung rather than rapped, with the syllables stretched across the bar so the melody carries the pocket instead of the drums.',
    rhymeScience:
      '"Notice" sets an /oʊ/ + /əs/ tail that the next bar answers, giving the hook a two-bar loop shape.',
    why: 'Keeping the object vague is what lets the hook attach to whatever the listener brings to it.',
    devices: [
      {
        deviceId: 'aave-grammar',
        span: 'She go crazy',
        explanation:
          'Habitual aspect marked by bare "go", which makes the reaction recurring rather than single.',
      },
      {
        deviceId: 'unreliable-narrator',
        span: 'when she notice',
        explanation:
          'The thing noticed is never specified, so the account is incomplete by design.',
        confidence: 'arguable',
      },
    ],
  },
  {
    text: "I got no idea what you're doing to me",
    sectionId: 'hook',
    meaning:
      'The title line — an admission of not understanding one\'s own state, sung with no attempt to resolve it.',
    flowMechanics:
      'The melody rises across the bar and stops without landing, which is what leaves the hook unresolved.',
    rhymeScience:
      'Ends on an open /iː/ that the arrangement answers instead of a rhyme, letting the beat close the phrase.',
    why: 'Making the hook a confession of confusion rather than a claim is what gives a fast, bright record its melancholy.',
    devices: [
      {
        deviceId: 'refrain',
        span: 'no idea',
        explanation:
          'The title phrase, returning as the record\'s recurring anchor.',
      },
      {
        deviceId: 'apostrophe',
        span: "what you're doing to me",
        explanation:
          'Addressed to an absent second person who never answers.',
      },
    ],
    entendres: [
      {
        span: 'no idea',
        layer: 'literal',
        reading: 'He does not understand what is happening.',
      },
      {
        span: 'no idea',
        layer: 'figurative',
        reading:
          'He has no plan and no intention of forming one — the confusion is the position, not a stage before one.',
      },
    ],
  },
]);

export const noIdeaProduction: TrackProduction = {
  producers: ['Wallis Lane', 'Cardo', 'Yung Exclusive'],
  bpm: BPM,
  musicalKey: 'B minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'trap',
      weight: 0.5,
      contribution:
        'The 808 pattern and hat rolls that keep the record moving under a sung vocal.',
    },
    {
      genre: 'electronic',
      weight: 0.3,
      contribution:
        'The bright synth arpeggio that carries the melodic hook alongside the voice.',
    },
    {
      genre: 'soul',
      weight: 0.2,
      contribution:
        'The vocal layering and harmony stacks behind the lead line.',
    },
  ],
  samples: [],
  drumPalette: ['808 sub', 'triplet hats', 'clap on 3'],
  instrumentation: ['synth arpeggio', 'sub bass', 'stacked vocal harmonies'],
  mixCharacter:
    'Wide and glossy, with heavy vocal layering and reverb — the voice is treated as an instrument in the arrangement rather than sitting in front of it.',
  eraContext:
    'From the point where melodic rap had fully absorbed R&B phrasing, and a record could be structurally a rap song with no rapped section.',
  sections: [],
  vocalPlacement:
    'Toliver floats well behind the hats, which is what makes a 152 BPM record feel slow.',
};

noIdeaProduction.sections = [
  {
    id: 'hook',
    kind: 'hook',
    label: 'Hook',
    startBar: 0,
    endBar: noIdeaLines.length - 1,
    lineIds: lineIdsFor(noIdeaLines, 'hook'),
  },
];
