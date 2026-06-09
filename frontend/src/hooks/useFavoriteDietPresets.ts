/**
 * useFavoriteDietPresets — parallel of useFavoriteWorkoutPresets but
 * for diet-plan presets. Trainer can star menus they reuse most
 * (e.g. "תפריט נשים 1650") so they float to the top of the grid
 * and picker.
 *
 * Same memory-only design as the workout favourites — survives a
 * session, cleared on hard reload. When the server adds a parallel
 * `favoriteDietPresetIds` field on the trainer doc we'll swap the
 * read/write internals without touching the call sites.
 */
import { useCallback, useEffect, useState } from "react";
import { useUsersStore } from "@/store/userStore";

/**
 * Module-level store, separate from workout favourites — diet and
 * workout favourites are independent collections that share NO ids.
 * Subscribers are notified on every mutation so the star icon stays
 * in sync between the templates grid and the picker modal.
 */
const memorySet = new Set<string>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function useFavoriteDietPresets() {
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
    //   updateTrainer(currentUser._id, { favoriteDietPresetIds: [...memorySet] })
  }, []);

  return {
    isFavorite,
    toggle,
    count: memorySet.size,
    /** Snapshot of the favourites set — useful for sorting/filtering. */
    ids: Array.from(memorySet),
  };
}
