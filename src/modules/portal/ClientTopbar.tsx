import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationsBell } from '@/components/layout/NotificationsBell'
import { ProfileMenu } from '@/components/layout/ProfileMenu'

const BREADCRUMBS: Record<string, string> = {
  '/portal':                                          'Portal del Cliente',
  '/portal/servicio-tecnico':                         'Servicio Técnico',
  '/portal/servicio-tecnico/dashboard':               'Servicio Técnico — Inicio',
  '/portal/servicio-tecnico/ordenes':                 'Servicio Técnico — Mis órdenes',
  '/portal/servicio-tecnico/equipos':                 'Servicio Técnico — Mis equipos',
  '/portal/servicio-tecnico/contratos':               'Servicio Técnico — Mis contratos',
  '/portal/servicio-tecnico/nueva-solicitud':         'Servicio Técnico — Nueva solicitud',
  '/portal/cobranzas':                                'Cobranzas',
  '/portal/despacho':                                 'Despacho',
}

export function ClientTopbar() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const parts = pathname.split('/')
  const base = parts.slice(0, 4).join('/')
  const title = BREADCRUMBS[pathname] ?? BREADCRUMBS[base] ?? 'Portal del Cliente'

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{user?.name ?? 'Cliente'}</p>
      </div>
      <div className="flex items-center gap-2">
        <NotificationsBell />
        <ProfileMenu />
      </div>
    </header>
  )
}
