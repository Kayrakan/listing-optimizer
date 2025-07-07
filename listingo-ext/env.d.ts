/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_EDGE_BASE: string
    readonly VITE_HMAC_SECRET: string
    readonly PLASMO_PUBLIC_API_BASE: string
    // add every other public var here ↓
    readonly PLASMO_PUBLIC_SUPABASE_URL: string
    readonly PLASMO_PUBLIC_SUPABASE_KEY: string
    readonly PLASMO_PUBLIC_STRIPE_CHECKOUT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
