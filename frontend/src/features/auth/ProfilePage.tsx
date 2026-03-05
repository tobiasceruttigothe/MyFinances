import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Mail, Globe, Settings } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const CURRENCIES = ['USD', 'ARS', 'EUR', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'UYU']

const schema = z.object({
  firstName: z.string().min(1, 'Requerido').max(50),
  lastName: z.string().min(1, 'Requerido').max(50),
  currency: z.string().min(3).max(3),
  timezone: z.string().min(1),
  language: z.string().min(2).max(5),
})
type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  const toast = useToast()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          currency: profile.currency,
          timezone: profile.timezone,
          language: profile.language,
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => authApi.updateProfile(data),
    onSuccess: (updated) => {
      setUser(updated)
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Perfil actualizado correctamente')
    },
    onError: () => toast.error('Error al actualizar el perfil'),
  })

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-0.5">Administrá tu información personal y preferencias</p>
      </div>

      {/* Avatar + info header */}
      {isLoading ? (
        <div className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              {profile?.firstName} {profile?.lastName}
            </p>
            <div className="flex items-center gap-1.5 text-blue-200 text-sm mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {profile?.email}
            </div>
            <div className="flex items-center gap-1.5 text-blue-200 text-xs mt-1">
              <User className="w-3 h-3" />
              @{profile?.username}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            Información personal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9" />)}
            </div>
          ) : (
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium">Nombre</Label>
                  <Input className="bg-white border-gray-200" {...register('firstName')} />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-medium">Apellido</Label>
                  <Input className="bg-white border-gray-200" {...register('lastName')} />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  Moneda
                </Label>
                <select
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  {...register('currency')}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.currency && <p className="text-xs text-red-500">{errors.currency.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-gray-400" />
                  Zona horaria
                </Label>
                <Input
                  className="bg-white border-gray-200"
                  placeholder="ej. America/Argentina/Buenos_Aires"
                  {...register('timezone')}
                />
                {errors.timezone && <p className="text-xs text-red-500">{errors.timezone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium">Idioma</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                  {...register('language')}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
                </Button>
                {!isDirty && (
                  <p className="text-xs text-gray-400">Sin cambios pendientes</p>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
