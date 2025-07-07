// authSlice.ts

import type { StateCreator } from "zustand"
import type { Store }          from "./index"

export interface AuthSlice {
    jwt?: string
    plan: "guest" | "pro"
    setJwt: (jwt: string) => void
    logout: () => void
}

export const createAuthSlice: StateCreator<
    Store,    // full store type
    [],       // no pre-middlewares
    [],       // no post-middlewares
    AuthSlice // slice we’re defining
> = (set) => ({
    jwt: undefined,
    plan: "guest",

    setJwt: (jwt) => set({ jwt }),

    logout: () => set({ jwt: undefined, plan: "guest" })
})
