// ~core/topup.ts
export const buyCredits = async (usd: number, email: string) => {
    const res = await fetch('https://app.listingo.dev/api/topup/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cents: usd * 100 }),
    }).then(r => r.json())
    chrome.tabs.create({ url: res.url })
}
