import { type LucideIcon, Hammer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ComingSoonPageProps {
  title: string
  icon: LucideIcon
  description: string
  features?: string[]
}

export function ComingSoonPage({ title, icon: Icon, description, features = [] }: ComingSoonPageProps) {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-6">
        <Icon className="h-10 w-10 text-muted-foreground/60" />
      </div>
      <div className="flex items-center justify-center gap-3 mb-3">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <Badge variant="secondary" className="gap-1.5">
          <Hammer className="h-3 w-3" />
          En construcción
        </Badge>
      </div>
      <p className="text-muted-foreground text-base leading-relaxed mb-8">{description}</p>
      {features.length > 0 && (
        <div className="text-left bg-muted/30 rounded-lg p-6">
          <p className="text-sm font-medium mb-3 text-foreground">Qué encontrarás aquí:</p>
          <ul className="space-y-2">
            {features.map(f => (
              <li key={f} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
