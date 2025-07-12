import type { StateCreator } from "zustand"

export interface DemoStore {
    id: string
    platform: string
    name: string
}

export interface DemoSlice {
    demoStore?: DemoStore
    setDemoStore: (s?: DemoStore) => void
}

export const createDemoSlice: StateCreator<DemoSlice> = (set) => ({
    demoStore: undefined,
    setDemoStore: (demoStore) => set({ demoStore })
})
