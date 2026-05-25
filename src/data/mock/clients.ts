export type { Client } from '@/types/client'
import type { Client } from '@/types/client'

const CLIENTS: Client[] = [
  { id: 'c-01', name: 'Dra. Carmen Rodríguez', cedula: 'V-12.345.678', rif: 'J-12345678-9', location: 'Clínica El Ávila, Piso 3', city: 'Caracas', phone: '0414-1234567', email: 'c.rodriguez@clinicaelavila.com', country: 've', isPublicSector: false, createdAt: new Date('2023-03-15') },
  { id: 'c-02', name: 'Dr. Andrés Pérez', cedula: 'V-8.901.234', rif: undefined, location: 'Consultorio Médico Torres, Local 2B', city: 'Maracaibo', phone: '0424-9876543', email: 'andres.perez@gmail.com', country: 've', isPublicSector: false, createdAt: new Date('2023-05-20') },
  { id: 'c-03', name: 'Centro Médico Las Mercedes', cedula: undefined, rif: 'J-30123456-1', location: 'Av. Las Mercedes, Edificio Centro Médico', city: 'Caracas', phone: '0212-9934455', email: 'compras@centromedicollm.com', country: 've', isPublicSector: false, createdAt: new Date('2022-11-01') },
  { id: 'c-04', name: 'Dra. Gabriela Sanchez', cedula: 'V-15.678.901', rif: undefined, location: 'Clínica Privada La Trinidad', city: 'Caracas', phone: '0416-5556789', email: 'gsanchez@clinicalatrinidad.com', country: 've', isPublicSector: false, createdAt: new Date('2023-07-10') },
  { id: 'c-05', name: 'Hospital Universitario', cedula: undefined, rif: 'G-20000001-0', location: 'Ciudad Universitaria, Sector Médico', city: 'Caracas', phone: '0212-6054321', email: 'adquisiciones@huc.edu.ve', country: 've', isPublicSector: true, createdAt: new Date('2022-06-15') },
  { id: 'c-06', name: 'Dr. Luis Fernández', cedula: 'V-9.234.567', rif: undefined, location: 'Av. Bolívar Norte, Consultorio 12', city: 'Valencia', phone: '0241-8567890', email: 'lfernandez.med@gmail.com', country: 've', isPublicSector: false, createdAt: new Date('2024-01-20') },
  { id: 'c-07', name: 'Clínica Santa Sofía', cedula: undefined, rif: 'J-40567891-2', location: 'Urb. Santa Sofía, Calle Principal', city: 'Caracas', phone: '0212-9052233', email: 'adm@clinicasantasofia.com', country: 've', isPublicSector: false, createdAt: new Date('2023-09-05') },
  { id: 'c-08', name: 'Dra. María Quintero', cedula: 'V-18.234.001', rif: undefined, location: 'Torre Médica Bello Monte, P5', city: 'Caracas', phone: '0412-3452211', email: 'mquintero@torremedicabm.com', country: 've', isPublicSector: false, createdAt: new Date('2023-12-01') },
  { id: 'c-09', name: 'Instituto de Diagnóstico Aragua', cedula: undefined, rif: 'J-28091234-5', location: 'Calle Miranda, Edif. IDA', city: 'Maracay', phone: '0243-6781234', email: 'info@ida.com.ve', country: 've', isPublicSector: false, createdAt: new Date('2024-02-14') },
  { id: 'c-10', name: 'Dr. Ricardo Mora', cedula: 'V-7.654.321', rif: undefined, location: 'Av. Intercomunal, CC Orinoko, Local 35', city: 'Puerto Ordaz', phone: '0286-9123456', email: 'rmora.cardio@yahoo.com', country: 've', isPublicSector: false, createdAt: new Date('2023-04-28') },
  { id: 'c-11', name: 'Policlínica Mérida', cedula: undefined, rif: 'J-31456789-0', location: 'Av. Los Próceres, Edif. Policlínica', city: 'Mérida', phone: '0274-2637890', email: 'gerencia@policlinicamd.com', country: 've', isPublicSector: false, createdAt: new Date('2022-08-30') },
  { id: 'c-12', name: 'Dra. Sofía Blanco', cedula: 'V-20.111.222', rif: undefined, location: 'Clínica Razetti, Piso 2', city: 'Barquisimeto', phone: '0251-4512233', email: 'sblanco@clinicarazetti.com', country: 've', isPublicSector: false, createdAt: new Date('2024-03-10') },
  { id: 'c-13', name: 'Centro de Imágenes del Este', cedula: undefined, rif: 'J-35678901-3', location: 'CC Sambil, Local PB-45', city: 'Caracas', phone: '0212-7634455', email: 'info@cieste.com.ve', country: 've', isPublicSector: false, createdAt: new Date('2023-10-22') },
  { id: 'c-14', name: 'Dr. Jorge Castillo', cedula: 'V-11.222.333', rif: undefined, location: 'Consultorio Médico Baralt, P3', city: 'Maracaibo', phone: '0261-7891234', email: 'jcastillo.ortopedia@gmail.com', country: 've', isPublicSector: false, createdAt: new Date('2024-01-05') },
  { id: 'c-15', name: 'Clínica El Paraíso', cedula: undefined, rif: 'J-38901234-6', location: 'Calle El Paraíso, Qta. Clínica', city: 'Caracas', phone: '0212-4531122', email: 'adm@clinicaelparaiso.com', country: 've', isPublicSector: false, createdAt: new Date('2023-06-18') },
  { id: 'c-16', name: 'Clínica San Fernando', cedula: undefined, rif: undefined, location: 'Vía España, Edificio Médico', city: 'Ciudad de Panamá', phone: '+507-264-1234', email: 'compras@clinicasanfernando.com.pa', country: 'pa', isPublicSector: false, createdAt: new Date('2024-06-01') },
  { id: 'c-17', name: 'Hospital Santo Tomás', cedula: undefined, rif: undefined, location: 'Av. Balboa, Ancón', city: 'Ciudad de Panamá', phone: '+507-207-8100', email: 'compras@hst.gob.pa', country: 'pa', isPublicSector: true, createdAt: new Date('2024-07-15') },
]

let _clients = [...CLIENTS]

export function getClients(): Client[] {
  return _clients
}

export function getClientById(id: string): Client | undefined {
  return _clients.find(c => c.id === id)
}

import { nanoid } from '@/lib/nanoid'

export function addClient(data: Omit<Client, 'id' | 'createdAt'>): Client {
  const client: Client = { ...data, id: `c-${nanoid()}`, createdAt: new Date() }
  _clients.push(client)
  return client
}
