import { Badge } from '@/components/ui/badge'
import type { ServiceOrderStatus, ServiceOrderType } from '@/types/service-order'
import type { DeliveryStatus } from '@/types/sale'
import type { PaymentStatus } from '@/types/payment'

const SO_STATUS: Record<ServiceOrderStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'muted' | 'destructive' }> = {
  'pendiente':            { label: 'Pendiente',           variant: 'warning' },
  'asignada':             { label: 'Asignada',            variant: 'default' },
  'en-progreso':          { label: 'En progreso',         variant: 'default' },
  'en-espera-repuestos':  { label: 'Espera repuestos',    variant: 'warning' },
  'completada':           { label: 'Completada',          variant: 'success' },
  'cancelada':            { label: 'Cancelada',           variant: 'muted' },
}

const SO_TYPE: Record<ServiceOrderType, { label: string; variant: 'default' | 'muted' }> = {
  'revision-fabrica': { label: 'Revisión fábrica', variant: 'muted' },
  'instalacion':      { label: 'Instalación',      variant: 'default' },
  'preventivo':       { label: 'Preventivo',       variant: 'default' },
  'correctivo':       { label: 'Correctivo',       variant: 'default' },
  'predictivo':       { label: 'Predictivo',       variant: 'default' },
}

const DELIVERY_STATUS: Record<DeliveryStatus, { label: string; variant: 'warning' | 'default' | 'success' }> = {
  'por-entregar': { label: 'Por entregar', variant: 'warning' },
  'en-entrega':   { label: 'En entrega',   variant: 'default' },
  'entregado':    { label: 'Entregado',    variant: 'success' },
}

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  pagado:   { label: 'Pagado',    variant: 'success' },
  mora:     { label: 'En mora',   variant: 'destructive' },
  pendiente:{ label: 'Pendiente', variant: 'warning' },
}

export function ServiceOrderStatusBadge({ status }: { status: ServiceOrderStatus }) {
  const { label, variant } = SO_STATUS[status]
  return <Badge variant={variant as never}>{label}</Badge>
}

export function ServiceOrderTypeBadge({ type }: { type: ServiceOrderType }) {
  const { label, variant } = SO_TYPE[type]
  return <Badge variant={variant as never}>{label}</Badge>
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const { label, variant } = DELIVERY_STATUS[status]
  return <Badge variant={variant as never}>{label}</Badge>
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, variant } = PAYMENT_STATUS[status]
  return <Badge variant={variant as never}>{label}</Badge>
}
