import { useState } from "react"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  Trash2
} from "lucide-react"
import { useStore } from "~state"
import type { JobStatus } from "@lo/shared/types"
import JobResults from "./JobResults"

interface JobRow {
  id: string
  status: JobStatus
  resultJson?: unknown
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
      return "Processing"
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

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case "queued":
      return "bg-yellow-100 text-yellow-700"
    case "ready":
      return "bg-green-100 text-green-700"
    case "patched":
      return "bg-blue-100 text-blue-700"
    case "error":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function JobsList() {
  const jobs = useStore((s) => s.rows)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const jobEntries = Object.entries(jobs)
  const activeJobs = jobEntries.filter(([_, job]) => job.status === "queued" || job.status === "ready")
  const completedJobs = jobEntries.filter(([_, job]) => job.status === "patched" || job.status === "error")
  const displayedJobs = showCompleted ? [...activeJobs, ...completedJobs] : activeJobs

  if (jobEntries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">No jobs yet</p>
        <p className="text-xs mt-1">Start a scan to see your jobs here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Active Jobs</h3>
        {completedJobs.length > 0 && (
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {showCompleted ? "Hide completed" : `Show ${completedJobs.length} completed`}
          </button>
        )}
      </div>

      {/* Jobs list */}
      <div className="space-y-2">
        {displayedJobs.map(([jobId, job]) => (
          <div
            key={jobId}
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
              selectedJob === jobId 
                ? "border-blue-300 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedJob(selectedJob === jobId ? null : jobId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(job.status)}
                <div>
                  <p className="font-medium text-sm">Job {jobId.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
                  {getStatusText(job.status)}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected job details */}
      {selectedJob && (
        <div className="border-t pt-4">
          <JobResults jobId={selectedJob} onClose={() => setSelectedJob(null)} />
        </div>
      )}

      {/* Empty state for active jobs */}
      {activeJobs.length === 0 && !showCompleted && (
        <div className="p-4 text-center text-gray-500">
          <CheckCircle className="h-6 w-6 mx-auto mb-2" />
          <p className="text-sm">No active jobs</p>
          <p className="text-xs mt-1">All jobs are completed</p>
        </div>
      )}
    </div>
  )
}




