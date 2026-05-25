import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ServiceOrdersTable } from '../components/ServiceOrdersTable'
import { ServiceOrderForm } from '../components/ServiceOrderForm'
import { FieldReportWizard } from '../components/FieldReportWizard'
import { ServiceOrderStatusBadge, ServiceOrderTypeBadge } from '@/components/shared/StatusBadge'
import { getServiceOrders, getServiceOrderById, updateServiceOrder } from '@/data/mock/service-orders'
import { getFieldReportsByOrderId } from '@/data/mock/field-reports'
import { PartRequestPanel } from '../components/PartRequestPanel'
import { PreServiceRequestPanel } from '../components/PreServiceRequestPanel'
import { getEquipmentById } from '@/data/mock/equipment'
import { getClientById } from '@/data/mock/clients'
import { getUserById } from '@/data/mock/users'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/format'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ServiceOrder, ServiceOrderStatus } from '@/types/service-order'

export default function Ordenes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState(() => getServiceOrders())
  const [showCreate, setShowCreate] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [showFieldReport, setShowFieldReport] = useState(false)

  const isCoordinadora = user?.role === 'coordinadora' || user?.role === 'supervisor'
  const isAsistente = user?.role === 'asistente'
  const myOrders = isCoordinadora || isAsistente ? orders : orders.filter(o => o.assignedTo === user?.id)

  function refresh() {
    setOrders([...getServiceOrders()])
  }

  function handleStatusChange(orderId: string, status: ServiceOrderStatus) {
    updateServiceOrder(orderId, { status })
    refresh()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : prev)
    }
  }

  const equipment = selectedOrder ? getEquipmentById(selectedOrder.equipmentId) : null
  const client = selectedOrder?.clientId ? getClientById(selectedOrder.clientId) : null
  const technician = selectedOrder?.assignedTo ? getUserById(selectedOrder.assignedTo) : null
  const fieldReports = selectedOrder ? getFieldReportsByOrderId(selectedOrder.id) : []
  const parentOrder = selectedOrder?.parentOrderId
    ? getServiceOrderById(selectedOrder.parentOrderId)
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Órdenes de Servicio"
        description={isCoordinadora ? 'Gestión y asignación de todas las órdenes' : 'Mis órdenes asignadas'}
        action={
          isCoordinadora ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          ) : undefined
        }
      />

      <ServiceOrdersTable
        orders={myOrders}
        onOrderClick={order => {
          if (isCoordinadora || isAsistente) {
            setSelectedOrder(order)
          } else {
            navigate(`/modulos/servicio-tecnico/ordenes/${order.id}`)
          }
        }}
        onOrdersChange={refresh}
        showAssignedTo={isCoordinadora || isAsistente}
        readonly={isAsistente}
      />

      {/* Create order dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Servicio</DialogTitle>
          </DialogHeader>
          <ServiceOrderForm
            onSuccess={() => { setShowCreate(false); refresh() }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Order detail drawer */}
      {selectedOrder && !showFieldReport && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedOrder(null)}>
          <div
            className="w-full max-w-md h-full bg-background border-l border-border shadow-xl overflow-y-auto p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Detalle de Orden</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <ServiceOrderTypeBadge type={selectedOrder.type} />
                <ServiceOrderStatusBadge status={selectedOrder.status} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Equipo</p>
                  <p className="font-medium">{equipment ? `${equipment.brand} ${equipment.model}` : selectedOrder.equipmentId}</p>
                </div>
                {client && (
                  <div>
                    <p className="text-muted-foreground text-xs">Cliente</p>
                    <p className="font-medium">{client.name}</p>
                  </div>
                )}
                {technician && (
                  <div>
                    <p className="text-muted-foreground text-xs">Técnico</p>
                    <p className="font-medium">{technician.name}</p>
                  </div>
                )}
                {selectedOrder.scheduledDate && (
                  <div>
                    <p className="text-muted-foreground text-xs">Programada</p>
                    <p className="font-medium">{formatDate(selectedOrder.scheduledDate)}</p>
                  </div>
                )}
                {selectedOrder.parentOrderId && parentOrder && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Origen</p>
                    <p className="font-medium">{parentOrder.id} — preventivo {formatDate(parentOrder.createdAt)}</p>
                  </div>
                )}
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-muted-foreground text-xs">Notas</p>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Status change — coordinadora only */}
            {isCoordinadora && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Cambiar estado</p>
                <Select
                  value={selectedOrder.status}
                  onValueChange={v => handleStatusChange(selectedOrder.id, v as ServiceOrderStatus)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="asignada">Asignada</SelectItem>
                    <SelectItem value="en-progreso">En progreso</SelectItem>
                    <SelectItem value="en-espera-repuestos">Espera repuestos</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Field reports list */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Visitas ({fieldReports.length})
              </p>
              {fieldReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin visitas registradas</p>
              ) : (
                fieldReports.map(fr => (
                  <div key={fr.id} className="rounded-md border p-3 text-sm space-y-1">
                    <p className="font-medium">Visita #{fr.visitNumber}</p>
                    <p className="text-muted-foreground">{formatDate(fr.startedAt)} — {fr.status}</p>
                    {fr.photos.length > 0 && <p className="text-xs">{fr.photos.length} foto(s)</p>}
                    {fr.notes && <p className="text-xs">{fr.notes}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Pre-service request — coordinadora review */}
            {isCoordinadora && (
              <PreServiceRequestPanel
                serviceOrderId={selectedOrder.id}
                tecnicoId={selectedOrder.assignedTo}
              />
            )}

            {/* Parts requests — solo correctivos */}
            {selectedOrder.type === 'correctivo' && (
              <PartRequestPanel
                serviceOrderId={selectedOrder.id}
                orderStatus={selectedOrder.status}
                isCoordinadora={isCoordinadora}
                onOrderStatusChange={(status) => handleStatusChange(selectedOrder.id, status)}
              />
            )}

            {/* Initiate visit — technician only, order not closed */}
            {!isCoordinadora && selectedOrder.status !== 'completada' && selectedOrder.status !== 'cancelada' && (
              <Button className="w-full" onClick={() => setShowFieldReport(true)}>
                Iniciar visita
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Field report wizard */}
      {selectedOrder && showFieldReport && (
        <Dialog open onOpenChange={() => setShowFieldReport(false)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reporte de Visita #{getFieldReportsByOrderId(selectedOrder.id).length + 1}</DialogTitle>
            </DialogHeader>
            <FieldReportWizard
              serviceOrderId={selectedOrder.id}
              onSuccess={() => { setShowFieldReport(false); setSelectedOrder(null); refresh() }}
              onCancel={() => setShowFieldReport(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
