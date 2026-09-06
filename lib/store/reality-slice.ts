// lib/store/reality-slice.ts
//
// Holds entries, extractions, and the highlight-to-extract selection state.
// Seeded from lib/mock/raw-reality.ts so the app looks like this user's mind
// on first load. The Reality Flipper's actual extraction logic (/api/metaphor)
// is Phase 4 — Phase 3 extract buttons write local stub ExtractionResults.
import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import type { WorkbenchStore } from './index';
import type { RealityEntry, ExtractionResult } from '@/lib/types/reality';
import { rawRealityEntries } from '@/lib/mock/raw-reality';

export interface RealitySlice {
  entries: RealityEntry[];
  extractions: ExtractionResult[];
  selectedEntryId: string | null;
  /** Character span currently highlighted in the raw-reality pane, for extraction. */
  selectionSpan: [number, number] | null;

  addEntry(body: string, tags?: string[], mood?: RealityEntry['mood']): void;
  deleteEntry(entryId: string): void;
  selectEntry(entryId: string | null): void;
  setSelectionSpan(span: [number, number] | null): void;
  addExtraction(extraction: ExtractionResult): void;
  acceptExtraction(extractionId: string): void;
  rejectExtraction(extractionId: string): void;
}

export const createRealitySlice: StateCreator<
  WorkbenchStore,
  [['zustand/immer', never]],
  [],
  RealitySlice
> = (set) => ({
  entries: rawRealityEntries,
  extractions: [],
  selectedEntryId: null,
  selectionSpan: null,

  addEntry: (body, tags = [], mood = 'flat') =>
    set((state) => {
      const entry: RealityEntry = {
        id: nanoid(),
        createdAt: new Date().toISOString(),
        body,
        tags,
        mood,
      };
      state.entries.unshift(entry);
    }),

  deleteEntry: (entryId) =>
    set((state) => {
      state.entries = state.entries.filter((e) => e.id !== entryId);
      if (state.selectedEntryId === entryId) state.selectedEntryId = null;
    }),

  selectEntry: (entryId) =>
    set((state) => {
      state.selectedEntryId = entryId;
      state.selectionSpan = null;
    }),

  setSelectionSpan: (span) =>
    set((state) => {
      state.selectionSpan = span;
    }),

  addExtraction: (extraction) =>
    set((state) => {
      state.extractions.push(extraction);
    }),

  acceptExtraction: (extractionId) =>
    set((state) => {
      const extraction = state.extractions.find((e) => e.id === extractionId);
      if (extraction) extraction.accepted = true;
    }),

  rejectExtraction: (extractionId) =>
    set((state) => {
      state.extractions = state.extractions.filter((e) => e.id !== extractionId);
    }),
});
