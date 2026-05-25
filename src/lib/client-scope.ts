import type { ServiceOrder } from '@/types/service-order'
import type { Equipment } from '@/types/equipment'
import type { Contract } from '@/types/contract'
import type { FieldReport } from '@/types/field-report'

import { getServiceOrders, getServiceOrderById } from '@/data/mock/service-orders'
import { getEquipment } from '@/data/mock/equipment'
import { getContractsByClientId } from '@/data/mock/contracts'
import { getFieldReportsByOrderId } from '@/data/mock/field-reports'

export function getOrdersForClient(clientId: string): ServiceOrder[] {
  return getServiceOrders().filter(o => o.clientId === clientId)
}

export function getOrderForClient(orderId: string, clientId: string): ServiceOrder | null {
  const order = getServiceOrderById(orderId)
  return order && order.clientId === clientId ? order : null
}

export function getEquipmentsForClient(clientId: string): Equipment[] {
  return getEquipment().filter(e => e.clientId === clientId)
}

export function getContractsForClient(clientId: string): Contract[] {
  return getContractsByClientId(clientId)
}

export function getFieldReportsForOrder(orderId: string, clientId: string): FieldReport[] {
  const order = getOrderForClient(orderId, clientId)
  if (!order) return []
  return getFieldReportsByOrderId(orderId)
}
