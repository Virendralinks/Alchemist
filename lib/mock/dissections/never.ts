// lib/mock/dissections/never.ts
// JID — "NEVER" (2018), prod. Christo.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 148;
const TRACK_ID = 'never-9';

export const neverLines = authoredLines(TRACK_ID, BPM, [
  {
    text: 'Never ran, never will',
    sectionId: 'hook',
    meaning:
      'A refusal spanning past and future in four words, borrowed from a phrase already in circulation and made the record\'s spine.',
    flowMechanics:
      'Two matched two-beat cells, which is what makes the phrase chantable at a tempo this fast.',
    rhymeScience:
      'The repeated "never" is the hook rather than any rhyme; "will" is left open for the following bar to answer.',
    why: 'A hook built from repetition rather than rhyme survives being dropped into any part of the record.',
    devices: [
      {
        deviceId: 'anaphora',
        span: 'Never ran, never will',
        explanation:
          'The same word heads both clauses, which is what gives the phrase its chant structure.',
      },
      {
        deviceId: 'interpolation',
        span: 'Never ran, never will',
        explanation:
          'Reworks an existing phrase from the tradition rather than sampling it, re-voiced over new production.',
      },
      {
        deviceId: 'refrain',
        span: 'Never ran, never will',
        explanation: 'Returns throughout the record as the structural anchor.',
      },
    ],
  },
  {
    text: 'Rap game bloody like a menstrual',
    sectionId: 'verse-1',
    meaning:
      'The industry described through a bodily comparison that is deliberately uncomfortable rather than heroic.',
    flowMechanics:
      'The bar accelerates into a four-syllable landing, which at 148 BPM leaves almost no space after it.',
    rhymeScience:
      '"Menstrual" opens a multisyllabic tail that the next bars answer with matching three-syllable shapes.',
    why: 'Choosing a comparison this unpleasant refuses the usual glamour of a violence metaphor.',
    devices: [
      {
        deviceId: 'simile',
        span: 'bloody like a menstrual',
        explanation:
          'Explicit comparison whose vehicle is chosen for discomfort rather than grandeur.',
      },
      {
        deviceId: 'multisyllabic-rhyme',
        span: 'menstrual',
        explanation:
          'A three-syllable tail that the following bars match whole rather than on the final syllable.',
      },
      {
        deviceId: 'anthimeria',
        span: 'menstrual',
        explanation:
          'An adjective used as a noun, which is what makes the rhyme shape available at all.',
      },
    ],
  },
  {
    text: 'Word to my pencil, sentimental',
    sectionId: 'verse-1',
    meaning:
      'He swears by his writing instrument, placing craft where an oath would normally place family or God.',
    flowMechanics:
      'Two rhyme landings inside one short bar, which is what keeps the density up while the line stays brief.',
    rhymeScience:
      '"Pencil" and "sentimental" both answer "menstrual" on the same three-syllable tail — three consecutive whole-shape rhymes.',
    why: 'Swearing on the pencil is the thesis: the writing is the thing being defended, not the persona.',
    devices: [
      {
        deviceId: 'chain-rhyme',
        span: 'pencil, sentimental',
        explanation:
          'Two more landings on the tail set by "menstrual", extending the chain across the couplet.',
      },
      {
        deviceId: 'metonymy',
        span: 'my pencil',
        explanation:
          'The tool stands for the whole practice of writing and the identity built on it.',
      },
      {
        deviceId: 'internal-rhyme',
        span: 'pencil',
        explanation:
          'Rhymes with "sentimental" inside the same bar rather than waiting for the bar end.',
      },
    ],
  },
]);

export const neverProduction: TrackProduction = {
  producers: ['Christo'],
  bpm: BPM,
  musicalKey: 'D minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'boom bap',
      weight: 0.4,
      contribution:
        'The snare on two and four, which anchors a tempo fast enough to drift.',
    },
    {
      genre: 'trap',
      weight: 0.35,
      contribution:
        'Hat subdivisions and 808 movement under the verse.',
    },
    {
      genre: 'soul',
      weight: 0.25,
      contribution:
        'The sampled vocal texture that opens the record and returns behind the hook.',
    },
  ],
  samples: [],
  drumPalette: ['808 sub', 'snappy snare', 'busy hats'],
  instrumentation: ['sampled vocal texture', 'sub bass', 'sparse keys'],
  mixCharacter:
    'Bright and forward, with the vocal doubled on the hook and left single in the verse so the density change is audible.',
  eraContext:
    'Made when technical rapping was re-emerging commercially, and the record uses tempo as the demonstration rather than the subject.',
  sections: [],
  vocalPlacement:
    'JID rides ahead of the hats in the verse and drops onto the snare for the hook, which is what separates the two sections.',
};

neverProduction.sections = [
  {
    id: 'hook',
    kind: 'hook',
    label: 'Hook',
    startBar: 0,
    endBar: 0,
    lineIds: lineIdsFor(neverLines, 'hook'),
  },
  {
    id: 'verse-1',
    kind: 'verse',
    label: 'Verse 1',
    startBar: 1,
    endBar: neverLines.length - 1,
    lineIds: lineIdsFor(neverLines, 'verse-1'),
  },
];
