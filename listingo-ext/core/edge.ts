/* listingo-ext/src/core/edge.ts */
import { hmac } from "@noble/hashes/hmac"
import { sha256 } from "@noble/hashes/sha2"          // ← NEW path, not deprecated
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils"

import { useStore } from "~state"

function sign(body: string, secret: string) {
    const key = utf8ToBytes(secret)
    const msg = utf8ToBytes(body)
    const digest = hmac(sha256, key, msg)
    return bytesToHex(digest)
}

export async function edgeFetch<T = unknown>(
    path: string,
    payload?: Record<string, unknown>
): Promise<T> {
    const jwt  = useStore.getState().auth.jwt
    const body = payload ? JSON.stringify(payload) : undefined
    const mac  = body ? sign(body, import.meta.env.VITE_HMAC_SECRET) : undefined

    const res = await fetch(`${import.meta.env.VITE_EDGE_BASE}${path}`, {
        method: body ? "POST" : "GET",
        headers: {
            Authorization: `Bearer ${jwt}`,
            ...(mac  && { "X-HMAC": mac }),
            ...(body && { "Content-Type": "application/json" })
        },
        body
    })

    if (!res.ok) throw new Error(await res.text())
    return res.json()
}
