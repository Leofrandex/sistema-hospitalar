import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import type { TechnicianPosition, DayTrack } from '@/data/mock/technicians'
import { cn } from '@/lib/cn'

// Inject pulsing animation once
const PULSE_CSS = `@keyframes tech-pulse{0%{transform:scale(1);opacity:.35}70%{transform:scale(2.4);opacity:0}100%{transform:scale(2.4);opacity:0}}`
let cssInjected = false
function injectCss() {
  if (cssInjected) return
  const s = document.createElement('style')
  s.textContent = PULSE_CSS
  document.head.appendChild(s)
  cssInjected = true
}

const STATUS_COLOR: Record<string, string> = {
  'en-ruta':     '#22c55e',
  'en-servicio': '#3b82f6',
  'disponible':  '#f59e0b',
  'inactivo':    '#6b7280',
}

function makeTechIcon(tech: TechnicianPosition): L.DivIcon {
  const color = STATUS_COLOR[tech.status] ?? '#6b7280'
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;width:40px;height:40px;border-radius:50%;background:${color};opacity:.25;animation:tech-pulse 2s ease-out infinite;"></span>
        <div style="
          position:relative;z-index:1;
          width:30px;height:30px;border-radius:50%;
          background:${color};border:2.5px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,.3);
          display:flex;align-items:center;justify-content:center;
          font-size:9px;font-weight:700;color:white;letter-spacing:-.5px;
        ">${tech.initials}</div>
      </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  })
}

interface LiveMapProps {
  tech: TechnicianPosition
  viewMode: 'live' | 'historial'
  selectedTrack: DayTrack | null
  className?: string
}

export default function LiveMap({ tech, viewMode, selectedTrack, className }: LiveMapProps) {
  injectCss()

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileRef = useRef<L.TileLayer | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const heatRef = useRef<L.Layer | null>(null)

  // ── Initialize map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    injectCss()

    const map = L.map(containerRef.current, {
      center: [tech.lat, tech.lng],
      zoom: 15,
      zoomControl: true,
    })

    tileRef.current = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      },
    ).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
      heatRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fly to technician when selection changes ───────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const zoom = viewMode === 'historial' ? 13 : 15
    map.flyTo([tech.lat, tech.lng], zoom, { duration: 0.8 })
  }, [tech.id, viewMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live marker ────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (viewMode !== 'live') {
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
      return
    }

    // Remove heat layer if present
    if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null }

    if (!markerRef.current) {
      markerRef.current = L.marker([tech.lat, tech.lng], { icon: makeTechIcon(tech) })
        .addTo(map)
        .bindPopup(`<div style="font-family:system-ui;min-width:130px;"><b style="font-size:13px;">${tech.name}</b><br/><span style="font-size:11px;color:#6b7280;">${tech.area}</span></div>`)
    } else {
      markerRef.current.setLatLng([tech.lat, tech.lng])
      markerRef.current.setIcon(makeTechIcon(tech))
    }
  }, [tech.lat, tech.lng, tech.id, tech.status, viewMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Heat map layer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (viewMode !== 'historial' || !selectedTrack?.points.length) {
      if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null }
      return
    }

    // Remove marker
    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }

    // Remove previous heat layer
    if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null }

    const heat = (L as any).heatLayer(selectedTrack.points, {
      radius: 28,
      blur: 18,
      maxZoom: 16,
      max: 1,
      gradient: { 0.3: '#3b82f6', 0.55: '#22c55e', 0.75: '#f59e0b', 1.0: '#ef4444' },
    }).addTo(map)
    heatRef.current = heat
  }, [viewMode, selectedTrack])

  return (
    <div
      ref={containerRef}
      className={cn('rounded-lg overflow-hidden border border-border', className)}
    />
  )
}
