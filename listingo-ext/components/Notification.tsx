import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

export type NotificationType = "success" | "error" | "info" | "warning"

interface NotificationProps {
  type: NotificationType
  title: string
  message?: string
  duration?: number
  onClose?: () => void
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200 text-green-700",
    iconClassName: "text-green-500"
  },
  error: {
    icon: XCircle,
    className: "bg-red-50 border-red-200 text-red-700",
    iconClassName: "text-red-500"
  },
  info: {
    icon: AlertCircle,
    className: "bg-blue-50 border-blue-200 text-blue-700",
    iconClassName: "text-blue-500"
  },
  warning: {
    icon: AlertCircle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-700",
    iconClassName: "text-yellow-500"
  }
}

export default function Notification({ 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const config = typeConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-[10000] p-4 border rounded-lg shadow-lg max-w-sm ${config.className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${config.iconClassName}`} />
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          {message && (
            <p className="text-sm mt-1 opacity-90">{message}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Hook for managing notifications
export function useNotification() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: NotificationType
    title: string
    message?: string
    duration?: number
  }>>([])

  const addNotification = (
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, type, title, message, duration }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const showSuccess = (title: string, message?: string) => 
    addNotification("success", title, message)
  
  const showError = (title: string, message?: string) => 
    addNotification("error", title, message)
  
  const showInfo = (title: string, message?: string) => 
    addNotification("info", title, message)
  
  const showWarning = (title: string, message?: string) => 
    addNotification("warning", title, message)

  return {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}

// Notification container component
export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification()

  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  )
}




