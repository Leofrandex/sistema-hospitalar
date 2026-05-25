export type SignatureMode = 'digital' | 'physical-scanned'

export interface GeoPoint {
  lat: number
  lng: number
  timestamp: string
}

export interface ServiceTimePhase {
  start?: string
  end?: string
}

export interface ServiceTimes {
  travelOut?: ServiceTimePhase
  wait?: ServiceTimePhase
  work?: ServiceTimePhase
  travelReturn?: ServiceTimePhase
  note?: string
}

export interface PartUsed {
  code: string
  quantity: number
  description: string
}

export interface FieldReport {
  id: string
  serviceOrderId: string
  visitNumber: number
  technicianId: string
  startedAt: Date
  completedAt?: Date
  photos: string[]
  accessories: string[]
  technicianSignature: string
  clientSignatureMode: SignatureMode
  clientSignatureData?: string
  clientSignerName?: string
  clientSignerCedula?: string
  directorSignatureMode?: SignatureMode
  directorSignatureData?: string
  directorSignerName?: string
  directorSignerCedula?: string
  geoCheckIn?: GeoPoint
  geoCheckOut?: GeoPoint
  notes?: string
  faultChecklist?: string[]
  faultDescription?: string
  faultReported?: string
  workPerformed?: string
  requiresPartsDescription?: string
  partsUsed?: PartUsed[]
  times?: ServiceTimes
  status: 'borrador' | 'completado'
}
