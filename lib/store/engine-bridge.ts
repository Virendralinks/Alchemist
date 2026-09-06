'use client';

// Thin message-passing client for the bilingual engine worker.
// ONLY the engine slice imports this — no component may talk to the worker.

// Type-only, so this import is erased and the engine module — which reaches
// CMUdict, ~4 MB — never lands in the page payload (Appendix B). The in-process
// fallback below pulls it in dynamically, on the paths that actually need it.
import type {
  IndexLoader,
  WorkerRequest,
  WorkerResponse,
  WorkerState,
} from '@/lib/engine/worker';
import type { RhymeIndex } from '@/lib/types/rhyme';
import type { AssonanceColumn } from '@/lib/types/matrix';

type Pending = {
  resolve: (value: WorkerResponse) => void;
  reject: (reason: unknown) => void;
};

const fetchIndex: IndexLoader = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load rhyme index: ${res.status}`);
  return (await res.json()) as RhymeIndex;
};

/** Build vowel-structure columns for the Phonetic Matrix from a loaded index. */
export function buildMatrixColumns(
  index: RhymeIndex,
  opts: { maxColumns?: number; maxPerColumn?: number } = {},
): AssonanceColumn[] {
  const maxColumns = opts.maxColumns ?? 24;
  const maxPerColumn = opts.maxPerColumn ?? 12;

  const scored = Object.entries(index.byNucleusSeq)
    .map(([key, ids]) => ({
      key,
      ids,
      // Prefer columns that contain tagged (Desi/pop-culture) material and
      // more than one lexeme — those are the ones a writer actually browses.
      weight:
        ids.length +
        ids.reduce((acc, id) => acc + (index.lexemes[id]?.tags.length ? 2 : 0), 0),
    }))
    .filter((c) => c.key.length > 0 && c.ids.length >= 2)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxColumns);

  return scored.map(({ key, ids }) => ({
    key,
    label: key
      .split('_')
      .map((n) => n.replace('ː', ':').toUpperCase())
      .join(' · '),
    entries: ids.slice(0, maxPerColumn).map((id) => {
      const lex = index.lexemes[id];
      return {
        text: lex.text,
        lang: lex.lang,
        tags: lex.tags,
        score: Math.max(0.05, 1 - Math.log10(lex.rank + 1) / Math.log10(2001)),
      };
    }),
  }));
}

export interface EngineBridge {
  ready: boolean;
  index: RhymeIndex | null;
  matrixColumns: AssonanceColumn[];
  init(indexUrl: string): Promise<WorkerResponse>;
  request(msg: WorkerRequest): Promise<WorkerResponse>;
  dispose(): void;
}

function createInProcessBridge(): EngineBridge {
  let engine: typeof import('@/lib/engine/worker') | null = null;
  let state: WorkerState | null = null;
  let index: RhymeIndex | null = null;
  let matrixColumns: AssonanceColumn[] = [];

  /** Loads the engine on first use and keeps it for the process lifetime. */
  async function ensureEngine() {
    if (!engine || !state) {
      engine = await import('@/lib/engine/worker');
      state = engine.createWorkerState();
    }
    return { engine, state };
  }

  return {
    get ready() {
      return state?.ready ?? false;
    },
    get index() {
      return index;
    },
    get matrixColumns() {
      return matrixColumns;
    },
    async init(indexUrl: string) {
      const loaded = await ensureEngine();
      const response = await loaded.engine.handleWorkerRequest(
        loaded.state,
        { id: 'init', kind: 'INIT', payload: { indexUrl } },
        fetchIndex,
      );
      if (response.kind === 'READY') {
        index = loaded.state.index;
        if (index) matrixColumns = buildMatrixColumns(index);
      }
      return response;
    },
    async request(msg: WorkerRequest) {
      const loaded = await ensureEngine();
      return loaded.engine.handleWorkerRequest(loaded.state, msg, fetchIndex);
    },
    dispose() {
      if (state) {
        state.index = null;
        state.ready = false;
      }
      index = null;
      matrixColumns = [];
    },
  };
}

function createWorkerBridge(): EngineBridge | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;

  let worker: Worker;
  try {
    worker = new Worker(new URL('../engine/worker.entry.ts', import.meta.url));
  } catch {
    return null;
  }

  const pending = new Map<string, Pending>();
  let ready = false;
  let index: RhymeIndex | null = null;
  let matrixColumns: AssonanceColumn[] = [];
  let disposed = false;

  worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
    const response = ev.data;
    const slot = pending.get(response.id);
    if (slot) {
      pending.delete(response.id);
      slot.resolve(response);
    }
  };

  worker.onerror = (err) => {
    for (const [, slot] of pending) {
      slot.reject(err);
    }
    pending.clear();
  };

  const request = (msg: WorkerRequest) =>
    new Promise<WorkerResponse>((resolve, reject) => {
      if (disposed) {
        reject(new Error('Engine bridge disposed'));
        return;
      }
      pending.set(msg.id, { resolve, reject });
      worker.postMessage(msg);
    });

  return {
    get ready() {
      return ready;
    },
    get index() {
      return index;
    },
    get matrixColumns() {
      return matrixColumns;
    },
    async init(indexUrl: string) {
      // Matrix columns need the index on the main thread; the worker gets its
      // own copy via INIT. One network fetch, two consumers.
      const loaded = await fetchIndex(indexUrl);
      index = loaded;
      matrixColumns = buildMatrixColumns(loaded);

      const response = await request({
        id: `init-${Date.now()}`,
        kind: 'INIT',
        payload: { indexUrl },
      });
      ready = response.kind === 'READY';
      return response;
    },
    request,
    dispose() {
      disposed = true;
      worker.terminate();
      pending.clear();
      ready = false;
      index = null;
      matrixColumns = [];
    },
  };
}

let singleton: EngineBridge | null = null;

/**
 * Returns a process-wide bridge. Prefers a real Worker so CMUdict stays off the
 * main bundle; falls back to in-process handleWorkerRequest (Node tests, or
 * when Worker construction fails).
 */
export function getEngineBridge(): EngineBridge {
  if (singleton) return singleton;
  singleton = createWorkerBridge() ?? createInProcessBridge();
  return singleton;
}

/** Test helper — force the in-process path and reset state. */
export function resetEngineBridgeForTests(): EngineBridge {
  if (singleton) singleton.dispose();
  singleton = createInProcessBridge();
  return singleton;
}
