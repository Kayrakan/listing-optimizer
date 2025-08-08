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
    Lock,
    Settings,
    BarChart3
} from "lucide-react"

import { useStore } from "~state"
import { edgeFetch } from "~core/edge"
import { useInitAuth } from "~hooks/useInitAuth"
import QuotaBadge from "./QuotaBadge"
import "~style.css"

import { supabase }   from "~core/supabase"
import { buyCredits } from "~core/topup"
import { useQuotaPoll } from "~core/useQuotaPoll"

import UpgradeOverlay from "~components/UpgradeOverlay"
import ConnectedSources from "~components/ConnectedSources"
import DemoTab from "~components/DemoTab"
import SignInOverlay from "~components/SignInOverlay"
import JobsList from "~components/JobsList"
import ErrorBoundary from "~components/ErrorBoundary"



/* --------------------------------------------------------------------------
 * Tab keys
 * ------------------------------------------------------------------------ */

type TabKey = "demo" | "sources" | "connect" | "jobs" | "settings"

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
        ? ["demo", "sources", "connect", "jobs"]
        : ["sources", "connect", "jobs", "settings"]
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
    const upgrade = async (overrideEmail?: string) => {
        if (buying) return
        setBuying(true)

        const email = overrideEmail?.trim()
            || (await supabase.auth.getUser()).data.user?.email
            || "";

        // Validate email format with regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || !emailRegex.test(email)) {
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
        } catch (error) {
            console.error("Failed to process payment:", error);
            alert("Payment processing failed. Please try again later or contact support.");
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
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
        >
            <Icon className="h-5 w-5" />
            <span className="text-[11px] leading-none tracking-wide">{label}</span>
        </button>
    )


    /* ---------------------------------------------------------------------- */
    return (
        <ErrorBoundary>
            <div className="relative w-[800px] max-w-none min-h-[600px] flex flex-col text-gray-900 shadow-lg bg-white">
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h1 className="font-semibold tracking-tight">Listing‑Optimizer</h1>
                    <QuotaBadge plan={plan} remaining={remaining} />
                </header>

                {/* Tab nav */}
                <nav className="flex bg-gray-50">
                    {tabs.map((t) => (
                        <NavBtn
                            key={t}
                            tab={t}
                            icon={
                                t === "demo" ? ListOrdered : 
                                t === "sources" ? Database : 
                                t === "connect" ? Plus :
                                t === "jobs" ? BarChart3 :
                                Settings
                            }
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
                                    <p className="text-sm text-gray-600">
                                        Upgrade to connect multiple stores and run bulk actions.
                                    </p>
                                    <button
                                        onClick={() => upgrade()}
                                        className="rounded-md bg-blue-600 hover:bg-blue-700 text-white py-2 flex items-center justify-center gap-2"
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

                    {active === "jobs" && <JobsList />}

                    {active === "settings" && (
                        <section className="flex flex-col gap-4">
                            <h2 className="font-semibold text-lg">Settings</h2>
                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-medium mb-2">Account</h3>
                                    <p className="text-sm text-gray-600 mb-3">Plan: {plan}</p>
                                    <button
                                        onClick={logout}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Sign out
                                    </button>
                                </div>
                                
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-medium mb-2">Credits</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {remaining} listings remaining
                                    </p>
                                    <button
                                        onClick={() => upgrade()}
                                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                    >
                                        Buy Credits
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                {/* Upgrade overlay for guests */}
                {locked && (
                    <UpgradeOverlay
                        email={emailInput}
                        setEmail={setEmailInput}
                        buying={buying}
                        onUpgrade={(email) => upgrade(email || emailInput)}
                        onBack={() => setActive("demo")}
                    />
                )}

                {showSignIn && <SignInOverlay email={emailInput} />}

                {/* Footer */}
                <footer className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-200">
                    © {new Date().getFullYear()} Listing‑Optimizer
                    {plan === 'pro' && (
                        <button
                            onClick={async () => {
                                const { data } = await supabase.auth.getUser()
                                const email = data.user?.email ?? ""
                                buyCredits(10, email)
                            }}
                            className="ml-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                            + $10 Credits
                        </button>
                    )}
                </footer>
            </div>
        </ErrorBoundary>
    )
}

/* ========================= helper components =========================== */


function ConnectorButton({ name, onClick }: { name: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
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
