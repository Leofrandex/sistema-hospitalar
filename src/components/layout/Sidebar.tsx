import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Wrench, Package, CreditCard, BarChart2, ShoppingBag,
  ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/contexts/AuthContext'
import { canAccess } from '@/lib/access'
import { toast } from 'sonner'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { label: 'Módulos', path: '/modulos', icon: LayoutDashboard, module: null },
  { label: 'Servicio Técnico', path: '/modulos/servicio-tecnico', icon: Wrench, module: 'servicio-tecnico' as const },
  { label: 'Logística', path: '/modulos/logistica', icon: Package, module: 'logistica' as const },
  { label: 'Cobranzas', path: '/modulos/cobranzas', icon: CreditCard, module: 'cobranzas' as const },
  { label: 'Dashboard Supervisor', path: '/modulos/supervisor', icon: BarChart2, module: 'supervisor' as const },
  { label: 'Compras', path: '/modulos/compras', icon: ShoppingBag, module: 'compras' as const },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleNav(e: React.MouseEvent, module: typeof NAV_ITEMS[0]['module']) {
    if (module && user && !canAccess(user.role, module)) {
      e.preventDefault()
      toast.error('Acceso restringido', {
        description: 'No tienes permiso para acceder a este módulo.',
      })
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 shrink-0',
          collapsed ? 'w-[60px]' : 'w-[240px]',
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-16 border-b border-sidebar-border px-3 shrink-0', collapsed ? 'justify-center' : 'gap-3 px-4')}>
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white leading-none">Hospitalar</p>
              <p className="text-xs text-white/60 mt-0.5">Plataforma Interna</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(item => (
            collapsed ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    end={item.path === '/modulos'}
                    onClick={e => handleNav(e, item.module)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-white'
                          : 'text-white/70 hover:bg-sidebar-accent/60 hover:text-white',
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/modulos'}
                onClick={e => handleNav(e, item.module)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-white font-medium'
                      : 'text-white/70 hover:bg-sidebar-accent/60 hover:text-white',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>

        {/* Bottom: logout + collapse */}
        <div className="border-t border-sidebar-border p-2 space-y-1 shrink-0">
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg text-white/70 hover:bg-sidebar-accent/60 hover:text-white transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Cerrar sesión</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggle}
                    className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg text-white/70 hover:bg-sidebar-accent/60 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expandir</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 h-10 w-full rounded-lg text-sm text-white/70 hover:bg-sidebar-accent/60 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Cerrar sesión</span>
              </button>
              <button
                onClick={onToggle}
                className="flex items-center gap-3 px-3 h-10 w-full rounded-lg text-sm text-white/70 hover:bg-sidebar-accent/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Contraer panel</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
