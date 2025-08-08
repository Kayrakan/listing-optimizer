import { useState, useEffect } from "react"
import { 
  Settings, 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle,
  ExternalLink,
  LogOut,
  RefreshCw
} from "lucide-react"
import { useStore } from "~state"
import { supabase } from "~core/supabase"
import { buyCredits } from "~core/topup"

interface SettingsSection {
  id: string
  title: string
  icon: any
  component: React.ReactNode
}

export default function Options() {
  const [activeSection, setActiveSection] = useState("account")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const plan = useStore((s) => s.plan)
  const remaining = useStore((s) => s.remaining)
  const logout = useStore((s) => s.logout)
  const refresh = useStore((s) => s.refresh)

  const [userEmail, setUserEmail] = useState("")
  const [autoScan, setAutoScan] = useState(false)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    // Get user email
    const getUserEmail = async () => {
      const { data } = await supabase.auth.getUser()
      setUserEmail(data.user?.email || "")
    }
    getUserEmail()
  }, [])

  const handleBuyCredits = async () => {
    setLoading(true)
    try {
      const url = await buyCredits(10, userEmail)
      window.open(url, "_blank")
      setMessage({ type: "success", text: "Checkout opened in new tab" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to open checkout" })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      logout()
      setMessage({ type: "success", text: "Signed out successfully" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to sign out" })
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshQuota = async () => {
    setLoading(true)
    try {
      await refresh()
      setMessage({ type: "success", text: "Quota refreshed" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to refresh quota" })
    } finally {
      setLoading(false)
    }
  }

  const sections: SettingsSection[] = [
    {
      id: "account",
      title: "Account",
      icon: User,
      component: (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Profile</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="text-sm font-medium">{userEmail}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Plan</label>
                <p className="text-sm font-medium capitalize">{plan}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="mt-4 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )
    },
    {
      id: "credits",
      title: "Credits",
      icon: CreditCard,
      component: (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Current Balance</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">{remaining}</span>
              <span className="text-sm text-gray-600">listings remaining</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleRefreshQuota}
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Quota
              </button>
              <button
                onClick={handleBuyCredits}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                Buy Credits ($10)
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "preferences",
      title: "Preferences",
      icon: Settings,
      component: (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Scanning</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoScan}
                  onChange={(e) => setAutoScan(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Auto-scan when visiting marketplace pages</span>
              </label>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show notifications when jobs complete</span>
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "help",
      title: "Help & Support",
      icon: HelpCircle,
      component: (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Resources</h3>
            <div className="space-y-2">
              <a
                href="https://listingo.ai/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
              >
                Documentation
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://listingo.ai/support"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
              >
                Contact Support
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">About</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Listing Optimizer v0.0.1</p>
              <p>AI-powered marketplace listing optimization</p>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your Listing Optimizer preferences</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === "success" 
              ? "bg-green-50 border border-green-200 text-green-700" 
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <section.icon className="h-5 w-5" />
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {sections.find(s => s.id === activeSection)?.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}