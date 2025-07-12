/* src/hooks/useInitAuth.ts
   Keeps JWT in Zustand → silent guest bootstrap → reacts to Supabase login */

import { useEffect } from "react"
import { supabase } from "~core/supabase"
import { useStore } from "~state"

export const useInitAuth = () => {
    const setJwt = useStore((s) => s.setJwt)

    useEffect(() => {
        /** bootstrap once */
        const boot = async () => {
            // 1️⃣ Supabase session already present?
            const { data } = await supabase.auth.getSession()
            if (data.session?.access_token) {
                setJwt(data.session.access_token)
                return
            }

            // 2️⃣ Otherwise, request guest token from Laravel
            console.log('api base');
            console.log(process.env.PLASMO_PUBLIC_API_BASE!);
            // console.log(import.meta.env.PLASMO_PUBLIC_API_BASE);
            const api = process.env.PLASMO_PUBLIC_API_BASE! // e.g. http://localhost:8000
            const { token } = await fetch(`${api}/api/auth/guest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }   // body is empty but ok
            }).then(r => r.json())
            console.log(token);
            setJwt(token)
        }

        boot()

        // 3️⃣ Keep Zustand in sync when Supabase signs in (magic-link / Stripe upgrade)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, sess) => {
            if (sess?.access_token) setJwt(sess.access_token)
        })

        return () => subscription.unsubscribe()
    }, [])
}
