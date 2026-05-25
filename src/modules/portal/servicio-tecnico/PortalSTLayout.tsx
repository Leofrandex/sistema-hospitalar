import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/cn'

const TABS = [
  { label: 'Inicio',           path: 'dashboard' },
  { label: 'Mis órdenes',      path: 'ordenes' },
  { label: 'Mis equipos',      path: 'equipos' },
  { label: 'Mis contratos',    path: 'contratos' },
  { label: 'Nueva solicitud',  path: 'nueva-solicitud' },
]

export default function PortalSTLayout() {
  return (
    <div className="space-y-6">
      <nav className="border-b border-border flex gap-1 overflow-x-auto scrollbar-thin">
        {TABS.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
