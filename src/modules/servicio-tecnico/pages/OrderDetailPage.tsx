import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardCheck,
  FileText,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ServiceOrderTypeBadge, ServiceOrderStatusBadge } from '@/components/shared/StatusBadge'
import { FieldReportWizard } from '../components/FieldReportWizard'
import { EquipmentDetailSheet } from '../components/EquipmentDetailSheet'
import { ServiceReportPrintable } from '../components/ServiceReportPrintable'
import { getServiceOrderById } from '@/data/mock/service-orders'
import { getEquipmentById } from '@/data/mock/equipment'
import { getClientById } from '@/data/mock/clients'
import { getContractByEquipmentId } from '@/data/mock/contracts'
import { getFieldReportsByOrderId } from '@/data/mock/field-reports'
import { getUserById } from '@/data/mock/users'
import {
  getPreServiceRequestByOrderId,
  addPreServiceRequest,
} from '@/data/mock/pre-service-requests'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import { formatDate } from '@/lib/format'
import type { FieldReport } from '@/types/field-report'
import type { PreServiceRequest } from '@/types/pre-service-request'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useNotifications()

  const order = id ? getServiceOrderById(id) : undefined
  const equipment = order ? getEquipmentById(order.equipmentId) : undefined
  const client = order?.clientId ? getClientById(order.clientId) : undefined

  const [preRequest, setPreRequest] = useState<PreServiceRequest | undefined>(
    () => (id ? getPreServiceRequestByOrderId(id) : undefined),
  )
  const [herramientas, setHerramientas] = useState('')
  const [showWizard, setShowWizard] = useState(false)
  const [showHistorySheet, setShowHistorySheet] = useState(false)
  const [reportToPrint, setReportToPrint] = useState<FieldReport | null>(null)
  const [fieldReports, setFieldReports] = useState(() =>
    id ? getFieldReportsByOrderId(id) : [],
  )

  function refreshReports() {
    if (id) setFieldReports([...getFieldReportsByOrderId(id)])
  }

  function handleSubmitRequest() {
    if (!id || !user) return
    const submitted = addPreServiceRequest({
      orderId: id,
      tecnicoId: user.id,
      herramientas: herramientas.trim(),
      status: 'pendiente',
      submittedAt: new Date(),
    })
    setPreRequest({ ...submitted })

    notify({
      type: 'info',
      module: 'servicio-tecnico',
      title: 'Solicitud previa enviada',
      message: `Se notificó a la coordinadora sobre tu solicitud para la orden ${id}.`,
      actionUrl: `/modulos/servicio-tecnico/ordenes/${id}`,
    })
  }

  function handleSkipRequest() {
    if (!id || !user) return
    const skipped = addPreServiceRequest({
      orderId: id,
      tecnicoId: user.id,
      herramientas: '',
      status: 'aprobada',
      submittedAt: new Date(),
      reviewedAt: new Date(),
    })
    setPreRequest({ ...skipped })
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <p className="text-muted-foreground">Orden no encontrada.</p>
      </div>
    )
  }

  const isClosed = order.status === 'completada' || order.status === 'cancelada'
  const noRequestNeeded =
    preRequest && preRequest.herramientas === ''

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/modulos/servicio-tecnico/ordenes')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Órdenes
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <h1 className="text-xl font-semibold">
            {equipment ? `${equipment.brand} ${equipment.model}` : order.equipmentId}
          </h1>
          <ServiceOrderTypeBadge type={order.type} />
          <ServiceOrderStatusBadge status={order.status} />
        </div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          {client && <span>Cliente: {client.name}</span>}
          {order.scheduledDate && <span>Programada: {formatDate(order.scheduledDate)}</span>}
          {equipment?.serialNumber && <span>S/N: {equipment.serialNumber}</span>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 -ml-2"
          onClick={() => setShowHistorySheet(true)}
        >
          <History className="h-4 w-4 mr-1" />
          Ver historial del equipo
        </Button>
        {order.notes && (
          <p className="text-sm text-muted-foreground border-l-2 pl-3">{order.notes}</p>
        )}
      </div>

      {/* Solicitud previa */}
      <section className="rounded-lg border p-4 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Solicitud previa
        </h2>

        {!preRequest && !isClosed && (
          <>
            <p className="text-sm text-muted-foreground">
              Indica si necesitas herramientas especiales para este servicio. Si no necesitas nada, puedes omitirlo.
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Herramientas necesarias</Label>
                <Textarea
                  value={herramientas}
                  onChange={e => setHerramientas(e.target.value)}
                  placeholder="Ej: destornillador torx T10, multímetro Fluke 117..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitRequest}
                disabled={!herramientas.trim()}
              >
                Enviar solicitud
              </Button>
              <Button variant="ghost" onClick={handleSkipRequest}>
                No necesito nada
              </Button>
            </div>
          </>
        )}

        {preRequest && (noRequestNeeded && preRequest.status === 'aprobada' ? (
          <p className="text-sm text-muted-foreground">
            No se solicitaron herramientas para este servicio.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <RequestStatusBadge request={preRequest} />
            </div>

            <div className="rounded-md bg-muted/40 p-3 space-y-2 text-sm">
              {preRequest.herramientas ? (
                <div className="flex gap-2">
                  <Wrench className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <p>{preRequest.herramientas}</p>
                </div>
              ) : (
                <p className="text-muted-foreground flex gap-2 items-center">
                  <Wrench className="h-3.5 w-3.5 shrink-0" />
                  Sin herramientas especiales
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enviada {formatDate(preRequest.submittedAt)}
              </p>
              {preRequest.coordinadoraNotes && (
                <p className="text-xs border-t pt-2">
                  Nota de coordinadora: {preRequest.coordinadoraNotes}
                </p>
              )}
            </div>
          </div>
        ))}

        {isClosed && !preRequest && (
          <p className="text-sm text-muted-foreground">Orden cerrada — sin solicitud registrada.</p>
        )}
      </section>

      {/* Reporte de visita */}
      <section className="rounded-lg border p-4 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Reporte de visita
        </h2>

        {fieldReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin visitas registradas aún.</p>
        ) : (
          <div className="space-y-2">
            {fieldReports.map(fr => (
              <div key={fr.id} className="rounded-md border p-3 text-sm space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Visita #{fr.visitNumber}</p>
                  {fr.status === 'completado' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setReportToPrint(fr)}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Descargar informe
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground">{formatDate(fr.startedAt)} — {fr.status}</p>
                {fr.photos.length > 0 && (
                  <p className="text-xs text-muted-foreground">{fr.photos.length} foto(s)</p>
                )}
                {fr.notes && <p className="text-xs">{fr.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {!isClosed && (
          <Button
            className="w-full"
            onClick={() => setShowWizard(true)}
          >
            {fieldReports.length === 0 ? 'Iniciar visita' : 'Registrar nueva visita'}
          </Button>
        )}
      </section>

      {/* Field report wizard dialog */}
      {showWizard && (
        <Dialog open onOpenChange={() => setShowWizard(false)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reporte de Visita #{fieldReports.length + 1}</DialogTitle>
            </DialogHeader>
            <FieldReportWizard
              serviceOrderId={order.id}
              onSuccess={() => {
                setShowWizard(false)
                refreshReports()
              }}
              onCancel={() => setShowWizard(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {showHistorySheet && (
        <EquipmentDetailSheet
          equipmentId={order.equipmentId}
          excludeOrderId={order.id}
          onClose={() => setShowHistorySheet(false)}
        />
      )}

      {reportToPrint && (
        <ServiceReportPrintable
          order={order}
          equipment={equipment}
          client={client}
          contract={equipment ? getContractByEquipmentId(equipment.id) : undefined}
          fieldReport={reportToPrint}
          technician={getUserById(reportToPrint.technicianId)}
          onClose={() => setReportToPrint(null)}
        />
      )}
    </div>
  )
}

function RequestStatusBadge({ request }: { request: PreServiceRequest }) {
  if (request.status === 'aprobada') {
    return (
      <Badge variant="outline" className="text-green-600 border-green-500 gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Solicitud aprobada
      </Badge>
    )
  }
  if (request.status === 'rechazada') {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <XCircle className="h-3.5 w-3.5" />
        Solicitud rechazada
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1.5">
      <Clock className="h-3.5 w-3.5" />
      Esperando aprobación
    </Badge>
  )
}
