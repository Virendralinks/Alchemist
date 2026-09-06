// lib/store/ui-slice.ts
//
// Theme, sidebar state, and the active command-palette target.
import type { StateCreator } from 'zustand';
import type { WorkbenchStore } from './index';

export interface UiSlice {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  /** What the palette is currently scoped to, e.g. a technique or device search. */
  commandPaletteTarget: string | null;

  setTheme(theme: 'dark' | 'light'): void;
  toggleSidebar(): void;
  openCommandPalette(target?: string | null): void;
  closeCommandPalette(): void;
}

export const createUiSlice: StateCreator<
  WorkbenchStore,
  [['zustand/immer', never]],
  [],
  UiSlice
> = (set) => ({
  theme: 'dark',
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  commandPaletteTarget: null,

  setTheme: (theme) =>
    set((state) => {
      state.theme = theme;
    }),

  toggleSidebar: () =>
    set((state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    }),

  openCommandPalette: (target = null) =>
    set((state) => {
      state.commandPaletteOpen = true;
      state.commandPaletteTarget = target;
    }),

  closeCommandPalette: () =>
    set((state) => {
      state.commandPaletteOpen = false;
      state.commandPaletteTarget = null;
    }),
});
