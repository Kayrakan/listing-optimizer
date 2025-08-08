import cssText from "data-text:~style.css"
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { Store, Sparkles, X, CheckCircle, AlertCircle } from "lucide-react"

// Types for listing detection
interface ListingData {
  id: string
  title: string
  description?: string
  price?: string
  url: string
  platform: "etsy" | "shopify" | "amazon" | "ebay"
}

interface OptimizationSuggestion {
  original: string
  optimized: string
  confidence: number
  reasoning: string
  applied?: boolean
}

// Main content script component
const ListingOptimizer = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [listings, setListings] = useState<ListingData[]>([])
  const [suggestions, setSuggestions] = useState<Record<string, OptimizationSuggestion>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Detect marketplace listings on the page
  const detectListings = (): ListingData[] => {
    const detected: ListingData[] = []
    
    // Etsy detection
    if (window.location.hostname.includes('etsy.com')) {
      const listingCards = document.querySelectorAll('[data-listing-id]')
      listingCards.forEach((card, index) => {
        const titleEl = card.querySelector('h3, .listing-link')
        const priceEl = card.querySelector('[data-testid="price"], .currency-value')
        
        if (titleEl) {
          detected.push({
            id: card.getAttribute('data-listing-id') || `etsy-${index}`,
            title: titleEl.textContent?.trim() || '',
            price: priceEl?.textContent?.trim(),
            url: window.location.href,
            platform: 'etsy'
          })
        }
      })
    }
    
    // Shopify detection
    if (window.location.hostname.includes('myshopify.com') || window.location.hostname.includes('shopify.com')) {
      const productCards = document.querySelectorAll('.product-card, .product-item')
      productCards.forEach((card, index) => {
        const titleEl = card.querySelector('.product-title, .product-name')
        const priceEl = card.querySelector('.price, .product-price')
        
        if (titleEl) {
          detected.push({
            id: card.getAttribute('data-product-id') || `shopify-${index}`,
            title: titleEl.textContent?.trim() || '',
            price: priceEl?.textContent?.trim(),
            url: window.location.href,
            platform: 'shopify'
          })
        }
      })
    }

    return detected
  }

  // Get optimization suggestions from the edge API
  const getSuggestions = async (listingTitles: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const edgeBase = import.meta.env.PLASMO_PUBLIC_EDGE_BASE || import.meta.env.VITE_EDGE_BASE
      if (!edgeBase) {
        throw new Error('Edge API base URL not configured')
      }
      
      const response = await fetch(`${edgeBase}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titles: listingTitles,
          platform: listings[0]?.platform || 'etsy'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to get optimization suggestions')
      }
      
      const data = await response.json()
      setSuggestions(data.suggestions || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Apply optimization to a listing
  const applyOptimization = async (listingId: string, suggestion: OptimizationSuggestion) => {
    try {
      const edgeBase = import.meta.env.PLASMO_PUBLIC_EDGE_BASE || import.meta.env.VITE_EDGE_BASE
      if (!edgeBase) {
        throw new Error('Edge API base URL not configured')
      }
      
      await fetch(`${edgeBase}/patch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          originalTitle: suggestion.original,
          optimizedTitle: suggestion.optimized
        })
      })
      
      // Update local state to show success
      setSuggestions(prev => ({
        ...prev,
        [listingId]: { ...prev[listingId], applied: true }
      }))
    } catch (err) {
      setError('Failed to apply optimization')
    }
  }

  // Scan for listings when component mounts
  useEffect(() => {
    const detected = detectListings()
    setListings(detected)
    
    if (detected.length > 0) {
      setIsVisible(true)
    }
  }, [])

  // Auto-scan for suggestions when listings are detected
  useEffect(() => {
    if (listings.length > 0 && Object.keys(suggestions).length === 0) {
      const titles = listings.map(l => l.title).filter(Boolean)
      if (titles.length > 0) {
        getSuggestions(titles)
      }
    }
  }, [listings])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Listing Optimizer</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const suggestion = suggestions[listing.id]
            
            return (
              <div key={listing.id} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-start gap-2 mb-2">
                  <Store className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{listing.title}</p>
                    {listing.price && (
                      <p className="text-xs text-gray-500">{listing.price}</p>
                    )}
                  </div>
                </div>
                
                {suggestion && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Optimized Title</span>
                    </div>
                    <p className="text-sm text-blue-900 mb-2">{suggestion.optimized}</p>
                    <p className="text-xs text-blue-700 mb-3">{suggestion.reasoning}</p>
                    
                    {suggestion.applied ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">Applied</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => applyOptimization(listing.id, suggestion)}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Inject styles
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// Mount the component
const mount = () => {
  const container = document.createElement("div")
  container.id = "listing-optimizer-root"
  document.body.appendChild(container)
  
  const root = createRoot(container)
  root.render(<ListingOptimizer />)
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount)
} else {
  mount()
}