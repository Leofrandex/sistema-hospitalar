export type EquipmentCategory =
  | 'ultrasonido'
  | 'rayos-x'
  | 'monitor'
  | 'desfibrilador'
  | 'otros'

export type EquipmentOrigen = 'carga_inicial' | 'manual'

export interface Equipment {
  id: string
  serialNumber: string
  model: string
  brand: string
  category: EquipmentCategory
  equipmentType?: string
  peripherals?: string
  maintenanceIntervalMonths: number
  arrivalDate?: Date
  dispatchDate?: Date
  installationDate?: Date
  clientId?: string
  siteId?: string
  description?: string
  serviceArea?: string
  assetTag?: string
  license?: string
  ctni?: string
  purchaseOrder?: string
  serviceHistory?: Date[]
  origen?: EquipmentOrigen
}
