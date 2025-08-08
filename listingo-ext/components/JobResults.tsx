import { useState } from "react"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Copy,
  ExternalLink
} from "lucide-react"
import { useStore } from "~state"
import type { JobStatus } from "@lo/shared/types"

interface JobResult {
  id: string
  status: JobStatus
  resultJson?: {
    listings: Array<{
      id: string
      originalTitle: string
      optimizedTitle: string
      confidence: number
      reasoning: string
      url?: string
    }>
  }
}

interface JobResultsProps {
  jobId: string
  onClose?: () => void
}

const getStatusIcon = (status: JobStatus) => {
  switch (status) {
    case "queued":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "ready":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "patched":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

const getStatusText = (status: JobStatus) => {
  switch (status) {
    case "queued":
      return "Processing..."
    case "ready":
      return "Ready"
    case "patched":
      return "Applied"
    case "error":
      return "Error"
    default:
      return "Unknown"
  }
}

export default function JobResults({ jobId, onClose }: JobResultsProps) {
  const job = useStore((s) => s.rows[jobId]) as JobResult
  const applyPatch = useStore((s) => s.applyPatch)
  const [applying, setApplying] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  if (!job) {
    return (
      <div className="p-4 text-center text-gray-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Job not found</p>
      </div>
    )
  }

  const handleApplyPatch = async (listingId: string) => {
    setApplying(listingId)
    try {
      await applyPatch(jobId)
    } finally {
      setApplying(null)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const listings = job.resultJson?.listings || []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(job.status)}
          <span className="font-medium">Job {jobId.slice(0, 8)}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            job.status === "ready" ? "bg-green-100 text-green-700" :
            job.status === "patched" ? "bg-blue-100 text-blue-700" :
            job.status === "error" ? "bg-red-100 text-red-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {getStatusText(job.status)}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Error state */}
      {job.status === "error" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">Failed to process listings</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {job.status === "queued" && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Analyzing your listings...</p>
        </div>
      )}

      {/* Results */}
      {job.status === "ready" && listings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4" />
            <span>Found {listings.length} optimization{listings.length !== 1 ? 's' : ''}</span>
          </div>

          {listings.map((listing) => (
            <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
              {/* Original listing */}
              <div className="mb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Original Title</h4>
                    <p className="text-sm text-gray-700">{listing.originalTitle}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(listing.originalTitle, `original-${listing.id}`)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Optimized suggestion */}
              <div className="mb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-green-700 mb-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Optimized Title
                    </h4>
                    <p className="text-sm text-green-800 font-medium">{listing.optimizedTitle}</p>
                    <p className="text-xs text-gray-600 mt-1">{listing.reasoning}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(listing.optimizedTitle, `optimized-${listing.id}`)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Confidence: {Math.round(listing.confidence * 100)}%
                  </span>
                  {listing.url && (
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View listing
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                
                <button
                  onClick={() => handleApplyPatch(listing.id)}
                  disabled={applying === listing.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying === listing.id ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      Applying...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-3 w-3" />
                      Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {job.status === "ready" && listings.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Sparkles className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No optimizations found for these listings</p>
        </div>
      )}

      {/* Success message for copied text */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md text-sm">
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}




