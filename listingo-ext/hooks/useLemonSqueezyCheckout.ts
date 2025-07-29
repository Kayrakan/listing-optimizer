import { useState } from 'react'
import { useStore } from '../state'

/**
 * Hook to handle LemonSqueezy checkout
 */
export function useLemonSqueezyCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const email = useStore(state => state.auth.email)

  /**
   * Open LemonSqueezy checkout for the specified amount
   * @param amountUSD - Amount in USD (e.g., 10 for $10)
   */
  const openCheckout = async (amountUSD: number) => {
    if (!email) {
      setError('You must be signed in to purchase credits')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert dollars to cents
      const cents = Math.round(amountUSD * 100)

      // Call the API to create a checkout session
      const response = await fetch(`${process.env.PLASMO_PUBLIC_API_URL}/api/topup/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cents,
          email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      // Open the checkout URL in a new tab
      window.open(data.url, '_blank')
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return {
    openCheckout,
    loading,
    error,
  }
}

export default useLemonSqueezyCheckout