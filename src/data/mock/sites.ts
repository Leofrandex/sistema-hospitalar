import type { Site } from '@/types/site'
import { getClients } from '@/data/mock/clients'

function buildFallbackSites(): Site[] {
  return getClients().map(c => ({
    id: `s-from-${c.id}`,
    clientId: c.id,
    name: c.name,
    address: c.location,
    city: c.city,
    contacts: [
      { role: 'general', name: c.name, phone: c.phone, email: c.email },
    ],
    notes: undefined,
    createdAt: c.createdAt,
  }))
}

let _sites: Site[] = buildFallbackSites()

export function getSites(): Site[] {
  return _sites
}

export function getSiteById(id: string): Site | undefined {
  return _sites.find(s => s.id === id)
}

export function getSitesByClientId(clientId: string): Site[] {
  return _sites.filter(s => s.clientId === clientId)
}

export function getPrimarySiteForClient(clientId: string): Site | undefined {
  return _sites.find(s => s.clientId === clientId)
}

export function addSite(data: Omit<Site, 'id' | 'createdAt'>): Site {
  const site: Site = {
    ...data,
    id: `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date(),
  }
  _sites.push(site)
  return site
}

export function updateSite(id: string, updates: Partial<Site>): Site | undefined {
  const i = _sites.findIndex(s => s.id === id)
  if (i < 0) return undefined
  _sites[i] = { ..._sites[i], ...updates }
  return _sites[i]
}
