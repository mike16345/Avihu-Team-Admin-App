/**
 * useFavoriteWorkoutPresets — single source of truth for the trainer's
 * starred workout-preset IDs.
 *
 * Council decision: server-side per-trainer (never localStorage) so
 * stars survive across devices and the WorkoutPresetPicker modal.
 *
 * IMPORTANT: until the server's new `favoriteWorkoutPresetIds` field
 * (added in `trainerModel.ts`) ships to prod, this hook reads/writes
 * a **session-only** in-memory store. Persistence is purely a swap of
 * the read/write internals — the hook surface (`isFavorite`, `toggle`,
 * `count`) stays stable so the call-sites don't change.
 */
import { useCallback, useEffect, useState } from "react";
import { useUsersStore } from "@/store/userStore";

/**
 * In-memory module-level store. Lives for the duration of the SPA
 * session; cleared on hard reload. Subscribers are notified whenever
 * the set mutates so every star icon stays in sync across the page
 * (the grid card + the picker modal both render the same source).
 */
const memorySet = new Set<string>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function useFavoriteWorkoutPresets() {
  const currentUser = useUsersStore((s) => s.currentUser);
  void currentUser; // reserved for the server-backed swap

  const [, force] = useState(0);
  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const isFavorite = useCallback((id?: string) => {
    if (!id) return false;
    return memorySet.has(id);
  }, []);

  const toggle = useCallback((id?: string) => {
    if (!id) return;
    if (memorySet.has(id)) memorySet.delete(id);
    else memorySet.add(id);
    notify();
    // TODO: when server ships, fire-and-forget
    //   updateTrainer(currentUser._id, { favoriteWorkoutPresetIds: [...memorySet] })
    // and reconcile with the server response.
  }, []);

  return {
    isFavorite,
    toggle,
    count: memorySet.size,
    /** Snapshot of the favourites set — useful for sorting/filtering. */
    ids: Array.from(memorySet),
  };
}
