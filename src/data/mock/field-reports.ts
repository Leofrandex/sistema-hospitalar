import { subDays, subHours } from 'date-fns'
import type { FieldReport } from '@/types/field-report'

const NOW = new Date()

const INITIAL_REPORTS: FieldReport[] = [
  {
    id: 'fr-01', serviceOrderId: 'so-36', visitNumber: 1, technicianId: 'u-02',
    startedAt: subDays(NOW, 5), completedAt: subDays(NOW, 5),
    photos: [], accessories: ['Maletín de herramientas', 'Multímetro'],
    technicianSignature: '', clientSignatureMode: 'digital', clientSignatureData: '',
    geoCheckIn:  { lat: 10.4806, lng: -66.9036, timestamp: subDays(NOW, 5).toISOString() },
    geoCheckOut: { lat: 10.4806, lng: -66.9036, timestamp: subHours(subDays(NOW, 5), -2).toISOString() },
    notes: 'Preventivo realizado sin novedades.', status: 'completado',
  },
  {
    id: 'fr-02', serviceOrderId: 'so-37', visitNumber: 1, technicianId: 'u-01',
    startedAt: subDays(NOW, 14), completedAt: subDays(NOW, 14),
    photos: [], accessories: ['Calibrador'],
    technicianSignature: '', clientSignatureMode: 'digital', clientSignatureData: '',
    notes: 'Completado sin novedad.', status: 'completado',
  },
  {
    id: 'fr-03', serviceOrderId: 'so-39', visitNumber: 1, technicianId: 'u-02',
    startedAt: subDays(NOW, 10), completedAt: subDays(NOW, 10),
    photos: [], accessories: ['Maletín de herramientas', 'Manual técnico'],
    technicianSignature: '', clientSignatureMode: 'digital', clientSignatureData: '',
    notes: 'Instalación exitosa.', status: 'completado',
  },
  {
    id: 'fr-04', serviceOrderId: 'so-43', visitNumber: 1, technicianId: 'u-01',
    startedAt: subDays(NOW, 8), completedAt: subDays(NOW, 8),
    photos: [], accessories: ['Sensor de repuesto', 'Multímetro'],
    technicianSignature: '', clientSignatureMode: 'digital', clientSignatureData: '',
    notes: 'Reemplazo de sensor de presión exitoso.', status: 'completado',
  },
]

let _reports: FieldReport[] = INITIAL_REPORTS.map(r => ({ ...r }))

export function getFieldReports(): FieldReport[] {
  return _reports
}

export function getFieldReportsByOrderId(serviceOrderId: string): FieldReport[] {
  return _reports.filter(r => r.serviceOrderId === serviceOrderId)
}

export function addFieldReport(data: Omit<FieldReport, 'id'>): FieldReport {
  const report: FieldReport = { ...data, id: `fr-${Date.now()}` }
  _reports.push(report)
  return report
}

export function updateFieldReport(id: string, updates: Partial<FieldReport>): FieldReport | undefined {
  const idx = _reports.findIndex(r => r.id === id)
  if (idx === -1) return undefined
  _reports[idx] = { ..._reports[idx], ...updates }
  return _reports[idx]
}
