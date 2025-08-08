/* src/hooks/useInitAuth.ts
   Keeps JWT in Zustand → silent guest bootstrap → reacts to Supabase login */

import { useEffect } from "react"
import { supabase } from "~core/supabase"
import { useStore } from "~state"
import { getEnv } from "~core/env"

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
            const api = getEnv("PLASMO_PUBLIC_API_BASE") || "http://localhost:8000"
            try {
                const response = await fetch(`${api}/api/auth/guest`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }   // body is empty but ok
                })
                
                if (response.ok) {
                    const { token } = await response.json()
                    setJwt(token)
                } else {
                    console.warn("Failed to get guest token:", response.status)
                }
            } catch (error) {
                console.warn("Error getting guest token:", error)
            }
        }

        boot()

        // 3️⃣ Keep Zustand in sync when Supabase signs in (magic-link / LemonSqueezy upgrade)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, sess: any) => {
            if (sess?.access_token) setJwt(sess.access_token)
        })

        return () => subscription.unsubscribe()
    }, [])
}
