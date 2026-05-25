import { addDays, subDays, addMonths } from 'date-fns'
import type { ServiceOrder } from '@/types/service-order'

const NOW = new Date()

const INITIAL_ORDERS: ServiceOrder[] = [
  // --- revision-fabrica (migrated from reviews.ts) ---
  { id: 'so-01', type: 'revision-fabrica', status: 'pendiente',   equipmentId: 'eq-01', country: 've', createdBy: 'u-06', createdAt: subDays(NOW, 5) },
  { id: 'so-02', type: 'revision-fabrica', status: 'pendiente',   equipmentId: 'eq-03', country: 've', createdBy: 'u-06', createdAt: subDays(NOW, 3) },
  { id: 'so-03', type: 'revision-fabrica', status: 'pendiente',   equipmentId: 'eq-08', country: 've', createdBy: 'u-06', createdAt: subDays(NOW, 8) },
  { id: 'so-04', type: 'revision-fabrica', status: 'pendiente',   equipmentId: 'eq-13', country: 've', createdBy: 'u-06', createdAt: subDays(NOW, 2) },
  { id: 'so-05', type: 'revision-fabrica', status: 'pendiente',   equipmentId: 'eq-14', country: 've', createdBy: 'u-06', createdAt: subDays(NOW, 2) },
  { id: 'so-06', type: 'revision-fabrica', status: 'pendiente',   equipmentId: 'eq-25', country: 've', createdBy: 'u-06', createdAt: subDays(NOW, 10) },
  { id: 'so-07', type: 'revision-fabrica', status: 'en-progreso', equipmentId: 'eq-02', country: 've', createdBy: 'u-06', assignedTo: 'u-01', createdAt: subDays(NOW, 12) },
  { id: 'so-08', type: 'revision-fabrica', status: 'en-progreso', equipmentId: 'eq-09', country: 've', createdBy: 'u-06', assignedTo: 'u-02', createdAt: subDays(NOW, 15) },
  { id: 'so-09', type: 'revision-fabrica', status: 'en-progreso', equipmentId: 'eq-15', country: 've', createdBy: 'u-06', assignedTo: 'u-01', createdAt: subDays(NOW, 20) },
  { id: 'so-10', type: 'revision-fabrica', status: 'en-progreso', equipmentId: 'eq-20', country: 've', createdBy: 'u-06', assignedTo: 'u-02', createdAt: subDays(NOW, 7) },
  { id: 'so-11', type: 'revision-fabrica', status: 'en-progreso', equipmentId: 'eq-21', country: 've', createdBy: 'u-06', assignedTo: 'u-01', createdAt: subDays(NOW, 18) },
  { id: 'so-12', type: 'revision-fabrica', status: 'completada',  equipmentId: 'eq-26', country: 've', createdBy: 'u-06', assignedTo: 'u-02', outcome: 'exitoso',  notes: 'Sin observaciones. Equipo listo para despacho.', completedAt: subDays(NOW, 22), createdAt: subDays(NOW, 25) },
  { id: 'so-13', type: 'revision-fabrica', status: 'completada',  equipmentId: 'eq-04', country: 've', createdBy: 'u-06', assignedTo: 'u-01', outcome: 'exitoso',  notes: 'Calibración completada exitosamente.', completedAt: subDays(NOW, 26), createdAt: subDays(NOW, 30) },
  { id: 'so-14', type: 'revision-fabrica', status: 'completada',  equipmentId: 'eq-05', country: 've', createdBy: 'u-06', assignedTo: 'u-02', outcome: 'emitido',  notes: 'Equipo emitido con observación menor en pantalla.', completedAt: subDays(NOW, 31), createdAt: subDays(NOW, 35) },
  { id: 'so-15', type: 'revision-fabrica', status: 'completada',  equipmentId: 'eq-06', country: 've', createdBy: 'u-06', assignedTo: 'u-01', outcome: 'anomalia', anomalyDescription: 'Sonda convexa con desgaste prematuro.', notes: 'Se notificó a supervisores.', completedAt: subDays(NOW, 36), createdAt: subDays(NOW, 40) },
  { id: 'so-16', type: 'revision-fabrica', status: 'completada',  equipmentId: 'eq-07', country: 've', createdBy: 'u-06', assignedTo: 'u-02', outcome: 'exitoso',  completedAt: subDays(NOW, 42), createdAt: subDays(NOW, 45) },
  { id: 'so-17', type: 'revision-fabrica', status: 'completada',  equipmentId: 'eq-10', country: 've', createdBy: 'u-06', assignedTo: 'u-01', outcome: 'exitoso',  notes: 'Test de imagen completo.', completedAt: subDays(NOW, 47), createdAt: subDays(NOW, 50) },
  { id: 'so-18', type: 'revision-fabrica', status: 'completada',  equipmentId: 'eq-16', country: 've', createdBy: 'u-06', assignedTo: 'u-02', outcome: 'exitoso',  completedAt: subDays(NOW, 51), createdAt: subDays(NOW, 55) },
  { id: 'so-19', type: 'revision-fabrica', status: 'completada',  equipmentId: 'eq-22', country: 've', createdBy: 'u-06', assignedTo: 'u-01', outcome: 'emitido',  notes: 'Pequeño arañazo cosmético.', completedAt: subDays(NOW, 56), createdAt: subDays(NOW, 60) },
  { id: 'so-20', type: 'revision-fabrica', status: 'completada',  equipmentId: 'eq-23', country: 've', createdBy: 'u-06', assignedTo: 'u-02', outcome: 'exitoso',  completedAt: subDays(NOW, 61), createdAt: subDays(NOW, 65) },

  // --- preventivo (migrated from maintenance.ts) ---
  { id: 'so-21', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-04', clientId: 'c-01', country: 've', createdBy: 'u-06', assignedTo: 'u-01', dueDate: addMonths(subDays(NOW, 180), 6), createdAt: subDays(NOW, 180) },
  { id: 'so-22', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-05', clientId: 'c-03', country: 've', createdBy: 'u-06', assignedTo: 'u-02', dueDate: addMonths(subDays(NOW, 200), 6), createdAt: subDays(NOW, 200) },
  { id: 'so-23', type: 'preventivo', status: 'asignada',    equipmentId: 'eq-22', clientId: 'c-02', country: 've', createdBy: 'u-06', assignedTo: 'u-01', dueDate: addMonths(subDays(NOW, 185), 6), notes: 'Cliente confirmó disponibilidad', createdAt: subDays(NOW, 185) },
  { id: 'so-24', type: 'preventivo', status: 'asignada',    equipmentId: 'eq-10', clientId: 'c-05', country: 've', createdBy: 'u-06', assignedTo: 'u-02', dueDate: addMonths(subDays(NOW, 360), 12), notes: 'Programado para el 2026-04-28', createdAt: subDays(NOW, 360) },
  { id: 'so-25', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-28', clientId: 'c-05', country: 've', createdBy: 'u-06', assignedTo: 'u-01', dueDate: addMonths(subDays(NOW, 175), 6), createdAt: subDays(NOW, 175) },
  { id: 'so-26', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-06', clientId: 'c-07', country: 've', createdBy: 'u-06', assignedTo: 'u-02', dueDate: addDays(NOW, 7),  createdAt: subDays(NOW, 95) },
  { id: 'so-27', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-23', clientId: 'c-06', country: 've', createdBy: 'u-06', assignedTo: 'u-01', dueDate: addDays(NOW, 10), createdAt: subDays(NOW, 100) },
  { id: 'so-28', type: 'preventivo', status: 'asignada',    equipmentId: 'eq-16', clientId: 'c-04', country: 've', createdBy: 'u-06', assignedTo: 'u-02', dueDate: addDays(NOW, 0),  notes: 'Visita hoy.', createdAt: subDays(NOW, 365) },
  { id: 'so-29', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-17', clientId: 'c-08', country: 've', createdBy: 'u-06', assignedTo: 'u-01', dueDate: addDays(NOW, 5),  createdAt: subDays(NOW, 280) },
  { id: 'so-30', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-29', clientId: 'c-11', country: 've', createdBy: 'u-06', assignedTo: 'u-02', dueDate: addDays(NOW, 12), createdAt: subDays(NOW, 210) },
  { id: 'so-31', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-07', clientId: 'c-10', country: 've', createdBy: 'u-06', assignedTo: 'u-01', dueDate: addDays(NOW, 25), createdAt: subDays(NOW, 340) },
  { id: 'so-32', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-11', clientId: 'c-11', country: 've', createdBy: 'u-06', assignedTo: 'u-02', dueDate: addDays(NOW, 45), createdAt: subDays(NOW, 120) },
  { id: 'so-33', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-18', clientId: 'c-09', country: 've', createdBy: 'u-06', assignedTo: 'u-01', dueDate: addDays(NOW, 60), createdAt: subDays(NOW, 155) },
  { id: 'so-34', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-12', clientId: 'c-13', country: 've', createdBy: 'u-06', assignedTo: 'u-02', dueDate: addDays(NOW, 87), createdAt: subDays(NOW, 78) },
  { id: 'so-35', type: 'preventivo', status: 'pendiente',   equipmentId: 'eq-24', clientId: 'c-14', country: 've', createdBy: 'u-06', assignedTo: 'u-01', dueDate: addDays(NOW, 130), createdAt: subDays(NOW, 50) },
  { id: 'so-36', type: 'preventivo', status: 'completada',  equipmentId: 'eq-27', clientId: 'c-15', country: 've', createdBy: 'u-06', assignedTo: 'u-02', dueDate: subDays(NOW, 7), notes: 'Preventivo realizado sin novedades.', completedAt: subDays(NOW, 5), createdAt: subDays(NOW, 310) },
  { id: 'so-37', type: 'preventivo', status: 'completada',  equipmentId: 'eq-19', clientId: 'c-12', country: 've', createdBy: 'u-06', assignedTo: 'u-01', dueDate: subDays(NOW, 15), completedAt: subDays(NOW, 14), createdAt: subDays(NOW, 60) },

  // --- instalacion (new examples) ---
  { id: 'so-38', type: 'instalacion', status: 'asignada',   equipmentId: 'eq-30', clientId: 'c-16', country: 'pa', createdBy: 'u-06', assignedTo: 'u-01', scheduledDate: addDays(NOW, 3), createdAt: subDays(NOW, 1) },
  { id: 'so-39', type: 'instalacion', status: 'completada', equipmentId: 'eq-31', clientId: 'c-01', country: 've', createdBy: 'u-06', assignedTo: 'u-02', completedAt: subDays(NOW, 10), createdAt: subDays(NOW, 15) },
  { id: 'so-40', type: 'instalacion', status: 'pendiente',  equipmentId: 'eq-32', clientId: 'c-17', country: 'pa', createdBy: 'u-06', createdAt: subDays(NOW, 2) },

  // --- correctivo (new examples) ---
  { id: 'so-41', type: 'correctivo', status: 'en-espera-repuestos', equipmentId: 'eq-04', clientId: 'c-01', country: 've', createdBy: 'u-06', assignedTo: 'u-01', parentOrderId: 'so-36', notes: 'Bomba de vacío defectuosa. Esperando repuesto.', createdAt: subDays(NOW, 3) },
  { id: 'so-42', type: 'correctivo', status: 'en-progreso',         equipmentId: 'eq-09', clientId: 'c-03', country: 've', createdBy: 'u-06', assignedTo: 'u-02', notes: 'Diagnóstico remoto iniciado.', createdAt: subDays(NOW, 1) },
  { id: 'so-43', type: 'correctivo', status: 'completada',          equipmentId: 'eq-16', clientId: 'c-04', country: 've', createdBy: 'u-06', assignedTo: 'u-01', completedAt: subDays(NOW, 8), notes: 'Reemplazo de sensor de presión.', createdAt: subDays(NOW, 12) },

  // --- predictivo ---
  { id: 'so-44', type: 'predictivo', status: 'pendiente',  equipmentId: 'eq-11', clientId: 'c-02', country: 've', createdBy: 'u-06', scheduledDate: addDays(NOW, 14), createdAt: subDays(NOW, 2) },
  { id: 'so-45', type: 'predictivo', status: 'asignada',   equipmentId: 'eq-18', clientId: 'c-05', country: 've', createdBy: 'u-06', assignedTo: 'u-01', scheduledDate: addDays(NOW, 7), createdAt: subDays(NOW, 5) },
  { id: 'so-46', type: 'predictivo', status: 'completada', equipmentId: 'eq-24', clientId: 'c-07', country: 've', createdBy: 'u-06', assignedTo: 'u-02', completedAt: subDays(NOW, 3), createdAt: subDays(NOW, 20) },
]

let _orders: ServiceOrder[] = INITIAL_ORDERS.map(o => ({ ...o }))

export function getServiceOrders(): ServiceOrder[] {
  return _orders
}

export function getServiceOrderById(id: string): ServiceOrder | undefined {
  return _orders.find(o => o.id === id)
}

export function updateServiceOrder(id: string, updates: Partial<ServiceOrder>): ServiceOrder | undefined {
  const idx = _orders.findIndex(o => o.id === id)
  if (idx === -1) return undefined
  _orders[idx] = { ..._orders[idx], ...updates }
  return _orders[idx]
}

export function addServiceOrder(data: Omit<ServiceOrder, 'id' | 'createdAt'>): ServiceOrder {
  const order: ServiceOrder = {
    ...data,
    id: `so-${Date.now()}`,
    createdAt: new Date(),
  }
  _orders.push(order)
  return order
}
