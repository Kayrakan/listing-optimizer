// state/index.ts

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Import factories (values) normally…
import { createAuthSlice }  from "./authSlice"
import { createQuotaSlice } from "./quotaSlice"
import { createJobsSlice }  from "./jobsSlice"
import { createSourcesSlice } from "./sourcesSlice"
import { createDemoSlice } from "./demoSlice"

// …but import the interfaces as types only
import type { AuthSlice }  from "./authSlice"
import type { QuotaSlice } from "./quotaSlice"
import type { JobsSlice }  from "./jobsSlice"
import type { SourcesSlice }  from "./sourcesSlice"
import type { DemoSlice } from "./demoSlice"

export type Store = AuthSlice & QuotaSlice & JobsSlice & SourcesSlice & DemoSlice

export const useStore = create<Store>()(
    persist(
        (...a) => ({
            ...createAuthSlice(...a),
            ...createQuotaSlice(...a),
            ...createJobsSlice(...a),
            ...createSourcesSlice(...a),   //  << new
            ...createDemoSlice(...a)          // ← NEW

        }),
        { name: "lo-store" }
    )
)
