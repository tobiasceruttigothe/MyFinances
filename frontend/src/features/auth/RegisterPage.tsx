import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { Input } from '@/components/ui/input'
import { Fini } from '@/components/shared/Fini'

const schema = z.object({
  firstName: z.string().min(1, 'Requerido').max(50),
  lastName: z.string().min(1, 'Requerido').max(50),
  username: z.string().min(3, 'Mínimo 3 caracteres').max(50),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await authApi.register(data)
      const auth = await authApi.login({ email: data.email, password: data.password })
      setTokens(auth.accessToken, auth.refreshToken)
      const profile = await authApi.getProfile()
      setUser(profile)
      navigate('/dashboard')
    } catch {
      setError('root', { message: 'No pudimos crear la cuenta. Quizás el email o usuario ya estén tomados.' })
    }
  }

  return (
    <div className="min-h-screen flex">
      <section className="hidden lg:flex lg:flex-[0.9] flex-col p-16 border-r border-rule">
        <div className="flex items-center gap-3">
          <Fini mood="happy" size={48} coin />
          <div>
            <div className="font-serif font-bold text-[24px] leading-none tracking-tight">
              My-Finances
            </div>
            <div className="text-[11px] tracking-[0.16em] uppercase text-pig-deep mt-1 font-bold">
              con Fini
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Fini mood="neutral" size={140} animated />
          <h1 className="font-serif font-bold text-[44px] leading-[1.08] tracking-tight mt-5 mb-4 max-w-md">
            Adoptá un <em className="text-pig-deep not-italic">chanchito.</em>
          </h1>
          <p className="text-[15px] leading-relaxed text-ink/80 max-w-md font-semibold">
            Fini guarda lo que ganás, vigila lo que gastás y festeja cuando
            ahorrás. Ingresos, gastos, metas e inversiones — todo en un lugar,
            sin planillas ni dolores de cabeza.
          </p>
        </div>
      </section>

      <section className="flex-1 lg:flex-[1.1] flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <Fini mood="happy" size={40} coin />
            <div className="font-serif font-bold text-[21px] leading-none tracking-tight">
              My-Finances
            </div>
          </div>

          <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">Crear cuenta</div>
          <h2 className="font-serif font-normal text-[36px] leading-[1.05] tracking-tight mt-1.5 mb-8">
            Anotate <em className="text-sepia">acá.</em>
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input label="Nombre" placeholder="Juan" autoComplete="given-name" {...register('firstName')} />
                {errors.firstName && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <Input label="Apellido" placeholder="Pérez" autoComplete="family-name" {...register('lastName')} />
                {errors.lastName && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <Input label="Nombre de usuario" placeholder="juanperez" autoComplete="username" {...register('username')} />
              {errors.username && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <Input label="Email" type="email" placeholder="juan@ejemplo.com" autoComplete="email" {...register('email')} />
              {errors.email && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-0 bottom-2 text-sepia hover:text-ink transition-colors"
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {errors.password && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div className="border-l-4 border-l-wine border border-rule bg-paper px-4 py-2.5 rounded-sm">
                <p className="font-serif italic text-[13px] text-ink">{errors.root.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[12px] text-[13.5px] font-semibold leading-none disabled:opacity-50"
            >
              {isSubmitting ? 'Creando cuenta…' : 'Crear mi cuenta →'}
            </button>
          </form>

          <p className="mt-7 text-center font-serif italic text-[14px] text-sepia">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="not-italic underline underline-offset-[3px] hover:text-ink transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
