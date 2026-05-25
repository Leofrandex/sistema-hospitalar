import { Check, Clock } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ServiceOrderStatus } from '@/types/service-order'

const STEPS: { key: ServiceOrderStatus; label: string }[] = [
  { key: 'pendiente',   label: 'Recibida' },
  { key: 'asignada',    label: 'Asignada' },
  { key: 'en-progreso', label: 'En sitio' },
  { key: 'completada',  label: 'Completada' },
]

const ORDER: Record<ServiceOrderStatus, number> = {
  'pendiente': 0,
  'asignada': 1,
  'en-progreso': 2,
  'en-espera-repuestos': 2,
  'completada': 3,
  'cancelada': -1,
}

export function OrderStatusTimeline({ status }: { status: ServiceOrderStatus }) {
  const currentIndex = ORDER[status]
  const isPaused = status === 'en-espera-repuestos'
  const isCanceled = status === 'cancelada'

  if (isCanceled) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Esta orden fue cancelada.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const done = idx < currentIndex
          const active = idx === currentIndex
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center z-10',
                  done && 'bg-success text-white',
                  active && 'bg-primary text-white ring-4 ring-primary/20',
                  !done && !active && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <span className={cn('text-xs mt-2 text-center', (done || active) ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {step.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'absolute top-[18px] left-1/2 w-full h-0.5',
                    idx < currentIndex ? 'bg-success' : 'bg-muted',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
      {isPaused && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning-foreground">
          Pausada — gestionando repuestos. Reanudaremos en cuanto estén disponibles.
        </div>
      )}
    </div>
  )
}
