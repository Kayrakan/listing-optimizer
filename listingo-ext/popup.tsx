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
        <div className="w-[96vw] max-w-[380px] bg-gradient-to-b from-base-00 to-base-05 min-h-[560px] flex flex-col text-base-90 shadow-lg">
            {/* Header */}
            <header className="bg-base-10 p-4 border-b border-base-20 flex items-center justify-between">
                <h1 className="text-base font-bold tracking-wide uppercase text-base-90">
                    AI Listing-Optimizer
                </h1>
                <QuotaBadge plan={plan} remaining={remaining}/>
            </header>

            {/* Main Content */}
            <div className="flex-1 p-6 flex flex-col gap-6">
                {/* Scan section */}
                <section className="bg-base-05 rounded-xl p-5 shadow-sm border border-base-20">
                    <h2 className="text-base font-semibold mb-4">Scan Your Listings</h2>

                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-base-70 font-medium">Number of listings to scan</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min={1}
                                    max={200}
                                    value={limit}
                                    disabled={busy}
                                    onChange={e => setLimit(+e.target.value)}
                                    className="w-full border-2 border-base-30 rounded-lg px-4 py-3 text-base outline-none
                                    focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            disabled={busy}
                            onClick={startScan}
                            className="mt-2 rounded-lg bg-accent hover:bg-accent-hover active:scale-[.98] disabled:opacity-50
                            text-base-00 flex items-center justify-center gap-2 py-3 font-semibold text-base shadow-sm transition-all">
                            {busy ? (
                                <>
                                    <RefreshCcw className="animate-spin h-5 w-5" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <span className="inline-block">Scan {limit} Listings</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* Plan / upgrade */}
                <section className="bg-base-05 rounded-xl p-5 shadow-sm border border-base-20">
                    <h2 className="text-base font-semibold mb-4">Your Plan</h2>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 bg-base-10 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="font-medium capitalize text-base">{plan}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {remaining > 0 ? (
                                    <span className="text-base-70 font-medium">{remaining} listings left</span>
                                ) : (
                                    <span className="text-error font-medium">0 listings left</span>
                                )}
                            </div>
                        </div>

                        {plan === "guest" ? (
                            <button
                                onClick={upgrade}
                                className="rounded-lg bg-accent hover:bg-accent-hover text-base-00
                                flex items-center justify-center gap-2 py-3 font-semibold shadow-sm transition-all">
                                Upgrade to Pro
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        ) : (
                            <button
                                onClick={logout}
                                className="text-sm text-base-70 hover:text-base-90 hover:underline self-start transition-colors">
                                Logout
                            </button>
                        )}
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-base-10 p-4 text-sm text-base-50 text-center border-t border-base-20">
                © {new Date().getFullYear()} Listing-Optimizer
            </footer>
        </div>
    )
}
