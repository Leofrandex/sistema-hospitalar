import { useEffect, useState } from 'react'
import { MapPin, Radio, Navigation, Wrench, Clock, Wifi } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  getLiveTechnicians,
  getTechnicianHistory,
  updateTechnicianPosition,
  type TechnicianPosition,
  type TechStatus,
} from '@/data/mock/technicians'
import LiveMap from '../components/LiveMap'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TechStatus, { label: string; color: string; dot: string }> = {
  'en-ruta':     { label: 'En ruta',     color: 'text-green-600',  dot: 'bg-green-500'  },
  'en-servicio': { label: 'En servicio', color: 'text-blue-600',   dot: 'bg-blue-500'   },
  'disponible':  { label: 'Disponible',  color: 'text-amber-600',  dot: 'bg-amber-500'  },
  'inactivo':    { label: 'Inactivo',    color: 'text-gray-400',   dot: 'bg-gray-400'   },
}

function formatAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return `hace ${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `hace ${mins}m`
  return `hace ${Math.floor(mins / 60)}h`
}

// Slightly jitter position to simulate live GPS
function jitter(val: number, amount = 0.0001): number {
  return val + (Math.random() - 0.5) * amount
}

// ─── Technician list card ─────────────────────────────────────────────────────

function TechCard({
  tech,
  selected,
  onClick,
}: {
  tech: TechnicianPosition
  selected: boolean
  onClick: () => void
}) {
  const cfg = STATUS_CONFIG[tech.status]
  const isActive = tech.status === 'en-ruta' || tech.status === 'en-servicio'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 rounded-lg border transition-all',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white',
              tech.status === 'en-ruta'     && 'bg-green-500',
              tech.status === 'en-servicio' && 'bg-blue-500',
              tech.status === 'disponible'  && 'bg-amber-500',
              tech.status === 'inactivo'    && 'bg-gray-400',
            )}
          >
            {tech.initials}
          </div>
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500 animate-pulse" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{tech.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-xs text-muted-foreground truncate">{tech.area}</span>
          </div>
        </div>

        {/* Live badge or last update */}
        <div className="flex-shrink-0 text-right">
          {isActive ? (
            <div className="flex items-center gap-1 text-green-600">
              <Radio className="h-3 w-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Live</span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground">{formatAgo(tech.lastUpdate)}</span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Localizador() {
  const [technicians, setTechnicians] = useState<TechnicianPosition[]>(getLiveTechnicians)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'live' | 'historial'>('live')
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const selected = technicians.find(t => t.id === selectedId) ?? null
  const history = selectedId ? getTechnicianHistory(selectedId) : null
  const selectedTrack = history?.tracks[selectedDayIdx] ?? null

  // Simulate live GPS updates for active technicians
  useEffect(() => {
    const interval = setInterval(() => {
      setTechnicians(prev => {
        const next = prev.map(t => {
          if (t.status !== 'en-ruta') return t
          const newLat = jitter(t.lat, 0.0003)
          const newLng = jitter(t.lng, 0.0003)
          updateTechnicianPosition(t.id, newLat, newLng)
          return { ...t, lat: newLat, lng: newLng, lastUpdate: new Date() }
        })
        return next
      })
      setLastRefresh(new Date())
    }, 5_000)
    return () => clearInterval(interval)
  }, [])

  const activeCount = technicians.filter(
    t => t.status === 'en-ruta' || t.status === 'en-servicio',
  ).length

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 220px)' }}>
      {/* Header row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Técnicos en campo</h2>
          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {activeCount} activos
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wifi className="h-3.5 w-3.5" />
          Actualizado {formatAgo(lastRefresh)}
        </div>
      </div>

      {/* Body: list + map */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: technician list */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
          {technicians.map(t => (
            <TechCard
              key={t.id}
              tech={t}
              selected={selectedId === t.id}
              onClick={() => {
                setSelectedId(t.id)
                setViewMode('live')
                setSelectedDayIdx(0)
              }}
            />
          ))}
        </div>

        {/* Right: map panel */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {selected ? (
            <>
              {/* View toggle + info bar */}
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  {/* Live / Historial toggle */}
                  <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-sm">
                    <button
                      onClick={() => setViewMode('live')}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                        viewMode === 'live'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      En vivo
                    </button>
                    <button
                      onClick={() => setViewMode('historial')}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                        viewMode === 'historial'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Historial
                    </button>
                  </div>

                  {/* Selected technician pill */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Wrench className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">{selected.name}</span>
                    <span>·</span>
                    <span>{selected.phone}</span>
                  </div>
                </div>

                {viewMode === 'live' && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {selected.area}
                    <span>·</span>
                    {formatAgo(selected.lastUpdate)}
                  </div>
                )}
              </div>

              {/* Day selector (historial mode) */}
              {viewMode === 'historial' && history && (
                <div className="flex gap-1.5 flex-shrink-0">
                  {history.tracks.map((track, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDayIdx(i)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                        selectedDayIdx === i
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {track.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Map */}
              <LiveMap
                tech={selected}
                viewMode={viewMode}
                selectedTrack={selectedTrack}
                className="flex-1 min-h-0"
              />

              {/* Historial legend */}
              {viewMode === 'historial' && (
                <div className="flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Intensidad de presencia:</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span>Baja</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <span>Media</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>Alta</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span>Muy alta</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-border text-center gap-3">
              <MapPin className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selecciona un técnico</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Ver su ubicación en vivo o el historial de la semana
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
