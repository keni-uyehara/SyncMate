import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  variant?: "severity" | "status" | "priority"
}

export function StatusBadge({ status, variant = "status" }: StatusBadgeProps) {
  const getStatusColor = (status: string, variant: string) => {
    if (variant === "severity") {
      switch (status.toLowerCase()) {
        case "high":
          return "bg-red-100 text-red-800"
        case "medium":
          return "bg-orange-100 text-orange-800"
        case "low":
          return "bg-green-100 text-green-800"
        case "critical":
          return "bg-red-100 text-red-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    if (variant === "status") {
      switch (status.toLowerCase()) {
        case "in progress":
        case "active":
          return "bg-blue-100 text-blue-800"
        case "pending review":
        case "pending":
          return "bg-yellow-100 text-yellow-800"
        case "revised":
        case "resolved":
        case "completed":
          return "bg-green-100 text-green-800"
        case "cancelled":
        case "failed":
          return "bg-red-100 text-red-800"
        case "draft":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    if (variant === "priority") {
      switch (status.toLowerCase()) {
        case "high":
        case "urgent":
          return "bg-red-100 text-red-800"
        case "medium":
        case "normal":
          return "bg-yellow-100 text-yellow-800"
        case "low":
          return "bg-green-100 text-green-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    return "bg-gray-100 text-gray-800"
  }

  return (
    <Badge className={getStatusColor(status, variant)}>
      {status}
    </Badge>
  )
}
