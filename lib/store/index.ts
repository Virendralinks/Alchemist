// lib/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSequencerSlice, type SequencerSlice } from './sequencer-slice';
import { createRealitySlice, type RealitySlice } from './reality-slice';
import { createEngineSlice, type EngineSlice } from './engine-slice';
import { createDissectSlice, type DissectSlice } from './dissect-slice';
import { createCodexSlice, type CodexSlice } from './codex-slice';
import { createArchiveSlice, type ArchiveSlice } from './archive-slice';
import { createUiSlice, type UiSlice } from './ui-slice';

export type WorkbenchStore = SequencerSlice &
  RealitySlice &
  EngineSlice &
  DissectSlice &
  CodexSlice &
  ArchiveSlice &
  UiSlice;

export const useWorkbenchStore = create<WorkbenchStore>()(
  persist(
    immer((...a) => ({
      ...createSequencerSlice(...a),
      ...createRealitySlice(...a),
      ...createEngineSlice(...a),
      ...createDissectSlice(...a),
      ...createCodexSlice(...a),
      ...createArchiveSlice(...a),
      ...createUiSlice(...a),
    })),
    {
      name: 'alchemists-workbench',
      version: 2,
      migrate: (persisted) => persisted,
      /** Persist user work only. Lexicons, indexes, and archive data are code, not state. */
      partialize: (s) => ({
        grids: s.grids,
        activeGridId: s.activeGridId,
        entries: s.entries,
        extractions: s.extractions,
        langOverrides: s.langOverrides,
        pronunciationOverrides: s.pronunciationOverrides,
        mastery: s.mastery,
        userDissections: s.userDissections,
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
      // Old v1 blobs stored a nested `ui` key and sometimes the whole store,
      // including selectedNodeIds. Restoring that mounted the emphasis slider
      // on first paint, which looped. Only copy the keys we actually persist.
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== 'object') return current;
        const p = persisted as Record<string, unknown>;
        const ui =
          p.ui && typeof p.ui === 'object'
            ? (p.ui as { theme?: 'dark' | 'light'; sidebarCollapsed?: boolean })
            : undefined;
        return {
          ...current,
          grids: (p.grids as WorkbenchStore['grids']) ?? current.grids,
          activeGridId:
            (p.activeGridId as string | undefined) ?? current.activeGridId,
          entries: (p.entries as WorkbenchStore['entries']) ?? current.entries,
          extractions:
            (p.extractions as WorkbenchStore['extractions']) ?? current.extractions,
          langOverrides:
            (p.langOverrides as WorkbenchStore['langOverrides']) ??
            current.langOverrides,
          pronunciationOverrides:
            (p.pronunciationOverrides as WorkbenchStore['pronunciationOverrides']) ??
            current.pronunciationOverrides,
          mastery: (p.mastery as WorkbenchStore['mastery']) ?? current.mastery,
          userDissections:
            (p.userDissections as WorkbenchStore['userDissections']) ??
            current.userDissections,
          theme:
            ui?.theme ??
            (p.theme as WorkbenchStore['theme'] | undefined) ??
            current.theme,
          sidebarCollapsed:
            ui?.sidebarCollapsed ??
            (typeof p.sidebarCollapsed === 'boolean'
              ? p.sidebarCollapsed
              : current.sidebarCollapsed),
        };
      },
    },
  ),
);

export type {
  SequencerSlice,
  RealitySlice,
  EngineSlice,
  DissectSlice,
  CodexSlice,
  ArchiveSlice,
  UiSlice,
};
