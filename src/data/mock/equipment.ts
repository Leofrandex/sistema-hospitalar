import { addDays, subDays } from 'date-fns'
import type { Equipment } from '@/types/equipment'
import { getSiteById } from '@/data/mock/sites'
import { nanoid } from '@/lib/nanoid'

const NOW = new Date()

export const EQUIPMENT: Equipment[] = [
  // Ultrasonidos
  { id: 'eq-01', serialNumber: 'SN-USG-20241', model: 'LOGIQ E10', brand: 'GE Healthcare', category: 'ultrasonido', maintenanceIntervalMonths: 6, arrivalDate: subDays(NOW, 5), clientId: undefined, description: 'Ecógrafo diagnóstico premium con IA integrada' },
  { id: 'eq-02', serialNumber: 'SN-USG-20242', model: 'LOGIQ E10', brand: 'GE Healthcare', category: 'ultrasonido', maintenanceIntervalMonths: 6, arrivalDate: subDays(NOW, 12), clientId: undefined, description: 'Ecógrafo diagnóstico premium' },
  { id: 'eq-03', serialNumber: 'SN-USG-20243', model: 'Mindray DC-80', brand: 'Mindray', category: 'ultrasonido', maintenanceIntervalMonths: 6, arrivalDate: subDays(NOW, 3), clientId: undefined },
  { id: 'eq-04', serialNumber: 'SN-USG-20180', model: 'Voluson E8', brand: 'GE Healthcare', category: 'ultrasonido', maintenanceIntervalMonths: 6, dispatchDate: subDays(NOW, 180), clientId: 'c-01', siteId: 's-from-c-01', description: 'Ecógrafo obstétrico 4D' },
  { id: 'eq-05', serialNumber: 'SN-USG-20190', model: 'Voluson E8', brand: 'GE Healthcare', category: 'ultrasonido', maintenanceIntervalMonths: 6, dispatchDate: subDays(NOW, 200), clientId: 'c-03', siteId: 's-from-c-03', description: 'Ecógrafo obstétrico 4D' },
  { id: 'eq-06', serialNumber: 'SN-USG-20210', model: 'Mindray DC-80', brand: 'Mindray', category: 'ultrasonido', maintenanceIntervalMonths: 6, dispatchDate: subDays(NOW, 95), clientId: 'c-07', siteId: 's-from-c-07' },
  { id: 'eq-07', serialNumber: 'SN-USG-20220', model: 'Sonosite Edge II', brand: 'Fujifilm', category: 'ultrasonido', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 340), clientId: 'c-10', siteId: 's-from-c-10' },

  // Rayos X
  { id: 'eq-08', serialNumber: 'SN-RX-20244', model: 'Definium 656 HD', brand: 'GE Healthcare', category: 'rayos-x', maintenanceIntervalMonths: 12, arrivalDate: subDays(NOW, 8), clientId: undefined },
  { id: 'eq-09', serialNumber: 'SN-RX-20245', model: 'DigitalDiagnost C90', brand: 'Philips', category: 'rayos-x', maintenanceIntervalMonths: 12, arrivalDate: subDays(NOW, 15), clientId: undefined, description: 'Sistema de rayos X digital directo' },
  { id: 'eq-10', serialNumber: 'SN-RX-20200', model: 'Definium 656 HD', brand: 'GE Healthcare', category: 'rayos-x', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 360), clientId: 'c-05', siteId: 's-from-c-05' },
  { id: 'eq-11', serialNumber: 'SN-RX-20210', model: 'DigitalDiagnost C90', brand: 'Philips', category: 'rayos-x', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 120), clientId: 'c-11', siteId: 's-from-c-11' },
  { id: 'eq-12', serialNumber: 'SN-RX-20230', model: 'Carestream DRX-Edge', brand: 'Carestream', category: 'rayos-x', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 78), clientId: 'c-13', siteId: 's-from-c-13' },

  // Monitores
  { id: 'eq-13', serialNumber: 'SN-MON-20246', model: 'IntelliVue MX750', brand: 'Philips', category: 'monitor', maintenanceIntervalMonths: 12, arrivalDate: subDays(NOW, 2), clientId: undefined, description: 'Monitor de signos vitales multiparamétrico' },
  { id: 'eq-14', serialNumber: 'SN-MON-20247', model: 'IntelliVue MX750', brand: 'Philips', category: 'monitor', maintenanceIntervalMonths: 12, arrivalDate: subDays(NOW, 2), clientId: undefined },
  { id: 'eq-15', serialNumber: 'SN-MON-20248', model: 'CARESCAPE B650', brand: 'GE Healthcare', category: 'monitor', maintenanceIntervalMonths: 12, arrivalDate: subDays(NOW, 20), clientId: undefined },
  { id: 'eq-16', serialNumber: 'SN-MON-20170', model: 'IntelliVue MX700', brand: 'Philips', category: 'monitor', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 365), clientId: 'c-04', siteId: 's-from-c-04' },
  { id: 'eq-17', serialNumber: 'SN-MON-20180', model: 'CARESCAPE B450', brand: 'GE Healthcare', category: 'monitor', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 280), clientId: 'c-08', siteId: 's-from-c-08' },
  { id: 'eq-18', serialNumber: 'SN-MON-20190', model: 'IntelliVue MX750', brand: 'Philips', category: 'monitor', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 155), clientId: 'c-09', siteId: 's-from-c-09' },
  { id: 'eq-19', serialNumber: 'SN-MON-20200', model: 'CARESCAPE B650', brand: 'GE Healthcare', category: 'monitor', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 60), clientId: 'c-12', siteId: 's-from-c-12' },

  // Desfibriladores
  { id: 'eq-20', serialNumber: 'SN-DEF-20249', model: 'HeartStart XL+', brand: 'Philips', category: 'desfibrilador', maintenanceIntervalMonths: 6, arrivalDate: subDays(NOW, 7), clientId: undefined, description: 'Desfibrilador/monitor profesional' },
  { id: 'eq-21', serialNumber: 'SN-DEF-20250', model: 'ZOLL R Series', brand: 'ZOLL Medical', category: 'desfibrilador', maintenanceIntervalMonths: 6, arrivalDate: subDays(NOW, 18), clientId: undefined },
  { id: 'eq-22', serialNumber: 'SN-DEF-20160', model: 'HeartStart XL+', brand: 'Philips', category: 'desfibrilador', maintenanceIntervalMonths: 6, dispatchDate: subDays(NOW, 185), clientId: 'c-02', siteId: 's-from-c-02' },
  { id: 'eq-23', serialNumber: 'SN-DEF-20170', model: 'ZOLL R Series', brand: 'ZOLL Medical', category: 'desfibrilador', maintenanceIntervalMonths: 6, dispatchDate: subDays(NOW, 100), clientId: 'c-06', siteId: 's-from-c-06' },
  { id: 'eq-24', serialNumber: 'SN-DEF-20180', model: 'Lifepak 20e', brand: 'Stryker', category: 'desfibrilador', maintenanceIntervalMonths: 6, dispatchDate: subDays(NOW, 50), clientId: 'c-14', siteId: 's-from-c-14' },

  // Otros
  { id: 'eq-25', serialNumber: 'SN-OTR-20251', model: 'Yuwell 7F-3', brand: 'Yuwell', category: 'otros', maintenanceIntervalMonths: 12, arrivalDate: subDays(NOW, 10), clientId: undefined, description: 'Concentrador de oxígeno 3L/min' },
  { id: 'eq-26', serialNumber: 'SN-OTR-20252', model: 'BD Alaris 8015', brand: 'BD Medical', category: 'otros', maintenanceIntervalMonths: 12, arrivalDate: subDays(NOW, 25), clientId: undefined, description: 'Bomba de infusión médica' },
  { id: 'eq-27', serialNumber: 'SN-OTR-20140', model: 'BD Alaris 8015', brand: 'BD Medical', category: 'otros', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 310), clientId: 'c-15', siteId: 's-from-c-15' },
  { id: 'eq-28', serialNumber: 'SN-OTR-20150', model: 'Draeger Primus', brand: 'Dräger', category: 'otros', maintenanceIntervalMonths: 6, dispatchDate: subDays(NOW, 175), clientId: 'c-05', siteId: 's-from-c-05', description: 'Máquina de anestesia' },
  { id: 'eq-29', serialNumber: 'SN-OTR-20160', model: 'Yuwell 7F-5', brand: 'Yuwell', category: 'otros', maintenanceIntervalMonths: 12, dispatchDate: subDays(NOW, 210), clientId: 'c-11', siteId: 's-from-c-11' },
  { id: 'eq-30', serialNumber: 'SN-OTR-20170', model: 'Omron HBP-1300', brand: 'Omron', category: 'otros', maintenanceIntervalMonths: 24, dispatchDate: subDays(NOW, 45), clientId: 'c-06', siteId: 's-from-c-06', description: 'Tensiómetro de brazo profesional' },

  // Equipos en venta / pendientes de entrega
  { id: 'eq-31', serialNumber: 'SN-USG-20260', model: 'Mindray DC-70', brand: 'Mindray', category: 'ultrasonido', maintenanceIntervalMonths: 6, dispatchDate: addDays(NOW, 5), clientId: 'c-06', siteId: 's-from-c-06' },
  { id: 'eq-32', serialNumber: 'SN-MON-20261', model: 'IntelliVue MX550', brand: 'Philips', category: 'monitor', maintenanceIntervalMonths: 12, dispatchDate: addDays(NOW, 3), clientId: 'c-12', siteId: 's-from-c-12' },
  { id: 'eq-33', serialNumber: 'SN-RX-20262', model: 'Luminos dRF Max', brand: 'Siemens', category: 'rayos-x', maintenanceIntervalMonths: 12, dispatchDate: addDays(NOW, 10), clientId: 'c-15', siteId: 's-from-c-15' },
  { id: 'eq-34', serialNumber: 'SN-DEF-20263', model: 'HeartStart MRx', brand: 'Philips', category: 'desfibrilador', maintenanceIntervalMonths: 6, dispatchDate: addDays(NOW, 7), clientId: 'c-14', siteId: 's-from-c-14' },
  { id: 'eq-35', serialNumber: 'SN-USG-20264', model: 'Sonosite PX', brand: 'Fujifilm', category: 'ultrasonido', maintenanceIntervalMonths: 12, dispatchDate: addDays(NOW, 14), clientId: 'c-09', siteId: 's-from-c-09' },
]

let _equipment = [...EQUIPMENT]

export function getEquipment(): Equipment[] {
  return _equipment
}

export function getEquipmentById(id: string): Equipment | undefined {
  return _equipment.find(e => e.id === id)
}

export function getEquipmentInStock(): Equipment[] {
  return _equipment.filter(e => !e.clientId && e.arrivalDate)
}

export function getEquipmentDispatched(): Equipment[] {
  return _equipment.filter(e => e.clientId && e.dispatchDate)
}

export function updateEquipment(id: string, updates: Partial<Equipment>): Equipment | undefined {
  const idx = _equipment.findIndex(e => e.id === id)
  if (idx === -1) return undefined
  _equipment[idx] = { ..._equipment[idx], ...updates }
  return _equipment[idx]
}

export function setEquipmentSite(equipmentId: string, siteId: string): Equipment | undefined {
  const site = getSiteById(siteId)
  if (!site) return undefined
  return updateEquipment(equipmentId, { siteId, clientId: site.clientId })
}

export function addEquipment(data: Omit<Equipment, 'id'>): Equipment {
  const eq: Equipment = { ...data, id: `eq-${nanoid()}` }
  _equipment.push(eq)
  return eq
}
