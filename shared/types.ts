export interface JobRow {}
export interface JwtClaims {}

// shared/types.ts
export type JobStatus = "queued" | "ready" | "patched" | "error"

export interface JobRow {
    id: string
    userId: string
    status: JobStatus
    result_json?: unknown
    created_at: string
}



