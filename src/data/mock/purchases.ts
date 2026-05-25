import { subDays, subMonths, addDays } from 'date-fns'
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchase'

const NOW = new Date()

function mkOrder(
  id: string,
  supplierId: string,
  emissionDaysAgo: number,
  leadDays: number,
  status: PurchaseOrderStatus,
  items: Array<{ productId: string; quantity: number; unitPrice: number }>,
  notes?: string,
  actualArrived?: boolean,
): PurchaseOrder {
  const emissionDate = subDays(NOW, emissionDaysAgo)
  const estimatedArrivalDate = addDays(emissionDate, leadDays)
  const actualArrivalDate =
    actualArrived && status === 'recibida' ? addDays(estimatedArrivalDate, Math.floor(Math.random() * 5) - 2) : undefined

  const orderItems = items.map((it, i) => ({
    id: `${id}-item-${i + 1}`,
    productId: it.productId,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    currency: 'USD' as const,
  }))

  const totalCost = orderItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)

  const statusHistory: PurchaseOrder['statusHistory'] = [{ status: 'emitida', changedAt: emissionDate }]
  if (status === 'en-transito' || status === 'recibida' || status === 'cancelada') {
    statusHistory.push({ status: status === 'cancelada' ? 'cancelada' : 'en-transito', changedAt: addDays(emissionDate, 3) })
  }
  if (status === 'recibida') {
    statusHistory.push({ status: 'recibida', changedAt: actualArrivalDate ?? estimatedArrivalDate })
  }

  return {
    id,
    supplierId,
    emissionDate,
    estimatedArrivalDate,
    actualArrivalDate,
    status,
    totalCost,
    currency: 'USD',
    items: orderItems,
    statusHistory,
    notes,
    createdAt: emissionDate,
  }
}

const INITIAL_ORDERS: PurchaseOrder[] = [
  // Órdenes recibidas (históricas)
  mkOrder('po-01', 'sup-01', 420, 45, 'recibida',
    [{ productId: 'prod-01', quantity: 2, unitPrice: 47000 }, { productId: 'prod-11', quantity: 20, unitPrice: 45 }],
    undefined, true),

  mkOrder('po-02', 'sup-02', 380, 50, 'recibida',
    [{ productId: 'prod-07', quantity: 3, unitPrice: 18000 }, { productId: 'prod-16', quantity: 5, unitPrice: 140 }, { productId: 'prod-19', quantity: 10, unitPrice: 60 }],
    undefined, true),

  mkOrder('po-03', 'sup-03', 330, 40, 'recibida',
    [{ productId: 'prod-02', quantity: 1, unitPrice: 27500 }, { productId: 'prod-17', quantity: 2, unitPrice: 3100 }],
    'Incluye garantía extendida de 2 años', true),

  mkOrder('po-04', 'sup-08', 300, 20, 'recibida',
    [{ productId: 'prod-11', quantity: 50, unitPrice: 42 }, { productId: 'prod-12', quantity: 30, unitPrice: 35 }, { productId: 'prod-13', quantity: 15, unitPrice: 52 }],
    undefined, true),

  mkOrder('po-05', 'sup-01', 270, 45, 'recibida',
    [{ productId: 'prod-08', quantity: 2, unitPrice: 14800 }, { productId: 'prod-16', quantity: 4, unitPrice: 140 }],
    undefined, true),

  mkOrder('po-06', 'sup-06', 240, 30, 'recibida',
    [{ productId: 'prod-11', quantity: 40, unitPrice: 44 }, { productId: 'prod-20', quantity: 20, unitPrice: 40 }],
    undefined, true),

  mkOrder('po-07', 'sup-02', 200, 50, 'recibida',
    [{ productId: 'prod-07', quantity: 2, unitPrice: 18200 }, { productId: 'prod-09', quantity: 1, unitPrice: 11800 }, { productId: 'prod-14', quantity: 8, unitPrice: 175 }],
    undefined, true),

  mkOrder('po-08', 'sup-05', 170, 35, 'recibida',
    [{ productId: 'prod-10', quantity: 2, unitPrice: 14200 }, { productId: 'prod-15', quantity: 6, unitPrice: 215 }],
    undefined, true),

  mkOrder('po-09', 'sup-03', 140, 40, 'recibida',
    [{ productId: 'prod-02', quantity: 2, unitPrice: 27800 }, { productId: 'prod-11', quantity: 30, unitPrice: 44 }, { productId: 'prod-13', quantity: 20, unitPrice: 53 }],
    undefined, true),

  mkOrder('po-10', 'sup-08', 110, 20, 'recibida',
    [{ productId: 'prod-12', quantity: 25, unitPrice: 36 }, { productId: 'prod-18', quantity: 10, unitPrice: 92 }, { productId: 'prod-19', quantity: 15, unitPrice: 62 }],
    undefined, true),

  mkOrder('po-11', 'sup-01', 80, 45, 'recibida',
    [{ productId: 'prod-01', quantity: 1, unitPrice: 48000 }, { productId: 'prod-16', quantity: 6, unitPrice: 143 }],
    'Modelo actualizado 2024', true),

  mkOrder('po-12', 'sup-07', 60, 25, 'recibida',
    [{ productId: 'prod-14', quantity: 10, unitPrice: 178 }, { productId: 'prod-15', quantity: 4, unitPrice: 218 }],
    undefined, true),

  // Órdenes en tránsito
  mkOrder('po-13', 'sup-02', 30, 50, 'en-transito',
    [{ productId: 'prod-07', quantity: 4, unitPrice: 18500 }, { productId: 'prod-09', quantity: 2, unitPrice: 12000 }]),

  mkOrder('po-14', 'sup-03', 20, 40, 'en-transito',
    [{ productId: 'prod-02', quantity: 1, unitPrice: 28000 }, { productId: 'prod-17', quantity: 1, unitPrice: 3200 }, { productId: 'prod-11', quantity: 25, unitPrice: 45 }]),

  // Órdenes emitidas (recientes)
  mkOrder('po-15', 'sup-01', 7, 45, 'emitida',
    [{ productId: 'prod-03', quantity: 1, unitPrice: 61000 }, { productId: 'prod-08', quantity: 1, unitPrice: 15000 }],
    'Prioridad alta — cliente en espera'),

  mkOrder('po-16', 'sup-08', 3, 15, 'emitida',
    [{ productId: 'prod-11', quantity: 60, unitPrice: 45 }, { productId: 'prod-12', quantity: 40, unitPrice: 36 }, { productId: 'prod-13', quantity: 30, unitPrice: 54 }, { productId: 'prod-20', quantity: 25, unitPrice: 41 }]),

  // Cancelada
  mkOrder('po-17', 'sup-04', 150, 35, 'cancelada',
    [{ productId: 'prod-04', quantity: 2, unitPrice: 21500 }],
    'Cancelada — proveedor sin stock'),
]

let _orders: PurchaseOrder[] = INITIAL_ORDERS.map(o => ({
  ...o,
  items: o.items.map(it => ({ ...it })),
  statusHistory: o.statusHistory.map(sh => ({ ...sh })),
}))

export function getPurchaseOrders(): PurchaseOrder[] {
  return _orders
}

export function getPurchaseOrderById(id: string): PurchaseOrder | undefined {
  return _orders.find(o => o.id === id)
}

export function addPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'createdAt'>): PurchaseOrder {
  const existingNums = _orders
    .map(o => parseInt(o.id.replace('po-', ''), 10))
    .filter(n => !isNaN(n))
  const next = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1
  const newOrder: PurchaseOrder = {
    ...data,
    id: `po-${String(next).padStart(2, '0')}`,
    createdAt: new Date(),
  }
  _orders = [newOrder, ..._orders]
  return newOrder
}

export function updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): PurchaseOrder | undefined {
  const idx = _orders.findIndex(o => o.id === id)
  if (idx === -1) return undefined
  _orders[idx] = { ..._orders[idx], ...updates }
  return _orders[idx]
}

export interface ProductRotation {
  productId: string
  totalQuantity: number
  orderCount: number
  totalSpend: number
}

export function getProductRotation(sinceDate?: Date): ProductRotation[] {
  const filtered = sinceDate
    ? _orders.filter(o => o.emissionDate >= sinceDate && o.status !== 'cancelada')
    : _orders.filter(o => o.status !== 'cancelada')

  const map = new Map<string, ProductRotation>()
  for (const order of filtered) {
    const seenProducts = new Set<string>()
    for (const item of order.items) {
      const existing = map.get(item.productId) ?? { productId: item.productId, totalQuantity: 0, orderCount: 0, totalSpend: 0 }
      existing.totalQuantity += item.quantity
      existing.totalSpend += item.quantity * item.unitPrice
      if (!seenProducts.has(item.productId)) {
        existing.orderCount += 1
        seenProducts.add(item.productId)
      }
      map.set(item.productId, existing)
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalQuantity - a.totalQuantity)
}
