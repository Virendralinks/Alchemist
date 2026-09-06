// lib/mock/dissections/index.ts
//
// Reference-song content, keyed by track id. Kept separate from artists.ts so
// the discography stays readable and each song's annotations live in one file.
//
// This module reaches the engine (helpers.ts computes Tier 1), so it is server
// and build-time only. Nothing under components/ may import it directly —
// pages read it and pass serialized lines down as props.

import type { LyricLine } from '@/lib/types/archive';
import type { TrackProduction } from '@/lib/types/production';

import { aMilliLines, aMilliProduction } from './a-milli';
import { devilLines, devilProduction } from './devil-in-a-new-dress';
import { dnaLines, dnaProduction } from './dna';
import { loseYourselfLines, loseYourselfProduction } from './lose-yourself';
import { magicWandLines, magicWandProduction } from './new-magic-wand';
import { mamaSaidLines, mamaSaidProduction } from './mama-said-knock-you-out';
import { middleChildLines, middleChildProduction } from './middle-child';
import { neverLines, neverProduction } from './never';
import { noIdeaLines, noIdeaProduction } from './no-idea';
import { zeroToHundredLines, zeroToHundredProduction } from './zero-to-100';

export interface ReferenceContent {
  lyrics: LyricLine[];
  production: TrackProduction;
}

export const referenceContent: Record<string, ReferenceContent> = {
  'middle-child-1': { lyrics: middleChildLines, production: middleChildProduction },
  'dna-2': { lyrics: dnaLines, production: dnaProduction },
  'lose-yourself-1': { lyrics: loseYourselfLines, production: loseYourselfProduction },
  'never-9': { lyrics: neverLines, production: neverProduction },
  'a-milli-3': { lyrics: aMilliLines, production: aMilliProduction },
  '0-to-100-1': { lyrics: zeroToHundredLines, production: zeroToHundredProduction },
  'mama-said-knock-you-out-2': { lyrics: mamaSaidLines, production: mamaSaidProduction },
  'new-magic-wand-6': { lyrics: magicWandLines, production: magicWandProduction },
  'devil-in-a-new-dress-8': { lyrics: devilLines, production: devilProduction },
  'no-idea-2': { lyrics: noIdeaLines, production: noIdeaProduction },
};
