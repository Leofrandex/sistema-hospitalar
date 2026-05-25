import { Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { getEquipmentsForClient } from '@/lib/client-scope'
import { NewServiceRequestForm } from '../components/NewServiceRequestForm'

export default function NuevaSolicitud() {
  const { user } = useAuth()
  const clientId = user?.clientId
  if (!clientId || !user) return null

  const equipments = getEquipmentsForClient(clientId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva solicitud"
        description="Pídenos un servicio para uno de tus equipos"
        icon={Plus}
      />

      {equipments.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No tienes equipos registrados"
          description="Contacta a tu asesor de Hospitalar para registrar tus equipos antes de solicitar servicio."
        />
      ) : (
        <NewServiceRequestForm equipments={equipments} clientId={clientId} userId={user.id} />
      )}
    </div>
  )
}
