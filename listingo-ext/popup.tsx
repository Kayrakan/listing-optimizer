/* --------------------------------------------------------------------------
 * Popup.tsx  –  AI Listing-Optimizer toolbar popup
 * --------------------------------------------------------------------------
 * Dimensions: 96 × 560 px   (Plasmo default)
 * Framework : React 18 · TypeScript 5 · TailwindCSS 3
 * State     : Zustand (authSlice, quotaSlice, jobsSlice)
 * ------------------------------------------------------------------------ */

import { useState } from "react"
import { ArrowRight, RefreshCcw } from "lucide-react"

import { useStore } from "~state"
import { edgeFetch } from "~core/edge"
import { useInitAuth } from "~hooks/useInitAuth"
import QuotaBadge from "./QuotaBadge"
import "~style.css"           // 1st line after imports

export default function Popup() {
    /* initialise guest-token flow once */
    useInitAuth()

    /* Zustand selectors */
    const remaining = useStore(s => s.remaining)          // from quotaSlice
    const plan      = useStore(s => s.plan)               // from authSlice
    const refresh   = useStore(s => s.refresh)            // quotaSlice
    const enqueue   = useStore(s => s.trackJob)           // jobsSlice

    /* local UI state */
    const [limit, setLimit]   = useState(20)
    const [busy,  setBusy]    = useState(false)

    /* handlers ------------------------------------------------------------- */
    const startScan = async () => {
        setBusy(true)
        try {
            const { jobId } = await edgeFetch<{ jobId: string }>("/scan", { limit })
            enqueue(jobId)          // jobsSlice starts polling
        } finally {
            setBusy(false)
        }
    }

    const upgrade = () =>
        chrome.tabs.create({ url: import.meta.env.PLASMO_PUBLIC_STRIPE_CHECKOUT })

    const logout = () => useStore.getState().logout()

    /* UI ------------------------------------------------------------------- */
    return (
        <div className="w-[96vw] max-w-[380px] bg-base-00 min-h-[560px] p-4 flex flex-col gap-4 text-base-90">
            {/* Header */}
            <header className="flex items-center justify-between">
                <h1 className="text-sm font-semibold tracking-wide uppercase text-base-70">
                    AI Listing-Optimizer
                </h1>
                <QuotaBadge plan={plan} remaining={remaining}/>
            </header>

            {/* Scan section */}
            <section className="flex flex-col gap-3">
                <label className="text-xs text-base-70">Listings to scan</label>
                <input
                    type="number"
                    min={1}
                    max={200}
                    value={limit}
                    disabled={busy}
                    onChange={e => setLimit(+e.target.value)}
                    className="border border-base-30 rounded-xl px-3 py-[6px] text-sm outline-none
                     focus:border-accent focus:ring-2 focus:ring-accent/30 transition"
                />

                <button
                    disabled={busy}
                    onClick={startScan}
                    className="rounded-pill bg-accent hover:bg-accent-hover active:scale-[.97] disabled:opacity-50
                     text-base-00 flex items-center justify-center gap-1 py-[10px] transition">
                    {busy ? <RefreshCcw className="animate-spin h-4" /> : null}
                    Scan {limit}
                </button>
            </section>

            <hr className="border-base-30" />

            {/* Plan / upgrade */}
            <section className="flex flex-col gap-2 text-sm">
                <p>
                    Plan:&nbsp;
                    <span className="font-medium capitalize">{plan}</span>
                    &nbsp;·&nbsp;
                    {remaining > 0 ? (
                        <span className="text-base-70">{remaining} left</span>
                    ) : (
                        <span className="text-error">0 left</span>
                    )}
                </p>

                {plan === "guest" ? (
                    <button
                        onClick={upgrade}
                        className="rounded-pill border border-accent text-accent hover:bg-accent-subtle
                       flex items-center justify-center gap-1 py-[8px] transition">
                        Upgrade
                        <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        onClick={logout}
                        className="text-xs text-base-70 hover:text-base-90 self-start">
                        Logout
                    </button>
                )}
            </section>

            {/* Footer */}
            <footer className="mt-auto text-[11px] text-base-30">
                © {new Date().getFullYear()} Listing-Optimizer
            </footer>
        </div>
    )
}
