import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getClients, addClient } from '@/data/mock/clients'
import { addSite } from '@/data/mock/sites'
import { addEquipment } from '@/data/mock/equipment'
import { addContract } from '@/data/mock/contracts'
import { parseWarrantyText } from './lib/parse-warranty'
import type { ImportSchema } from '@/lib/data-import'

interface Props {
  onExit: () => void
}

export function IndividualEntryForm({ onExit }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [schema, setSchema] = useState<ImportSchema>('privado')

  const [clientId, setClientId] = useState<string>('new')
  const [clientName, setClientName] = useState('')
  const [siteName, setSiteName] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [siteCity, setSiteCity] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const [equipmentType, setEquipmentType] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [installationDate, setInstallationDate] = useState('')
  const [warrantyText, setWarrantyText] = useState('')
  const [preventivosIncluded, setPreventivosIncluded] = useState<number>(0)

  const clients = getClients().filter(c => c.isPublicSector === (schema === 'publico'))

  function submit() {
    const client = clientId === 'new'
      ? addClient({
          name: clientName,
          cedula: undefined,
          rif: undefined,
          location: siteAddress,
          city: siteCity,
          phone: contactPhone,
          email: contactEmail,
          country: 'pa',
          isPublicSector: schema === 'publico',
          notes: undefined,
        })
      : clients.find(c => c.id === clientId)!

    const site = addSite({
      clientId: client.id,
      name: siteName || client.name,
      address: siteAddress,
      city: siteCity,
      contacts: contactName
        ? [{ role: schema === 'publico' ? 'biomedica' : 'general', name: contactName, phone: contactPhone, email: contactEmail }]
        : [],
      notes: undefined,
    })

    const equipment = addEquipment({
      serialNumber,
      model,
      brand,
      category: 'otros',
      equipmentType,
      maintenanceIntervalMonths: 12,
      installationDate: installationDate ? new Date(installationDate) : undefined,
      clientId: client.id,
      siteId: site.id,
      origen: 'carga_inicial',
    })

    const warrantyMonths = parseWarrantyText(warrantyText)
    if (warrantyMonths && installationDate) {
      addContract({
        contractNumber: `GAR-${equipment.id}`,
        clientId: client.id,
        equipmentId: equipment.id,
        startDate: new Date(installationDate),
        durationMonths: warrantyMonths,
        preventivosIncluded,
        status: 'activo',
        tipo: 'garantia',
        origen: 'carga_inicial',
        createdBy: 'u-07',
      })
    }

    onExit()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onExit}><ArrowLeft className="h-4 w-4 mr-1" />Volver</Button>
        <h2 className="text-xl font-semibold">Alta individual — paso {step} de 3</h2>
      </div>

      {step === 1 && (
        <div className="space-y-4 max-w-md">
          <Label>Tipo de cliente</Label>
          <RadioGroup value={schema} onValueChange={v => setSchema(v as ImportSchema)}>
            <div className="flex items-center gap-2"><RadioGroupItem value="privado" id="r-priv-i" /><Label htmlFor="r-priv-i">Privado</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="publico" id="r-pub-i" /><Label htmlFor="r-pub-i">Público</Label></div>
          </RadioGroup>
          <Button onClick={() => setStep(2)}>Continuar</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 max-w-xl">
          <Label>Cliente</Label>
          <select className="w-full border rounded p-2" value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="new">— Crear nuevo —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {clientId === 'new' && (
            <Input placeholder="Nombre del cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
          )}
          <Input placeholder="Nombre de la sede" value={siteName} onChange={e => setSiteName(e.target.value)} />
          <Input placeholder="Dirección" value={siteAddress} onChange={e => setSiteAddress(e.target.value)} />
          <Input placeholder="Ciudad" value={siteCity} onChange={e => setSiteCity(e.target.value)} />
          <Input placeholder="Contacto: nombre" value={contactName} onChange={e => setContactName(e.target.value)} />
          <Input placeholder="Contacto: teléfono" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
          <Input placeholder="Contacto: correo" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
            <Button onClick={() => setStep(3)}>Continuar</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 max-w-xl">
          <Input placeholder="Tipo de equipo (libre)" value={equipmentType} onChange={e => setEquipmentType(e.target.value)} />
          <Input placeholder="Marca" value={brand} onChange={e => setBrand(e.target.value)} />
          <Input placeholder="Modelo" value={model} onChange={e => setModel(e.target.value)} />
          <Input placeholder="Serial" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} required />
          <Label>Fecha de instalación</Label>
          <Input type="date" value={installationDate} onChange={e => setInstallationDate(e.target.value)} />
          <Input placeholder="Garantía (ej: '1 año', '2 años')" value={warrantyText} onChange={e => setWarrantyText(e.target.value)} />
          <Label htmlFor="ind-preventivos">Preventivos incluidos en la garantía</Label>
          <Input
            id="ind-preventivos"
            type="number"
            min={0}
            step={1}
            value={preventivosIncluded}
            onChange={e => setPreventivosIncluded(Math.max(0, parseInt(e.target.value || '0', 10)))}
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(2)}>Atrás</Button>
            <Button onClick={submit} disabled={!serialNumber}>Guardar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
