/* --------------------------------------------------------------------------
 * UpgradeOverlay.tsx  –  modal that captures guest e‑mail and triggers top‑up
 * --------------------------------------------------------------------------
 * Props
 *   • email        – current value to pre‑fill
 *   • setEmail     – setter to lift value to parent
 *   • buying       – boolean spinner / disabled state
 *   • onUpgrade    – callback that opens Stripe Checkout
 *   • onBack       – return to Demo tab
 * ------------------------------------------------------------------------ */

import { useState, type FC } from "react"
import { Lock, RefreshCcw, ArrowRight } from "lucide-react"

export interface UpgradeOverlayProps {
    email: string
    setEmail: (v: string) => void
    buying: boolean
    onUpgrade: () => void
    onBack: () => void
}

const UpgradeOverlay: FC<UpgradeOverlayProps> = ({
                                                     email,
                                                     setEmail,
                                                     buying,
                                                     onUpgrade,
                                                     onBack
                                                 }) => {
    // local buffer so typing doesn't instantly mutate parent state
    const [temp, setTemp] = useState(email)

    const saveAndUpgrade = () => {
        setEmail(temp.trim())
        onUpgrade()
    }

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-base-00/60 backdrop-blur-sm">
            <div className="bg-base-00 border border-base-20 rounded-xl p-8 flex flex-col gap-4 shadow-xl max-w-[340px] w-full">
                <div className="flex flex-col items-center gap-1">
                    <Lock className="h-6 w-6 text-accent" />
                    <h3 className="text-lg font-semibold">Unlock full power</h3>
                    <p className="text-sm text-base-70 text-center">
                        Upgrade to Pro to access connected sources and bulk actions.
                    </p>
                </div>

                <label className="text-xs font-medium text-base-60">
                    E‑mail for receipt & magic‑link
                </label>
                <input
                    type="email"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="w-full border border-base-30 rounded-md px-3 py-2 text-base outline-none focus:border-accent"
                    placeholder="you@example.com"
                />

                <button
                    onClick={saveAndUpgrade}
                    disabled={buying}
                    className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {buying && <RefreshCcw className="h-4 w-4 animate-spin" />}
                    {buying ? "Redirecting…" : "Upgrade for $10"}
                    <ArrowRight className="h-4 w-4" />
                </button>

                <button
                    onClick={onBack}
                    className="text-xs underline self-center text-base-60 hover:text-base-90"
                >
                    Back to Demo
                </button>
            </div>
        </div>
    )
}

export default UpgradeOverlay;
