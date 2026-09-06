// lib/mock/dissections/middle-child.ts
// J. Cole — "Middle Child" (2019), prod. T-Minus.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 124;
const TRACK_ID = 'middle-child-1';

export const middleChildLines = authoredLines(TRACK_ID, BPM, [
  {
    text: "I'm the middle child, I got a lot of siblings",
    sectionId: 'verse-2',
    meaning:
      'Cole places himself between two rap generations — old heads who came before and the younger wave who arrived after — and claims the middle as a position of use rather than compromise.',
    flowMechanics:
      'The first half sits square on the beat and the second half crowds together, so the bar accelerates into the rhyme rather than coasting into it.',
    rhymeScience:
      'The tail leans on the /ɪ/ vowel repeated across "middle", "siblings", and the unstressed endings, holding the bar together with vowel colour instead of a hard end-rhyme.',
    why: 'Announcing the thesis as a family position rather than an argument makes the rest of the verse read as obligation instead of ego.',
    devices: [
      {
        deviceId: 'metaphor',
        span: 'middle child',
        explanation:
          'Generational position rendered as birth order — the family frame carries duty, rivalry, and being overlooked all at once.',
      },
      {
        deviceId: 'assonance',
        span: 'siblings',
        explanation:
          'The short /ɪ/ here chimes with "middle" earlier in the bar, tying the two halves without a full rhyme.',
        confidence: 'arguable',
      },
    ],
    entendres: [
      {
        span: 'middle child',
        layer: 'literal',
        reading: 'The child born between older and younger siblings.',
      },
      {
        span: 'middle child',
        layer: 'cultural',
        reading:
          'The rapper who arrived after the 2000s greats but before the SoundCloud wave, belonging fully to neither.',
      },
    ],
  },
  {
    text: 'The young Ns is my brothers, they the reason that I bring it',
    sectionId: 'verse-2',
    meaning:
      'He frames the newer generation as kin rather than competition, which is what obliges him to keep his standard high.',
    flowMechanics:
      'A run of unstressed syllables in the middle of the bar sets up the landing on "bring it", so the emphasis arrives late.',
    rhymeScience:
      'Rhymes back to the previous bar on the same /ɪŋ/ family, extending the chain across the couplet rather than closing it.',
    why: 'Calling them brothers rather than students is what keeps the bar from condescension.',
    devices: [
      {
        deviceId: 'metaphor',
        span: 'my brothers',
        explanation:
          'Extends the family conceit from the previous bar rather than starting a new image.',
      },
    ],
  },
  {
    text: 'I love my ns to death and I mean it',
    sectionId: 'verse-2',
    meaning:
      'A flat declarative that interrupts the technical run — the plainest line in the verse, placed where the density peaks.',
    flowMechanics:
      'Almost every syllable is stressed, so the bar reads slower than its neighbours despite the same tempo.',
    rhymeScience:
      'Ends on "mean it", holding the /iː/ + /ɪt/ shape that the surrounding bars keep returning to.',
    why: 'Dropping the wordplay for one bar is what makes the sincerity land instead of sounding like another punchline.',
    devices: [
      {
        deviceId: 'caesura',
        span: 'to death and',
        explanation:
          'The mid-bar turn separates the claim from its confirmation, so "and I mean it" reads as a second sentence.',
        confidence: 'arguable',
      },
    ],
  },
  {
    text: 'The real ones been dead and the fake ones is breathing',
    sectionId: 'verse-2',
    meaning:
      'The people with integrity are gone while the imitators thrive — a survivor complaint, stated as inventory rather than grievance.',
    flowMechanics:
      'The bar splits exactly in half at "and", giving the two clauses equal weight so the contrast is heard as balance.',
    rhymeScience:
      'The /iː/ of "breathing" answers "mean it" from the bar before, keeping the vowel chain running across the couplet.',
    why: 'Structuring it as a symmetrical pair makes the inversion feel like a law rather than an opinion.',
    devices: [
      {
        deviceId: 'antithesis',
        span: 'The real ones been dead and the fake ones is breathing',
        explanation:
          'Two clauses of matched shape holding opposed terms — real against fake, dead against breathing.',
      },
      {
        deviceId: 'irony',
        span: 'the fake ones is breathing',
        explanation:
          'Survival is awarded to exactly the people who deserve it least, and the bar states it without comment.',
        confidence: 'arguable',
      },
    ],
    entendres: [
      {
        span: 'breathing',
        layer: 'literal',
        reading: 'Still alive.',
      },
      {
        span: 'breathing',
        layer: 'figurative',
        reading:
          'Still working, still charting — alive in the industry sense rather than the biological one.',
      },
    ],
  },
  {
    text: "I'm dead in the middle of two generations",
    sectionId: 'verse-2',
    meaning:
      'The opening image restated with precision: not merely between two waves but stranded exactly at the midpoint, belonging to neither.',
    flowMechanics:
      'The bar sits evenly across the grid with no crowding, which lets the geometry of the claim come through.',
    rhymeScience:
      'The /eɪʃən/ tail opens a chain that the following bars answer, replacing the /ɪ/ colour of the opening bars.',
    why: 'Returning to the thesis in a harder form is what turns an opening line into a structural spine.',
    devices: [
      {
        deviceId: 'extended-metaphor',
        span: 'dead in the middle of two generations',
        explanation:
          'The birth-order conceit from the top of the verse carried forward and made spatial.',
      },
      {
        deviceId: 'antanaclasis',
        span: 'dead',
        explanation:
          'The same word used literally two bars earlier for the departed now means "exactly", which reuses the sound while switching the sense.',
      },
    ],
  },
  {
    text: "I'm little bro and big bro all at once",
    sectionId: 'verse-2',
    meaning:
      'He occupies both roles simultaneously — student to the generation above and elder to the one below.',
    flowMechanics:
      'Two matched two-beat halves joined by "and", so the bar scans as a single balanced unit.',
    rhymeScience:
      'The bar declines to rhyme, resolving on "once" outside the running chain, which marks it as the summary line.',
    why: 'Stating both roles in one breath is the payoff the whole middle-child frame was built to reach.',
    devices: [
      {
        deviceId: 'antithesis',
        span: 'little bro and big bro',
        explanation:
          'Two opposed roles in matched grammatical shape, separated only by the adjective.',
      },
      {
        deviceId: 'paradox',
        span: 'little bro and big bro all at once',
        explanation:
          'A logically impossible position asserted as simple fact, which is the argument the verse has been building.',
      },
      {
        deviceId: 'polyptoton',
        span: 'bro',
        explanation:
          'The same noun repeated under opposed modifiers, which is what makes the contradiction audible.',
        confidence: 'arguable',
      },
    ],
  },
]);

export const middleChildProduction: TrackProduction = {
  producers: ['T-Minus'],
  bpm: BPM,
  musicalKey: 'C minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'trap',
      weight: 0.55,
      contribution:
        'Rolling hi-hats and the 808 glide that carries the low end under the horns.',
    },
    {
      genre: 'soul',
      weight: 0.25,
      contribution:
        'The horn fanfare that opens the record and punctuates each hook return.',
    },
    {
      genre: 'boom bap',
      weight: 0.2,
      contribution:
        'Snare placement squarely on two and four, resisting the triplet feel the hats imply.',
    },
  ],
  samples: [],
  drumPalette: ['808 sub', 'rolling closed hats', 'hard clap on 2 and 4'],
  instrumentation: ['horn stabs', 'sub bass', 'sparse keys'],
  mixCharacter:
    'Dry, forward vocal with almost no reverb tail — the voice sits in front of the horns rather than inside them.',
  eraContext:
    'Released as trap production had become the default rap palette; the horn fanfare deliberately imports a older, triumphal register into that grid.',
  sections: [],
  vocalPlacement:
    'Cole raps slightly behind the hat pattern, which makes a 124 BPM record feel unhurried.',
};

middleChildProduction.sections = [
  {
    id: 'verse-2',
    kind: 'verse',
    label: 'Verse 2',
    startBar: 0,
    endBar: middleChildLines.length - 1,
    lineIds: lineIdsFor(middleChildLines, 'verse-2'),
  },
];
