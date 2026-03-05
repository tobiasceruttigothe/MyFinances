import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8082'
const REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? 'myfinances-realm'
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'myfinances-app'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const returnedState = params.get('state')
    const errorParam = params.get('error')

    if (errorParam) {
      setError('Autenticación cancelada o rechazada por Google.')
      return
    }

    const storedState = sessionStorage.getItem('oauth_state')
    const codeVerifier = sessionStorage.getItem('oauth_code_verifier')

    if (!code || !storedState || returnedState !== storedState || !codeVerifier) {
      setError('Estado de autenticación inválido o expirado. Por favor intentá de nuevo.')
      return
    }

    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_code_verifier')

    handleCallback(code, codeVerifier)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCallback(code: string, codeVerifier: string) {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`

      // 1. Exchange authorization code for tokens
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

      // 2. Store access token so apiClient can use it immediately
      setTokens(tokens.access_token, tokens.refresh_token)

      // 3. Decode JWT to extract user claims (no verification needed — gateway already does it)
      const [, payloadB64] = tokens.access_token.split('.')
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))

      // 4. Ensure user exists in our DB (idempotent — safe to call on every login)
      await authApi.socialRegister({
        email: payload.email ?? '',
        firstName: payload.given_name ?? '',
        lastName: payload.family_name ?? '',
      })

      // 5. Fetch full profile and store in auth state
      const profile = await authApi.getProfile()
      setUser(profile)

      navigate('/dashboard', { replace: true })
    } catch {
      setError('Ocurrió un error al completar la autenticación. Por favor intentá de nuevo.')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-sm">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <span className="text-red-600 text-xl">✕</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error de autenticación</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-5">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-sm text-gray-500 font-medium">Completando autenticación con Google…</p>
      </div>
    </div>
  )
}
