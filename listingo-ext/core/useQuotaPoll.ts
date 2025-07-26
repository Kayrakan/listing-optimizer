// listingo-ext/core/useQuotaPoll.ts
import { useEffect, useRef } from "react"
import { useStore } from "~state"

export const useQuotaPoll = (enabled: boolean) => {
    const timer = useRef<NodeJS.Timeout>()

    useEffect(() => {
        if (!enabled) return

        const poll = async () => {
            const jwt = useStore.getState().jwt
            const r = await fetch("https://api.listingo.ai/api/quota", {
                headers: jwt ? { Authorization: `Bearer ${jwt}` } : {}
            })
            const { remaining } = await r.json()

            if (remaining > 0) {
                if (jwt) {
                    useStore.getState().setRemaining(remaining)
                    clearInterval(timer.current!)
                } else {
                    useStore.getState().setShowSignIn(true)
                }
            }
        }

        poll()
        timer.current = setInterval(poll, 10_000)
        return () => clearInterval(timer.current!)
    }, [enabled])
}
