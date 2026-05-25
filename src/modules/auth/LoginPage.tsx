import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { login, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string>()

  if (user) {
    navigate(user.role === 'cliente' ? '/portal' : '/modulos', { replace: true })
    return null
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormValues) {
    setServerError(undefined)
    const result = await login(data.email, data.password)
    if (result.ok) {
      const stored = sessionStorage.getItem('hospitalar-user')
      const loggedUser = stored ? JSON.parse(stored) : null
      navigate(loggedUser?.role === 'cliente' ? '/portal' : '/modulos', { replace: true })
    } else {
      setServerError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <p className="font-semibold text-lg leading-none">Hospitalar</p>
            <p className="text-white/60 text-sm">Equipos Médicos</p>
          </div>
        </div>

        <div>
          <blockquote className="text-2xl font-light leading-relaxed mb-6 text-white/90">
            "Centralizando los procesos de Hospitalar para que cada equipo tenga la visibilidad que merece."
          </blockquote>
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-semibold">40+</p>
              <p className="text-white/60 text-sm">años en el mercado</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">3</p>
              <p className="text-white/60 text-sm">departamentos conectados</p>
            </div>
          </div>
        </div>

        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} Hospitalar Venezuela. Todos los derechos reservados.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <div>
              <p className="font-semibold leading-none">Hospitalar</p>
              <p className="text-muted-foreground text-xs">Sistema Interno</p>
            </div>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="px-0 lg:px-6">
              <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@hospitalarve.com"
                    autoComplete="email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {serverError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                    <p className="text-sm text-destructive">{serverError}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Ingresar
                </Button>
              </form>

              <div className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Credenciales de prueba</p>
                <p>Email: <span className="font-mono">demo@hospitalarve.com</span></p>
                <p>Contraseña: <span className="font-mono">demo123</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
