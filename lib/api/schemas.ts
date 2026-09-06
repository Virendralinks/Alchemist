// lib/api/schemas.ts
//
// Every API boundary validates with Zod on the way in and on the way out.
// These schemas are shared by the route handlers and by the typed client in
// lib/api/client.ts, so a contract change is a compile error on both sides.

import { z } from 'zod';
import { devices } from '@/lib/mock/devices';

/**
 * Bumping this invalidates every cached dissection (Section 4.4). Bump it when
 * the Dissection shape changes, never for a prompt tweak.
 */
export const SCHEMA_VERSION = 1;

/**
 * The device vocabulary is closed. Built from the taxonomy at module load so
 * the model can never invent terminology (Section 4.3).
 */
export const ALL_DEVICE_IDS: string[] = devices.map((d) => d.id);
export const DEVICE_ID_SET: ReadonlySet<string> = new Set(ALL_DEVICE_IDS);
export const deviceIdEnum = z.enum(ALL_DEVICE_IDS as [string, ...string[]]);

// ---------------------------------------------------------------------------
// Phonetic primitives — mirror lib/types/phonetics.ts
// ---------------------------------------------------------------------------

export const langSchema = z.enum(['en', 'hi']);
export const stressSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const phonemeSchema = z.object({
  ipa: z.string(),
  kind: z.enum(['vowel', 'consonant']),
  length: z.enum(['short', 'long']),
  stress: stressSchema,
  nasalized: z.boolean().optional(),
});

export const syllableSchema = z.object({
  onset: z.array(phonemeSchema),
  nucleus: phonemeSchema,
  coda: z.array(phonemeSchema),
  stress: stressSchema,
  graphemes: z.string(),
});

export const pronunciationSchema = z.object({
  phonemes: z.array(phonemeSchema),
  syllables: z.array(syllableSchema),
  assonanceKey: z.string(),
  rhymeTail: z.string(),
  score: z.number(),
  origin: z.enum(['lexicon', 'rules', 'user']),
});

export const tokenAnalysisSchema = z.object({
  token: z.string(),
  charStart: z.number().int().nonnegative(),
  charEnd: z.number().int().nonnegative(),
  lang: langSchema,
  langConfidence: z.number(),
  langLocked: z.boolean(),
  candidates: z.array(pronunciationSchema),
  selectedCandidate: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Tier 1 — computed, never generated
// ---------------------------------------------------------------------------

const spanSchema = z.tuple([z.number().int(), z.number().int()]);

export const rhythmAnalysisSchema = z.object({
  syllableCount: z.number().int().nonnegative(),
  tokens: z.array(tokenAnalysisSchema),
  schemeLetter: z.string(),
  internalRhymes: z.array(
    z.object({ aSpan: spanSchema, bSpan: spanSchema, score: z.number() }),
  ),
  assonanceChains: z.array(
    z.object({ key: z.string(), spans: z.array(spanSchema) }),
  ),
  density: z.number(),
  slotMap: z.array(z.string().nullable()),
  pocket: z.enum(['ahead', 'in', 'behind', 'mixed']),
  articulation: z.enum(['staccato', 'legato', 'mixed']),
});

// ---------------------------------------------------------------------------
// Tier 2 — interpretive
// ---------------------------------------------------------------------------

export const entendreSchema = z.object({
  reading: z.string().min(1),
  layer: z.enum(['literal', 'figurative', 'cultural', 'meta']),
  charStart: z.number().int().nonnegative(),
  charEnd: z.number().int().nonnegative(),
});

/**
 * Model-authored device instances are always `llm` + `arguable`. The route
 * overwrites these fields regardless of what came back, so a model cannot
 * claim certainty for itself.
 */
export const deviceInstanceSchema = z.object({
  deviceId: deviceIdEnum,
  charStart: z.number().int().nonnegative(),
  charEnd: z.number().int().nonnegative(),
  explanation: z.string().min(1),
  detectedBy: z.enum(['engine', 'llm', 'author']).default('llm'),
  confidence: z.enum(['certain', 'arguable']).default('arguable'),
});

// ---------------------------------------------------------------------------
// POST /api/dissect
// ---------------------------------------------------------------------------

export const dissectRequest = z.object({
  text: z.string().min(1).max(4000),
  tier1: rhythmAnalysisSchema,
  context: z
    .object({
      bpm: z.number().int().min(40).max(220).optional(),
      /** Optional stylistic frame: "dissect as if this were a J. Cole verse". */
      referenceArtistId: z.string().optional(),
      langHint: z.enum(['en', 'hi', 'mixed']).optional(),
    })
    .optional(),
});
export type DissectRequest = z.infer<typeof dissectRequest>;

/** Streamed as NDJSON; each line is one patch applied to the draft Dissection. */
export const dissectPatch = z.discriminatedUnion('field', [
  z.object({ field: z.literal('meaning'), value: z.string() }),
  z.object({ field: z.literal('flowMechanics'), value: z.string() }),
  z.object({ field: z.literal('rhymeScience'), value: z.string() }),
  z.object({ field: z.literal('why'), value: z.string() }),
  z.object({ field: z.literal('entendre'), value: entendreSchema }),
  z.object({ field: z.literal('device'), value: deviceInstanceSchema }),
  z.object({ field: z.literal('done'), value: z.object({ model: z.string() }) }),
  z.object({ field: z.literal('error'), value: z.object({ message: z.string() }) }),
]);
export type DissectPatch = z.infer<typeof dissectPatch>;

/** What the model is asked to return, before validation strips the invalid parts. */
export const dissectModelOutput = z.object({
  meaning: z.string().optional(),
  flowMechanics: z.string().optional(),
  rhymeScience: z.string().optional(),
  why: z.string().optional(),
  entendres: z.array(z.unknown()).optional(),
  devices: z.array(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// POST /api/suggest
// ---------------------------------------------------------------------------

export const suggestRequest = z.object({
  line: z.string().min(1).max(500),
  langHint: z.enum(['en', 'hi', 'mixed']).optional(),
  /** Emotional register from the surrounding draft, if known. */
  mood: z.string().max(40).optional(),
});
export type SuggestRequest = z.infer<typeof suggestRequest>;

export const deviceSuggestion = z.object({
  deviceId: deviceIdEnum,
  /** The concrete idea, not a definition. */
  idea: z.string().min(1),
  /** Optional rewritten fragment demonstrating it. */
  example: z.string().optional(),
});

export const suggestResponse = z.object({
  suggestions: z.array(deviceSuggestion),
  model: z.string(),
});
export type SuggestResponse = z.infer<typeof suggestResponse>;

// ---------------------------------------------------------------------------
// POST /api/rhyme — mosaic + holorime phrase search (no model involved)
// ---------------------------------------------------------------------------

export const rhymeRequest = z.object({
  token: z.string().min(1).max(80),
  lang: langSchema,
  /** Full line, required for holorime search. */
  line: z.string().max(500).optional(),
  limit: z.number().int().min(1).max(60).optional(),
});
export type RhymeRequest = z.infer<typeof rhymeRequest>;

export const rhymeCandidateSchema = z.object({
  text: z.string(),
  lang: langSchema,
  type: z.enum([
    'perfect',
    'identical',
    'slant',
    'para',
    'consonance',
    'assonance-chain',
    'internal',
    'multisyllabic',
    'mosaic',
    'holorime',
    'forced',
  ]),
  score: z.number(),
  phonemes: z.array(phonemeSchema),
  syllableCount: z.number().int().nonnegative(),
  gloss: z.string().optional(),
  isCrossLanguage: z.boolean(),
  tags: z.array(z.string()),
});

export const rhymeResponse = z.object({
  candidates: z.array(rhymeCandidateSchema),
});
export type RhymeResponse = z.infer<typeof rhymeResponse>;

// ---------------------------------------------------------------------------
// POST /api/metaphor — Reality Flipper extraction
// ---------------------------------------------------------------------------

export const metaphorRequest = z.object({
  entryId: z.string().min(1),
  text: z.string().min(1).max(2000),
  span: spanSchema,
  kind: z.enum(['metaphor', 'muhawara', 'pocket-skeleton', 'image']),
});
export type MetaphorRequest = z.infer<typeof metaphorRequest>;

export const extractionResultSchema = z.object({
  id: z.string(),
  sourceEntryId: z.string(),
  sourceSpan: spanSchema,
  kind: z.enum(['metaphor', 'muhawara', 'pocket-skeleton', 'image']),
  output: z.string().min(1),
  gloss: z.string().optional(),
  literal: z.string().optional(),
  templateId: z.string().optional(),
  accepted: z.boolean(),
});

export const metaphorResponse = z.object({
  extractions: z.array(extractionResultSchema),
  model: z.string(),
});
export type MetaphorResponse = z.infer<typeof metaphorResponse>;

/** Shape every route uses for a handled failure. */
export const apiError = z.object({
  error: z.string(),
  /** True when the failure is a missing key rather than a bug — drives degrade UI. */
  degraded: z.boolean().optional(),
});
export type ApiError = z.infer<typeof apiError>;
