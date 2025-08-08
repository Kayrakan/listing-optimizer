export function getEnv(name: string): string | undefined {
  // Prefer Vite/Plasmo import.meta.env if available
  try {
    const meta: any = (import.meta as any)
    if (meta?.env && typeof meta.env === "object" && name in meta.env) {
      const v = meta.env[name]
      if (typeof v === "string" && v.length > 0) return v
    }
  } catch (_) {
    // ignore
  }

  // Fallback to process.env (Parcel/Plasmo replaces at build time)
  try {
    const pe: any = (globalThis as any).process?.env
    const v = pe?.[name]
    if (typeof v === "string" && v.length > 0) return v
  } catch (_) {
    // ignore
  }

  return undefined
}
