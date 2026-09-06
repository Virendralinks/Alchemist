// lib/mock/lineage-graph.ts
//
// The influence graph. Edges are technical claims, not biography: an edge means
// "this artist's structural innovation is visible in that artist's writing".
//
// Each TechniqueModule carries a SequencerTemplate that loads straight into the
// grid, so reading about a flow and trying it are one click apart.

import type { LineageArtist, SequencerTemplate } from '@/lib/types/lineage';

const slot = (bar: number, beat: number, tick = 0) => bar * 16 + beat * 4 + tick;

const at = (
  index: number,
  text: string,
  assonanceKey: string,
  emphasis = 0.7,
): SequencerTemplate['placements'][number] => ({
  slotIndex: index,
  text,
  assonanceKey,
  emphasis,
});

// ---------------------------------------------------------------------------
// Technique templates
// ---------------------------------------------------------------------------

const internalRhymeChain: SequencerTemplate = {
  id: 'tpl-rakim-internal',
  name: 'Internal rhyme chain',
  bpm: 92,
  placements: [
    at(slot(0, 0), 'I', 'aɪ', 0.6),
    at(slot(0, 0, 2), 'start', 'ɑ', 0.9),
    at(slot(0, 1, 2), 'to', 'ə', 0.4),
    at(slot(0, 2), 'think', 'ɪ', 0.8),
    at(slot(0, 3), 'and', 'æ', 0.5),
    at(slot(0, 3, 2), 'then', 'ɛ', 0.7),
    at(slot(1, 0), 'I', 'aɪ', 0.6),
    at(slot(1, 0, 2), 'sink', 'ɪ', 0.9),
    at(slot(1, 2), 'in', 'ɪ', 0.6),
    at(slot(1, 2, 2), 'to', 'ə', 0.4),
    at(slot(1, 3), 'ink', 'ɪ', 1),
    at(slot(2, 0), 'the', 'ə', 0.4),
    at(slot(2, 0, 2), 'link', 'ɪ', 0.9),
    at(slot(2, 2), 'be', 'ɪ', 0.5),
    at(slot(2, 2, 2), 'tween', 'iː', 0.8),
    at(slot(3, 0), 'the', 'ə', 0.4),
    at(slot(3, 0, 2), 'brink', 'ɪ', 1),
  ],
};

const multiCompound: SequencerTemplate = {
  id: 'tpl-eminem-compound',
  name: 'Compound multisyllabic',
  bpm: 104,
  placements: [
    at(slot(0, 0), 'cri', 'ɪ'),
    at(slot(0, 0, 2), 'ti', 'ɪ'),
    at(slot(0, 1), 'cal', 'ə', 0.6),
    at(slot(0, 2), 'con', 'ɑ'),
    at(slot(0, 2, 2), 'di', 'ɪ'),
    at(slot(0, 3), 'tion', 'ə', 0.9),
    at(slot(1, 0), 'lyr', 'ɪ'),
    at(slot(1, 0, 2), 'i', 'ɪ'),
    at(slot(1, 1), 'cal', 'ə', 0.6),
    at(slot(1, 2), 'am', 'æ'),
    at(slot(1, 2, 2), 'mu', 'ju'),
    at(slot(1, 3), 'ni', 'ɪ'),
    at(slot(1, 3, 2), 'tion', 'ə', 1),
    at(slot(2, 0), 'mi', 'ɪ'),
    at(slot(2, 0, 2), 'ra', 'æ'),
    at(slot(2, 1), 'cu', 'ju'),
    at(slot(2, 1, 2), 'lous', 'ə', 0.9),
    at(slot(3, 0), 'ri', 'ɪ'),
    at(slot(3, 0, 2), 'di', 'ɪ'),
    at(slot(3, 1), 'cu', 'ju'),
    at(slot(3, 1, 2), 'lous', 'ə', 1),
  ],
};

const tripletFlow: SequencerTemplate = {
  id: 'tpl-triplet-flow',
  name: 'Triplet flow over 4/4',
  bpm: 140,
  placements: [
    at(slot(0, 0), 'run', 'ʌ', 0.9),
    at(slot(0, 0, 1), 'it', 'ɪ', 0.5),
    at(slot(0, 0, 3), 'back', 'æ', 0.7),
    at(slot(0, 1, 2), 'run', 'ʌ', 0.9),
    at(slot(0, 1, 3), 'it', 'ɪ', 0.5),
    at(slot(0, 2, 1), 'up', 'ʌ', 0.7),
    at(slot(1, 0), 'count', 'aʊ', 0.9),
    at(slot(1, 0, 1), 'it', 'ɪ', 0.5),
    at(slot(1, 0, 3), 'twice', 'aɪ', 0.7),
    at(slot(1, 2), 'stack', 'æ', 0.9),
    at(slot(1, 2, 1), 'it', 'ɪ', 0.5),
    at(slot(1, 2, 3), 'nice', 'aɪ', 1),
    at(slot(2, 0), 'no', 'oʊ', 0.8),
    at(slot(2, 0, 2), 'brakes', 'eɪ', 0.9),
    at(slot(2, 2), 'no', 'oʊ', 0.8),
    at(slot(2, 2, 2), 'takes', 'eɪ', 1),
    at(slot(3, 0), 'that', 'æ', 0.6),
    at(slot(3, 1), 'pace', 'eɪ', 1),
  ],
};

const soulSampleCadence: SequencerTemplate = {
  id: 'tpl-soul-cadence',
  name: 'Soul-sample cadence',
  bpm: 86,
  placements: [
    at(slot(0, 1), 'she', 'iː', 0.8),
    at(slot(0, 1, 2), 'told', 'oʊ', 0.9),
    at(slot(0, 2, 2), 'me', 'iː', 0.6),
    at(slot(0, 3, 2), 'slow', 'oʊ', 0.9),
    at(slot(1, 1), 'the', 'ə', 0.4),
    at(slot(1, 1, 2), 'horns', 'ɔ', 1),
    at(slot(1, 3), 'know', 'oʊ', 0.8),
    at(slot(2, 1), 'they', 'eɪ', 0.6),
    at(slot(2, 1, 2), 'loop', 'uː', 0.9),
    at(slot(2, 3), 'low', 'oʊ', 0.8),
    at(slot(3, 1), 'let', 'ɛ', 0.6),
    at(slot(3, 1, 2), 'it', 'ɪ', 0.4),
    at(slot(3, 2, 2), 'go', 'oʊ', 1),
  ],
};

const conversationalPocket: SequencerTemplate = {
  id: 'tpl-conversational',
  name: 'Conversational pocket',
  bpm: 80,
  placements: [
    at(slot(0, 0), 'look', 'ʊ', 0.7),
    at(slot(0, 1), 'I', 'aɪ', 0.5),
    at(slot(0, 1, 2), 'been', 'ɪ', 0.6),
    at(slot(0, 2, 2), 'try', 'aɪ', 0.8),
    at(slot(0, 3, 2), 'na', 'ə', 0.4),
    at(slot(1, 0), 'tell', 'ɛ', 0.7),
    at(slot(1, 1), 'you', 'uː', 0.5),
    at(slot(1, 2), 'some', 'ʌ', 0.6),
    at(slot(1, 2, 2), 'thing', 'ɪ', 0.5),
    at(slot(2, 0), 'but', 'ʌ', 0.6),
    at(slot(2, 1), 'you', 'uː', 0.5),
    at(slot(2, 1, 2), 'don', 'oʊ', 0.7),
    at(slot(2, 2, 2), 't', 'ə', 0.3),
    at(slot(3, 0), 'lis', 'ɪ', 0.8),
    at(slot(3, 0, 2), 'ten', 'ə', 0.6),
    at(slot(3, 2), 'right', 'aɪ', 1),
  ],
};

const doubleTimeSwitch: SequencerTemplate = {
  id: 'tpl-double-time',
  name: 'Double-time switch',
  bpm: 96,
  placements: [
    at(slot(0, 0), 'walk', 'ɔ', 0.9),
    at(slot(0, 2), 'slow', 'oʊ', 0.9),
    at(slot(1, 0), 'then', 'ɛ', 0.7),
    at(slot(1, 2), 'go', 'oʊ', 0.9),
    // Bar 3 doubles the rate — the switch is the whole lesson.
    at(slot(2, 0), 'ev', 'ɛ', 0.8),
    at(slot(2, 0, 1), 'ry', 'i', 0.5),
    at(slot(2, 0, 2), 'sin', 'ɪ', 0.7),
    at(slot(2, 0, 3), 'gle', 'ə', 0.5),
    at(slot(2, 1), 'syl', 'ɪ', 0.8),
    at(slot(2, 1, 1), 'la', 'ə', 0.5),
    at(slot(2, 1, 2), 'ble', 'ə', 0.5),
    at(slot(2, 1, 3), 'lands', 'æ', 0.8),
    at(slot(2, 2), 'on', 'ɑ', 0.6),
    at(slot(2, 2, 1), 'a', 'ə', 0.4),
    at(slot(2, 2, 2), 'six', 'ɪ', 0.7),
    at(slot(2, 2, 3), 'teenth', 'iː', 0.8),
    at(slot(3, 0), 'then', 'ɛ', 0.7),
    at(slot(3, 2), 'rest', 'ɛ', 1),
  ],
};

const characterVoice: SequencerTemplate = {
  id: 'tpl-character-voice',
  name: 'Character voice switch',
  bpm: 88,
  placements: [
    at(slot(0, 0), 'he', 'iː', 0.7),
    at(slot(0, 0, 2), 'said', 'ɛ', 0.8),
    at(slot(0, 2), 'boy', 'ɔɪ', 0.9),
    at(slot(1, 0), 'you', 'uː', 0.6),
    at(slot(1, 1), 'bet', 'ɛ', 0.8),
    at(slot(1, 1, 2), 'ter', 'ə', 0.5),
    at(slot(1, 2, 2), 'know', 'oʊ', 0.9),
    at(slot(2, 0), 'I', 'aɪ', 0.6),
    at(slot(2, 0, 2), 'said', 'ɛ', 0.8),
    at(slot(2, 2), 'sir', 'ɜ', 0.9),
    at(slot(3, 0), 'I', 'aɪ', 0.6),
    at(slot(3, 1), 'al', 'ɔ', 0.7),
    at(slot(3, 1, 2), 'rea', 'ɛ', 0.6),
    at(slot(3, 2), 'dy', 'i', 0.5),
    at(slot(3, 2, 2), 'do', 'uː', 1),
  ],
};

const melodicRepetition: SequencerTemplate = {
  id: 'tpl-melodic-repetition',
  name: 'Melodic repetition',
  bpm: 74,
  placements: [
    at(slot(0, 0), 'no', 'oʊ', 0.9),
    at(slot(0, 1, 2), 'i', 'aɪ', 0.7),
    at(slot(0, 2, 2), 'dea', 'iː', 0.9),
    at(slot(1, 0), 'no', 'oʊ', 0.9),
    at(slot(1, 1, 2), 'i', 'aɪ', 0.7),
    at(slot(1, 2, 2), 'dea', 'iː', 0.9),
    at(slot(2, 0), 'where', 'ɛ', 0.7),
    at(slot(2, 1), 'you', 'uː', 0.5),
    at(slot(2, 1, 2), 'been', 'ɪ', 0.8),
    at(slot(3, 0), 'no', 'oʊ', 0.9),
    at(slot(3, 1, 2), 'i', 'aɪ', 0.7),
    at(slot(3, 2, 2), 'dea', 'iː', 1),
  ],
};

const boastLadder: SequencerTemplate = {
  id: 'tpl-boast-ladder',
  name: 'Boast ladder',
  bpm: 98,
  placements: [
    at(slot(0, 0), 'don', 'oʊ', 0.9),
    at(slot(0, 0, 2), 't', 'ə', 0.3),
    at(slot(0, 1, 2), 'call', 'ɔ', 0.9),
    at(slot(0, 3), 'it', 'ɪ', 0.5),
    at(slot(1, 0), 'a', 'ə', 0.4),
    at(slot(1, 0, 2), 'come', 'ʌ', 0.9),
    at(slot(1, 1, 2), 'back', 'æ', 1),
    at(slot(2, 0), 'I', 'aɪ', 0.6),
    at(slot(2, 1), 'been', 'ɪ', 0.7),
    at(slot(2, 2), 'here', 'ɪ', 0.9),
    at(slot(3, 0), 'for', 'ɔ', 0.6),
    at(slot(3, 1), 'years', 'ɪ', 1),
  ],
};

// ---------------------------------------------------------------------------
// The graph
// ---------------------------------------------------------------------------

export const lineageArtists: LineageArtist[] = [
  {
    id: 'ln-ll-cool-j',
    name: 'LL Cool J',
    era: '80s',
    yearsActive: [1984, null],
    region: 'Queens, NY',
    thesis:
      'Proved a rapper could carry a record on presence and cadence alone, and made the comeback record a form.',
    influencedBy: [],
    archiveArtistId: 'll-cool-j',
    accentColor: 'yellow-400',
    techniques: [
      {
        id: 'tech-boast-ladder',
        name: 'Boast ladder',
        description:
          'Each bar raises the claim of the one before it, so the verse has a shape even when the subject is only "I am good at this".',
        listenFor:
          'The escalation is structural — bar four cannot be swapped with bar one without the verse deflating.',
        template: boastLadder,
      },
    ],
  },
  {
    id: 'ln-rakim',
    name: 'Rakim',
    era: '80s',
    yearsActive: [1985, null],
    region: 'Long Island, NY',
    thesis:
      'Moved rap off the end-rhyme grid: internal rhymes mid-bar and a conversational, unhurried delivery over the beat.',
    influencedBy: [],
    archiveArtistId: null,
    accentColor: 'amber-400',
    techniques: [
      {
        id: 'tech-internal-chain',
        name: 'Internal rhyme chain',
        description:
          'Rhymes land inside the bar rather than only at the end, so the line keeps pulling forward instead of stopping at the barline.',
        listenFor:
          'Count how many rhymes happen before the bar ends. The end-rhyme stops being the main event.',
        template: internalRhymeChain,
      },
    ],
  },
  {
    id: 'ln-nas',
    name: 'Nas',
    era: '90s',
    yearsActive: [1991, null],
    region: 'Queensbridge, NY',
    thesis:
      'Brought cinematic specificity — the verse as a scene with camera position, not a list of claims.',
    influencedBy: ['ln-rakim'],
    archiveArtistId: null,
    accentColor: 'emerald-400',
    techniques: [
      {
        id: 'tech-soul-cadence',
        name: 'Soul-sample cadence',
        description:
          'Phrasing that leans on the sample rather than the drums, entering late and resolving on the loop rather than the snare.',
        listenFor:
          'The vocal enters after the downbeat and lands with the horns, not the kick.',
        template: soulSampleCadence,
      },
    ],
  },
  {
    id: 'ln-jay-z',
    name: 'Jay-Z',
    era: '90s',
    yearsActive: [1995, null],
    region: 'Brooklyn, NY',
    thesis:
      'Compressed narrative into conversational phrasing — the sound of talking while never losing the pocket.',
    influencedBy: ['ln-rakim', 'ln-ll-cool-j'],
    archiveArtistId: null,
    accentColor: 'zinc-300',
    techniques: [
      {
        id: 'tech-conversational',
        name: 'Conversational pocket',
        description:
          'Bars phrased as speech, with rests where a speaker would breathe, so the rhyme arrives as an aside rather than a punchline.',
        listenFor:
          'The rests are load-bearing. Removing them turns the same words into a chant.',
        template: conversationalPocket,
      },
    ],
  },
  {
    id: 'ln-eminem',
    name: 'Eminem',
    era: '2000s',
    yearsActive: [1996, null],
    region: 'Detroit, MI',
    thesis:
      'Industrialised the multisyllabic rhyme: compound rhymes stacked so densely they become the rhythm section.',
    influencedBy: ['ln-rakim', 'ln-nas'],
    archiveArtistId: 'eminem',
    accentColor: 'zinc-300',
    techniques: [
      {
        id: 'tech-compound-multi',
        name: 'Compound multisyllabic',
        description:
          'Three- and four-syllable tails rhymed whole, often assembling a multi-word phrase to match a single long word.',
        listenFor:
          'The rhyme is the entire tail, not the last syllable. Track the vowels, not the spelling.',
        template: multiCompound,
      },
      {
        id: 'tech-character-voice',
        name: 'Character voice switch',
        description:
          'Changing timbre and register mid-verse to mark a change of speaker, so dialogue works without narration.',
        listenFor:
          'The switch happens on the bar line, and the pocket changes with the voice.',
        template: characterVoice,
      },
    ],
  },
  {
    id: 'ln-lil-wayne',
    name: 'Lil Wayne',
    era: '2000s',
    yearsActive: [1996, null],
    region: 'New Orleans, LA',
    thesis:
      'Made the non-sequitur punchline a structure — associative leaps held together by sound rather than argument.',
    influencedBy: ['ln-jay-z'],
    archiveArtistId: 'lil-wayne',
    accentColor: 'fuchsia-400',
    techniques: [
      {
        id: 'tech-double-time',
        name: 'Double-time switch',
        description:
          'Holding a spacious pocket for two bars, then doubling the syllable rate without changing tempo.',
        listenFor:
          'The beat never speeds up. Only the vocal subdivision changes, which is why it lands.',
        template: doubleTimeSwitch,
      },
    ],
  },
  {
    id: 'ln-kanye-west',
    name: 'Kanye West',
    era: '2000s',
    yearsActive: [1996, null],
    region: 'Chicago, IL',
    thesis:
      'Rebuilt rap production around pitched-up soul, then kept dismantling his own template every album.',
    influencedBy: ['ln-jay-z', 'ln-nas'],
    archiveArtistId: 'kanye-west',
    accentColor: 'violet-400',
    techniques: [
      {
        id: 'tech-soul-flip',
        name: 'Soul flip phrasing',
        description:
          'Writing to the chopped sample rather than the drum grid, so the vocal inherits the original record’s swing.',
        listenFor:
          'The phrasing swings against a straight drum pattern because it is following the chop.',
        template: soulSampleCadence,
      },
    ],
  },
  {
    id: 'ln-kendrick-lamar',
    name: 'Kendrick Lamar',
    era: '2010s',
    yearsActive: [2003, null],
    region: 'Compton, CA',
    thesis:
      'Uses voice as a structural device: register, pitch, and character shift to carry argument across a verse.',
    influencedBy: ['ln-nas', 'ln-eminem', 'ln-jay-z'],
    archiveArtistId: 'kendrick-lamar',
    accentColor: 'emerald-400',
    techniques: [
      {
        id: 'tech-voice-as-structure',
        name: 'Voice as structure',
        description:
          'Each shift in timbre marks a shift in speaker or stance, so the verse argues with itself without stage directions.',
        listenFor:
          'The pitch change lands exactly where the rhetorical turn does.',
        template: characterVoice,
      },
      {
        id: 'tech-triplet-over-four',
        name: 'Triplet flow over 4/4',
        description:
          'Grouping syllables in threes against a four-beat grid, creating tension that resolves at the bar line.',
        listenFor:
          'The pattern drifts against the snare and re-syncs every fourth bar.',
        template: tripletFlow,
      },
    ],
  },
  {
    id: 'ln-j-cole',
    name: 'J. Cole',
    era: '2010s',
    yearsActive: [2007, null],
    region: 'Fayetteville, NC',
    thesis:
      'Plain-spoken register carrying dense internal rhyme — the technique hides inside conversational delivery.',
    influencedBy: ['ln-jay-z', 'ln-nas'],
    archiveArtistId: 'j-cole',
    accentColor: 'amber-400',
    techniques: [
      {
        id: 'tech-plain-dense',
        name: 'Plain-spoken density',
        description:
          'Rhyme chains buried under a conversational delivery, so the craft only surfaces when you transcribe it.',
        listenFor:
          'It sounds like talking. Write it out and count the rhymes per bar.',
        template: conversationalPocket,
      },
    ],
  },
  {
    id: 'ln-drake',
    name: 'Drake',
    era: '2010s',
    yearsActive: [2006, null],
    region: 'Toronto, ON',
    thesis:
      'Collapsed the boundary between rapping and singing, making melodic repetition a rap structure.',
    influencedBy: ['ln-lil-wayne', 'ln-kanye-west'],
    archiveArtistId: 'drake',
    accentColor: 'rose-400',
    techniques: [
      {
        id: 'tech-melodic-repetition',
        name: 'Melodic repetition',
        description:
          'A short melodic cell repeated with small variations, so the hook logic runs through the verse too.',
        listenFor:
          'The same three-note shape returns every two bars, slightly displaced.',
        template: melodicRepetition,
      },
    ],
  },
  {
    id: 'ln-tyler-the-creator',
    name: 'Tyler, the Creator',
    era: '2010s',
    yearsActive: [2007, null],
    region: 'Ladera Heights, CA',
    thesis:
      'Treats the album as arrangement first — beat switches mid-song are narrative devices, not transitions.',
    influencedBy: ['ln-kanye-west'],
    archiveArtistId: 'tyler-the-creator',
    accentColor: 'lime-400',
    techniques: [
      {
        id: 'tech-beat-switch-narrative',
        name: 'Beat-switch as narrative',
        description:
          'The instrumental changes underneath a continuing verse, so the same speaker is recontextualised mid-thought.',
        listenFor:
          'The vocal does not restart at the switch — it carries across, which is what makes it a turn.',
        template: doubleTimeSwitch,
      },
    ],
  },
  {
    id: 'ln-jid',
    name: 'JID',
    era: '2020s',
    yearsActive: [2010, null],
    region: 'Atlanta, GA',
    thesis:
      'Southern cadence married to East-coast rhyme density, at a syllable rate that treats speed as texture.',
    influencedBy: ['ln-eminem', 'ln-kendrick-lamar', 'ln-lil-wayne'],
    archiveArtistId: 'jid',
    accentColor: 'sky-400',
    techniques: [
      {
        id: 'tech-density-as-texture',
        name: 'Density as texture',
        description:
          'Syllable rate high enough that the words read as a percussion layer before they read as language.',
        listenFor:
          'On first listen it is rhythm. On the third it is a sentence.',
        template: multiCompound,
      },
    ],
  },
  {
    id: 'ln-don-toliver',
    name: 'Don Toliver',
    era: '2020s',
    yearsActive: [2017, null],
    region: 'Houston, TX',
    thesis:
      'Uses the voice as an atmospheric instrument — the texture carries the record more than the syllables do.',
    influencedBy: ['ln-drake', 'ln-kanye-west'],
    archiveArtistId: 'don-toliver',
    accentColor: 'cyan-400',
    techniques: [
      {
        id: 'tech-vocal-atmosphere',
        name: 'Vocal as atmosphere',
        description:
          'Phrases stretched and layered until the vocal reads as a pad, with meaning arriving through repetition.',
        listenFor:
          'The hook works before you catch a single word of it.',
        template: melodicRepetition,
      },
    ],
  },
];

export const lineageArtistById: Map<string, LineageArtist> = new Map(
  lineageArtists.map((a) => [a.id, a]),
);

export interface LineageEdgeSpec {
  id: string;
  source: string;
  target: string;
  relation: 'direct' | 'sample' | 'regional';
}

/**
 * Derived from `influencedBy`. A relation is 'regional' when both artists share
 * a region, which is a different kind of claim than direct technical descent.
 */
export const lineageEdges: LineageEdgeSpec[] = lineageArtists.flatMap((artist) =>
  artist.influencedBy
    .filter((sourceId) => lineageArtistById.has(sourceId))
    .map((sourceId) => {
      const source = lineageArtistById.get(sourceId)!;
      const sameRegion =
        source.region.split(',').pop()?.trim() ===
        artist.region.split(',').pop()?.trim();
      return {
        id: `${sourceId}->${artist.id}`,
        source: sourceId,
        target: artist.id,
        relation: sameRegion ? ('regional' as const) : ('direct' as const),
      };
    }),
);

/** Era determines the row, so the graph reads top-to-bottom chronologically. */
export const ERA_ORDER: LineageArtist['era'][] = [
  '80s',
  '90s',
  '2000s',
  '2010s',
  '2020s',
];
