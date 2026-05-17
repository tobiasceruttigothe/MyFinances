import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

const CURRENCIES = ['USD', 'ARS', 'EUR', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'UYU']
const LANGUAGES: Array<[string, string]> = [
  ['es', 'Español'],
  ['en', 'English'],
  ['pt', 'Português'],
]

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
  const logout = useAuthStore((s) => s.logout)
  const toast = useToast()
  const navigate = useNavigate()

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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '·'

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">Perfil</div>
          <h1 className="font-serif font-normal text-[36px] leading-[1.05] tracking-tight mt-1">
            Hola, <em className="text-sepia">{profile?.firstName ?? '…'}.</em>
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="border border-rule rounded-sm px-[18px] py-[11px] text-[13.5px] text-ink hover:bg-sepia-soft transition-colors font-semibold"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-[22px]">
        <aside className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[22px]">
          {isLoading ? (
            <>
              <Skeleton className="w-20 h-20 rounded-full mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-44" />
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-ink text-paper flex items-center justify-center font-serif italic text-[32px] mb-4">
                {initials}
              </div>
              <div className="font-serif text-[22px] tracking-tight">
                {profile?.firstName} {profile?.lastName}
              </div>
              <div className="text-[12.5px] text-sepia mt-0.5">{profile?.email}</div>
              {profile?.username && (
                <div className="font-mono text-[11px] text-sepia mt-1">@{profile.username}</div>
              )}

              <div className="mt-5 pt-4 border-t border-dashed border-rule flex flex-col gap-2.5">
                {[
                  ['Moneda', profile?.currency ?? '—'],
                  ['Zona horaria', profile?.timezone ?? '—'],
                  ['Idioma', LANGUAGES.find(([code]) => code === profile?.language)?.[1] ?? profile?.language ?? '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3">
                    <span className="text-[11.5px] text-sepia tracking-wide">{label}</span>
                    <span className="font-serif italic text-[13px] text-right truncate">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[22px]">
          <h2 className="font-serif italic font-medium text-[19px] mb-5">Información personal</h2>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9" />)}
            </div>
          ) : (
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid grid-cols-2 gap-5">
              <div>
                <Input label="Nombre" {...register('firstName')} />
                {errors.firstName && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <Input label="Apellido" {...register('lastName')} />
                {errors.lastName && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.lastName.message}</p>}
              </div>

              <div className="flex flex-col">
                <span className="text-[10.5px] uppercase tracking-[0.14em] text-sepia font-semibold mb-1.5">Moneda</span>
                <select
                  className="font-serif text-[17px] bg-transparent outline-none px-0 py-1.5 border-b border-rule focus:border-ink transition-colors"
                  {...register('currency')}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <span className="text-[10.5px] uppercase tracking-[0.14em] text-sepia font-semibold mb-1.5">Idioma</span>
                <select
                  className="font-serif text-[17px] bg-transparent outline-none px-0 py-1.5 border-b border-rule focus:border-ink transition-colors"
                  {...register('language')}
                >
                  {LANGUAGES.map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <Input label="Zona horaria" placeholder="ej. America/Argentina/Buenos_Aires" {...register('timezone')} />
                {errors.timezone && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.timezone.message}</p>}
              </div>

              <div className="col-span-2 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="inline-flex items-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13.5px] font-semibold leading-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
                </button>
                {!isDirty && (
                  <p className="font-serif italic text-[12px] text-sepia">Sin cambios pendientes.</p>
                )}
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
