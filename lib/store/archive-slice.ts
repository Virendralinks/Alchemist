// lib/store/archive-slice.ts
//
// Holds only navigation and X-Ray selection. The catalogue itself is static
// module data (lib/mock/artists.ts) and is never copied into the store.
import type { StateCreator } from 'zustand';
import type { WorkbenchStore } from './index';

export interface ArchiveSlice {
  selectedArtistId: string | null;
  selectedTrackId: string | null;
  selectedLineIds: string[];
  selectedBlockRange: [number, number] | null;

  selectArtist(artistId: string | null): void;
  selectTrack(trackId: string | null): void;
  selectLine(lineId: string, additive?: boolean): void;
  selectBlockRange(range: [number, number] | null): void;
  clearSelection(): void;
}

export const createArchiveSlice: StateCreator<
  WorkbenchStore,
  [['zustand/immer', never]],
  [],
  ArchiveSlice
> = (set) => ({
  selectedArtistId: null,
  selectedTrackId: null,
  selectedLineIds: [],
  selectedBlockRange: null,

  selectArtist: (artistId) =>
    set((state) => {
      state.selectedArtistId = artistId;
      state.selectedTrackId = null;
      state.selectedLineIds = [];
      state.selectedBlockRange = null;
    }),

  selectTrack: (trackId) =>
    set((state) => {
      state.selectedTrackId = trackId;
      state.selectedLineIds = [];
      state.selectedBlockRange = null;
    }),

  selectLine: (lineId, additive = false) =>
    set((state) => {
      state.selectedBlockRange = null;
      if (additive) {
        if (!state.selectedLineIds.includes(lineId)) state.selectedLineIds.push(lineId);
      } else {
        state.selectedLineIds = [lineId];
      }
    }),

  selectBlockRange: (range) =>
    set((state) => {
      state.selectedBlockRange = range;
      state.selectedLineIds = [];
    }),

  clearSelection: () =>
    set((state) => {
      state.selectedLineIds = [];
      state.selectedBlockRange = null;
    }),
});
