// lib/store/codex-slice.ts
//
// Filters, the device lens, hover highlighting, and the mastery loop. The
// taxonomy and the reverse index are static module data (lib/codex/device-index)
// and are never copied into the store — only what the user has done is.

import type { StateCreator } from 'zustand';
import type { WorkbenchStore } from './index';
import type { DeviceFamily, DeviceDepth } from '@/lib/types/devices';
import { templateById } from '@/lib/mock/templates';
import { devices } from '@/lib/mock/devices';

export interface CodexSlice {
  familyFilter: DeviceFamily[];
  depthFilter: DeviceDepth[];
  lensEnabled: boolean; // overlay all device spans at once
  hoveredDeviceId: string | null;
  /** Mastery tracking, persisted: what you've seen and what you've practiced. */
  mastery: Record<string, { seen: number; practiced: number; lastSeenAt: string }>;

  toggleFamily(f: DeviceFamily): void;
  toggleDepth(d: DeviceDepth): void;
  toggleLens(): void;
  hoverDevice(id: string | null): void;
  markSeen(deviceId: string): void;
  practiceDevice(deviceId: string): void; // loads template into sequencer
}

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const deviceById = new Map(devices.map((d) => [d.id, d]));

export const createCodexSlice: StateCreator<
  WorkbenchStore,
  [['zustand/immer', never]],
  [],
  CodexSlice
> = (set, get) => ({
  familyFilter: [],
  depthFilter: [],
  lensEnabled: false,
  hoveredDeviceId: null,
  mastery: {},

  // An empty filter array means "everything", so toggling the last one off
  // widens the view rather than emptying it.
  toggleFamily: (f) =>
    set((state) => {
      state.familyFilter = toggle(state.familyFilter, f);
    }),

  toggleDepth: (d) =>
    set((state) => {
      state.depthFilter = toggle(state.depthFilter, d);
    }),

  toggleLens: () =>
    set((state) => {
      state.lensEnabled = !state.lensEnabled;
    }),

  hoverDevice: (id) =>
    set((state) => {
      state.hoveredDeviceId = id;
    }),

  markSeen: (deviceId) =>
    set((state) => {
      const entry = state.mastery[deviceId];
      if (entry) {
        entry.seen += 1;
        entry.lastSeenAt = new Date().toISOString();
      } else {
        state.mastery[deviceId] = {
          seen: 1,
          practiced: 0,
          lastSeenAt: new Date().toISOString(),
        };
      }
    }),

  /**
   * The single most important interaction in the knowledge layer: loads the
   * device's practice template into the sequencer and counts the attempt.
   */
  practiceDevice: (deviceId) => {
    const device = deviceById.get(deviceId);
    const template = device?.practiceTemplateId
      ? templateById.get(device.practiceTemplateId)
      : undefined;

    if (template) {
      get().loadTemplate(template, { artistId: 'codex', techniqueId: deviceId });
    }

    set((state) => {
      const entry = state.mastery[deviceId];
      if (entry) {
        entry.practiced += 1;
        entry.lastSeenAt = new Date().toISOString();
      } else {
        state.mastery[deviceId] = {
          seen: 1,
          practiced: 1,
          lastSeenAt: new Date().toISOString(),
        };
      }
    });
  },
});
