import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  actions?: {
    label: string
    icon: LucideIcon
    variant?: "default" | "outline" | "destructive"
    onClick?: () => void
  }[]
}

export function DashboardHeader({ title, actions = [] }: DashboardHeaderProps) {
  return (
    <div>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
                className="bg-[#000000] text-white hover:bg-[#000000]/90"
              >
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
