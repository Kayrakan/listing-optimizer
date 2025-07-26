/* --------------------------------------------------------------------------
 * DemoTab.tsx – Demo flow for guest users (connect 1 store → scan 10 listings)
 * --------------------------------------------------------------------------
 * Props: none – pulls Zustand slices directly.
 * ------------------------------------------------------------------------ */

import { useEffect, useState } from "react"
import { RefreshCcw, Store } from "lucide-react"

import { useStore } from "~state"
import { edgeFetch } from "~core/edge"

export default function DemoTab() {
    const demoStore    = useStore(s => s.demoStore)
    const setDemoStore = useStore(s => s.setDemoStore)
    const enqueue      = useStore(s => s.trackJob)

    const [phase, setPhase] = useState<"idle" | "oauth" | "scanning">("idle")

    /* 1️⃣ open OAuth in new tab */
    const connect = async (platform: "etsy" | "shopify") => {
        setPhase("oauth")
        await chrome.tabs.create({
            url: `${import.meta.env.PLASMO_PUBLIC_API_BASE}/oauth/demo/${platform}`
        })
    }

    /* 2️⃣ listen for OAuth success message */
    useEffect(() => {
        const listener = (msg: any) => {
            if (msg?.type !== "demo-oauth-success") return
            setDemoStore({ id: msg.storeId, platform: msg.platform, name: msg.storeName })
            setPhase("idle")
        }
        chrome.runtime.onMessage.addListener(listener)
        return () => chrome.runtime.onMessage.removeListener(listener)
    }, [])

    /* 3️⃣ run the 10‑listing scan */
    const runDemo = async () => {
        if (!demoStore) return
        setPhase("scanning")
        const { jobId } = await edgeFetch<{ jobId: string }>("/scan", {
            limit: 10,
            demoStoreId: demoStore.id
        })
        enqueue(jobId)
        setPhase("idle")
    }

    /* --------------------------- UI ------------------------------------- */
    return (
        <section className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Quick Demo</h2>

            {!demoStore ? (
                <>
                    <p className="text-sm text-base-70">
                        Connect one store to see title suggestions on its top 10 listings.
                    </p>

                    <button onClick={() => connect("etsy")} disabled={phase === "oauth"} className="btn-primary">
                        {phase === "oauth" ? "Waiting for OAuth…" : "Connect Etsy"}
                    </button>

                    <button onClick={() => connect("shopify")} disabled={phase === "oauth"} className="btn-secondary">
                        Connect Shopify
                    </button>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2 bg-base-05 p-3 rounded">
                        <Store className="h-4 w-4" />
                        <span className="font-medium">{demoStore.name}</span>
                        <button onClick={() => setDemoStore(undefined)} className="ml-auto text-xs underline">
                            Change store
                        </button>
                    </div>

                    <button onClick={runDemo} disabled={phase === "scanning"} className="btn-accent flex items-center justify-center gap-2">
                        {phase === "scanning" && <RefreshCcw className="h-4 w-4 animate-spin" />}
                        {phase === "scanning" ? "Scanning…" : "Run demo on 10 listings"}
                    </button>
                </>
            )}
        </section>
    )
}
