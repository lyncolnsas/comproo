import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 20;

export interface HistoryHandle<T> {
  state: T;
  set: (next: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: (initial: T) => void;
}

export function useHistory<T>(initialState: T): HistoryHandle<T> {
  // past[0] = oldest, past[past.length-1] = most recent undo candidate
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  // Debounce: avoid recording every single slider tick
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<T | null>(null);

  const commitPending = useCallback(() => {
    if (pendingRef.current !== null) {
      const snap = pendingRef.current;
      pendingRef.current = null;
      setPast(prev => {
        const next = [...prev, snap];
        return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
      });
      setFuture([]);
    }
  }, []);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setPresent(prev => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;

      // Record the PREVIOUS value as undo target (debounced)
      if (debounceRef.current) clearTimeout(debounceRef.current);
      pendingRef.current = prev;
      debounceRef.current = setTimeout(() => {
        commitPending();
      }, 400);

      return resolved;
    });
  }, [commitPending]);

  const undo = useCallback(() => {
    // Flush any pending debounced history entry first
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      commitPending();
    }
    setPast(prev => {
      if (prev.length === 0) return prev;
      const newPast = prev.slice(0, -1);
      const restored = prev[prev.length - 1];
      setFuture(f => [present, ...f].slice(0, MAX_HISTORY));
      setPresent(restored);
      return newPast;
    });
  }, [present, commitPending]);

  const redo = useCallback(() => {
    setFuture(prev => {
      if (prev.length === 0) return prev;
      const [next, ...rest] = prev;
      setPast(p => [...p, present].slice(-MAX_HISTORY));
      setPresent(next);
      return rest;
    });
  }, [present]);

  const clear = useCallback((initial: T) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pendingRef.current = null;
    setPast([]);
    setPresent(initial);
    setFuture([]);
  }, []);

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    clear,
  };
}
