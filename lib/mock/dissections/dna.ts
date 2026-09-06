// lib/mock/dissections/dna.ts
// Kendrick Lamar — "DNA." (2017), prod. Mike WiLL Made-It.

import type { TrackProduction } from '@/lib/types/production';
import { authoredLines, lineIdsFor } from './helpers';

const BPM = 140;
const TRACK_ID = 'dna-2';

export const dnaLines = authoredLines(TRACK_ID, BPM, [
  {
    text: 'I got, I got, I got, I got',
    sectionId: 'verse-1',
    meaning:
      'A four-fold engine start. The phrase carries no content yet — it establishes the rhythmic cell the whole verse will be built from.',
    flowMechanics:
      'Four identical two-syllable cells on consecutive beats, which locks the ear to the grid before anything is asked of it.',
    rhymeScience:
      'Pure repetition rather than rhyme: the /aɪ/ and /ɑ/ alternation inside each cell is the only vowel movement.',
    why: 'Opening with a rhythm rather than a claim means every subsequent noun lands in a slot the listener is already counting.',
    devices: [
      {
        deviceId: 'anaphora',
        span: 'I got, I got, I got, I got',
        explanation:
          'The same head repeated four times, converting a phrase into a metrical unit.',
      },
      {
        deviceId: 'refrain',
        span: 'I got',
        explanation:
          'This cell returns throughout the verse as the structural spine.',
        confidence: 'arguable',
      },
    ],
  },
  {
    text: 'Loyalty, got royalty inside my DNA',
    sectionId: 'verse-1',
    meaning:
      'Inherited traits stated as fact rather than achievement — what he has is genetic, not earned, which is the album-level argument in miniature.',
    flowMechanics:
      'Both nouns land on strong positions, and the bar resolves early enough to leave air before the next cell.',
    rhymeScience:
      'A near-identical tail: "loyalty" and "royalty" differ only in onset, which is as close as a rhyme gets without being the same word.',
    why: 'Rhyming the two words so tightly makes the claim sound inevitable — as if the language itself already linked them.',
    devices: [
      {
        deviceId: 'perfect-rhyme',
        span: 'royalty',
        explanation:
          'Everything from the stressed vowel onward matches "loyalty"; only the onset changes.',
      },
      {
        deviceId: 'metaphor',
        span: 'DNA',
        explanation:
          'Character rendered as genetic material, which makes it non-negotiable rather than chosen.',
      },
    ],
    entendres: [
      {
        span: 'royalty',
        layer: 'literal',
        reading: 'Descent from kings — inherited nobility.',
      },
      {
        span: 'royalty',
        layer: 'meta',
        reading:
          'Publishing royalties: the money a catalogue pays its writer, also inherited by his family.',
      },
    ],
  },
  {
    text: 'I got power, poison, pain and joy inside my DNA',
    sectionId: 'verse-1',
    meaning:
      'Four incompatible inheritances claimed at once, refusing to separate the good from the damaging.',
    flowMechanics:
      'The list crowds four stresses into the first half of the bar, then the tail stretches out — dense, then open.',
    rhymeScience:
      '"Poison" and "joy" share the /ɔɪ/ nucleus, so the list is bound internally rather than only at the bar end.',
    why: 'Putting poison and joy in one breath is the thesis: he is not sorting the inheritance, only reporting it.',
    devices: [
      {
        deviceId: 'asyndeton',
        span: 'power, poison, pain and joy',
        explanation:
          'The list runs without connectives until the last item, which speeds it up and makes the set feel unbounded.',
      },
      {
        deviceId: 'alliteration',
        span: 'power, poison, pain',
        explanation:
          'Three plosive /p/ onsets in a row give the list a percussive attack that matches the drum pattern.',
      },
      {
        deviceId: 'internal-rhyme',
        span: 'poison',
        explanation:
          'The /ɔɪ/ nucleus rhymes with "joy" later in the same bar, binding the list from inside.',
      },
    ],
  },
  {
    text: 'I got hustle though, ambition, flow, inside my DNA',
    sectionId: 'verse-1',
    meaning:
      'The second list shifts from inherited temperament to working method — what he does with the inheritance.',
    flowMechanics:
      'Commas force three micro-stops, so the bar is deliberately choppier than the one before it.',
    rhymeScience:
      '"Though" and "flow" carry the same /oʊ/ tail inside the bar, which is what lets the list breathe without losing cohesion.',
    why: 'Following a temperament list with a labour list is what stops the DNA conceit from becoming an excuse.',
    devices: [
      {
        deviceId: 'internal-rhyme',
        span: 'though',
        explanation:
          'Rhymes with "flow" two words later — an internal pair inside a single bar.',
      },
      {
        deviceId: 'parallelism',
        span: 'I got hustle though, ambition, flow, inside my DNA',
        explanation:
          'Matches the previous bar exactly in shape, which is what makes the change of content legible.',
      },
    ],
  },
  {
    text: 'I was born like this, since one like this, immaculate conception',
    sectionId: 'verse-1',
    meaning:
      'Origin claimed as miraculous rather than developmental — he did not become this, he arrived as it.',
    flowMechanics:
      'Two clipped clauses of identical length, then a four-syllable phrase that breaks the pattern and stretches the bar.',
    rhymeScience:
      '"Conception" opens the /ɛpʃən/ tail that the next bar answers, which is the longest rhyme shape in the section.',
    why: 'Escalating from genetics to theology is how the verse raises its own stakes without raising its volume.',
    devices: [
      {
        deviceId: 'epistrophe',
        span: 'born like this, since one like this',
        explanation:
          'Both clauses end on the same phrase, which turns the repetition into a rhythmic hinge.',
      },
      {
        deviceId: 'symbolism',
        span: 'immaculate conception',
        explanation:
          'Religious doctrine imported to assert an origin without ordinary cause.',
      },
      {
        deviceId: 'hyperbole',
        span: 'immaculate conception',
        explanation:
          'Deliberate overstatement that the boast register carries without strain.',
        confidence: 'arguable',
      },
    ],
  },
  {
    text: 'I transform like this, perform like this, was Yeshua new weapon',
    sectionId: 'verse-1',
    meaning:
      'Ability and performance stated in the same construction, then attributed to a divine source rather than to practice.',
    flowMechanics:
      'The bar reuses the previous one\'s rhythm exactly, so the escalation in content happens with no change in form.',
    rhymeScience:
      '"Weapon" answers "conception" on the /ɛpən/ shape — a two-syllable landing rather than a single-syllable one.',
    why: 'Repeating the exact rhythm while swapping the claim is what makes the pair read as one continuous assertion.',
    devices: [
      {
        deviceId: 'polyptoton',
        span: 'transform like this, perform like this',
        explanation:
          'Two verbs sharing a root and an identical frame, which binds them tighter than rhyme alone would.',
      },
      {
        deviceId: 'name-drop',
        span: 'Yeshua',
        explanation:
          'The Hebrew name for Jesus, which places the claim in a specific tradition rather than a generic one.',
      },
      {
        deviceId: 'metaphor',
        span: 'new weapon',
        explanation:
          'The rapper rendered as instrument rather than agent — wielded rather than acting.',
      },
    ],
  },
]);

export const dnaProduction: TrackProduction = {
  producers: ['Mike WiLL Made-It'],
  bpm: BPM,
  musicalKey: 'B minor',
  timeSignature: '4/4',
  genreBlend: [
    {
      genre: 'trap',
      weight: 0.5,
      contribution:
        'The 808 pattern and hat subdivisions that carry the first half of the record.',
    },
    {
      genre: 'funk',
      weight: 0.3,
      contribution:
        'The bass figure that drives the beat switch in the back half.',
    },
    {
      genre: 'electronic',
      weight: 0.2,
      contribution:
        'The pitched, reversed textures used as transition markers.',
    },
  ],
  samples: [
    {
      id: 'dna-fox-news',
      title: 'Fox News broadcast excerpt',
      artist: 'Fox News',
      year: 2017,
      genre: 'electronic',
      flipType: 'chop',
      whatWasTaken:
        'Spoken criticism of the artist, chopped and used as the hinge for the beat switch.',
    },
  ],
  drumPalette: ['808 sub', 'triplet hats', 'hard kick', 'no snare in the switch'],
  instrumentation: ['sub bass', 'distorted low synth', 'vocal chops'],
  mixCharacter:
    'Aggressively compressed with the vocal pushed to the front; the beat switch drops the low end out entirely for a bar.',
  eraContext:
    'Arrived when trap had standardised rap production, and uses the beat switch to break its own grid rather than ride it.',
  sections: [],
  vocalPlacement:
    'Kendrick sits dead on the grid in the first half and pushes ahead of it after the switch, which is what makes the second half feel faster at the same tempo.',
};

dnaProduction.sections = [
  {
    id: 'verse-1',
    kind: 'verse',
    label: 'Verse 1',
    startBar: 0,
    endBar: dnaLines.length - 1,
    lineIds: lineIdsFor(dnaLines, 'verse-1'),
    beatSwitch: false,
  },
];
