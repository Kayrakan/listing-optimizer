import type { StateCreator } from "zustand"
import type { Store } from "./index"
import type { JobStatus } from "@lo/shared/types"      // 'queued' | 'ready' | 'patched' | 'error'

import { edgeFetch } from "~core/edge"

export interface JobRow {
    id: string
    status: JobStatus
    resultJson?: unknown
}

export interface JobsSlice {
    rows: Record<string, JobRow>
    trackJob: (jobId: string) => void
    applyPatch: (jobId: string) => Promise<void>
}

/* helper: polls until job ready or error --------------------------------*/
const pollJob = async (jobId: string, update: (jr: JobRow)=>void) => {
    while (true) {
        const data = await edgeFetch<{ status: JobStatus; result_json?: unknown }>(
            `/result?jobId=${jobId}`
        )
        update({ id: jobId, status: data.status, resultJson: data.result_json })

        if (["ready", "error"].includes(data.status)) break
        await new Promise(r => setTimeout(r, 2000))
    }
}

/* slice factory ---------------------------------------------------------*/
export const createJobsSlice: StateCreator<
    Store,
    [],
    [],
    JobsSlice
> = (set, get) => ({
    rows: {},

    trackJob(jobId) {
        // optimistic row
        set(s => ({ rows: { ...s.rows, [jobId]: { id: jobId, status: "queued" } } }))

        /* start polling */
        pollJob(jobId, (jr) => {
            set(s => ({ rows: { ...s.rows, [jr.id]: jr } }))
        })
    },

    async applyPatch(jobId) {
        await edgeFetch("/patch", { jobId })
        set(s => ({
            rows: {
                ...s.rows,
                [jobId]: { ...s.rows[jobId], status: "patched" }
            }
        }))
        // ask quota slice to refresh count
        get().refresh?.()
    }
})
