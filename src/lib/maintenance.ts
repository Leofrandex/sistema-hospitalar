import type { Equipment } from '@/types/equipment'
import type { ServiceOrder } from '@/types/service-order'
import type { Contract } from '@/types/contract'
import { getPreventivoOccurrenceDate } from '@/types/contract'
import { daysUntil } from '@/lib/format'

export type MaintenanceStatus = 'sin-contrato' | 'vencido' | 'proximo' | 'ok'

export interface MaintenanceInfo {
  equipment: Equipment
  contract: Contract | undefined
  nextDue: Date | null
  status: MaintenanceStatus
  daysRemaining: number | null
  hasOpenOrder: boolean
  completedPreventivos: number
  preventivosIncluded: number | null
}

export function countCompletedPreventivos(
  equipmentId: string,
  orders: ServiceOrder[],
): number {
  return orders.filter(
    o =>
      o.equipmentId === equipmentId &&
      o.type === 'preventivo' &&
      o.status === 'completada',
  ).length
}

export function getNextMaintenanceDue(
  equipment: Equipment,
  orders: ServiceOrder[],
  contract: Contract | undefined,
): Date | null {
  if (!contract || contract.status !== 'activo') return null
  const completed = countCompletedPreventivos(equipment.id, orders)
  if (completed >= contract.preventivosIncluded) return null
  return getPreventivoOccurrenceDate(contract, completed + 1)
}

export function getMaintenanceStatus(
  nextDue: Date | null,
  contract: Contract | undefined,
): MaintenanceStatus {
  if (!contract || contract.status !== 'activo') return 'sin-contrato'
  if (!nextDue) return 'ok'
  const days = daysUntil(nextDue)
  if (days < 0) return 'vencido'
  if (days <= 30) return 'proximo'
  return 'ok'
}

export function hasOpenPreventivoOrder(
  equipmentId: string,
  orders: ServiceOrder[],
): boolean {
  return orders.some(
    o =>
      o.equipmentId === equipmentId &&
      o.type === 'preventivo' &&
      o.status !== 'completada' &&
      o.status !== 'cancelada',
  )
}

export function getMaintenanceInfo(
  equipment: Equipment,
  orders: ServiceOrder[],
  contract: Contract | undefined,
): MaintenanceInfo {
  const nextDue = getNextMaintenanceDue(equipment, orders, contract)
  const status = getMaintenanceStatus(nextDue, contract)
  const daysRemaining = nextDue ? daysUntil(nextDue) : null
  const hasOpenOrder = hasOpenPreventivoOrder(equipment.id, orders)
  return {
    equipment,
    contract,
    nextDue,
    status,
    daysRemaining,
    hasOpenOrder,
    completedPreventivos: countCompletedPreventivos(equipment.id, orders),
    preventivosIncluded: contract?.preventivosIncluded ?? null,
  }
}
