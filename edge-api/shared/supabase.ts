// shared/supabase.ts
export const supabase = createClient(
    import.meta.env.PLASMO_PUBLIC_SUPABASE_URL,
    import.meta.env.PLASMO_PUBLIC_SUPABASE_ANON
)