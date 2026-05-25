import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { nanoid } from '@/lib/nanoid'
import type { AppNotification, NotificationType } from '@/types/notification'
import type { ModuleName } from '@/types/user'
import { getPayments } from '@/data/mock/payments'
import { getServiceOrders } from '@/data/mock/service-orders'
import { getEquipment } from '@/data/mock/equipment'
import { getContractByEquipmentId } from '@/data/mock/contracts'
import { daysUntil } from '@/lib/format'
import { getMaintenanceInfo } from '@/lib/maintenance'
import { useAuth } from '@/contexts/AuthContext'

interface NotifyParams {
  type: NotificationType
  module: ModuleName
  title: string
  message: string
  actionUrl?: string
  email?: { to: string | string[]; subject: string; html: string }
}

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  notify: (params: NotifyParams) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const { user } = useAuth()

  const notify = useCallback((params: NotifyParams) => {
    const notification: AppNotification = {
      id: nanoid(),
      type: params.type,
      module: params.module,
      title: params.title,
      message: params.message,
      createdAt: new Date(),
      read: false,
      actionUrl: params.actionUrl,
    }

    setNotifications(prev => [notification, ...prev])

    if (params.type === 'error' || params.type === 'warning') {
      toast.warning(params.title, { description: params.message })
    } else if (params.type === 'success') {
      toast.success(params.title, { description: params.message })
    } else {
      toast.info(params.title, { description: params.message })
    }

    if (params.email) {
      console.log('[email:dry-run]', params.email)
    }
  }, [])

  useEffect(() => {
    setNotifications([])
    const isCliente = user?.role === 'cliente'
    const ordersUrl = (orderId?: string) => isCliente
      ? `/portal/servicio-tecnico/ordenes${orderId ? `/${orderId}` : ''}`
      : `/modulos/servicio-tecnico/ordenes${orderId ? `/${orderId}` : ''}`
    const equiposUrl = isCliente
      ? '/portal/servicio-tecnico/equipos'
      : '/modulos/servicio-tecnico/preventivos'
    const cobranzasUrl = isCliente
      ? '/portal/cobranzas'
      : '/modulos/cobranzas/pagos'

    const scopedPayments = user?.role === 'cliente' && user.clientId
      ? getPayments().filter(p => p.clientId === user.clientId)
      : getPayments()
    scopedPayments.forEach(p => {
      if (p.status === 'mora') {
        notify({
          type: 'error',
          module: 'cobranzas',
          title: 'Pago en mora',
          message: `Cliente tiene cuota ${p.installmentNumber}/${p.totalInstallments} en mora`,
          actionUrl: cobranzasUrl,
        })
      } else if (p.status === 'pendiente' && daysUntil(p.dueDate) <= 3 && daysUntil(p.dueDate) >= 0) {
        notify({
          type: 'warning',
          module: 'cobranzas',
          title: 'Pago próximo a vencer',
          message: `Cuota ${p.installmentNumber}/${p.totalInstallments} vence en ${daysUntil(p.dueDate)} día(s)`,
          actionUrl: cobranzasUrl,
        })
      }
    })

    const scopedOrders = user?.role === 'cliente' && user.clientId
      ? getServiceOrders().filter(o => o.clientId === user.clientId)
      : getServiceOrders()
    const scopedEquipments = user?.role === 'cliente' && user.clientId
      ? getEquipment().filter(e => e.clientId === user.clientId)
      : getEquipment()

    const orders = scopedOrders
    orders.forEach(o => {
      if (o.type === 'preventivo' && o.dueDate && o.status !== 'completada' && o.status !== 'cancelada') {
        const days = daysUntil(o.dueDate)
        if (days <= 14 && days >= 0) {
          notify({
            type: 'warning',
            module: 'servicio-tecnico',
            title: 'Mantenimiento preventivo próximo',
            message: `Equipo requiere mantenimiento en ${days} día(s)`,
            actionUrl: ordersUrl(),
          })
        }
      }
    })

    // Alarm source: contrato activo derivado por equipo. Fires only when no open order exists; 30-day threshold.
    // Complements the orders loop above (open orders, 14-day threshold).
    const equipment = scopedEquipments
    equipment
      .filter(eq => eq.clientId && eq.dispatchDate)
      .forEach(eq => {
        const contract = getContractByEquipmentId(eq.id)
        const info = getMaintenanceInfo(eq, orders, contract)
        if (info.hasOpenOrder) return
        if (info.status === 'vencido') {
          notify({
            type: 'error',
            module: 'servicio-tecnico',
            title: 'Mantenimiento vencido',
            message: `${eq.brand} ${eq.model} (${eq.serialNumber}) lleva ${Math.abs(info.daysRemaining ?? 0)} día(s) sin mantenimiento`,
            actionUrl: equiposUrl,
          })
        } else if (info.status === 'proximo') {
          notify({
            type: 'warning',
            module: 'servicio-tecnico',
            title: 'Mantenimiento preventivo próximo',
            message: `${eq.brand} ${eq.model} (${eq.serialNumber}) vence en ${info.daysRemaining} día(s)`,
            actionUrl: equiposUrl,
          })
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, user?.clientId])

  function markRead(id: string) {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, notify, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider')
  return ctx
}
