import { useState } from "react"
import { supabase } from "~core/supabase"
import { Lock, Mail } from "lucide-react"

export default function SignInOverlay({ email }: { email: string }) {
    const [sending, setSending] = useState(false)
    const resend = async () => {
        setSending(true)
        await supabase.auth.signInWithOtp({ email })
        setSending(false)
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-base-00/60 backdrop-blur-sm">
            <div className="bg-base-00 border border-base-20 rounded-xl p-6 flex flex-col gap-4 shadow-xl max-w-[320px]">
                <Lock className="h-6 w-6 text-accent mx-auto" />
                <p className="text-sm text-base-70 text-center">
                    Payment received!<br />
                    Open the magic-link in <b>this browser</b> to unlock your credits.
                </p>
                <button
                    onClick={resend}
                    disabled={sending}
                    className="btn-accent flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {sending ? "Sending…" : "Resend link"}
                    <Mail className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
