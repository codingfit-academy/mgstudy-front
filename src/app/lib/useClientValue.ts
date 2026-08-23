"use client";

import { useRef, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Reads a value from a browser-only source (sessionStorage, localStorage, ...)
 * without calling setState in an effect and without a hydration mismatch:
 * server render and the first client render both see `fallback`, then React
 * swaps in the real value right after hydration, before paint.
 *
 * `read` only ever runs once (its result is cached), so it's safe to return
 * objects/arrays as well as primitives.
 */
export function useClientValue<T>(read: () => T, fallback: T): T {
  const cache = useRef<{ value: T } | null>(null);

  function getSnapshot() {
    if (cache.current === null) {
      cache.current = { value: read() };
    }
    return cache.current.value;
  }

  return useSyncExternalStore(noopSubscribe, getSnapshot, () => fallback);
}
