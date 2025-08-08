// ~core/topup.ts
import { getEnv } from "~core/env"

let inFlight: Promise<string> | null = null

export async function buyCredits(usd: number, email: string) {
    // Return existing promise if a request is already in progress
    if (inFlight) return inFlight

    inFlight = (async () => {
        try {
            const apiBase = getEnv("PLASMO_PUBLIC_API_BASE") || "http://localhost:8000"
            const response = await fetch(`${apiBase}/api/topup/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, cents: Math.round(usd * 100) })
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server response was not JSON");
            }

            const res = await response.json();
            if (!res.url) {
                throw new Error("Invalid response format: missing URL");
            }

            return res.url as string;
        } finally {
            // Reset guard once finished (success or error)
            inFlight = null
        }
    })()

    return inFlight
}
