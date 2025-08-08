import { createClient } from "@supabase/supabase-js"
import { Storage } from "@plasmohq/storage"
import { getEnv } from "~core/env"

const storage = new Storage({
    area: "local"
})

// Read env via helper (handles import.meta.env and process.env)
const supabaseUrl = getEnv("PLASMO_PUBLIC_SUPABASE_URL")
const supabaseKey = getEnv("PLASMO_PUBLIC_SUPABASE_KEY")

if (!supabaseUrl || !supabaseKey) {
    console.warn(
        "Supabase env missing. Set PLASMO_PUBLIC_SUPABASE_URL and PLASMO_PUBLIC_SUPABASE_KEY in .env.local"
    )
}

const createMockClient = () => ({
    auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        signInWithOAuth: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: (_e: any, _cb?: any) => ({
            data: {
                subscription: { unsubscribe: () => void 0 }
            },
            error: null
        })
    }
}) as any

export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
            storage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        }
    })
    : createMockClient()