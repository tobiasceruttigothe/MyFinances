import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8082'
const REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? 'myfinances-realm'
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'myfinances-app'

type InitialState =
  | { kind: 'error'; message: string }
  | { kind: 'ready'; code: string; codeVerifier: string }

function readInitialState(): InitialState {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const returnedState = params.get('state')
  const errorParam = params.get('error')

  if (errorParam) {
    return { kind: 'error', message: 'Autenticación cancelada o rechazada por Google.' }
  }

  const storedState = sessionStorage.getItem('oauth_state')
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier')

  if (!code || !storedState || returnedState !== storedState || !codeVerifier) {
    return { kind: 'error', message: 'Estado de autenticación inválido o expirado. Por favor intentá de nuevo.' }
  }

  return { kind: 'ready', code, codeVerifier }
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const [initial] = useState(readInitialState)
  const [asyncError, setAsyncError] = useState<string | null>(null)

  const error = initial.kind === 'error' ? initial.message : asyncError

  useEffect(() => {
    if (initial.kind === 'error') return

    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_code_verifier')

    const { code, codeVerifier } = initial

    const run = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/callback`

        // Token exchange goes directly to Keycloak, so the response is OAuth2
        // snake_case (access_token / refresh_token). Our /api/v1/users/refresh-token
        // wraps the same Keycloak response in a camelCase DTO; this path bypasses it.
        const tokenRes = await fetch(
          `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: CLIENT_ID,
              code,
              redirect_uri: redirectUri,
              code_verifier: codeVerifier,
            }),
          }
        )

        if (!tokenRes.ok) {
          throw new Error(`Token exchange failed: ${tokenRes.status}`)
        }

        const tokens = await tokenRes.json()
        setTokens(tokens.access_token, tokens.refresh_token)

        const [, payloadB64] = tokens.access_token.split('.')
        const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))

        await authApi.socialRegister({
          email: payload.email ?? '',
          firstName: payload.given_name ?? '',
          lastName: payload.family_name ?? '',
        })

        const profile = await authApi.getProfile()
        setUser(profile)

        navigate('/dashboard', { replace: true })
      } catch {
        setAsyncError('Ocurrió un error al completar la autenticación. Por favor intentá de nuevo.')
      }
    }

    void run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center max-w-md">
          <div className="text-[11px] tracking-[0.2em] uppercase text-wine font-semibold">
            Autenticación · Error
          </div>
          <h1 className="font-serif font-normal text-[36px] leading-tight tracking-tight mt-3">
            Algo salió mal<span className="text-wine">.</span>
          </h1>
          <p className="font-serif italic text-[15px] text-sepia mt-4 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-8 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13px] font-medium tracking-wide hover:bg-ink/90 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center max-w-md">
        <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">
          Autenticación · Google
        </div>
        <h1 className="font-serif font-normal text-[36px] leading-tight tracking-tight mt-3">
          Completando tu sesión<span className="text-wine">.</span>
        </h1>
        <p className="font-serif italic text-[15px] text-sepia mt-4 leading-relaxed">
          Un momento mientras armamos tu cuaderno.
        </p>
        <div className="mt-8 inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-ink" />
      </div>
    </div>
  )
}
