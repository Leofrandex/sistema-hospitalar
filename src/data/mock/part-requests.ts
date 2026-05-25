import { subDays } from 'date-fns'
import type { PartRequest } from '@/types/part-request'

const INITIAL: PartRequest[] = [
  {
    id: 'pr-01',
    serviceOrderId: 'so-41',
    description: 'Bomba de vacío modelo BV-220 (repuesto OEM)',
    status: 'en-tramite',
    requestedAt: subDays(new Date(), 3),
    notes: 'Pedido al proveedor Meditech el 2026-04-29',
  },
]

let _requests: PartRequest[] = INITIAL.map(r => ({ ...r }))

export function getPartRequests(): PartRequest[] {
  return _requests
}

export function getPartRequestsByOrderId(serviceOrderId: string): PartRequest[] {
  return _requests.filter(r => r.serviceOrderId === serviceOrderId)
}

export function addPartRequest(data: Omit<PartRequest, 'id'>): PartRequest {
  const next: PartRequest = {
    ...data,
    id: `pr-${String(_requests.length + 1).padStart(2, '0')}`,
  }
  _requests = [..._requests, next]
  return next
}

export function updatePartRequest(id: string, updates: Partial<PartRequest>): PartRequest | undefined {
  const idx = _requests.findIndex(r => r.id === id)
  if (idx === -1) return undefined
  _requests = _requests.map((r, i) => (i === idx ? { ...r, ...updates } : r))
  return _requests[idx]
}
