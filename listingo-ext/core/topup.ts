// ~core/topup.ts
// core/topup.ts
export async function buyCredits(usd: number, email: string) {
    const res = await fetch("https://app.listingo.dev/api/topup/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cents: usd * 100 })
    }).then(r => r.json())

    return res.url as string       // <- return URL instead of opening tab
}



