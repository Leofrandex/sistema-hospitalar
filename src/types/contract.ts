export type ContractStatus = 'activo' | 'vencido' | 'cancelado'
export type ContractType = 'garantia' | 'renovacion'
export type ContractOrigen = 'carga_inicial' | 'manual'

export interface Contract {
  id: string
  contractNumber: string
  clientId: string
  equipmentId: string
  startDate: Date
  endDate: Date
  durationMonths: number
  preventivosIncluded: number
  pdfUrl?: string
  pdfFileName?: string
  notes?: string
  status: ContractStatus
  tipo: ContractType
  origen: ContractOrigen
  createdAt: Date
  createdBy: string
}

export function getContractIntervalDays(contract: Contract): number {
  const totalMs = contract.endDate.getTime() - contract.startDate.getTime()
  const totalDays = totalMs / (1000 * 60 * 60 * 24)
  return totalDays / contract.preventivosIncluded
}

export function getPreventivoOccurrenceDate(contract: Contract, occurrence: number): Date {
  const totalMs = contract.endDate.getTime() - contract.startDate.getTime()
  const proportional = (occurrence / contract.preventivosIncluded) * totalMs
  return new Date(contract.startDate.getTime() + proportional)
}

export function isContractExpired(contract: Contract): boolean {
  return contract.endDate.getTime() < Date.now()
}
