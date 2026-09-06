// tests/fixtures/hinglish-bars.ts
//
// The golden set. 44 bars in 22 couplets, mixing English and romanized Hindi,
// each hand-annotated with the four things the engine must get right:
// total syllable count, per-token language, per-syllable stress, and the
// end-rhyme classification against its partner bar.
//
// How to read `stress`: it is a flat array over the whole bar, one entry per
// syllable, in reading order, concatenating each word's syllables. Its length
// must equal `syllables` — that redundancy is deliberate, because a count that
// disagrees with its own stress pattern is the first sign of a G2P bug.
//
// Ad-libs in parentheses are excluded from `tokens`, `syllables`, and `stress`.
// A shouted "(yeah)" is not part of the bar's rhythm and must not be counted.
//
// English stress comes from CMUdict, so these annotations are checked against
// the dictionary rather than invented. Hindi stress follows the weight rule in
// `syllabify.ts`: exactly one primary per word, on the leftmost heaviest
// syllable, where a long vowel or a coda makes a syllable heavy.

import type { Lang, Stress } from '@/lib/types/phonetics';
import type { RhymeType } from '@/lib/types/rhyme';

export interface FixtureToken {
  text: string;
  lang: Lang;
}

export interface HinglishBar {
  id: string;
  text: string;
  /** Word tokens only, in order. Punctuation and ad-libs are excluded. */
  tokens: FixtureToken[];
  /** Total syllables in the bar, ad-libs excluded. */
  syllables: number;
  /** One entry per syllable, in reading order. Length === `syllables`. */
  stress: Stress[];
  /** The line-final word — what the end rhyme is computed on. */
  endWord: string;
}

export interface HinglishCouplet {
  id: string;
  a: HinglishBar;
  b: HinglishBar;
  /** How `a.endWord` rhymes with `b.endWord`, by the 3.8 priority table. */
  endRhyme: RhymeType;
  /** True when the rhyming pair spans languages — the bilingual-only device. */
  crossLanguage: boolean;
}

const en = (text: string): FixtureToken => ({ text, lang: 'en' });
const hi = (text: string): FixtureToken => ({ text, lang: 'hi' });

export const HINGLISH_COUPLETS: HinglishCouplet[] = [
  {
    id: 'c01-perfect-en',
    endRhyme: 'perfect',
    crossLanguage: false,
    a: {
      id: 'c01a',
      text: 'I pushed the fix at two',
      tokens: [en('I'), en('pushed'), en('the'), en('fix'), en('at'), en('two')],
      syllables: 6,
      stress: [1, 1, 0, 1, 1, 1],
      endWord: 'two',
    },
    b: {
      id: 'c01b',
      text: 'the pipeline pushed it through',
      tokens: [en('the'), en('pipeline'), en('pushed'), en('it'), en('through')],
      syllables: 6,
      stress: [0, 1, 2, 1, 1, 1],
      endWord: 'through',
    },
  },
  {
    id: 'c02-identical-hi',
    endRhyme: 'identical',
    crossLanguage: false,
    a: {
      id: 'c02a',
      text: 'mera dil abhi tak tuta nahi',
      tokens: [hi('mera'), hi('dil'), hi('abhi'), hi('tak'), hi('tuta'), hi('nahi')],
      syllables: 10,
      stress: [1, 0, 1, 0, 1, 1, 1, 0, 0, 1],
      endWord: 'nahi',
    },
    b: {
      id: 'c02b',
      text: 'is shehar mein koi apna nahi',
      tokens: [hi('is'), hi('shehar'), hi('mein'), hi('koi'), hi('apna'), hi('nahi')],
      syllables: 10,
      stress: [1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
      endWord: 'nahi',
    },
  },
  {
    id: 'c03-perfect-hi',
    endRhyme: 'perfect',
    crossLanguage: false,
    a: {
      id: 'c03a',
      text: 'aaj raat phir se wahi baat',
      tokens: [hi('aaj'), hi('raat'), hi('phir'), hi('se'), hi('wahi'), hi('baat')],
      syllables: 7,
      stress: [1, 1, 1, 1, 0, 1, 1],
      endWord: 'baat',
    },
    b: {
      id: 'c03b',
      text: 'neend nahi aayi saari raat',
      tokens: [hi('neend'), hi('nahi'), hi('aayi'), hi('saari'), hi('raat')],
      syllables: 8,
      stress: [1, 0, 1, 1, 0, 1, 0, 1],
      endWord: 'raat',
    },
  },
  {
    id: 'c04-slant-en',
    endRhyme: 'slant',
    crossLanguage: false,
    a: {
      id: 'c04a',
      text: 'the bars I wrote took shape',
      tokens: [en('the'), en('bars'), en('I'), en('wrote'), en('took'), en('shape')],
      syllables: 6,
      stress: [0, 1, 1, 1, 1, 1],
      endWord: 'shape',
    },
    b: {
      id: 'c04b',
      text: 'the sprint I sold them was fake',
      tokens: [en('the'), en('sprint'), en('I'), en('sold'), en('them'), en('was'), en('fake')],
      syllables: 7,
      stress: [0, 1, 1, 1, 1, 1, 1],
      endWord: 'fake',
    },
  },
  {
    id: 'c05-para-en',
    endRhyme: 'para',
    crossLanguage: false,
    a: {
      id: 'c05a',
      text: 'I put my head down and I grind',
      tokens: [en('I'), en('put'), en('my'), en('head'), en('down'), en('and'), en('I'), en('grind')],
      syllables: 8,
      stress: [1, 1, 1, 1, 1, 0, 1, 1],
      endWord: 'grind',
    },
    b: {
      id: 'c05b',
      text: 'the whole floor looks so grand',
      tokens: [en('the'), en('whole'), en('floor'), en('looks'), en('so'), en('grand')],
      syllables: 6,
      stress: [0, 1, 1, 1, 1, 1],
      endWord: 'grand',
    },
  },
  {
    id: 'c06-multi-hi',
    endRhyme: 'multisyllabic',
    crossLanguage: false,
    a: {
      id: 'c06a',
      text: 'ye thi meri kismat',
      tokens: [hi('ye'), hi('thi'), hi('meri'), hi('kismat')],
      syllables: 6,
      stress: [1, 1, 1, 0, 1, 0],
      endWord: 'kismat',
    },
    b: {
      id: 'c06b',
      text: 'ab toot rahi meri himmat',
      tokens: [hi('ab'), hi('toot'), hi('rahi'), hi('meri'), hi('himmat')],
      syllables: 8,
      stress: [1, 1, 0, 1, 1, 0, 1, 0],
      endWord: 'himmat',
    },
  },
  {
    id: 'c07-perfect-cross',
    endRhyme: 'perfect',
    crossLanguage: true,
    a: {
      id: 'c07a',
      text: 'tere naam pe rukta mera dil',
      tokens: [hi('tere'), hi('naam'), hi('pe'), hi('rukta'), hi('mera'), hi('dil')],
      syllables: 9,
      stress: [1, 0, 1, 1, 1, 0, 1, 0, 1],
      endWord: 'dil',
    },
    b: {
      id: 'c07b',
      text: 'the servers hum and the office is still',
      tokens: [
        en('the'), en('servers'), en('hum'), en('and'), en('the'), en('office'), en('is'), en('still'),
      ],
      syllables: 10,
      stress: [0, 1, 0, 1, 0, 0, 1, 0, 1, 1],
      endWord: 'still',
    },
  },
  {
    id: 'c08-perfect-cross-naam',
    endRhyme: 'perfect',
    crossLanguage: true,
    a: {
      id: 'c08a',
      text: 'din bhar likha sirf tera naam',
      tokens: [hi('din'), hi('bhar'), hi('likha'), hi('sirf'), hi('tera'), hi('naam')],
      syllables: 8,
      stress: [1, 1, 0, 1, 1, 1, 0, 1],
      endWord: 'naam',
    },
    b: {
      id: 'c08b',
      text: 'I take the hit and I stay calm',
      tokens: [en('I'), en('take'), en('the'), en('hit'), en('and'), en('I'), en('stay'), en('calm')],
      syllables: 8,
      stress: [1, 1, 0, 1, 0, 1, 1, 1],
      endWord: 'calm',
    },
  },
  {
    id: 'c09-forced-cross',
    endRhyme: 'para',
    crossLanguage: true,
    a: {
      id: 'c09a',
      text: 'aaj bhi hai kal ka dard',
      tokens: [hi('aaj'), hi('bhi'), hi('hai'), hi('kal'), hi('ka'), hi('dard')],
      syllables: 6,
      stress: [1, 1, 1, 1, 1, 1],
      endWord: 'dard',
    },
    b: {
      id: 'c09b',
      text: 'I ate the loss and moved on hard',
      tokens: [en('I'), en('ate'), en('the'), en('loss'), en('and'), en('moved'), en('on'), en('hard')],
      syllables: 8,
      stress: [1, 1, 0, 1, 0, 1, 1, 1],
      endWord: 'hard',
    },
  },
  {
    id: 'c10-slant-mixed',
    endRhyme: 'slant',
    crossLanguage: false,
    a: {
      id: 'c10a',
      text: 'har roz wahi ek kaam',
      tokens: [hi('har'), hi('roz'), hi('wahi'), hi('ek'), hi('kaam')],
      syllables: 6,
      stress: [1, 1, 0, 1, 1, 1],
      endWord: 'kaam',
    },
    b: {
      id: 'c10b',
      text: 'ab bhi mera table nahi saaf',
      tokens: [hi('ab'), hi('bhi'), hi('mera'), en('table'), hi('nahi'), hi('saaf')],
      syllables: 9,
      stress: [1, 1, 1, 0, 1, 0, 0, 1, 1],
      endWord: 'saaf',
    },
  },
  {
    id: 'c11-para-hi',
    endRhyme: 'para',
    crossLanguage: false,
    a: {
      id: 'c11a',
      text: 'din bhar chalta rehta hai dil',
      tokens: [hi('din'), hi('bhar'), hi('chalta'), hi('rehta'), hi('hai'), hi('dil')],
      syllables: 8,
      stress: [1, 1, 1, 0, 1, 0, 1, 1],
      endWord: 'dil',
    },
    b: {
      id: 'c11b',
      text: 'phir bhi mera sirf thoda daal',
      tokens: [hi('phir'), hi('bhi'), hi('mera'), hi('sirf'), hi('thoda'), hi('daal')],
      syllables: 8,
      stress: [1, 1, 1, 0, 1, 1, 0, 1],
      endWord: 'daal',
    },
  },
  {
    id: 'c12-multi-en',
    endRhyme: 'perfect',
    crossLanguage: false,
    a: {
      id: 'c12a',
      text: 'the ticket lands on me later',
      tokens: [en('the'), en('ticket'), en('lands'), en('on'), en('me'), en('later')],
      syllables: 8,
      stress: [0, 1, 0, 1, 1, 1, 1, 0],
      endWord: 'later',
    },
    b: {
      id: 'c12b',
      text: 'my notice period made me greater',
      tokens: [en('my'), en('notice'), en('period'), en('made'), en('me'), en('greater')],
      syllables: 10,
      stress: [1, 1, 0, 1, 0, 0, 1, 1, 1, 0],
      endWord: 'greater',
    },
  },
  {
    id: 'c13-identical-en',
    endRhyme: 'identical',
    crossLanguage: false,
    a: {
      id: 'c13a',
      text: 'the pen is all I got so I write',
      tokens: [
        en('the'), en('pen'), en('is'), en('all'), en('I'), en('got'), en('so'), en('I'), en('write'),
      ],
      syllables: 9,
      stress: [0, 1, 1, 1, 1, 1, 1, 1, 1],
      endWord: 'write',
    },
    b: {
      id: 'c13b',
      text: 'and each bar I chose was right',
      tokens: [en('and'), en('each'), en('bar'), en('I'), en('chose'), en('was'), en('right')],
      syllables: 7,
      stress: [0, 1, 1, 1, 1, 1, 1],
      endWord: 'right',
    },
  },
  {
    id: 'c14-perfect-cross-din',
    endRhyme: 'perfect',
    crossLanguage: true,
    a: {
      id: 'c14a',
      text: 'office se ghar tak wahi din',
      tokens: [en('office'), hi('se'), hi('ghar'), hi('tak'), hi('wahi'), hi('din')],
      syllables: 8,
      stress: [1, 0, 1, 1, 1, 0, 1, 1],
      endWord: 'din',
    },
    b: {
      id: 'c14b',
      text: 'the standup asks me where I been',
      tokens: [en('the'), en('standup'), en('asks'), en('me'), en('where'), en('I'), en('been')],
      syllables: 8,
      stress: [0, 1, 2, 1, 1, 1, 1, 1],
      endWord: 'been',
    },
  },
  {
    // dil /d̪ɪl/ against deal /dil/: the coda is identical and only the nucleus
    // moves, which is pararhyme, not a stretch. Cross-language pairs land here
    // often, because Hindi short /ɪ/ maps onto English long /i/ constantly.
    id: 'c15-para-cross-deal',
    endRhyme: 'para',
    crossLanguage: true,
    a: {
      id: 'c15a',
      text: 'poora din bik gaya mera dil',
      tokens: [hi('poora'), hi('din'), hi('bik'), hi('gaya'), hi('mera'), hi('dil')],
      syllables: 9,
      stress: [1, 0, 1, 1, 0, 1, 1, 0, 1],
      endWord: 'dil',
    },
    b: {
      id: 'c15b',
      text: 'they call it a fair deal',
      tokens: [en('they'), en('call'), en('it'), en('a'), en('fair'), en('deal')],
      syllables: 6,
      stress: [1, 1, 1, 0, 1, 1],
      endWord: 'deal',
    },
  },
  {
    id: 'c16-assonance-hi',
    endRhyme: 'assonance-chain',
    crossLanguage: false,
    a: {
      id: 'c16a',
      text: 'I built this beat like a maker',
      tokens: [en('I'), en('built'), en('this'), en('beat'), en('like'), en('a'), en('maker')],
      syllables: 8,
      stress: [1, 1, 1, 1, 1, 0, 1, 0],
      endWord: 'maker',
    },
    b: {
      id: 'c16b',
      text: 'they asked me twice for a favor',
      tokens: [en('they'), en('asked'), en('me'), en('twice'), en('for'), en('a'), en('favor')],
      syllables: 8,
      stress: [1, 1, 1, 1, 1, 0, 1, 0],
      endWord: 'favor',
    },
  },
  {
    id: 'c17-slant-en-sleep',
    endRhyme: 'slant',
    crossLanguage: false,
    a: {
      id: 'c17a',
      text: 'the deadline moved and I lost sleep',
      tokens: [
        en('the'), en('deadline'), en('moved'), en('and'), en('I'), en('lost'), en('sleep'),
      ],
      syllables: 8,
      stress: [0, 1, 2, 1, 0, 1, 1, 1],
      endWord: 'sleep',
    },
    b: {
      id: 'c17b',
      text: 'I eat the loss and I repeat',
      tokens: [en('I'), en('eat'), en('the'), en('loss'), en('and'), en('I'), en('repeat')],
      syllables: 8,
      stress: [1, 1, 0, 1, 0, 1, 0, 1],
      endWord: 'repeat',
    },
  },
  {
    id: 'c18-perfect-adlib',
    endRhyme: 'perfect',
    crossLanguage: false,
    a: {
      id: 'c18a',
      text: 'deployed the fix (yeah) phir bhi client naaraaz',
      tokens: [
        en('deployed'), en('the'), en('fix'), hi('phir'), hi('bhi'), en('client'), hi('naaraaz'),
      ],
      syllables: 10,
      stress: [0, 1, 0, 1, 1, 1, 1, 0, 0, 1],
      endWord: 'naaraaz',
    },
    b: {
      id: 'c18b',
      text: 'meri migration ka yahi andaaz',
      tokens: [hi('meri'), en('migration'), hi('ka'), hi('yahi'), hi('andaaz')],
      syllables: 10,
      stress: [1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
      endWord: 'andaaz',
    },
  },
  {
    id: 'c19-para-hi-dil',
    endRhyme: 'para',
    crossLanguage: false,
    a: {
      id: 'c19a',
      text: 'tod ke rakh diya mera dil',
      tokens: [hi('tod'), hi('ke'), hi('rakh'), hi('diya'), hi('mera'), hi('dil')],
      syllables: 8,
      stress: [1, 1, 1, 0, 1, 1, 0, 1],
      endWord: 'dil',
    },
    b: {
      id: 'c19b',
      text: 'ghar mein bacha sirf thoda daal',
      tokens: [hi('ghar'), hi('mein'), hi('bacha'), hi('sirf'), hi('thoda'), hi('daal')],
      syllables: 8,
      stress: [1, 1, 1, 0, 1, 1, 0, 1],
      endWord: 'daal',
    },
  },
  {
    id: 'c20-forced-en',
    endRhyme: 'forced',
    crossLanguage: false,
    a: {
      id: 'c20a',
      text: "I don't sleep I watch the moon",
      tokens: [en('I'), en("don't"), en('sleep'), en('I'), en('watch'), en('the'), en('moon')],
      syllables: 7,
      stress: [1, 1, 1, 1, 1, 0, 1],
      endWord: 'moon',
    },
    b: {
      id: 'c20b',
      text: 'they never left me with a map',
      tokens: [en('they'), en('never'), en('left'), en('me'), en('with'), en('a'), en('map')],
      syllables: 8,
      stress: [1, 1, 0, 1, 1, 1, 0, 1],
      endWord: 'map',
    },
  },
  {
    id: 'c21-multi-hi-izzat',
    endRhyme: 'multisyllabic',
    crossLanguage: false,
    a: {
      id: 'c21a',
      text: 'kaam se mili sirf izzat',
      tokens: [hi('kaam'), hi('se'), hi('mili'), hi('sirf'), hi('izzat')],
      syllables: 7,
      stress: [1, 1, 0, 1, 1, 1, 0],
      endWord: 'izzat',
    },
    b: {
      id: 'c21b',
      text: 'paisa nahi bacha meri kismat',
      tokens: [hi('paisa'), hi('nahi'), hi('bacha'), hi('meri'), hi('kismat')],
      syllables: 10,
      stress: [1, 0, 0, 1, 1, 0, 1, 0, 1, 0],
      endWord: 'kismat',
    },
  },
  {
    id: 'c22-identical-hi-hai',
    endRhyme: 'identical',
    crossLanguage: false,
    a: {
      id: 'c22a',
      text: 'ye sheher mera ghar hai',
      tokens: [hi('ye'), hi('sheher'), hi('mera'), hi('ghar'), hi('hai')],
      syllables: 7,
      stress: [1, 0, 1, 1, 0, 1, 1],
      endWord: 'hai',
    },
    b: {
      id: 'c22b',
      text: 'aur ye kaam mera hai',
      tokens: [hi('aur'), hi('ye'), hi('kaam'), hi('mera'), hi('hai')],
      syllables: 6,
      stress: [1, 1, 1, 1, 0, 1],
      endWord: 'hai',
    },
  },
];

/** Flat list, for tests that do not care about pairing. */
export const HINGLISH_BARS: HinglishBar[] = HINGLISH_COUPLETS.flatMap((c) => [c.a, c.b]);

/**
 * The ambiguous tokens from the Section 3.2 table. Each is given twice, in a
 * context that should force each reading, because the whole point is that the
 * decision is contextual rather than a fixed dictionary answer.
 */
export interface AmbiguousCase {
  /** The token under test, as it appears in `text`. */
  token: string;
  text: string;
  expected: Lang;
  /** Why a human reads it this way — the note is for whoever debugs a failure. */
  note: string;
}

export const AMBIGUOUS_TOKEN_CASES: AmbiguousCase[] = [
  { token: 'main', text: 'the main pipeline broke again', expected: 'en', note: 'English adjective before an English noun' },
  { token: 'main', text: 'kal main ghar se aaya', expected: 'hi', note: 'Hindi first-person pronoun; Hindi neighbours on both sides' },
  { token: 'to', text: 'I sent the file to the client', expected: 'en', note: 'English preposition' },
  { token: 'to', text: 'baat kar li to phir kya hua', expected: 'hi', note: 'Hindi discourse particle toh' },
  { token: 'bat', text: 'he swung the bat and missed', expected: 'en', note: 'English noun with English determiner' },
  { token: 'bat', text: 'meri bat koi nahi sunta', expected: 'hi', note: 'baat spelled short; Hindi frame' },
  { token: 'sab', text: 'sab log yahi bolte hai', expected: 'hi', note: 'Hindi quantifier' },
  { token: 'car', text: 'I parked the car outside', expected: 'en', note: 'English noun' },
  { token: 'car', text: 'kaam car ke ghar jao', expected: 'hi', note: 'kar spelled with c; Hindi verb stem' },
  { token: 'mere', text: 'mere ghar mein koi nahi', expected: 'hi', note: 'Hindi possessive' },
  { token: 'is', text: 'the migration is broken', expected: 'en', note: 'English copula' },
  { token: 'is', text: 'is shehar mein sab bikta hai', expected: 'hi', note: 'Hindi oblique demonstrative' },
  { token: 'dil', text: 'mera dil abhi bhi jaga hai', expected: 'hi', note: 'Hindi-only word' },
  { token: 'kal', text: 'kal raat neend nahi aayi', expected: 'hi', note: 'Hindi-only word' },
];

/**
 * Schwa deletion is the single biggest correctness risk in Hindi phonetics
 * (Section 3.4). Every one of these is a hand-checked count.
 */
export interface SchwaCase {
  token: string;
  /** Expected syllable count of the top-ranked pronunciation. */
  syllables: number;
  note: string;
}

export const SCHWA_CASES: SchwaCase[] = [
  { token: 'kamal', syllables: 2, note: 'word-final schwa deletes: kə.məl, never kə.mə.lə' },
  { token: 'samajh', syllables: 2, note: 'word-final schwa deletes: sə.mədʒʰ' },
  { token: 'karan', syllables: 2, note: 'kə.rən' },
  { token: 'sagar', syllables: 2, note: 'sə.gər' },
  { token: 'andar', syllables: 2, note: 'word-initial schwa is never deleted: ən.d̪ər' },
  { token: 'agar', syllables: 2, note: 'word-initial schwa preserved: ə.gər' },
  { token: 'asar', syllables: 2, note: 'word-initial schwa preserved: ə.sər' },
  { token: 'karna', syllables: 2, note: 'medial schwa deletes in VC_CV: kər.naː' },
  { token: 'samajhna', syllables: 3, note: 'sə.mədʒʰ.naː — deletion must not strand an illegal cluster' },
  { token: 'dhadkan', syllables: 2, note: 'd̪ʰəɽ.kən' },
  { token: 'mausam', syllables: 2, note: 'mɔː.səm' },
  { token: 'nikalna', syllables: 3, note: 'nɪ.kəl.naː' },
];
