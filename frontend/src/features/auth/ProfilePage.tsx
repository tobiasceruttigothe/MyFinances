import { useState } from 'react'
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
import { FiniSays } from '@/components/shared/Fini'
import type { UserProfile } from '@/types/auth'

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

      <WhatsAppSection profile={profile} />
    </div>
  )
}

/**
 * Vínculo del teléfono con WhatsApp — habilita cargar transacciones
 * mandándole un texto o audio a Fini. Flujo: pedir código → confirmarlo.
 */
function WhatsAppSection({ profile }: { profile?: UserProfile }) {
  const qc = useQueryClient()
  const toast = useToast()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'idle' | 'code'>('idle')
  const [changing, setChanging] = useState(false)

  const requestCode = useMutation({
    mutationFn: () => authApi.requestPhoneVerification(phone.trim()),
    onSuccess: () => {
      setStep('code')
      toast.success('Te mandamos un código por WhatsApp')
    },
    onError: () => toast.error('No pudimos enviar el código. Revisá el formato: +5493511234567'),
  })

  const confirmCode = useMutation({
    mutationFn: () => authApi.confirmPhoneVerification(code.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      setStep('idle')
      setChanging(false)
      setPhone('')
      setCode('')
      toast.success('¡Listo! WhatsApp conectado — mandale un audio a Fini cuando quieras')
    },
    onError: () => toast.error('Código incorrecto o vencido. Pedí uno nuevo.'),
  })

  const verified = Boolean(profile?.phoneVerified && profile?.phone) && !changing

  return (
    <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[22px]">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif font-bold text-[19px]">WhatsApp con Fini</h2>
        {verified && (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sage bg-sage-soft rounded-pill px-3 py-1">
            ● Conectado
          </span>
        )}
      </div>

      {verified ? (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <FiniSays mood="party" size={60} animated={false}>
            Estamos conectados en <strong className="font-mono">{profile?.phone}</strong>.
            Mandame «gasté 5000 en el súper» o un audio, y yo lo anoto.
          </FiniSays>
          <button
            onClick={() => {
              setStep('idle')
              setChanging(true)
            }}
            className="text-[12.5px] text-sepia underline underline-offset-[3px] hover:text-ink transition-colors"
          >
            Cambiar número
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <FiniSays mood="neutral" size={60} animated={false}>
            Conectá tu número y cargá gastos sin abrir la app: me escribís o me
            mandás un audio por WhatsApp y yo me encargo del resto.
          </FiniSays>

          {step === 'idle' ? (
            <form
              className="flex items-end gap-3 max-w-md"
              onSubmit={(e) => {
                e.preventDefault()
                requestCode.mutate()
              }}
            >
              <div className="flex-1">
                <Input
                  label="Tu número (formato internacional)"
                  placeholder="+5493511234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={requestCode.isPending || phone.trim().length < 8}
                className="bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13px] font-bold leading-none disabled:opacity-50 hover:bg-pig-deep transition-colors"
              >
                {requestCode.isPending ? 'Enviando…' : 'Mandame el código'}
              </button>
            </form>
          ) : (
            <form
              className="flex items-end gap-3 max-w-md"
              onSubmit={(e) => {
                e.preventDefault()
                confirmCode.mutate()
              }}
            >
              <div className="flex-1">
                <Input
                  label="Código que te llegó por WhatsApp"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={confirmCode.isPending || code.trim().length < 4}
                className="bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13px] font-bold leading-none disabled:opacity-50 hover:bg-pig-deep transition-colors"
              >
                {confirmCode.isPending ? 'Verificando…' : 'Confirmar'}
              </button>
              <button
                type="button"
                onClick={() => setStep('idle')}
                className="text-[12.5px] text-sepia underline underline-offset-[3px] hover:text-ink transition-colors pb-3"
              >
                Cambiar número
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  )
}
