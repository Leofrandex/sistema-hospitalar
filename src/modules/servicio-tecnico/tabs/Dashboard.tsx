import { useMemo, useState } from 'react'
import {
  ClipboardList, Clock, CheckCircle, AlertTriangle, Plus, Bell, Activity,
  Wrench, ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { KpiCard } from '@/components/shared/KpiCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PreServiceRequestModal } from '@/modules/servicio-tecnico/components/PreServiceRequestModal'
import { getServiceOrders, getServiceOrderById } from '@/data/mock/service-orders'
import { getEquipmentDispatched, getEquipmentById } from '@/data/mock/equipment'
import { getClientById } from '@/data/mock/clients'
import { getContractByEquipmentId } from '@/data/mock/contracts'
import { getUserById } from '@/data/mock/users'
import { getPreServiceRequests, updatePreServiceRequest } from '@/data/mock/pre-service-requests'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import { daysUntil, formatRelative, ORDER_TYPE_LABEL } from '@/lib/format'
import { getMaintenanceInfo } from '@/lib/maintenance'
import type { PreServiceRequest } from '@/types/pre-service-request'
import type { ServiceOrder } from '@/types/service-order'
import type { User } from '@/types/user'
import type { Equipment } from '@/types/equipment'
import type { Client } from '@/types/client'

interface PendingItem {
  request: PreServiceRequest
  order: ServiceOrder
  technician: User
  equipment: Equipment
  client: Client
}

export default function STDashboard() {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const navigate = useNavigate()
  const isCoordinadora = user?.role === 'coordinadora' || user?.role === 'supervisor'
  const isAsistente = user?.role === 'asistente'

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const orders = useMemo(() => {
    const all = getServiceOrders()
    return isCoordinadora ? all : all.filter(o => o.assignedTo === user?.id)
  }, [isCoordinadora, user?.id, refreshKey])

  const active = orders.filter(o =>
    ['pendiente', 'asignada', 'en-progreso', 'en-espera-repuestos'].includes(o.status),
  )
  const inProgress = orders.filter(o => o.status === 'en-progreso')
  const overdue = orders.filter(
    o => o.dueDate && daysUntil(o.dueDate) < 0 && o.status !== 'completada' && o.status !== 'cancelada',
  )
  const completedThisMonth = orders.filter(o => {
    if (o.status !== 'completada' || !o.completedAt) return false
    const d = new Date(o.completedAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const unassigned = orders.filter(o => !o.assignedTo && o.status === 'pendiente')

  const predictivosActivos = useMemo(() => {
    if (!isCoordinadora) return 0
    return getServiceOrders()
      .filter(o => o.type === 'predictivo' && ['pendiente', 'asignada', 'en-progreso'].includes(o.status))
      .length
  }, [isCoordinadora, refreshKey])

  const preventivosPendientes = useMemo(() => {
    if (!isCoordinadora) return 0
    const allOrders = getServiceOrders()
    return getEquipmentDispatched()
      .map(eq => getMaintenanceInfo(eq, allOrders, getContractByEquipmentId(eq.id)))
      .filter(i => (i.status === 'vencido' || i.status === 'proximo') && !i.hasOpenOrder)
      .length
  }, [isCoordinadora, refreshKey])

  const pendingItems = useMemo((): PendingItem[] => {
    if (!isCoordinadora) return []
    return getPreServiceRequests()
      .filter(r => r.status === 'pendiente')
      .flatMap(r => {
        const order = getServiceOrderById(r.orderId)
        if (!order) return []
        const equipment = getEquipmentById(order.equipmentId)
        const client = order.clientId ? getClientById(order.clientId) : undefined
        const technician = getUserById(r.tecnicoId)
        if (!equipment || !client || !technician) return []
        return [{ request: r, order, equipment, client, technician }]
      })
  }, [isCoordinadora, refreshKey])

  const selectedItem = pendingItems.find(i => i.request.id === selectedRequestId) ?? null

  function handleDecision(requestId: string, orderId: string, decision: 'aprobada' | 'rechazada') {
    updatePreServiceRequest(requestId, {
      status: decision,
      reviewedAt: new Date(),
      reviewedBy: user?.id,
    })
    notify({
      type: decision === 'aprobada' ? 'success' : 'warning',
      module: 'servicio-tecnico',
      title: decision === 'aprobada' ? 'Solicitud aprobada' : 'Solicitud rechazada',
      message: `Tu solicitud previa para la orden ${orderId} fue ${decision} por ${user?.name ?? 'la coordinadora'}.`,
      actionUrl: `/modulos/servicio-tecnico/ordenes/${orderId}`,
    })
    setModalOpen(false)
    setSelectedRequestId(null)
    setRefreshKey(k => k + 1)
  }

  function openModal(requestId: string) {
    setSelectedRequestId(requestId)
    setModalOpen(true)
  }

  if (isAsistente) {
    return <AsistenteDashboard />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Dashboard — Servicio Técnico"
        description={isCoordinadora ? 'Vista general de todas las órdenes' : 'Mis órdenes asignadas'}
        action={
          isCoordinadora ? (
            <Button onClick={() => navigate('/modulos/servicio-tecnico/ordenes')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          ) : undefined
        }
      />

      {/* KPIs principales — 4 columnas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Activas"
          value={active.length}
          subtitle="En curso o pendientes"
          icon={ClipboardList}
          variant="default"
        />
        <KpiCard
          title="En progreso"
          value={inProgress.length}
          subtitle="Visita en curso"
          icon={Clock}
          variant="default"
        />
        <KpiCard
          title="Vencidas"
          value={overdue.length}
          subtitle="Duedate pasado"
          icon={AlertTriangle}
          variant={overdue.length > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          title="Completadas (mes)"
          value={completedThisMonth.length}
          subtitle="Este mes"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* KPIs coordinadora — compactos */}
      {isCoordinadora && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-lg border p-3 border-destructive/40">
            <div className="rounded-md p-2 bg-destructive/10 text-destructive shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Preventivos pendientes</p>
              <p className="text-xl font-semibold text-destructive leading-tight">{preventivosPendientes}</p>
              <p className="text-xs text-muted-foreground truncate">Vencidos o próximos sin orden activa</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="rounded-md p-2 bg-primary/10 text-primary shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Predictivos activos</p>
              <p className="text-xl font-semibold text-foreground leading-tight">{predictivosActivos}</p>
              <p className="text-xs text-muted-foreground truncate">Pendientes, asignados o en progreso</p>
            </div>
          </div>
        </div>
      )}

      {/* Panel de aprobaciones pendientes */}
      {isCoordinadora && pendingItems.length > 0 && (
        <div className="rounded-xl border border-violet-500/60 overflow-hidden">
          {/* Header */}
          <div className="bg-violet-600 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-white/80" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Aprobaciones pendientes</h3>
                  <Badge className="bg-white/25 text-white hover:bg-white/25 text-xs font-bold px-2">
                    {pendingItems.length}
                  </Badge>
                </div>
                <p className="text-xs text-white/70 mt-0.5">
                  Solicitudes de herramientas esperando tu respuesta
                </p>
              </div>
            </div>
          </div>

          {/* Lista de solicitudes */}
          <div className="divide-y divide-border">
            {pendingItems.map(({ request, order, equipment, client, technician }) => (
              <div key={request.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                {/* Avatar iniciales */}
                <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center text-xs font-bold shrink-0">
                  {technician.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{technician.name}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">
                      {equipment.brand} {equipment.model}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground truncate">{client.name}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {ORDER_TYPE_LABEL[order.type] ?? order.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {request.herramientas && (
                      <span className="flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        Herramientas
                      </span>
                    )}
                    <span>{formatRelative(request.submittedAt)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => openModal(request.id)}
                  >
                    Ver solicitud
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-8 bg-green-600 hover:bg-green-700"
                    onClick={() => handleDecision(request.id, request.orderId, 'aprobada')}
                  >
                    Aprobar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner órdenes sin asignar */}
      {isCoordinadora && unassigned.length > 0 && (
        <div className="rounded-md border border-warning/40 bg-warning/5 p-4 text-sm">
          <p className="font-medium text-warning">
            {unassigned.length} orden(es) sin asignar
          </p>
          <p className="text-muted-foreground mt-1">Ve a Órdenes para asignar técnico.</p>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedItem && (
        <PreServiceRequestModal
          request={selectedItem.request}
          order={selectedItem.order}
          technician={selectedItem.technician}
          equipment={selectedItem.equipment}
          client={selectedItem.client}
          open={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedRequestId(null) }}
          onApprove={() => handleDecision(
            selectedItem.request.id,
            selectedItem.request.orderId,
            'aprobada',
          )}
          onReject={() => handleDecision(
            selectedItem.request.id,
            selectedItem.request.orderId,
            'rechazada',
          )}
          onViewOrder={() => {
            setModalOpen(false)
            setSelectedRequestId(null)
            navigate(`/modulos/servicio-tecnico/ordenes/${selectedItem.order.id}`)
          }}
        />
      )}
    </div>
  )
}

function AsistenteDashboard() {
  const requests = getPreServiceRequests().filter(r => r.status === 'pendiente')
  const ordenesPendientes = getServiceOrders().filter(
    o => o.status === 'pendiente' || o.status === 'asignada',
  )

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Dashboard — Asistente"
        description="Solicitudes de herramientas y órdenes a procesar"
      />

      <section>
        <h2 className="text-lg font-semibold mb-3">Solicitudes de herramientas pendientes</h2>
        {requests.length === 0 ? (
          <EmptyState title="No hay solicitudes pendientes" />
        ) : (
          <ul className="space-y-2">
            {requests.map(r => {
              const tecnico = getUserById(r.tecnicoId)
              return (
                <li key={r.id} className="rounded border border-border p-3">
                  <div className="text-sm font-medium">Orden {r.orderId}</div>
                  <div className="text-xs text-muted-foreground">Técnico: {tecnico?.name ?? '—'}</div>
                  <div className="mt-1 text-sm">{r.herramientas || 'Sin herramientas especiales'}</div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Órdenes pendientes</h2>
        {ordenesPendientes.length === 0 ? (
          <EmptyState title="No hay órdenes pendientes" />
        ) : (
          <ul className="space-y-2">
            {ordenesPendientes.map(o => (
              <li key={o.id} className="rounded border border-border p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Orden {o.id} — {ORDER_TYPE_LABEL[o.type]}</div>
                  <div className="text-xs text-muted-foreground">{o.scheduledDate ? formatRelative(o.scheduledDate) : 'Sin fecha'}</div>
                </div>
                <Badge>{o.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
