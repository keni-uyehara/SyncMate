import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  change?: {
    value: string
    isPositive: boolean
  }
  progress?: number
  description?: string
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-500",
  change,
  progress,
  description
}: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            <span className={`${change.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              {change.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {change.value}
            </span>
          </p>
        )}
        {progress !== undefined && (
          <Progress value={progress} className="mt-2" />
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
