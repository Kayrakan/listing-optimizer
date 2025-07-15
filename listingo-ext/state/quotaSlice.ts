import type { StateCreator } from "zustand"
import type { Store } from "./index"

// --- interface ----------------------------------------------------------
export interface QuotaSlice {
    remaining: number
    refresh: () => Promise<void>
    setRemaining: (n: number) => void          // ◀︎ new

}

// --- slice factory ------------------------------------------------------
export const createQuotaSlice: StateCreator<
    Store,
    [],
    [],
    QuotaSlice
> = (set, get) => ({
    remaining: 0,
    setRemaining: (n) => set({ remaining: n }),   // ◀︎ new

    async refresh() {
        const jwt = get().jwt                              // from authSlice
        if (!jwt) return

        const res = await fetch("https://api.listingo.ai/api/quota", {
            headers: { Authorization: `Bearer ${jwt}` }
        })

        if (res.ok) {
            const { remaining } = await res.json()
            set({ remaining })
        }
    }
})
