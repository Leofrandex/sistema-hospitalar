import { useState } from 'react'
import { ClipboardCheck, Wrench, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  getPreServiceRequestByOrderId,
  updatePreServiceRequest,
} from '@/data/mock/pre-service-requests'
import { getUserById } from '@/data/mock/users'
import { useNotifications } from '@/contexts/NotificationsContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/format'
import type { PreServiceRequest } from '@/types/pre-service-request'

interface PreServiceRequestPanelProps {
  serviceOrderId: string
  tecnicoId: string | undefined
}

export function PreServiceRequestPanel({ serviceOrderId, tecnicoId }: PreServiceRequestPanelProps) {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const [request, setRequest] = useState<PreServiceRequest | undefined>(
    () => getPreServiceRequestByOrderId(serviceOrderId),
  )
  const [notes, setNotes] = useState('')

  function refresh() {
    setRequest(getPreServiceRequestByOrderId(serviceOrderId))
  }

  function handleDecision(decision: 'aprobada' | 'rechazada') {
    if (!request) return
    updatePreServiceRequest(request.id, {
      status: decision,
      reviewedAt: new Date(),
      reviewedBy: user?.id,
      coordinadoraNotes: notes.trim() || undefined,
    })
    refresh()
    setNotes('')

    if (tecnicoId) {
      const tecnico = getUserById(tecnicoId)
      notify({
        type: decision === 'aprobada' ? 'success' : 'warning',
        module: 'servicio-tecnico',
        title: decision === 'aprobada' ? 'Solicitud aprobada' : 'Solicitud rechazada',
        message: `Tu solicitud previa para la orden ${serviceOrderId} fue ${decision} por ${user?.name ?? 'la coordinadora'}.`,
        actionUrl: `/modulos/servicio-tecnico/ordenes/${serviceOrderId}`,
      })
      // dry-run email notification to technician
      if (tecnico) {
        console.log('[email:dry-run]', {
          to: tecnico.email ?? tecnicoId,
          subject: `Solicitud ${decision} — Orden ${serviceOrderId}`,
          html: `<p>Tu solicitud previa para la orden <strong>${serviceOrderId}</strong> fue <strong>${decision}</strong>.</p>${notes ? `<p>Notas: ${notes}</p>` : ''}`,
        })
      }
    }
  }

  if (!request) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <ClipboardCheck className="h-3.5 w-3.5" />
          Solicitud previa
        </p>
        <p className="text-sm text-muted-foreground">El técnico no ha enviado una solicitud previa.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <ClipboardCheck className="h-3.5 w-3.5" />
          Solicitud previa
        </p>
        <StatusBadge status={request.status} />
      </div>

      <div className="rounded-md border p-3 space-y-2 text-sm">
        {request.herramientas ? (
          <div className="flex gap-2">
            <Wrench className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="leading-snug">{request.herramientas}</p>
          </div>
        ) : (
          <p className="text-muted-foreground flex gap-2 items-center">
            <Wrench className="h-3.5 w-3.5 shrink-0" />
            Sin herramientas especiales
          </p>
        )}

        <p className="text-xs text-muted-foreground">Enviada {formatDate(request.submittedAt)}</p>

        {request.coordinadoraNotes && (
          <p className="text-xs text-muted-foreground border-t pt-2">
            Nota: {request.coordinadoraNotes}
          </p>
        )}
        {request.reviewedAt && (
          <p className="text-xs text-muted-foreground">
            Revisada {formatDate(request.reviewedAt)}
          </p>
        )}
      </div>

      {request.status === 'pendiente' && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Nota para el técnico (opcional)</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Instrucciones, observaciones..."
              rows={2}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleDecision('aprobada')} className="flex-1">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDecision('rechazada')}
              className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Rechazar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: PreServiceRequest['status'] }) {
  if (status === 'aprobada') {
    return (
      <Badge variant="outline" className="text-green-600 border-green-500 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Aprobada
      </Badge>
    )
  }
  if (status === 'rechazada') {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Rechazada
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Clock className="h-3 w-3" />
      Pendiente
    </Badge>
  )
}
