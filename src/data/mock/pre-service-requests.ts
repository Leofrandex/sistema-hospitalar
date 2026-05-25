import { subDays } from 'date-fns'
import type { PreServiceRequest } from '@/types/pre-service-request'

const INITIAL: PreServiceRequest[] = [
  {
    id: 'psr-01',
    orderId: 'so-42',
    tecnicoId: 'u-02',
    herramientas: 'Osciloscopio digital, multímetro de alta precisión, kit de calibración de sensores',
    status: 'pendiente',
    submittedAt: subDays(new Date(), 1),
  },
  {
    id: 'psr-02',
    orderId: 'so-45',
    tecnicoId: 'u-01',
    herramientas: '',
    status: 'pendiente',
    submittedAt: subDays(new Date(), 3),
  },
]

let _requests: PreServiceRequest[] = INITIAL.map(r => ({ ...r }))

export function getPreServiceRequests(): PreServiceRequest[] {
  return _requests
}

export function getPreServiceRequestByOrderId(orderId: string): PreServiceRequest | undefined {
  return _requests.find(r => r.orderId === orderId)
}

export function addPreServiceRequest(data: Omit<PreServiceRequest, 'id'>): PreServiceRequest {
  const next: PreServiceRequest = {
    ...data,
    id: `psr-${String(_requests.length + 1).padStart(2, '0')}`,
  }
  _requests = [..._requests, next]
  return next
}

export function updatePreServiceRequest(
  id: string,
  updates: Partial<PreServiceRequest>,
): PreServiceRequest | undefined {
  const idx = _requests.findIndex(r => r.id === id)
  if (idx === -1) return undefined
  _requests = _requests.map((r, i) => (i === idx ? { ...r, ...updates } : r))
  return _requests[idx]
}
