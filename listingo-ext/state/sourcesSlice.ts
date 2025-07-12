// state/sourcesSlice.ts
import type { StateCreator } from "zustand/vanilla"

export interface Source {
    id: string
    name: string
    platform: string
}

export interface SourcesSlice {
    sources: Source[]
    setSources: (s: Source[]) => void
    addSource: (s: Source) => void
    removeSource: (id: string) => void
}

export const createSourcesSlice: StateCreator<
    SourcesSlice,
    [],
    [],
    SourcesSlice
> = (set) => ({
    sources: [],
    setSources: (sources) => set({ sources }),
    addSource: (source) =>
        set((state) => ({ sources: [...state.sources, source] })),
    removeSource: (id) =>
        set((state) => ({
            sources: state.sources.filter((s) => s.id !== id)
        }))
})
