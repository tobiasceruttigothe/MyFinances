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
import { generateCodeVerifier, generateCodeChallenge, generateState, buildKeycloakAuthUrl } from '@/lib/pkce'

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8082'
const REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? 'myfinances-realm'
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'myfinances-app'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function loginWithGoogle() {
    setGoogleLoading(true)
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    const state = generateState()

    sessionStorage.setItem('oauth_code_verifier', verifier)
    sessionStorage.setItem('oauth_state', state)

    window.location.href = buildKeycloakAuthUrl({
      keycloakUrl: KEYCLOAK_URL,
      realm: REALM,
      clientId: CLIENT_ID,
      redirectUri: `${window.location.origin}/auth/callback`,
      state,
      codeChallenge: challenge,
      idpHint: 'google',
    })
  }

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      const auth = await authApi.login(data)
      setTokens(auth.accessToken, auth.refreshToken)
      const profile = await authApi.getProfile()
      setUser(profile)
      navigate('/dashboard')
    } catch {
      setError('root', { message: 'Email o contraseña incorrectos.' })
    }
  }

  return (
    <div className="min-h-screen flex">
      <section className="hidden lg:flex lg:flex-[1.05] flex-col p-16 border-r border-rule">
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
          <Fini mood="party" size={150} animated />
          <h1 className="font-serif font-bold text-[44px] leading-[1.08] tracking-tight mt-5 mb-4 max-w-md">
            Tus cuentas, <em className="text-pig-deep not-italic">sin drama.</em>
          </h1>
          <p className="text-[15px] leading-relaxed text-ink/80 max-w-md font-semibold">
            Anotá un gasto en dos toques, o directamente mandale un audio a
            Fini por WhatsApp: «gasté 5 lucas en el súper» — y listo, queda
            guardado. Llevar las cuentas no tiene por qué ser un trabajo.
          </p>
        </div>
      </section>

      <section className="flex-1 lg:flex-[0.95] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <Fini mood="happy" size={40} coin />
            <div className="font-serif font-bold text-[21px] leading-none tracking-tight">
              My-Finances
            </div>
          </div>

          <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">Acceder</div>
          <h2 className="font-serif font-bold text-[34px] leading-[1.05] tracking-tight mt-1.5 mb-8">
            ¡Hola de nuevo! <span className="text-pig-deep">Fini te esperaba.</span>
          </h2>

          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-rule rounded-sm px-4 py-3 font-serif text-[14px] hover:bg-sepia-soft transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
          </button>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-rule" />
            <span className="font-serif italic text-[11.5px] text-sepia">o con tu email</span>
            <div className="flex-1 h-px bg-rule" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input label="Email" type="email" placeholder="tu@email.com" autoComplete="email" {...register('email')} />
              {errors.email && <p className="font-serif italic text-[12px] text-wine mt-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
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
              {isSubmitting ? 'Ingresando…' : 'Entrar →'}
            </button>
          </form>

          <p className="mt-7 text-center text-[14px] text-sepia font-semibold">
            ¿Todavía sin cuenta?{' '}
            <Link to="/register" className="underline underline-offset-[3px] hover:text-ink transition-colors">
              Sumate gratis
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
