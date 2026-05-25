import { useLocation } from 'react-router-dom'
import { NotificationsBell } from './NotificationsBell'
import { ProfileMenu } from './ProfileMenu'

const BREADCRUMBS: Record<string, string> = {
  '/modulos': 'Módulos',
  '/modulos/servicio-tecnico': 'Servicio Técnico',
  '/modulos/servicio-tecnico/dashboard':   'Servicio Técnico — Dashboard',
  '/modulos/servicio-tecnico/ordenes':     'Servicio Técnico — Órdenes',
  '/modulos/servicio-tecnico/localizador': 'Servicio Técnico — Localizador',
  '/modulos/logistica': 'Logística',
  '/modulos/logistica/dashboard': 'Logística — Dashboard',
  '/modulos/logistica/ventas':    'Logística — Ventas',
  '/modulos/cobranzas': 'Cobranzas',
  '/modulos/cobranzas/dashboard':  'Cobranzas — Dashboard',
  '/modulos/cobranzas/pagos':      'Cobranzas — Pagos',
  '/modulos/cobranzas/calendario': 'Cobranzas — Calendario',
  '/modulos/supervisor': 'Dashboard Supervisor',
  '/modulos/supervisor/resumen':       'Dashboard — Resumen',
  '/modulos/supervisor/bottlenecks':   'Dashboard — Cuellos de Botella',
  '/modulos/supervisor/departamentos': 'Dashboard — Departamentos',
}

export function Topbar() {
  const { pathname } = useLocation()

  const parts = pathname.split('/')
  const base = parts.slice(0, 4).join('/')
  const title = BREADCRUMBS[pathname] ?? BREADCRUMBS[base] ?? 'Hospitalar'

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">Hospitalar — Sistema Interno</p>
      </div>
      <div className="flex items-center gap-2">
        <NotificationsBell />
        <ProfileMenu />
      </div>
    </header>
  )
}
