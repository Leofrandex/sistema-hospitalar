import type { Client } from '@/types/client'
import type { Site, SiteContact, ContactRole } from '@/types/site'
import type { Equipment, EquipmentCategory } from '@/types/equipment'
import { getClients, addClient } from '@/data/mock/clients'
import { getEquipment, updateEquipment, addEquipment } from '@/data/mock/equipment'
import { getSites, addSite } from '@/data/mock/sites'
import { addContract } from '@/data/mock/contracts'
import { getKnownMapping, type TargetField } from '@/lib/excel-headers'
import { parseFlexibleDate, parseWarrantyText } from '@/modules/servicio-tecnico/data-load/lib/parse-warranty'

export type ImportSchema = 'publico' | 'privado'

export { getKnownMapping }

export interface ParsedRow {
  client: Partial<Client>
  site: Partial<Site> & { contacts: SiteContact[] }
  equipment: Partial<Equipment>
  warrantyText?: string
}

export interface ColumnMapping {
  [originalHeader: string]: TargetField
}

export interface RowError {
  rowIndex: number
  reason: string
}

export interface ImportResult {
  rowsRead: number
  clientsCreated: number
  clientsReused: number
  sitesCreated: number
  sitesReused: number
  equipmentCreated: number
  equipmentUpdated: number
  contractsCreated: number
  errors: RowError[]
}

function inferCategory(equipmentType?: string): EquipmentCategory {
  const t = (equipmentType ?? '').toLowerCase()
  if (t.includes('ultrasonido') || t.includes('eco')) return 'ultrasonido'
  if (t.includes('rayos') || t.includes('x-ray') || t.includes('rx')) return 'rayos-x'
  if (t.includes('monitor')) return 'monitor'
  if (t.includes('desfibrilador')) return 'desfibrilador'
  return 'otros'
}

function setByPath(parsed: ParsedRow, field: TargetField, value: unknown): void {
  if (value == null || value === '' || value === 'S/D' || value === 'N/A') return
  const str = typeof value === 'string' ? value.trim() : value

  switch (field) {
    case 'ignore': return
    case 'client.name':       parsed.client.name = String(str); break
    case 'client.notes':      parsed.client.notes = String(str); break
    case 'client.phone':      parsed.client.phone = String(str); break
    case 'client.email':      parsed.client.email = String(str); break
    case 'site.name':         parsed.site.name = String(str); break
    case 'site.address':      parsed.site.address = String(str); break
    case 'site.city':         parsed.site.city = String(str); break
    case 'equipment.equipmentType': parsed.equipment.equipmentType = String(str); break
    case 'equipment.brand':         parsed.equipment.brand = String(str); break
    case 'equipment.model':         parsed.equipment.model = String(str); break
    case 'equipment.serialNumber':  parsed.equipment.serialNumber = String(str); break
    case 'equipment.peripherals':   parsed.equipment.peripherals = String(str); break
    case 'equipment.installationDate': {
      const d = parseFlexibleDate(str)
      if (d) parsed.equipment.installationDate = d
      break
    }
    case 'equipment.dispatchDate': {
      const d = parseFlexibleDate(str)
      if (d) parsed.equipment.dispatchDate = d
      break
    }
    case 'equipment.serviceArea':   parsed.equipment.serviceArea = String(str); break
    case 'equipment.assetTag':      parsed.equipment.assetTag = String(str); break
    case 'equipment.license':       parsed.equipment.license = String(str); break
    case 'equipment.ctni':          parsed.equipment.ctni = String(str); break
    case 'equipment.purchaseOrder': parsed.equipment.purchaseOrder = String(str); break
    case 'equipment.serviceHistory[]': {
      const d = parseFlexibleDate(str)
      if (d) {
        parsed.equipment.serviceHistory = [...(parsed.equipment.serviceHistory ?? []), d]
      }
      break
    }
    case 'contract.warrantyText':   parsed.warrantyText = String(str); break
    default: {
      if (field.startsWith('site.contact.')) {
        const parts = field.split('.')
        const role = parts[2] as ContactRole
        const prop = parts[3] as keyof SiteContact
        let contact = parsed.site.contacts.find(c => c.role === role)
        if (!contact) {
          contact = { role, name: '' }
          parsed.site.contacts.push(contact)
        }
        ;(contact as unknown as Record<string, unknown>)[prop] = String(str)
      }
    }
  }
}

export function parseRow(
  rawRow: Record<string, unknown>,
  mapping: ColumnMapping,
): ParsedRow {
  const parsed: ParsedRow = {
    client: {},
    site: { contacts: [] },
    equipment: {},
  }
  for (const [header, value] of Object.entries(rawRow)) {
    const field = mapping[header]
    if (!field) continue
    setByPath(parsed, field, value)
  }
  return parsed
}

function findOrCreateClient(
  parsed: ParsedRow,
  isPublicSector: boolean,
  stats: ImportResult,
): Client | undefined {
  const name = parsed.client.name?.trim()
  if (!name) return undefined
  const existing = getClients().find(c => c.name.trim().toLowerCase() === name.toLowerCase())
  if (existing) {
    stats.clientsReused++
    return existing
  }
  const created = addClient({
    name,
    cedula: undefined,
    rif: undefined,
    location: parsed.site.address ?? '',
    city: parsed.site.city ?? '',
    phone: parsed.client.phone ?? '',
    email: parsed.client.email ?? '',
    country: 'pa',
    isPublicSector,
    notes: parsed.client.notes,
  })
  stats.clientsCreated++
  return created
}

function findOrCreateSite(parsed: ParsedRow, clientId: string, stats: ImportResult): Site {
  const name = parsed.site.name?.trim() || parsed.client.name?.trim() || 'Sede principal'
  const existing = getSites().find(
    s => s.clientId === clientId && s.name.trim().toLowerCase() === name.toLowerCase(),
  )
  if (existing) {
    stats.sitesReused++
    return existing
  }
  const site = addSite({
    clientId,
    name,
    address: parsed.site.address,
    city: parsed.site.city,
    contacts: parsed.site.contacts,
    notes: undefined,
  })
  stats.sitesCreated++
  return site
}

function upsertEquipment(
  parsed: ParsedRow,
  siteId: string,
  clientId: string,
  stats: ImportResult,
): Equipment | undefined {
  const serial = parsed.equipment.serialNumber?.toString().trim()
  if (!serial) return undefined

  const existing = getEquipment().find(
    e => e.serialNumber.trim().toLowerCase() === serial.toLowerCase(),
  )
  if (existing) {
    updateEquipment(existing.id, {
      ...parsed.equipment,
      serialNumber: serial,
      siteId,
      clientId,
      category: inferCategory(parsed.equipment.equipmentType ?? existing.equipmentType),
      origen: 'carga_inicial',
    })
    stats.equipmentUpdated++
    return existing
  }
  const created = addEquipment({
    serialNumber: serial,
    model: parsed.equipment.model ?? '',
    brand: parsed.equipment.brand ?? '',
    category: inferCategory(parsed.equipment.equipmentType),
    equipmentType: parsed.equipment.equipmentType,
    peripherals: parsed.equipment.peripherals,
    maintenanceIntervalMonths: 12,
    arrivalDate: undefined,
    dispatchDate: parsed.equipment.dispatchDate,
    installationDate: parsed.equipment.installationDate,
    clientId,
    siteId,
    description: undefined,
    serviceArea: parsed.equipment.serviceArea,
    assetTag: parsed.equipment.assetTag,
    license: parsed.equipment.license,
    ctni: parsed.equipment.ctni,
    purchaseOrder: parsed.equipment.purchaseOrder,
    serviceHistory: parsed.equipment.serviceHistory,
    origen: 'carga_inicial',
  })
  stats.equipmentCreated++
  return created
}

function maybeCreateWarrantyContract(
  parsed: ParsedRow,
  equipmentId: string,
  clientId: string,
  preventivosIncluded: number,
  stats: ImportResult,
): void {
  if (!parsed.warrantyText) return
  const months = parseWarrantyText(parsed.warrantyText)
  if (!months) return
  const startDate = parsed.equipment.installationDate ?? parsed.equipment.dispatchDate
  if (!startDate) return

  addContract({
    contractNumber: `GAR-${equipmentId}`,
    clientId,
    equipmentId,
    startDate,
    durationMonths: months,
    preventivosIncluded,
    status: 'activo',
    tipo: 'garantia',
    origen: 'carga_inicial',
    createdBy: 'u-07',
  })
  stats.contractsCreated++
}

export function executeImport(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping,
  isPublicSector: boolean,
  preventivosIncluded: number = 0,
): ImportResult {
  const stats: ImportResult = {
    rowsRead: rows.length,
    clientsCreated: 0, clientsReused: 0,
    sitesCreated: 0, sitesReused: 0,
    equipmentCreated: 0, equipmentUpdated: 0,
    contractsCreated: 0,
    errors: [],
  }

  rows.forEach((raw, idx) => {
    const parsed = parseRow(raw, mapping)
    if (!parsed.equipment.serialNumber) {
      return
    }
    try {
      const client = findOrCreateClient(parsed, isPublicSector, stats)
      if (!client) {
        stats.errors.push({ rowIndex: idx + 2, reason: 'Falta nombre de cliente' })
        return
      }
      const site = findOrCreateSite(parsed, client.id, stats)
      const equipment = upsertEquipment(parsed, site.id, client.id, stats)
      if (equipment) {
        maybeCreateWarrantyContract(parsed, equipment.id, client.id, preventivosIncluded, stats)
      }
    } catch (e) {
      stats.errors.push({ rowIndex: idx + 2, reason: String(e) })
    }
  })

  return stats
}
