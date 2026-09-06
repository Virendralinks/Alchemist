/// <reference lib="webworker" />
// Dedicated module-worker entry. Bundlers resolve this via
// `new URL('./worker.entry.ts', import.meta.url)` from the engine bridge.
// Keeps CMUdict + the bilingual engine out of the main bundle (Appendix B).

import { attachToWorkerScope } from './worker';

const scope = self as DedicatedWorkerGlobalScope;

attachToWorkerScope({
  set onmessage(fn) {
    scope.onmessage = fn as typeof scope.onmessage;
  },
  get onmessage() {
    return scope.onmessage as ((ev: MessageEvent) => void) | null;
  },
  postMessage: (msg) => {
    scope.postMessage(msg);
  },
});
