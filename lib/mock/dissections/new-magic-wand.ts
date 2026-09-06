// lib/mock/dissections/new-magic-wand.ts
// Tyler, The Creator — "NEW MAGIC WAND" (2019), prod. Tyler, The Creator.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 137;
const TRACK_ID = 'new-magic-wand-6';

export const magicWandLines = authoredLines(TRACK_ID, BPM, [
  {
    text: 'I need to get her out the picture',
    sectionId: 'verse-1',
    meaning:
      'A jealous demand stated as logistics, with the violence held inside a bland idiom.',
    flowMechanics:
      'Flat, almost spoken delivery against a distorted synth, so the calm of the line is the disturbing part.',
    rhymeScience:
      'Opens on an /ɪ/ tail that the following bars keep returning to without ever resolving cleanly.',
    why: 'Using the mildest available phrasing for the worst available intention is the song\'s central technique.',
    devices: [
      {
        deviceId: 'litotes',
        span: 'out the picture',
        explanation:
          'An idiom for removal doing duty for something far more serious, which the rest of the song makes explicit.',
      },
      {
        deviceId: 'metonymy',
        span: 'the picture',
        explanation:
          'The frame stands in for the relationship and the life inside it.',
        confidence: 'arguable',
      },
    ],
    entendres: [
      {
        span: 'out the picture',
        layer: 'literal',
        reading: 'No longer present in the situation.',
      },
      {
        span: 'out the picture',
        layer: 'figurative',
        reading:
          'Removed permanently — the reading the song\'s later lines confirm.',
      },
    ],
  },
  {
    text: "She's the one gotta go",
    sectionId: 'verse-1',
    meaning:
      'The decision is presented as already made, with the obligation displaced onto circumstance rather than the speaker.',
    flowMechanics:
      'Short and clipped, dropped into a gap in the synth pattern.',
    rhymeScience:
      '"Go" lands an open /oʊ/ that hangs unresolved, matching the unfinished quality of the thought.',
    why: 'The passive framing is what keeps the narrator sympathetic for one more bar than he deserves.',
    devices: [
      {
        deviceId: 'unreliable-narrator',
        span: "She's the one gotta go",
        explanation:
          'The speaker presents his own choice as an external necessity.',
      },
    ],
  },
  {
    text: "Don't nobody gotta know",
    sectionId: 'verse-1',
    meaning:
      'The move from intention to concealment, which is where the song stops being about jealousy.',
    flowMechanics:
      'Matched exactly to the previous bar, so the escalation happens without any change in delivery.',
    rhymeScience:
      'Full /oʊ/ rhyme with "go", closing the couplet on the same open vowel.',
    why: 'Keeping the rhythm identical while the content escalates is what makes the turn land as a shock.',
    devices: [
      {
        deviceId: 'perfect-rhyme',
        span: 'know',
        explanation: 'Full rhyme with "go" on the open /oʊ/.',
      },
      {
        deviceId: 'aave-grammar',
        span: "Don't nobody gotta know",
        explanation:
          'Negative concord with negative inversion, which places the line in spoken rather than written register.',
      },
      {
        deviceId: 'parallelism',
        span: "Don't nobody gotta know",
        explanation:
          'Same shape as the preceding bar, which is what lets the escalation pass almost unnoticed.',
      },
    ],
  },
  {
    text: 'Please, please, I need her out my life',
    sectionId: 'verse-1',
    meaning:
      'The register collapses from planning into begging, which is where the narrator stops sounding in control.',
    flowMechanics:
      'The doubled word forces two stresses before the bar has started moving, so the line begins already destabilised.',
    rhymeScience:
      '"Life" breaks the /oʊ/ pairing of the previous couplet, and nothing answers it — the section is left open.',
    why: 'Following two flat, controlled bars with an unguarded one is what reveals the calm as performance.',
    devices: [
      {
        deviceId: 'apostrophe',
        span: 'Please, please',
        explanation:
          'A direct appeal to a listener who is never identified and never responds.',
      },
      {
        deviceId: 'persona-shift',
        span: 'Please, please, I need her out my life',
        explanation:
          'The cold planner of the previous bars gives way to someone pleading, without any transition.',
      },
      {
        deviceId: 'anaphora',
        span: 'Please, please',
        explanation:
          'Immediate repetition at the head of the bar, which is the only place the delivery loses its composure.',
        confidence: 'arguable',
      },
    ],
  },
]);

export const magicWandProduction: TrackProduction = {
  producers: ['Tyler, The Creator'],
  bpm: BPM,
  musicalKey: 'C♯ minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'electronic',
      weight: 0.45,
      contribution:
        'The distorted lead synth that functions as both riff and noise floor.',
    },
    {
      genre: 'trap',
      weight: 0.3,
      contribution: 'The 808 pattern and hat rolls under the verse.',
    },
    {
      genre: 'rock',
      weight: 0.25,
      contribution:
        'The overdriven texture and the abrupt dynamic drops borrowed from guitar arrangement.',
    },
  ],
  samples: [],
  drumPalette: ['808 sub', 'clipped hats', 'sudden full stops'],
  instrumentation: ['distorted synth lead', 'sub bass', 'pitched vocal layers'],
  mixCharacter:
    'Intentionally clipped and overdriven, with the synth pushed past the point of distortion so the track sounds like it is failing.',
  eraContext:
    'From an album built on self-production and abrupt structural cuts, where a song ending mid-phrase is a compositional decision.',
  sections: [],
  vocalPlacement:
    'Tyler delivers close to the grid and low in the mix under the synth, which makes the words feel withheld rather than performed.',
};

magicWandProduction.sections = [
  {
    id: 'verse-1',
    kind: 'verse',
    label: 'Verse 1',
    startBar: 0,
    endBar: magicWandLines.length - 1,
    lineIds: lineIdsFor(magicWandLines, 'verse-1'),
  },
];
