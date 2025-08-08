/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_EDGE_BASE: string
    readonly VITE_HMAC_SECRET: string
    readonly PLASMO_PUBLIC_API_BASE: string
    readonly PLASMO_PUBLIC_EDGE_BASE: string
    // add every other public var here ↓
    readonly PLASMO_PUBLIC_SUPABASE_URL: string
    readonly PLASMO_PUBLIC_SUPABASE_KEY: string
    readonly PLASMO_PUBLIC_LEMONSQUEEZY_CHECKOUT: string
    readonly PLASMO_PUBLIC_LEMONSQUEEZY_STORE_ID: string
    readonly PLASMO_PUBLIC_LEMONSQUEEZY_PRODUCT_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
