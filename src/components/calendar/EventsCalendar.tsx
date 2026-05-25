import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, addMonths, subMonths, format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'

export interface CalendarEvent {
  id: string
  date: Date
  title: string
  variant?: 'default' | 'warning' | 'danger' | 'success'
  onClick?: () => void
}

interface EventsCalendarProps {
  events: CalendarEvent[]
  className?: string
}

const VARIANT_DOT: Record<string, string> = {
  default: 'bg-primary',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  success: 'bg-success',
}

const VARIANT_EVENT: Record<string, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-destructive/10 text-destructive border-destructive/20',
  success: 'bg-success/10 text-success border-success/20',
}

export function EventsCalendar({ events, className }: EventsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const selectedEvents = selectedDay
    ? events.filter(e => isSameDay(e.date, selectedDay))
    : []

  function eventsForDay(day: Date) {
    return events.filter(e => isSameDay(e.date, day))
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-foreground capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setCurrentMonth(new Date())}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="py-1 text-xs font-medium text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {days.map(day => {
          const dayEvents = eventsForDay(day)
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
          const hasEvents = dayEvents.length > 0
          const isCurrentMonth = isSameMonth(day, currentMonth)

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(prev => (prev && isSameDay(prev, day) ? null : day))}
              className={cn(
                'relative bg-background flex flex-col items-center p-1.5 min-h-[52px] transition-colors hover:bg-muted',
                !isCurrentMonth && 'opacity-30',
                isSelected && 'bg-accent',
              )}
            >
              <span
                className={cn(
                  'text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium',
                  isToday(day) && 'bg-primary text-primary-foreground',
                  isSelected && !isToday(day) && 'bg-accent-foreground/10',
                )}
              >
                {format(day, 'd')}
              </span>
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {dayEvents.slice(0, 3).map(e => (
                    <span
                      key={e.id}
                      className={cn('w-1.5 h-1.5 rounded-full', VARIANT_DOT[e.variant ?? 'default'])}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="space-y-2">
          <p className="text-sm font-medium capitalize">
            {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin eventos este día.</p>
          ) : (
            <div className="space-y-1.5">
              {selectedEvents.map(e => (
                <button
                  key={e.id}
                  onClick={e.onClick}
                  className={cn(
                    'w-full text-left rounded-md border px-3 py-2 text-sm transition-colors hover:opacity-90',
                    VARIANT_EVENT[e.variant ?? 'default'],
                  )}
                >
                  {e.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
