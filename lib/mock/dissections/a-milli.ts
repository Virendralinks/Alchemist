// lib/mock/dissections/a-milli.ts
// Lil Wayne — "A Milli" (2008), prod. Bangladesh.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 82;
const TRACK_ID = 'a-milli-3';

export const aMilliLines = authoredLines(TRACK_ID, BPM, [
  {
    text: "I'm a millionaire, I'm a young money millionaire",
    sectionId: 'verse-1',
    meaning:
      'The opening claim doubles itself, adding the label affiliation the second time — the boast and the business are the same fact.',
    flowMechanics:
      'The repeat stretches across the bar line, so the phrase arrives twice at different points in the grid rather than as a neat couplet.',
    rhymeScience:
      'The whole bar turns on repeating "millionaire" rather than rhyming it, which sets up the near-rhymes that follow.',
    why: 'Repetition rather than a new rhyme makes the claim sound like a fact being restated for the record.',
    devices: [
      {
        deviceId: 'epanalepsis',
        span: "I'm a millionaire, I'm a young money millionaire",
        explanation:
          'The bar opens and closes on the same word, enclosing the label name inside the boast.',
      },
      {
        deviceId: 'braggadocio',
        span: 'young money millionaire',
        explanation:
          'Wealth stated as identity rather than achievement, which is the mode the entire record operates in.',
      },
    ],
  },
  {
    text: 'Tougher than Nigerian hair',
    sectionId: 'verse-1',
    meaning:
      'A hardness boast built from a specific, unexpected comparison rather than a generic one.',
    flowMechanics:
      'A short bar against a beat with almost no low end, so the space around it is part of the effect.',
    rhymeScience:
      'Lands "hair" on the /ɛr/ tail already established by "millionaire", extending the chain with a single syllable.',
    why: 'The associative leap from wealth to hair texture is the record\'s method: the connection is sonic first and semantic second.',
    devices: [
      {
        deviceId: 'simile',
        span: 'Tougher than Nigerian hair',
        explanation:
          'An explicit comparison whose vehicle is deliberately far from the tenor, which is where the humour sits.',
      },
      {
        deviceId: 'perfect-rhyme',
        span: 'hair',
        explanation:
          'Closes the /ɛr/ chain running from "millionaire" across the previous bar.',
      },
    ],
  },
  {
    text: 'My criteria compared to your career just isn\'t fair',
    sectionId: 'verse-1',
    meaning:
      'A dismissal framed as measurement — his standards and their whole body of work are not comparable quantities.',
    flowMechanics:
      'Three rhyme landings inside one bar keep the pocket busy while the drums stay sparse.',
    rhymeScience:
      '"Criteria", "career", and "fair" all touch the same /ɪr/–/ɛr/ region, which is a chain built on drifting vowels rather than exact matches.',
    why: 'Stacking near-rhymes rather than perfect ones is what lets the bar keep moving instead of resolving.',
    devices: [
      {
        deviceId: 'internal-rhyme',
        span: 'career',
        explanation:
          'Rhymes with "criteria" earlier in the same bar, before the end-rhyme arrives.',
      },
      {
        deviceId: 'slant-rhyme',
        span: 'criteria',
        explanation:
          'Near-rhyme against the /ɛr/ chain — the vowel drifts but the frame holds.',
        confidence: 'arguable',
      },
      {
        deviceId: 'litotes',
        span: "just isn't fair",
        explanation:
          'Understatement standing in for a much larger claim about the gap between them.',
        confidence: 'arguable',
      },
    ],
  },
  {
    text: 'Young Money militia, and I am the commissioner',
    sectionId: 'verse-1',
    meaning:
      'The label recast as an armed force with him at its head — authority claimed through organisational rank rather than skill.',
    flowMechanics:
      'The bar front-loads its stresses and then runs out in a long unstressed tail, which is what makes the four-syllable ending land softly.',
    rhymeScience:
      '"Militia" and "commissioner" pair across three syllables on a drifting vowel, a near-rhyme held together by the shared /ɪʃ/ centre.',
    why: 'Choosing "commissioner" over any obvious rank word is the craft: the rhyme dictates the image rather than the other way round.',
    devices: [
      {
        deviceId: 'name-drop',
        span: 'Young Money',
        explanation:
          'His own label named inside the boast, so the brand and the bar advance together.',
      },
      {
        deviceId: 'metaphor',
        span: 'militia',
        explanation:
          'A record label rendered as an irregular armed force rather than a business.',
      },
      {
        deviceId: 'multisyllabic-rhyme',
        span: 'commissioner',
        explanation:
          'Three syllables matched against "militia" rather than a single closing syllable.',
      },
    ],
  },
  {
    text: "You don't want start Weezy, 'cause the F is for Finisher",
    sectionId: 'verse-1',
    meaning:
      'A warning built by re-reading his own stage name — the middle initial is retrofitted into a threat.',
    flowMechanics:
      'The bar pauses at the comma and then accelerates through the explanation, so the threat arrives as an aside.',
    rhymeScience:
      '"Finisher" closes the three-syllable chain begun by "militia" and "commissioner", the third consecutive landing on that shape.',
    why: 'Making the letter mean something new is the whole move: the name was always there, and the bar retroactively arms it.',
    devices: [
      {
        deviceId: 'double-entendre',
        span: 'the F is for Finisher',
        explanation:
          'The initial from "Weezy F Baby" reassigned mid-bar, so the name carries both readings at once.',
      },
      {
        deviceId: 'name-drop',
        span: 'Weezy',
        explanation:
          'His own alias, used as the raw material the wordplay operates on.',
      },
      {
        deviceId: 'chain-rhyme',
        span: 'Finisher',
        explanation:
          'Third landing on the tail set two bars earlier, closing the run.',
      },
    ],
    entendres: [
      {
        span: 'F',
        layer: 'literal',
        reading: 'The middle initial in his stage name, Weezy F Baby.',
      },
      {
        span: 'F',
        layer: 'figurative',
        reading:
          'The first letter of "Finisher" — the name reread as a description of what he does to competitors.',
      },
    ],
  },
]);

export const aMilliProduction: TrackProduction = {
  producers: ['Bangladesh'],
  bpm: BPM,
  musicalKey: 'A minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'boom bap',
      weight: 0.45,
      contribution:
        'The stripped kick-and-snare skeleton with no melodic instrument at all.',
    },
    {
      genre: 'electronic',
      weight: 0.35,
      contribution:
        'The pitched, stuttering vocal sample that functions as the only riff.',
    },
    {
      genre: 'funk',
      weight: 0.2,
      contribution:
        'The syncopated placement of the kick, which supplies the swing the drums otherwise lack.',
    },
  ],
  samples: [
    {
      id: 'a-milli-a-milli',
      title: 'Vocal chop source',
      artist: 'Uncredited vocal',
      year: 2008,
      genre: 'electronic',
      flipType: 'chop',
      whatWasTaken:
        'A single repeated vocal syllable, pitched and stuttered into the beat\'s only melodic content.',
    },
  ],
  drumPalette: ['808 kick', 'sharp snare', 'no hats for long stretches'],
  instrumentation: ['stuttered vocal chop', 'sub bass'],
  mixCharacter:
    'Almost empty — the arrangement is mostly negative space, which forces the vocal to carry the record.',
  eraContext:
    'Landed during the mixtape era when beats were increasingly maximal; its refusal to add a melody was the point.',
  sections: [],
  vocalPlacement:
    'Wayne floats freely across the bar, entering and stopping in places the sparse drums leave wide open.',
};

aMilliProduction.sections = [
  {
    id: 'verse-1',
    kind: 'verse',
    label: 'Verse 1',
    startBar: 0,
    endBar: aMilliLines.length - 1,
    lineIds: lineIdsFor(aMilliLines, 'verse-1'),
  },
];
