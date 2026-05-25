import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText } from 'lucide-react'
import { cn } from '@/lib/cn'

const TABS = [
  { label: 'Dashboard', path: '/modulos/compras/dashboard', icon: LayoutDashboard },
  { label: 'Órdenes', path: '/modulos/compras/ordenes', icon: FileText },
]

export default function ComprasLayout() {
  const { pathname } = useLocation()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors whitespace-nowrap',
              pathname.startsWith(tab.path)
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
