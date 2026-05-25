import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card, CardContent } from '@/components/ui/card'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'default' | 'warning' | 'danger' | 'success'
  className?: string
}

const variantStyles = {
  default: {
    icon: 'bg-primary/10 text-primary',
    card: '',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    card: 'border-warning/40',
  },
  danger: {
    icon: 'bg-destructive/10 text-destructive',
    card: 'border-destructive/40',
  },
  success: {
    icon: 'bg-success/10 text-success',
    card: 'border-success/40',
  },
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', className }: KpiCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn('animate-fade-in', styles.card, className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-normal truncate">{title}</p>
            <p className="text-3xl font-semibold mt-1 text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={cn('text-xs mt-2 font-medium', trend.value > 0 ? 'text-destructive' : 'text-success')}>
                {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn('rounded-lg p-3 shrink-0', styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
