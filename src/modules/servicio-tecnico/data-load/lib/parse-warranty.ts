export function parseWarrantyText(raw: unknown): number | null {
  if (raw == null) return null
  const text = String(raw).toLowerCase().trim()
  if (!text || ['s/d', 'n/a', 'vencida', 'sin garantia', 'sin garantía'].includes(text)) {
    return null
  }

  let total = 0
  let matched = false

  const yearMatch = text.match(/(\d+)\s*a[nñ]o/)
  if (yearMatch) {
    total += parseInt(yearMatch[1], 10) * 12
    matched = true
  }
  const monthMatch = text.match(/(\d+)\s*mes/)
  if (monthMatch) {
    total += parseInt(monthMatch[1], 10)
    matched = true
  }

  return matched ? total : null
}

const SPANISH_MONTHS: Record<string, number> = {
  enero: 0, january: 0,
  febrero: 1, february: 1,
  marzo: 2, march: 2,
  abril: 3, april: 3,
  mayo: 4, may: 4,
  junio: 5, june: 5,
  julio: 6, july: 6,
  agosto: 7, august: 7,
  septiembre: 8, september: 8,
  octubre: 9, october: 9,
  noviembre: 10, november: 10,
  diciembre: 11, december: 11,
}

export function parseFlexibleDate(raw: unknown): Date | undefined {
  if (raw == null) return undefined
  if (raw instanceof Date) return raw
  const text = String(raw).trim()
  if (!text || text.toLowerCase() === 's/d' || text.toLowerCase() === 'n/a') return undefined

  if (text.match(/\d{4}-\d{2}-\d{2}/)) {
    const iso = new Date(text)
    if (!isNaN(iso.getTime())) return iso
  }

  const m = text.toLowerCase().match(/(\d+)\s*(?:de\s+)?([a-záéíóúñ]+)\s*(?:de\s+)?(\d{4})/)
  if (m) {
    const day = parseInt(m[1], 10)
    const monthName = m[2].normalize('NFD').replace(/[̀-ͯ]/g, '')
    const year = parseInt(m[3], 10)
    const month = SPANISH_MONTHS[monthName]
    if (month != null && day >= 1 && day <= 31) {
      return new Date(year, month, day)
    }
  }

  return undefined
}
