import { Bell } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationsContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/cn'
import { formatRelative } from '@/lib/format'
import { useNavigate } from 'react-router-dom'

const TYPE_COLORS = {
  info: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-destructive/10 text-destructive',
  success: 'bg-success/10 text-success',
}

export function NotificationsBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const navigate = useNavigate()

  function handleClick(id: string, url?: string) {
    markRead(id)
    if (url) navigate(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline pr-2"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Sin notificaciones
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-1 p-1">
              {notifications.slice(0, 30).map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n.id, n.actionUrl)}
                  className={cn(
                    'w-full text-left rounded-md p-3 text-sm hover:bg-muted transition-colors',
                    !n.read && 'bg-accent/50',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn('mt-0.5 rounded-full w-2 h-2 shrink-0', !n.read ? 'bg-primary' : 'bg-transparent')} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium truncate', !n.read && 'text-foreground')}>{n.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-muted-foreground text-xs mt-1">{formatRelative(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
