import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ServiceOrderStatusBadge, ServiceOrderTypeBadge } from '@/components/shared/StatusBadge'
import { getEquipmentById } from '@/data/mock/equipment'
import { getUserById } from '@/data/mock/users'
import { formatDate } from '@/lib/format'
import type { ServiceOrder } from '@/types/service-order'

interface ServiceOrderCardProps {
  order: ServiceOrder
  onClick: () => void
}

export function ServiceOrderCard({ order, onClick }: ServiceOrderCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id })
  const equipment = getEquipmentById(order.equipmentId)
  const technician = order.assignedTo ? getUserById(order.assignedTo) : undefined

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'opacity-50' : ''}
    >
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{equipment?.model ?? order.equipmentId}</p>
              <p className="text-xs text-muted-foreground truncate">{equipment?.brand}</p>
            </div>
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground mt-0.5">
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <ServiceOrderTypeBadge type={order.type} />
            <ServiceOrderStatusBadge status={order.status} />
          </div>
          {technician && (
            <p className="text-xs text-muted-foreground">Técnico: {technician.name}</p>
          )}
          {order.dueDate && (
            <p className="text-xs text-muted-foreground">Vence: {formatDate(order.dueDate)}</p>
          )}
          {order.scheduledDate && (
            <p className="text-xs text-muted-foreground">Programada: {formatDate(order.scheduledDate)}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
