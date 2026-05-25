import { useState } from 'react'
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'
import type { GeoPoint } from '@/types/field-report'

interface GeoCaptureProps {
  label: string
  value?: GeoPoint
  onCapture: (point: GeoPoint) => void
  className?: string
}

type GeoState = 'idle' | 'loading' | 'captured' | 'error'

export function GeoCapture({ label, value, onCapture, className }: GeoCaptureProps) {
  const [state, setState] = useState<GeoState>(value ? 'captured' : 'idle')
  const [errorMsg, setErrorMsg] = useState('')

  function capture() {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocalización no disponible en este dispositivo')
      setState('error')
      return
    }
    setState('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const point: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: new Date().toISOString(),
        }
        onCapture(point)
        setState('captured')
      },
      err => {
        setErrorMsg(err.message)
        setState('error')
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={state === 'captured' ? 'outline' : 'default'}
          size="sm"
          onClick={capture}
          disabled={state === 'loading'}
        >
          {state === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <MapPin className="h-4 w-4 mr-2" />
          )}
          {state === 'captured' ? 'Actualizar ubicación' : 'Capturar ubicación'}
        </Button>

        {state === 'captured' && value && (
          <div className="flex items-center gap-1 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            <span>{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</span>
          </div>
        )}
        {state === 'error' && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMsg || 'Error al obtener ubicación'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
