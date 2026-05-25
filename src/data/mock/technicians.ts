export type TechStatus = 'en-ruta' | 'en-servicio' | 'disponible' | 'inactivo'

export interface TechnicianPosition {
  id: string
  name: string
  initials: string
  lat: number
  lng: number
  lastUpdate: Date
  status: TechStatus
  area: string
  phone: string
}

export interface DayTrack {
  date: Date
  label: string
  points: [number, number, number][]
}

export interface TechnicianHistory {
  technicianId: string
  tracks: DayTrack[]
}

// Deterministic cluster generator – same output on every render
function cluster(
  lat: number,
  lng: number,
  count: number,
  spread: number,
  seed: number,
): [number, number, number][] {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i * 137.508 + seed * 43) % 360) * (Math.PI / 180)
    const r = ((i * 0.618 + seed * 0.23) % 1) * spread
    const intensity = 0.35 + 0.65 * ((i % 7) / 7)
    return [lat + r * Math.cos(angle), lng + r * Math.sin(angle), intensity] as [number, number, number]
  })
}

// Caracas area centers
const AREAS = {
  altamira:       { lat: 10.4952, lng: -66.8513, label: 'Altamira' },
  chacao:         { lat: 10.4940, lng: -66.8545, label: 'Chacao' },
  lasMercedes:    { lat: 10.4777, lng: -66.8621, label: 'Las Mercedes' },
  laFlorida:      { lat: 10.4929, lng: -66.8783, label: 'La Florida' },
  sabanaGrande:   { lat: 10.4880, lng: -66.8745, label: 'Sabana Grande' },
  elRosal:        { lat: 10.4880, lng: -66.8567, label: 'El Rosal' },
  losPalosGrandes:{ lat: 10.5007, lng: -66.8520, label: 'Los Palos Grandes' },
  belloMonte:     { lat: 10.4788, lng: -66.8735, label: 'Bello Monte' },
  chuao:          { lat: 10.4848, lng: -66.8535, label: 'Chuao' },
  laCastellana:   { lat: 10.4998, lng: -66.8615, label: 'La Castellana' },
}

// Days for history labels
function dayTrackLabel(daysAgo: number): { date: Date; label: string } {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const day = days[date.getDay()]
  const num = date.getDate()
  return { date, label: daysAgo === 0 ? 'Hoy' : `${day} ${num}` }
}

// ─── Live positions ───────────────────────────────────────────────────────────

const LIVE_TECHNICIANS: TechnicianPosition[] = [
  {
    id: 'u-01',
    name: 'Carlos Gómez',
    initials: 'CG',
    lat: 10.4958,
    lng: -66.8501,
    lastUpdate: new Date(Date.now() - 12_000),
    status: 'en-ruta',
    area: 'Altamira',
    phone: '+58 412-345-6789',
  },
  {
    id: 'u-02',
    name: 'María Torres',
    initials: 'MT',
    lat: 10.4937,
    lng: -66.8553,
    lastUpdate: new Date(Date.now() - 180_000),
    status: 'en-servicio',
    area: 'Chacao',
    phone: '+58 424-876-5432',
  },
  {
    id: 'u-06',
    name: 'Luis Herrera',
    initials: 'LH',
    lat: 10.4782,
    lng: -66.8615,
    lastUpdate: new Date(Date.now() - 45_000),
    status: 'en-ruta',
    area: 'Las Mercedes',
    phone: '+58 416-234-9870',
  },
  {
    id: 'u-07',
    name: 'Sofía Mendoza',
    initials: 'SM',
    lat: 10.4933,
    lng: -66.8778,
    lastUpdate: new Date(Date.now() - 600_000),
    status: 'disponible',
    area: 'La Florida',
    phone: '+58 412-654-3210',
  },
]

// ─── Weekly history (heat map data) ──────────────────────────────────────────

function buildHistory(
  techId: string,
  weekPlan: { areas: (keyof typeof AREAS)[]; count: number }[],
): TechnicianHistory {
  const tracks: DayTrack[] = weekPlan.map((day, daysAgo) => {
    const { date, label } = dayTrackLabel(daysAgo)
    const points: [number, number, number][] = []
    day.areas.forEach((areaKey, i) => {
      const a = AREAS[areaKey]
      points.push(...cluster(a.lat, a.lng, day.count, 0.008, daysAgo * 7 + i * 13 + techId.charCodeAt(2)))
    })
    return { date, label, points }
  })
  return { technicianId: techId, tracks }
}

const TECHNICIAN_HISTORIES: TechnicianHistory[] = [
  buildHistory('u-01', [
    { areas: ['altamira', 'chacao'],              count: 40 },
    { areas: ['elRosal', 'chuao'],                count: 35 },
    { areas: ['lasMercedes', 'belloMonte'],        count: 30 },
    { areas: ['losPalosGrandes', 'laCastellana'],  count: 45 },
    { areas: ['altamira', 'chacao'],              count: 38 },
    { areas: ['elRosal', 'chuao'],                count: 20 },
    { areas: ['laFlorida', 'sabanaGrande'],        count: 25 },
  ]),
  buildHistory('u-02', [
    { areas: ['chacao', 'altamira'],              count: 35 },
    { areas: ['lasMercedes', 'belloMonte'],        count: 40 },
    { areas: ['laFlorida', 'sabanaGrande'],        count: 30 },
    { areas: ['chacao', 'elRosal'],               count: 42 },
    { areas: ['chuao', 'laCastellana'],           count: 28 },
    { areas: ['losPalosGrandes'],                 count: 18 },
    { areas: ['chacao', 'lasMercedes'],           count: 33 },
  ]),
  buildHistory('u-06', [
    { areas: ['lasMercedes', 'belloMonte'],        count: 45 },
    { areas: ['sabanaGrande', 'laFlorida'],        count: 38 },
    { areas: ['chacao', 'elRosal'],               count: 32 },
    { areas: ['altamira', 'losPalosGrandes'],      count: 40 },
    { areas: ['lasMercedes', 'chuao'],             count: 35 },
    { areas: ['belloMonte', 'sabanaGrande'],       count: 22 },
    { areas: ['lasMercedes', 'elRosal'],           count: 28 },
  ]),
  buildHistory('u-07', [
    { areas: ['laFlorida', 'sabanaGrande'],        count: 30 },
    { areas: ['belloMonte', 'lasMercedes'],        count: 35 },
    { areas: ['chacao', 'altamira'],              count: 40 },
    { areas: ['laFlorida', 'elRosal'],            count: 28 },
    { areas: ['sabanaGrande', 'chuao'],           count: 32 },
    { areas: ['laCastellana', 'losPalosGrandes'], count: 20 },
    { areas: ['laFlorida', 'belloMonte'],          count: 25 },
  ]),
]

// ─── Exported API ─────────────────────────────────────────────────────────────

let _technicians: TechnicianPosition[] = LIVE_TECHNICIANS.map(t => ({ ...t }))

export function getLiveTechnicians(): TechnicianPosition[] {
  return _technicians
}

export function updateTechnicianPosition(id: string, lat: number, lng: number): void {
  const t = _technicians.find(t => t.id === id)
  if (t) {
    t.lat = lat
    t.lng = lng
    t.lastUpdate = new Date()
  }
}

export function getTechnicianHistory(id: string): TechnicianHistory | undefined {
  return TECHNICIAN_HISTORIES.find(h => h.technicianId === id)
}
