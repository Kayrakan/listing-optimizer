// ~core/topup.ts
// core/topup.ts
export async function buyCredits(usd: number, email: string) {
    try {
        const response = await fetch(`${process.env.PLASMO_PUBLIC_API_BASE}/api/topup/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, cents: usd * 100 })
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server response was not JSON");
        }

        const res = await response.json();

        if (!res.url) {
            throw new Error("Invalid response format: missing URL");
        }

        return res.url as string;
    } catch (error) {
        console.error("Error during payment processing:", error);
        throw error;
    }
}
