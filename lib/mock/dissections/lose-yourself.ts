// lib/mock/dissections/lose-yourself.ts
// Eminem — "Lose Yourself" (2002), prod. Eminem, Jeff Bass, Luis Resto.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 171;
const TRACK_ID = 'lose-yourself-1';

export const loseYourselfLines = authoredLines(TRACK_ID, BPM, [
  {
    text: "His palms are sweaty, knees weak, arms are heavy",
    sectionId: 'verse-1',
    meaning:
      'The verse opens on physical symptoms rather than a statement of nerves — the body reports the fear before the narrator names it.',
    flowMechanics:
      'Three clauses of shrinking length inside one bar, which speeds the delivery up exactly as the anxiety escalates.',
    rhymeScience:
      '"Sweaty" and "heavy" carry a two-syllable tail on /ɛ/ + /i/, bracketing the bar so the clipped middle clause sits inside a rhymed frame.',
    why: 'Third person keeps it clinical, which is what makes the panic land harder than a first-person confession would.',
    devices: [
      {
        deviceId: 'asyndeton',
        span: 'palms are sweaty, knees weak, arms are heavy',
        explanation:
          'No connectives between the three symptoms, so the list reads as a body failing faster than it can be described.',
      },
      {
        deviceId: 'imagery',
        span: 'knees weak',
        explanation:
          'Concrete physical detail doing the work an abstract noun like "nervous" would not.',
      },
      {
        deviceId: 'perfect-rhyme',
        span: 'heavy',
        explanation:
          'Rhymes with "sweaty" across the bar — same stressed vowel and tail, different onset.',
      },
    ],
  },
  {
    text: "There's vomit on his sweater already, mom's spaghetti",
    sectionId: 'verse-1',
    meaning:
      'The humiliation is specific and domestic: the thing he has thrown up is his mother\'s cooking, which ties the stage fright back to home.',
    flowMechanics:
      'The bar crams two extra syllables against the same tempo, so it reads as a rushed aside rather than a delivered line.',
    rhymeScience:
      'Extends the /ɛti/ chain from the previous bar across "sweater", "already", and "spaghetti" — three landings on one tail inside two bars.',
    why: 'Rhyming a humiliating image this tightly is the joke and the craft at once: the sound is triumphant while the content is abject.',
    devices: [
      {
        deviceId: 'chain-rhyme',
        span: 'sweater already, mom\'s spaghetti',
        explanation:
          'Three consecutive words landing the same tail, which is what makes the couplet feel unbroken.',
      },
      {
        deviceId: 'multisyllabic-rhyme',
        span: 'spaghetti',
        explanation:
          'A three-syllable tail rhymed whole against "already", not just on the final syllable.',
      },
      {
        deviceId: 'imagery',
        span: 'vomit on his sweater',
        explanation:
          'The detail is visual and specific, which is why it survived into common speech.',
      },
    ],
  },
  {
    text: "He's nervous, but on the surface he looks calm and ready",
    sectionId: 'verse-1',
    meaning:
      'The gap between interior state and exterior presentation, stated plainly — the thesis of the whole verse.',
    flowMechanics:
      'A caesura after "nervous" splits the bar into the two selves it is describing, so the form performs the split.',
    rhymeScience:
      '"Nervous" and "surface" pair on a slant, while "ready" returns to the /ɛti/ chain running through the section.',
    why: 'Placing the internal/external contrast at the hinge of the verse is what licenses the beat to stay steady while the words panic.',
    devices: [
      {
        deviceId: 'antithesis',
        span: "He's nervous, but on the surface he looks calm and ready",
        explanation:
          'Two opposed states balanced across a single conjunction, one interior and one performed.',
      },
      {
        deviceId: 'caesura',
        span: 'nervous, but',
        explanation:
          'The mid-bar break separates the private self from the public one.',
      },
      {
        deviceId: 'slant-rhyme',
        span: 'surface',
        explanation:
          'Near-rhyme with "nervous" — shared consonant frame, drifted vowel.',
        confidence: 'arguable',
      },
    ],
    entendres: [
      {
        span: 'on the surface',
        layer: 'literal',
        reading: 'What is visible on the outside of his body.',
      },
      {
        span: 'on the surface',
        layer: 'meta',
        reading:
          'The performed persona a rapper presents on record, distinct from the writer behind it.',
      },
    ],
  },
  {
    text: "Snap back to reality, oh there goes gravity",
    sectionId: 'verse-1',
    meaning:
      'The interior monologue is interrupted by the moment itself — attention returns to the room and the body fails again.',
    flowMechanics:
      'The two halves are rhythmically identical, so the bar reads as one motion snapping shut.',
    rhymeScience:
      '"Reality" and "gravity" match across three syllables, which is a whole-shape rhyme rather than a tail rhyme.',
    why: 'Rhyming the abstraction against the physical force is the bar: the mind returns and the body immediately betrays it.',
    devices: [
      {
        deviceId: 'multisyllabic-rhyme',
        span: 'gravity',
        explanation:
          'A three-syllable rhyme against "reality" matched whole rather than on the final syllable.',
      },
      {
        deviceId: 'internal-rhyme',
        span: 'reality',
        explanation:
          'The rhyme lands mid-bar rather than at the bar end, which is what gives the line its snap.',
      },
      {
        deviceId: 'metaphor',
        span: 'there goes gravity',
        explanation:
          'Losing composure rendered as a physical law failing, which keeps the register bodily rather than emotional.',
      },
    ],
    entendres: [
      {
        span: 'gravity',
        layer: 'literal',
        reading: 'The force holding him upright, described as failing.',
      },
      {
        span: 'gravity',
        layer: 'figurative',
        reading:
          'Seriousness and composure — the gravity of the occasion slipping away from him.',
      },
    ],
  },
  {
    text: "He's chokin', how? Everybody's jokin' now",
    sectionId: 'verse-1',
    meaning:
      'Failure and the crowd\'s reaction compressed into one bar, with the "how" registering the narrator\'s own disbelief.',
    flowMechanics:
      'A question mark mid-bar creates a hard stop, so the second clause arrives as a separate event rather than a continuation.',
    rhymeScience:
      '"Chokin\'" and "jokin\'" rhyme internally while "how" and "now" bracket the bar, giving it two rhyme axes at once.',
    why: 'Putting the crowd\'s laughter in the same bar as the choke is what makes the humiliation simultaneous rather than consequent.',
    devices: [
      {
        deviceId: 'internal-rhyme',
        span: "chokin'",
        explanation:
          'Rhymes with "jokin\'" across the caesura, binding the two clauses the punctuation separates.',
      },
      {
        deviceId: 'caesura',
        span: 'how?',
        explanation:
          'A full stop inside the bar, which is where the narrator breaks frame.',
      },
      {
        deviceId: 'fourth-wall-break',
        span: 'how?',
        explanation:
          'The narrator interrupts his own third-person account to react to it.',
        confidence: 'arguable',
      },
    ],
  },
]);

export const loseYourselfProduction: TrackProduction = {
  producers: ['Eminem', 'Jeff Bass', 'Luis Resto'],
  bpm: BPM,
  musicalKey: 'D minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'rock',
      weight: 0.45,
      contribution:
        'The distorted guitar riff that carries the whole arrangement and gives it stadium scale.',
    },
    {
      genre: 'boom bap',
      weight: 0.35,
      contribution:
        'Straight kick-snare on a four-beat grid, resisting any swing.',
    },
    {
      genre: 'soul',
      weight: 0.2,
      contribution:
        'The sustained piano figure under the hook that supplies the melancholy.',
    },
  ],
  samples: [],
  drumPalette: ['live-feel kit', 'hard snare on 2 and 4', 'no swing'],
  instrumentation: ['distorted electric guitar', 'piano', 'bass guitar'],
  mixCharacter:
    'Loud, dry, midrange-forward — the vocal is mixed like a rock lead rather than sitting inside the beat.',
  eraContext:
    'Released when rap and rock crossover was commercially dominant; the arrangement borrows rock structure while keeping the drum grid strictly hip-hop.',
  sections: [],
  vocalPlacement:
    'Eminem rides slightly ahead of the snare throughout, which is what makes a 171 BPM record feel urgent rather than fast.',
};

loseYourselfProduction.sections = [
  {
    id: 'verse-1',
    kind: 'verse',
    label: 'Verse 1',
    startBar: 0,
    endBar: loseYourselfLines.length - 1,
    lineIds: lineIdsFor(loseYourselfLines, 'verse-1'),
  },
];
