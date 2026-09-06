// lib/cache/dissection-cache.ts
//
// IndexedDB cache keyed by sha256(normalizedText) + schemaVersion (Section 4.4).
// Normalization means trivial edits — casing, doubled spaces, a trailing comma —
// do not force a regeneration, while a real edit does.
//
// The hashing and key derivation are pure and exported separately so they can be
// tested in Node, where IndexedDB does not exist.

import type { Dissection } from '@/lib/types/archive';
import { SCHEMA_VERSION } from '@/lib/api/schemas';

const DB_NAME = 'alchemists-workbench';
const STORE = 'dissections';
const DB_VERSION = 1;

/** Lowercase, collapse whitespace, strip trailing punctuation per line. */
export function normalizeText(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,;:!?—–-]+$/u, '')
        .trim(),
    )
    .filter((line) => line.length > 0)
    .join('\n');
}

/** SubtleCrypto is available in browsers and in Node 18+ via globalThis.crypto. */
export async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** A schema version bump invalidates everything, which is the right behaviour. */
export async function cacheKey(text: string): Promise<string> {
  const hash = await sha256(normalizeText(text));
  return `${hash}:v${SCHEMA_VERSION}`;
}

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    // A blocked or unavailable IndexedDB degrades to "no cache", never to an error.
    request.onerror = () => resolve(null);
  });
}

export async function readCachedDissection(
  text: string,
): Promise<Dissection | null> {
  const db = await openDb();
  if (!db) return null;
  const key = await cacheKey(text);

  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(key);
    request.onsuccess = () => {
      const value = request.result as Dissection | undefined;
      // Defensive: a stale record from an older shape is treated as a miss.
      if (!value || value.schemaVersion !== SCHEMA_VERSION) resolve(null);
      else resolve(value);
    };
    request.onerror = () => resolve(null);
    tx.oncomplete = () => db.close();
  });
}

export async function writeCachedDissection(
  text: string,
  dissection: Dissection,
): Promise<void> {
  const db = await openDb();
  if (!db) return;
  const key = await cacheKey(text);

  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(dissection, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => resolve();
  });
}

export async function clearDissectionCache(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => resolve();
  });
}
