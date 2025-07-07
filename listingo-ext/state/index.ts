// state/index.ts

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Import factories (values) normally…
import { createAuthSlice }  from "./authSlice"
import { createQuotaSlice } from "./quotaSlice"
import { createJobsSlice }  from "./jobsSlice"

// …but import the interfaces as types only
import type { AuthSlice }  from "./authSlice"
import type { QuotaSlice } from "./quotaSlice"
import type { JobsSlice }  from "./jobsSlice"

export type Store = AuthSlice & QuotaSlice & JobsSlice

export const useStore = create<Store>()(
    persist(
        (...a) => ({
            ...createAuthSlice(...a),
            ...createQuotaSlice(...a),
            ...createJobsSlice(...a)
        }),
        { name: "lo-store" }
    )
)
