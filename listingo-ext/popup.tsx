/* --------------------------------------------------------------------------
 * Popup.tsx  –  AI Listing‑Optimizer toolbar popup (v2 tabbed)
 * --------------------------------------------------------------------------
 * Framework : React 18 · TypeScript 5 · TailwindCSS 3
 * State     : Zustand (authSlice, quotaSlice, jobsSlice, sourcesSlice)
 * ------------------------------------------------------------------------ */

import { useState, useEffect } from "react"
import {
    ListOrdered,
    Database,
    Plus,
    ArrowRight,
    RefreshCcw,
    Link,
    Store,
    Lock
} from "lucide-react"

import { useStore } from "~state"
import { edgeFetch } from "~core/edge"
import { useInitAuth } from "~hooks/useInitAuth"
import QuotaBadge from "./QuotaBadge"
import "~style.css"

/* --------------------------------------------------------------------------
 * Tab keys
 * ------------------------------------------------------------------------ */

type TabKey = "demo" | "sources" | "connect"

// const isGuestPlan = (p: string) => p === "guest"

const isGuestPlan = (p?: string) =>
    !p || p.toLowerCase() === "guest" || p === "free"

export default function Popup() {
    useInitAuth()

    /* 2. global state */
    const plan = useStore((s) => s.plan)       // "guest" | "pro"
    const remaining = useStore((s) => s.remaining) // quotaSlice
    const enqueue = useStore((s) => s.trackJob) // jobsSlice
    const logout = () => useStore.getState().logout()

    /* 3. local UI state */
    const [active, setActive] = useState<TabKey>("demo")
    const [limit, setLimit] = useState(10)
    const [busy, setBusy] = useState(false)

    /* ---------- derived helpers ---------- */
    const isGuest = isGuestPlan(plan)
    const tabs: TabKey[] = isGuest
        ? ["demo", "sources", "connect"]
        : ["sources", "connect"]
    const locked = isGuest && active !== "demo"

    /* keep user on a valid tab (if plan changes) */
    useEffect(() => {
        if (!tabs.includes(active)) setActive(tabs[0])
    }, [tabs])


    useEffect(() => {
        const handler = (msg: any) => {
            if (msg.type === 'supabase-sign-in' && typeof msg.credits === 'number') {
                useStore.getState().setRemaining(msg.credits)
            }
        }
        chrome.runtime.onMessage.addListener(handler)
        return () => chrome.runtime.onMessage.removeListener(handler)
    }, [])

    /* 4. actions */
    const startScan = async () => {
        setBusy(true)
        try {
            const { jobId } = await edgeFetch<{ jobId: string }>("/scan", { limit })
            enqueue(jobId)
        } finally {
            setBusy(false)
        }
    }

    useEffect(() => {
        console.log("plan from store →", plan)
        console.log("isGuest →", isGuest)
    }, [plan])


    const upgrade = () =>
        chrome.tabs.create({
            url: import.meta.env.PLASMO_PUBLIC_STRIPE_CHECKOUT
        })

    /* ---------- reusable sub‑components ---------- */
    const NavBtn = ({
                        tab,
                        icon: Icon,
                        label
                    }: {
        tab: TabKey
        icon: any
        label: string
    }) => (
        <button
            onClick={() => setActive(tab)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 border-b-2
      transition-colors ${
                active === tab
                    ? "border-accent text-accent"
                    : "border-transparent text-base-60 hover:text-base-90"
            }`}
        >
            <Icon className="h-5 w-5" />
            <span className="text-[11px] leading-none tracking-wide">{label}</span>
        </button>
    )


    /* ---------------------------------------------------------------------- */
    return (
        <div className="relative w-[800px] max-w-none min-h-[600px] flex flex-col text-base-90 shadow-lg">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-base-20">
                <h1 className="font-semibold tracking-tight">Listing‑Optimizer</h1>
                <QuotaBadge plan={plan} remaining={remaining} />
            </header>

            {/* Tab nav */}
            <nav className="flex bg-base-05">
                {tabs.map((t) => (
                    <NavBtn
                        key={t}
                        tab={t}
                        icon={t === "demo" ? ListOrdered : t === "sources" ? Database : Plus}
                        label={t.charAt(0).toUpperCase() + t.slice(1)}
                    />
                ))}
            </nav>

            {/* Body */}
            <main className={`flex-1 overflow-y-auto p-4 ${locked ? "filter blur-sm pointer-events-none" : ""}`}>
                {active === "demo" && <DemoTab />}

                {active === "sources" && (
                    <section className="flex flex-col gap-4">
                        <h2 className="font-semibold text-lg">Connected Sources</h2>
                        {plan === "guest" ? (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-base-70">
                                    Upgrade to connect multiple stores and run bulk actions.
                                </p>
                                <button
                                    onClick={upgrade}
                                    className="rounded-md bg-accent hover:bg-accent-hover text-base-00 py-2 flex items-center justify-center gap-2"
                                >
                                    Upgrade to Pro <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <ConnectedSources />
                        )}
                    </section>
                )}

                {active === "connect" && (
                    <section className="flex flex-col gap-4">
                        <h2 className="font-semibold text-lg">Connect a Store</h2>
                        <ConnectorButton name="Etsy" onClick={() => startOAuth("etsy")} />
                        <ConnectorButton name="Shopify" onClick={() => startOAuth("shopify")} />
                        {/* add more platforms here */}
                    </section>
                )}
            </main>

            {/* Upgrade overlay for guests */}
            {locked && <UpgradeOverlay onUpgrade={upgrade} onBack={() => setActive("demo")} />}

            {/* Footer */}
            <footer className="px-4 py-2 text-center text-xs text-base-50 border-t border-base-20">
                © {new Date().getFullYear()} Listing‑Optimizer
                {plan !== "guest" && (
                    <button onClick={logout} className="ml-2 underline text-base-60 hover:text-base-90">
                        Logout
                    </button>
                )}
                {plan === 'pro' && (
                    <button
                        onClick={() => buyCredits(10, supabase.auth.getUser()?.email!)}
                        className="ml-2 rounded bg-accent px-2 py-1 text-xs text-base-00"
                    >
                        + $10 Credits
                    </button>
                )}

            </footer>
        </div>
    )
}

/* ========================= helper components =========================== */
function ConnectedSources() {
    const sources = useStore((s) => s.sources)

    if (!sources?.length) {
        return <p className="text-sm text-base-70">No sources connected yet.</p>
    }

    return (
        <ul className="flex flex-col gap-2">
            {sources.map((src: any) => (
                <li key={src.id} className="flex items-center justify-between p-3 border border-base-20 rounded-md">
                    <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span>{src.name}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-base-60" />
                </li>
            ))}
        </ul>
    )
}

function ConnectorButton({ name, onClick }: { name: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex items-center justify-between p-3 border border-base-20 rounded-md hover:bg-base-05">
            <span>{name}</span>
            <Link className="h-4 w-4" />
        </button>
    )
}

function DemoTab() {
    const demoStore = useStore((s) => s.demoStore)
    const setDemoStore = useStore((s) => s.setDemoStore)
    const enqueue = useStore((s) => s.trackJob)

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
            setDemoStore({
                id: msg.storeId,
                platform: msg.platform,
                name: msg.storeName
            })
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

    /* ---------- UI ---------- */
    return (
        <section className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Quick Demo</h2>

            {!demoStore ? (
                <>
                    <p className="text-sm text-base-70">Connect one store to see title suggestions on its top 10 listings.</p>
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

function UpgradeOverlay({
                            onUpgrade,
                            onBack
                        }: {
    onUpgrade: () => void
    onBack: () => void
}) {
    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-base-00/60 backdrop-blur-sm">
            <div className="bg-base-00 border border-base-20 rounded-xl p-8 flex flex-col items-center gap-4 shadow-xl max-w-[320px] text-center">
                <Lock className="h-6 w-6 text-accent" />
                <h3 className="text-lg font-semibold">Unlock full power</h3>
                <p className="text-sm text-base-70">Upgrade to Pro to access connected sources and bulk actions.</p>
                <button onClick={onUpgrade} className="btn-accent w-full flex items-center justify-center gap-2">
                    Upgrade to Pro <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={onBack} className="text-xs underline text-base-60 hover:text-base-90">
                    Back to Demo
                </button>
            </div>
        </div>
    )
}

async function startOAuth(platform: string) {
    await chrome.tabs.create({
        url: `${import.meta.env.PLASMO_PUBLIC_API_BASE}/oauth/${platform}`
    })
}
