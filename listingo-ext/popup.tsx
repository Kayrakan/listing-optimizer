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

import { supabase }   from "~core/supabase"
import { buyCredits } from "~core/topup"
import { useQuotaPoll } from "~core/useQuotaPoll"   // ⬅︎ add here


// remove OverlayProps + inline component from popup.tsx
import UpgradeOverlay from "~components/UpgradeOverlay"
import ConnectedSources from "~components/ConnectedSources"
import DemoTab from "~components/DemoTab"
import SignInOverlay     from "~components/SignInOverlay"



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

    const [emailInput, setEmailInput] = useState("")   // guest e-mail
    const [buying,     setBuying]     = useState(false)


    const [polling, setPolling]    = useState(false)   // quota-poll switch
    useQuotaPoll(polling)        // ⬅︎ starts or stops based on flag

    const showSignIn   = useStore(s => s.showSignIn)
    const setShowSignIn= useStore(s => s.setShowSignIn)


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


    /** Open Stripe Checkout for a $10 pack (or prompt email for guests) */
    const upgrade = async () => {
        if (buying) return
        setBuying(true)

        const email =
            emailInput.trim() ||
            (await supabase.auth.getUser()).data.user?.email ||
            ""

        if (!email) {
            alert("Please enter a valid e-mail.")
            setBuying(false)
            return
        }

        try {
            /* 1. create Checkout, get URL */
            const url = await buyCredits(10, email)
            const { id: tabId } = await chrome.tabs.create({ url })

            // Fallback: start polling after 60 s even if the tab is still open
            setTimeout(() => setPolling(true), 60_000)               // NEW

            chrome.tabs.onRemoved.addListener(function listener(closedId) {
                if (closedId === tabId) {
                    setPolling(true)                                     // instant path
                    chrome.tabs.onRemoved.removeListener(listener)
                }
            })
        } finally {
            setBuying(false)
        }
    }




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
            {locked && (
                <UpgradeOverlay
                    email={emailInput}
                    setEmail={setEmailInput}
                    buying={buying}
                    onUpgrade={upgrade}
                    onBack={() => setActive("demo")}
                />
            )}

            {showSignIn && <SignInOverlay email={emailInput} />}

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
                        onClick={async () => {
                            const { data } = await supabase.auth.getUser()   // v2 API
                            const email = data.user?.email ?? ""
                            buyCredits(10, email)        // $10 pack
                        }}
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


function ConnectorButton({ name, onClick }: { name: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex items-center justify-between p-3 border border-base-20 rounded-md hover:bg-base-05">
            <span>{name}</span>
            <Link className="h-4 w-4" />
        </button>
    )
}

async function startOAuth(platform: string) {
    await chrome.tabs.create({
        url: `${import.meta.env.PLASMO_PUBLIC_API_BASE}/oauth/${platform}`
    })
}
