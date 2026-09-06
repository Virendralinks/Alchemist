// lib/mock/dissections/devil-in-a-new-dress.ts
// Kanye West feat. Rick Ross — "Devil in a New Dress" (2010), prod. Bink!, Mike Dean.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 88;
const TRACK_ID = 'devil-in-a-new-dress-8';

export const devilLines = authoredLines(TRACK_ID, BPM, [
  {
    text: 'I love it though',
    sectionId: 'verse-1',
    meaning:
      'A three-word admission that the thing being described is bad for him and wanted anyway — the whole song compressed into one clause.',
    flowMechanics:
      'A fragment where a full bar is expected, so the silence after it is part of the line.',
    rhymeScience:
      'Ends on an open /oʊ/ that stays unresolved until much later in the verse.',
    why: 'Leading with the confession rather than building to it makes everything after it a description rather than an argument.',
    devices: [
      {
        deviceId: 'paradox',
        span: 'I love it though',
        explanation:
          'Affection stated in the same breath as the objection it is answering, with the objection left unspoken.',
      },
    ],
  },
  {
    text: "Put your hands to the constellations, the way you look should be a sin",
    sectionId: 'verse-1',
    meaning:
      'Desire framed in religious terms, which sets up the title\'s collision of the sacred and the corrupting.',
    flowMechanics:
      'The bar runs long against a slow tempo, so the phrasing spills past the bar line rather than fitting it.',
    rhymeScience:
      'The /ɛ/ and /ɪ/ tail on "constellations" and "sin" is a loose pairing that holds the long bar together.',
    why: 'Reaching for the sky and then naming it a sin is the mechanism of the whole song: elevation and condemnation in one gesture.',
    devices: [
      {
        deviceId: 'imagery',
        span: 'hands to the constellations',
        explanation:
          'A physical gesture scaled to astronomical distance.',
      },
      {
        deviceId: 'hyperbole',
        span: 'should be a sin',
        explanation:
          'Attractiveness elevated to a moral category, which the title then literalises.',
      },
      {
        deviceId: 'enjambment',
        span: 'constellations, the way you look',
        explanation:
          'The clause runs past the natural bar boundary, which is what makes the delivery feel conversational.',
        confidence: 'arguable',
      },
    ],
  },
  {
    text: 'You know our love would be tragic',
    sectionId: 'verse-1',
    meaning:
      'The outcome is known in advance and the relationship proceeds anyway, which is the definition of the tragic mode he names.',
    flowMechanics:
      'A short, flat bar dropped between two ornate ones, which is where the song lets its guard down.',
    rhymeScience:
      '"Tragic" opens an /æ/ tail that the next bar answers, so the couplet is bound by a vowel rather than a full rhyme.',
    why: 'Naming the genre of the relationship is a way of taking responsibility without changing anything.',
    devices: [
      {
        deviceId: 'unreliable-narrator',
        span: 'You know our love would be tragic',
        explanation:
          'The speaker demonstrates full insight into the harm and continues regardless, which undercuts his own account.',
        confidence: 'arguable',
      },
    ],
  },
  {
    text: 'So you never tell nobody, when nobody asks',
    sectionId: 'verse-1',
    meaning:
      'The secrecy is unnecessary — nobody is asking — which quietly reveals how small the affair actually is.',
    flowMechanics:
      'Repetition of "nobody" across the bar gives it a circular shape that matches the futility being described.',
    rhymeScience:
      '"Asks" answers "tragic" on the /æ/ nucleus, closing the couplet on a slant rather than a full rhyme.',
    why: 'The deflation in the second clause is what stops the verse from being romantic about itself.',
    devices: [
      {
        deviceId: 'epanalepsis',
        span: 'never tell nobody, when nobody asks',
        explanation:
          'The same word closes the first clause and opens the second, linking them into one motion.',
      },
      {
        deviceId: 'irony',
        span: 'when nobody asks',
        explanation:
          'The secrecy has no audience, which makes the drama entirely self-supplied.',
      },
      {
        deviceId: 'slant-rhyme',
        span: 'asks',
        explanation:
          'Shares the /æ/ nucleus with "tragic" without matching the tail.',
        confidence: 'arguable',
      },
    ],
  },
]);

export const devilProduction: TrackProduction = {
  producers: ['Bink!', 'Mike Dean', 'Kanye West'],
  bpm: BPM,
  musicalKey: 'F♯ minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'soul',
      weight: 0.5,
      contribution:
        'The looped vocal sample that supplies the harmonic bed and the record\'s entire emotional register.',
    },
    {
      genre: 'rock',
      weight: 0.3,
      contribution:
        'Mike Dean\'s extended guitar solo, which replaces a final verse.',
    },
    {
      genre: 'boom bap',
      weight: 0.2,
      contribution:
        'The slow, heavy drum pattern holding the sample in place.',
    },
  ],
  samples: [
    {
      id: 'devil-will-you-love-me-tomorrow',
      title: 'Will You Love Me Tomorrow',
      artist: 'Smokey Robinson',
      year: 1965,
      genre: 'soul',
      flipType: 'loop',
      whatWasTaken:
        'The vocal and chord bed, slowed and looped so its original question hangs over the verse unanswered.',
    },
  ],
  drumPalette: ['slow kick', 'rimshot-adjacent snare', 'sparse hats'],
  instrumentation: ['looped soul vocal', 'electric guitar', 'organ', 'bass'],
  mixCharacter:
    'Warm and saturated, with the sample left noisy rather than cleaned up; the guitar is mixed as a lead voice equal to the rappers.',
  eraContext:
    'From the maximalist album that reset the scale of mainstream rap production, where a two-minute instrumental outro was a structural choice rather than an indulgence.',
  sections: [],
  vocalPlacement:
    'Kanye raps well behind the beat, which at 88 BPM makes the delivery sound reluctant and gives the confession its weight.',
};

devilProduction.sections = [
  {
    id: 'verse-1',
    kind: 'verse',
    label: 'Verse 1',
    startBar: 0,
    endBar: devilLines.length - 1,
    lineIds: lineIdsFor(devilLines, 'verse-1'),
  },
];
