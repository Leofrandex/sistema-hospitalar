import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, MapPin, Bell, Cpu, FileText, Upload } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/contexts/AuthContext'

export default function ServicioTecnicoLayout() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const role = user?.role
  const isCoordinadora = role === 'coordinadora' || role === 'supervisor'
  const isAsistente = role === 'asistente'

  const ALL_TABS = {
    dashboard:   { label: 'Dashboard',     path: '/modulos/servicio-tecnico/dashboard',   icon: LayoutDashboard },
    ordenes:     { label: 'Órdenes',       path: '/modulos/servicio-tecnico/ordenes',     icon: ClipboardList },
    preventivos: { label: 'Preventivos',   path: '/modulos/servicio-tecnico/preventivos', icon: Bell },
    localizador: { label: 'Localizador',   path: '/modulos/servicio-tecnico/localizador', icon: MapPin },
    equipos:     { label: 'Equipos',       path: '/modulos/servicio-tecnico/equipos',     icon: Cpu },
    contratos:   { label: 'Contratos',     path: '/modulos/servicio-tecnico/contratos',   icon: FileText },
    cargaData:   { label: 'Carga de Data', path: '/modulos/servicio-tecnico/carga-data',  icon: Upload },
  }

  const TABS = isAsistente
    ? [ALL_TABS.dashboard, ALL_TABS.ordenes, ALL_TABS.contratos, ALL_TABS.cargaData]
    : isCoordinadora
      ? [ALL_TABS.dashboard, ALL_TABS.ordenes, ALL_TABS.preventivos, ALL_TABS.localizador, ALL_TABS.equipos, ALL_TABS.contratos]
      : [ALL_TABS.dashboard, ALL_TABS.ordenes, ALL_TABS.preventivos]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors whitespace-nowrap',
              pathname === tab.path || pathname.startsWith(tab.path + '/')
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
