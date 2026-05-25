import { Wrench, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatRelative, ORDER_TYPE_LABEL } from '@/lib/format'
import type { PreServiceRequest } from '@/types/pre-service-request'
import type { ServiceOrder } from '@/types/service-order'
import type { User } from '@/types/user'
import type { Equipment } from '@/types/equipment'
import type { Client } from '@/types/client'

interface PreServiceRequestModalProps {
  request: PreServiceRequest
  order: ServiceOrder
  technician: User
  equipment: Equipment
  client: Client
  open: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onViewOrder: () => void
}

export function PreServiceRequestModal({
  request,
  order,
  technician,
  equipment,
  client,
  open,
  onClose,
  onApprove,
  onReject,
  onViewOrder,
}: PreServiceRequestModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{technician.name}</DialogTitle>
          <DialogDescription>
            {equipment.brand} {equipment.model} · {client.name} · {ORDER_TYPE_LABEL[order.type]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5" />
              Herramientas especiales
            </p>
            <p className="text-sm">
              {request.herramientas || 'No solicitó herramientas especiales'}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Enviada {formatRelative(request.submittedAt)}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewOrder}
            className="text-muted-foreground justify-start"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Ver orden completa
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReject}
              className="text-destructive border-destructive hover:bg-destructive/10"
            >
              Rechazar
            </Button>
            <Button size="sm" onClick={onApprove}>
              Aprobar solicitud
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
