import { useState } from "react"
import "./style.css"

export default function Popup() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle")
  const [title, setTitle] = useState("")

  const handleScan = () => {
    setStatus("loading")
    // Mock API call
    setTimeout(() => {
      setTitle("Optimized Listing Title")
      setStatus("ready")
    }, 1000)
  }

  const handleApply = () => {
    // Mock apply call
    setStatus("idle")
    setTitle("")
  }

  return (
    <div className="w-72 p-4 text-gray-800 font-sans">
      <h1 className="text-lg font-semibold mb-3">Listing Optimizer</h1>
      <button
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        onClick={handleScan}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Scanning..." : "Scan Listings"}
      </button>

      {status === "ready" && (
        <div className="mt-4">
          <p className="text-sm mb-1">Suggested Title</p>
          <div className="border p-2 rounded bg-gray-50 text-sm">{title}</div>
          <button
            className="mt-3 w-full bg-green-600 text-white py-2 rounded"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <span>Quota: 10 left</span>
        <button
          className="text-blue-600 hover:underline"
          onClick={() => window.open("https://example.com")}
        >
          Upgrade
        </button>
      </div>
    </div>
  )
}
