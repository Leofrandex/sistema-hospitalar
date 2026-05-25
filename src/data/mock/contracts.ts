import { addMonths, subDays } from 'date-fns'
import type { Contract } from '@/types/contract'

const NOW = new Date()

interface SeedShape {
  id: string
  contractNumber: string
  clientId: string
  equipmentId: string
  startDate: Date
  durationMonths: number
  preventivosIncluded: number
  notes?: string
  createdBy?: string
}

const SEED: SeedShape[] = [
  // Equipos despachados (pasado) — 1 contrato por equipo con clientId
  { id: 'ct-01', contractNumber: 'HV-2025-001', clientId: 'c-01', equipmentId: 'eq-04', startDate: subDays(NOW, 180), durationMonths: 12, preventivosIncluded: 2, notes: 'Contrato anual estándar — incluye 2 preventivos.' },
  { id: 'ct-02', contractNumber: 'HV-2025-002', clientId: 'c-03', equipmentId: 'eq-05', startDate: subDays(NOW, 200), durationMonths: 12, preventivosIncluded: 2 },
  { id: 'ct-03', contractNumber: 'HV-2025-003', clientId: 'c-07', equipmentId: 'eq-06', startDate: subDays(NOW, 95),  durationMonths: 12, preventivosIncluded: 2 },
  { id: 'ct-04', contractNumber: 'HV-2024-014', clientId: 'c-10', equipmentId: 'eq-07', startDate: subDays(NOW, 340), durationMonths: 24, preventivosIncluded: 2, notes: 'Contrato bianual con renovación automática.' },
  { id: 'ct-05', contractNumber: 'HV-2024-018', clientId: 'c-05', equipmentId: 'eq-10', startDate: subDays(NOW, 360), durationMonths: 24, preventivosIncluded: 2, notes: 'Sector público — Hospital Universitario.' },
  { id: 'ct-06', contractNumber: 'HV-2025-021', clientId: 'c-11', equipmentId: 'eq-11', startDate: subDays(NOW, 120), durationMonths: 12, preventivosIncluded: 1 },
  { id: 'ct-07', contractNumber: 'HV-2025-022', clientId: 'c-13', equipmentId: 'eq-12', startDate: subDays(NOW, 78),  durationMonths: 12, preventivosIncluded: 1 },
  { id: 'ct-08', contractNumber: 'HV-2024-029', clientId: 'c-04', equipmentId: 'eq-16', startDate: subDays(NOW, 365), durationMonths: 24, preventivosIncluded: 2 },
  { id: 'ct-09', contractNumber: 'HV-2024-031', clientId: 'c-08', equipmentId: 'eq-17', startDate: subDays(NOW, 280), durationMonths: 12, preventivosIncluded: 1 },
  { id: 'ct-10', contractNumber: 'HV-2024-035', clientId: 'c-09', equipmentId: 'eq-18', startDate: subDays(NOW, 155), durationMonths: 12, preventivosIncluded: 1 },
  { id: 'ct-11', contractNumber: 'HV-2025-040', clientId: 'c-12', equipmentId: 'eq-19', startDate: subDays(NOW, 60),  durationMonths: 12, preventivosIncluded: 1 },
  { id: 'ct-12', contractNumber: 'HV-2025-005', clientId: 'c-02', equipmentId: 'eq-22', startDate: subDays(NOW, 185), durationMonths: 12, preventivosIncluded: 2 },
  { id: 'ct-13', contractNumber: 'HV-2025-009', clientId: 'c-06', equipmentId: 'eq-23', startDate: subDays(NOW, 100), durationMonths: 12, preventivosIncluded: 2 },
  { id: 'ct-14', contractNumber: 'HV-2025-026', clientId: 'c-14', equipmentId: 'eq-24', startDate: subDays(NOW, 50),  durationMonths: 12, preventivosIncluded: 2 },
  { id: 'ct-15', contractNumber: 'HV-2024-042', clientId: 'c-15', equipmentId: 'eq-27', startDate: subDays(NOW, 310), durationMonths: 12, preventivosIncluded: 1, notes: 'Contrato cerca de vencer; renovación en gestión.' },
  { id: 'ct-16', contractNumber: 'HV-2024-045', clientId: 'c-05', equipmentId: 'eq-28', startDate: subDays(NOW, 175), durationMonths: 12, preventivosIncluded: 2, notes: 'Máquina de anestesia — preventivos cada 6 meses.' },
  { id: 'ct-17', contractNumber: 'HV-2024-048', clientId: 'c-11', equipmentId: 'eq-29', startDate: subDays(NOW, 210), durationMonths: 12, preventivosIncluded: 1 },
  { id: 'ct-18', contractNumber: 'HV-2025-051', clientId: 'c-06', equipmentId: 'eq-30', startDate: subDays(NOW, 45),  durationMonths: 24, preventivosIncluded: 1, notes: 'Tensiómetro — preventivo bianual.' },
  // Equipos con dispatch futuro (contratos firmados, equipos por entregar)
  { id: 'ct-19', contractNumber: 'HV-2026-001', clientId: 'c-06', equipmentId: 'eq-31', startDate: subDays(NOW, -5),  durationMonths: 12, preventivosIncluded: 2 },
  { id: 'ct-20', contractNumber: 'HV-2026-002', clientId: 'c-12', equipmentId: 'eq-32', startDate: subDays(NOW, -3),  durationMonths: 12, preventivosIncluded: 1 },
  // eq-33, eq-34, eq-35 quedan sin contrato para permitir pruebas de creación desde el form.
]

function buildContract(seed: SeedShape): Contract {
  const endDate = addMonths(seed.startDate, seed.durationMonths)
  const expired = endDate.getTime() < NOW.getTime()
  return {
    id: seed.id,
    contractNumber: seed.contractNumber,
    clientId: seed.clientId,
    equipmentId: seed.equipmentId,
    startDate: seed.startDate,
    endDate,
    durationMonths: seed.durationMonths,
    preventivosIncluded: seed.preventivosIncluded,
    notes: seed.notes,
    status: expired ? 'vencido' : 'activo',
    tipo: 'renovacion',
    origen: 'manual',
    createdAt: seed.startDate,
    createdBy: seed.createdBy ?? 'u-demo',
  }
}

let _contracts: Contract[] = SEED.map(buildContract)

export function getContracts(): Contract[] {
  return _contracts
}

export function getContractById(id: string): Contract | undefined {
  return _contracts.find(c => c.id === id)
}

export function getContractByEquipmentId(equipmentId: string): Contract | undefined {
  return _contracts.find(c => c.equipmentId === equipmentId)
}

export function getContractsByClientId(clientId: string): Contract[] {
  return _contracts.filter(c => c.clientId === clientId)
}

export function addContract(data: Omit<Contract, 'id' | 'createdAt' | 'endDate'>): Contract {
  const id = `ct-${String(_contracts.length + 1).padStart(2, '0')}`
  const endDate = addMonths(data.startDate, data.durationMonths)
  const contract: Contract = {
    ...data,
    id,
    endDate,
    createdAt: new Date(),
  }
  _contracts = [..._contracts, contract]
  return contract
}

export function updateContract(id: string, updates: Partial<Contract>): Contract | undefined {
  const idx = _contracts.findIndex(c => c.id === id)
  if (idx === -1) return undefined
  _contracts[idx] = { ..._contracts[idx], ...updates }
  return _contracts[idx]
}
