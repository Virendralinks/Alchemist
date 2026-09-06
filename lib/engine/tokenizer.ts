// lib/engine/tokenizer.ts
//
// Splits a bar into tokens while keeping character offsets, because every
// readout downstream — device spans, rhyme highlights, the X-Ray panel — has to
// point back at the exact letters the writer typed. An analysis that knows a
// word rhymes but not where it sits on screen is useless to the UI.

export type TokenKind = 'word' | 'punctuation';

export interface Token {
  text: string;
  /** Offsets into the source line. `line.slice(charStart, charEnd) === text`. */
  charStart: number;
  charEnd: number;
  kind: TokenKind;
  /**
   * True for anything inside parentheses or square brackets. Ad-libs are
   * performed, not counted: a shouted "(yeah)" is not part of the bar's rhythm,
   * so syllable counts, density, and rhyme scheme all skip them.
   */
  isAdLib: boolean;
}

/**
 * Word characters. Apostrophes are kept inside words so `don't` stays one token
 * (CMUdict has it) and the romanized-Hindi habit of writing `dill'` survives.
 * Digits are kept because writers type `9:10` and `24/7` and dropping them would
 * silently shorten the bar.
 */
const WORD_CHAR = /[A-Za-z0-9\u2019']/;
const OPENERS: Record<string, string> = { '(': ')', '[': ']' };

export function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  /** Stack rather than a boolean: writers nest brackets, e.g. "(yeah [ha])". */
  const openStack: string[] = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (OPENERS[ch]) {
      openStack.push(OPENERS[ch]);
      tokens.push({ text: ch, charStart: i, charEnd: i + 1, kind: 'punctuation', isAdLib: true });
      i += 1;
      continue;
    }

    if (openStack.length > 0 && ch === openStack[openStack.length - 1]) {
      openStack.pop();
      tokens.push({ text: ch, charStart: i, charEnd: i + 1, kind: 'punctuation', isAdLib: true });
      i += 1;
      continue;
    }

    if (WORD_CHAR.test(ch)) {
      const start = i;
      while (i < line.length && WORD_CHAR.test(line[i])) i += 1;
      let end = i;
      // A trailing apostrophe is punctuation, not part of the word: `writin'`
      // keeps its apostrophe, but `'em` and `dill'` should not end on one.
      while (end > start + 1 && /['\u2019]/.test(line[end - 1])) end -= 1;
      tokens.push({
        text: line.slice(start, end),
        charStart: start,
        charEnd: end,
        kind: 'word',
        isAdLib: openStack.length > 0,
      });
      if (end < i) {
        tokens.push({
          text: line.slice(end, i),
          charStart: end,
          charEnd: i,
          kind: 'punctuation',
          isAdLib: openStack.length > 0,
        });
      }
      continue;
    }

    // Any other run of non-word, non-space characters is one punctuation token,
    // so `...` and `--` do not become three and two tokens.
    const start = i;
    while (
      i < line.length &&
      !/\s/.test(line[i]) &&
      !WORD_CHAR.test(line[i]) &&
      !OPENERS[line[i]] &&
      !(openStack.length > 0 && line[i] === openStack[openStack.length - 1])
    ) {
      i += 1;
    }
    tokens.push({
      text: line.slice(start, i),
      charStart: start,
      charEnd: i,
      kind: 'punctuation',
      isAdLib: openStack.length > 0,
    });
  }

  return tokens;
}

/** The tokens that carry rhythm: words, ad-libs excluded. */
export const countedWords = (tokens: Token[]): Token[] =>
  tokens.filter((t) => t.kind === 'word' && !t.isAdLib);

/** Mid-line punctuation is a caesura candidate, so the detector needs it. */
export const isCaesuraMark = (token: Token): boolean =>
  token.kind === 'punctuation' && /[,;:—–]|\.\.\./.test(token.text);

export const normalizeToken = (text: string): string =>
  text.toLowerCase().replace(/[\u2019]/g, "'");
