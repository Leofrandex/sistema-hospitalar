import type { ServiceOrder } from '@/types/service-order'
import type { User } from '@/types/user'
import type { Equipment } from '@/types/equipment'

export interface TechnicianSuggestion {
  technician: User
  orderCount: number
}

export function getSuggestedTechnician(
  brand: string,
  orders: ServiceOrder[],
  technicians: User[],
  allEquipment: Equipment[],
): TechnicianSuggestion | null {
  const brandEquipmentIds = new Set(
    allEquipment.filter(e => e.brand === brand).map(e => e.id),
  )

  const countByTechnicianId = new Map<string, number>()
  for (const order of orders) {
    if (
      order.status === 'completada' &&
      order.assignedTo &&
      brandEquipmentIds.has(order.equipmentId)
    ) {
      countByTechnicianId.set(
        order.assignedTo,
        (countByTechnicianId.get(order.assignedTo) ?? 0) + 1,
      )
    }
  }

  if (countByTechnicianId.size === 0) return null

  let best: TechnicianSuggestion | null = null
  for (const technician of technicians) {
    const count = countByTechnicianId.get(technician.id)
    if (count !== undefined && (best === null || count > best.orderCount)) {
      best = { technician, orderCount: count }
    }
  }

  return best
}
