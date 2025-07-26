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

import { useState, useEffect, type FC, type KeyboardEvent } from "react"
import { Lock, RefreshCcw, ArrowRight, Mail, CreditCard } from "lucide-react"

export interface UpgradeOverlayProps {
    email: string
    setEmail: (v: string) => void
    buying: boolean
    onUpgrade: (email?: string) => void
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
    const [isValid, setIsValid] = useState(false)
    const [showValidation, setShowValidation] = useState(false)

    // Update local state when prop changes
    useEffect(() => {
        setTemp(email)
    }, [email])

    // Validate email format
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        setIsValid(emailRegex.test(temp.trim()))
    }, [temp])

    const saveAndUpgrade = () => {
        setShowValidation(true)
        if (!isValid) return
        const e = temp.trim()
        setEmail(e)
        // Pass the validated email directly to onUpgrade
        onUpgrade(e)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            saveAndUpgrade()
        }
    }

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-base-00/60 backdrop-blur-sm">
            <div className="bg-base-00 border border-base-20 rounded-xl p-8 flex flex-col gap-5 shadow-xl max-w-[380px] w-full">
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-accent/10 p-3 rounded-full">
                        <Lock className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">Unlock Pro Features</h3>
                    <p className="text-sm text-base-70 text-center">
                        Get unlimited access to connected sources and powerful bulk actions.
                    </p>
                </div>

                <div className="bg-base-05 p-4 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="mt-1">
                            <CreditCard className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                            <h4 className="font-medium">Pro Plan - $10</h4>
                            <p className="text-xs text-base-70">Includes 100 listing optimizations</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Your email address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-60" />
                        <input
                            type="email"
                            value={temp}
                            onChange={e => setTemp(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="you@example.com"
                            className="w-full border rounded-lg px-10 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none"
                            aria-label="Email for receipt and magic-link"
                            autoFocus
                        />
                    </div>
                    {showValidation && !isValid && (
                        <p className="text-xs text-red-500">Please enter a valid email address</p>
                    )}
                </div>

                <button
                    onClick={saveAndUpgrade}
                    disabled={buying}
                    className="mt-2 w-full btn-accent py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {buying && <RefreshCcw className="animate-spin h-4 w-4"/>}
                    {buying ? "Processing payment..." : "Upgrade Now"}
                    {!buying && <ArrowRight className="h-4 w-4" />}
                </button>

                <div className="text-xs text-center text-base-60">
                    Secure payment processing by Stripe
                </div>

                <button
                    onClick={onBack}
                    className="text-sm underline self-center text-base-60 hover:text-base-90 mt-2"
                >
                    Continue with Demo
                </button>
            </div>
        </div>
    )
}

export default UpgradeOverlay;
