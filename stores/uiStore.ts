// stores/uiStore.ts
import { create }                       from 'zustand'
import { persist, createJSONStorage }   from 'zustand/middleware'

/**
 * Draw animation key: `${vishiId}_${cycleNumber}`
 * Persisted so the animation never re-plays after a refresh.
 */
function drawKey(vishiId: number, cycleNumber: number) {
  return `${vishiId}_${cycleNumber}`
}

interface UIState {
  hydrated:    boolean
  setHydrated: (val: boolean) => void

  // ─── Draw Animation ───────────────────────────────────────────────────────
  // Tracks which vishi+cycle draws have already shown the animation.
  seenDraws:    Record<string, boolean>
  hasSeenDraw:  (vishiId: number, cycleNumber: number) => boolean
  markDrawSeen: (vishiId: number, cycleNumber: number) => void
}

const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      hydrated:    false,
      setHydrated: (val) => set({ hydrated: val }),

      seenDraws:    {},

      hasSeenDraw: (vishiId, cycleNumber) =>
        Boolean(get().seenDraws[drawKey(vishiId, cycleNumber)]),

      markDrawSeen: (vishiId, cycleNumber) =>
        set((s) => ({
          seenDraws: {
            ...s.seenDraws,
            [drawKey(vishiId, cycleNumber)]: true,
          },
        })),
    }),
    {
      name:    'ui-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist seenDraws — hydrated is always reset on mount
      partialize: (s) => ({ seenDraws: s.seenDraws }),
    }
  )
)

export default useUIStore
