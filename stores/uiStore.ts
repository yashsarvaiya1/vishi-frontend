// stores/uiStore.ts

import { create } from 'zustand'

interface UIState {
  sidebarOpen:     boolean
  hydrated:        boolean
  toggleSidebar:   () => void
  setSidebarOpen:  (val: boolean) => void
  setHydrated:     (val: boolean) => void
}

const useUIStore = create<UIState>()((set) => ({
  sidebarOpen:    false,
  hydrated:       false,
  toggleSidebar:  () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  setHydrated:    (val) => set({ hydrated: val }),
}))

export default useUIStore
