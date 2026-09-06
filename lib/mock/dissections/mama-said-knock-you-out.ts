// lib/mock/dissections/mama-said-knock-you-out.ts
// LL Cool J — "Mama Said Knock You Out" (1990), prod. Marley Marl.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 105;
const TRACK_ID = 'mama-said-knock-you-out-2';

export const mamaSaidLines = authoredLines(TRACK_ID, BPM, [
  {
    text: "Don't call it a comeback, I been here for years",
    sectionId: 'verse-1',
    meaning:
      'He rejects the frame before anyone can apply it — the narrative of decline and return is refused rather than argued with.',
    flowMechanics:
      'The bar opens on a stressed imperative and then flattens out, so the command carries all the weight.',
    rhymeScience:
      'Sets up "years" as the anchor for a run of /ɪr/ landings across the following bars.',
    why: 'Opening on a prohibition rather than a boast makes the whole verse a correction, which is a harder posture than bragging.',
    devices: [
      {
        deviceId: 'apostrophe',
        span: "Don't call it a comeback",
        explanation:
          'Addressed directly to an unnamed critic, which puts the listener in the position of the person being corrected.',
      },
      {
        deviceId: 'apophasis',
        span: "Don't call it a comeback",
        explanation:
          'Naming the comeback in the act of denying it, so the idea is planted anyway.',
        confidence: 'arguable',
      },
    ],
  },
  {
    text: "I'm rocking my peers, puttin' suckers in fear",
    sectionId: 'verse-1',
    meaning:
      'His standing is measured against contemporaries rather than the past, which is the counter-argument to the comeback framing.',
    flowMechanics:
      'Two matched clauses on the same rhythmic shape, giving the bar a call-and-response symmetry inside a single line.',
    rhymeScience:
      '"Peers" and "fear" both land the /ɪr/ tail set up by "years", making three consecutive landings on one vowel.',
    why: 'The internal symmetry is what lets a boast bar feel structured rather than merely loud.',
    devices: [
      {
        deviceId: 'internal-rhyme',
        span: 'peers',
        explanation:
          'Rhymes mid-bar with "fear" at the end, so the line closes on itself.',
      },
      {
        deviceId: 'parallelism',
        span: "I'm rocking my peers, puttin' suckers in fear",
        explanation:
          'Two clauses of identical grammatical shape, which is what makes the bar scan as balanced.',
      },
      {
        deviceId: 'chain-rhyme',
        span: 'fear',
        explanation:
          'Third landing on the /ɪr/ tail begun in the previous bar.',
      },
    ],
  },
  {
    text: "Makin' the tears rain down like a monsoon",
    sectionId: 'verse-1',
    meaning:
      'The damage he causes is scaled up to weather — personal defeat rendered as a natural disaster.',
    flowMechanics:
      'The bar breaks the /ɪr/ chain at its end, which is what signals the section is turning.',
    rhymeScience:
      '"Tears" holds the chain one last time before "monsoon" moves the vowel somewhere new.',
    why: 'Ending the chain on a new vowel is how the verse changes gear without changing tempo.',
    devices: [
      {
        deviceId: 'simile',
        span: 'like a monsoon',
        explanation:
          'Explicit comparison scaling an individual reaction to a seasonal weather system.',
      },
      {
        deviceId: 'hyperbole',
        span: 'rain down like a monsoon',
        explanation:
          'Deliberate overstatement that the boast register licenses.',
      },
    ],
  },
  {
    text: "Listen to the bass go boom",
    sectionId: 'verse-1',
    meaning:
      'The attention is redirected from the boast to the beat itself, a direct instruction to the listener.',
    flowMechanics:
      'The shortest bar in the section, which leaves room for the drum to answer it.',
    rhymeScience:
      'Closes the couplet on "boom" against "monsoon" — a clean /uː/ pair after the long /ɪr/ run.',
    why: 'Handing the bar back to the production is a way of proving the claim rather than repeating it.',
    devices: [
      {
        deviceId: 'onomatopoeia',
        span: 'boom',
        explanation:
          'The word imitates the drum it names, so the sound and the reference are the same event.',
      },
      {
        deviceId: 'perfect-rhyme',
        span: 'boom',
        explanation:
          'Full rhyme with "monsoon" from the previous bar, resolving the couplet.',
      },
      {
        deviceId: 'call-and-response',
        span: 'Listen to the bass go boom',
        explanation:
          'An instruction to the audience that the arrangement then answers.',
        confidence: 'arguable',
      },
    ],
  },
  {
    text: 'Mama said knock you out',
    sectionId: 'hook',
    meaning:
      'The violence is authorised by someone else — he is carrying out an instruction from home rather than issuing a threat of his own.',
    flowMechanics:
      'Five heavy syllables with no unstressed filler, which is what makes the hook shoutable over a bare break.',
    rhymeScience:
      'No rhyme; the hook runs on stress placement and repetition, which is why it works chanted by a crowd.',
    why: 'Displacing the aggression onto a maternal instruction is what lets the record be both a threat and an act of obedience.',
    devices: [
      {
        deviceId: 'refrain',
        span: 'Mama said knock you out',
        explanation:
          "The title line and the record's structural anchor, returning after every verse.",
      },
      {
        deviceId: 'metonymy',
        span: 'Mama',
        explanation:
          'Stands for the grandmother who raised him, and behind her for family authority generally.',
        confidence: 'arguable',
      },
    ],
    entendres: [
      {
        span: 'knock you out',
        layer: 'literal',
        reading: 'Render an opponent unconscious, in the boxing sense the video leans on.',
      },
      {
        span: 'knock you out',
        layer: 'meta',
        reading:
          'Overwhelm a listener or a rival rapper — win the record rather than the fight.',
      },
    ],
  },
  {
    text: "I'm gonna knock you out",
    sectionId: 'hook',
    meaning:
      'The instruction accepted and restated in the first person, which is the only change between the two hook lines.',
    flowMechanics:
      'Rhythmically identical to the line before it, so the shift from reported to owned lands purely on the pronoun.',
    rhymeScience:
      'Repeats the previous line\'s tail exactly rather than rhyming with it, which is what makes the pair a call and its answer.',
    why: 'Moving the same clause from her mouth to his is the entire hook: permission becomes intent without a word changing.',
    devices: [
      {
        deviceId: 'epistrophe',
        span: 'knock you out',
        explanation:
          'Both hook lines close on the identical phrase, so the repetition sits at the end rather than the head.',
      },
      {
        deviceId: 'call-and-response',
        span: "I'm gonna knock you out",
        explanation:
          "Answers the previous line's reported instruction in his own voice.",
      },
      {
        deviceId: 'refrain',
        span: "I'm gonna knock you out",
        explanation: 'The second half of the recurring hook pair.',
      },
    ],
  },
]);

export const mamaSaidProduction: TrackProduction = {
  producers: ['Marley Marl', 'LL Cool J'],
  bpm: BPM,
  musicalKey: 'E minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'boom bap',
      weight: 0.6,
      contribution:
        'The hard, dry break that defines the record and the era around it.',
    },
    {
      genre: 'funk',
      weight: 0.25,
      contribution:
        'The sampled drum break and its original swing, kept rather than quantised away.',
    },
    {
      genre: 'rock',
      weight: 0.15,
      contribution:
        'The guitar stab used as a punctuation mark between phrases.',
    },
  ],
  samples: [
    {
      id: 'mama-said-funky-drummer',
      title: 'Funky Drummer',
      artist: 'James Brown',
      year: 1970,
      genre: 'funk',
      flipType: 'loop',
      whatWasTaken:
        'The drum break, looped as the record\'s rhythmic foundation.',
    },
    {
      id: 'mama-said-sing-sing',
      title: 'Sing Sing',
      artist: 'Gaz',
      year: 1978,
      genre: 'funk',
      flipType: 'chop',
      whatWasTaken: 'Percussion and accent hits layered over the main break.',
    },
  ],
  drumPalette: ['sampled break', 'hard snare', 'minimal hats'],
  instrumentation: ['guitar stab', 'bass line', 'scratch accents'],
  mixCharacter:
    'Dry and aggressive with the vocal shouted rather than rapped, mixed hot against a break that is barely processed.',
  eraContext:
    'Made at the moment sampling was still legally open, when a whole record could be built from a loop and an attitude.',
  sections: [],
  vocalPlacement:
    'LL lands hard on the snare rather than around it, which is what gives the record its confrontational feel.',
};

mamaSaidProduction.sections = [
  {
    id: 'verse-1',
    kind: 'verse',
    label: 'Verse 1',
    startBar: 0,
    endBar: 3,
    lineIds: lineIdsFor(mamaSaidLines, 'verse-1'),
  },
  {
    id: 'hook',
    kind: 'hook',
    label: 'Hook',
    startBar: 4,
    endBar: mamaSaidLines.length - 1,
    lineIds: lineIdsFor(mamaSaidLines, 'hook'),
  },
];
