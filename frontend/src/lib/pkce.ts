// PKCE (Proof Key for Code Exchange) helpers for OAuth 2.0 Authorization Code flow.
// Reference: https://datatracker.ietf.org/doc/html/rfc7636

function randomBase64Url(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function generateCodeVerifier(): string {
  // Between 43 and 128 chars per spec
  return randomBase64Url(64)
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function generateState(): string {
  return randomBase64Url(24)
}

export function buildKeycloakAuthUrl(params: {
  keycloakUrl: string
  realm: string
  clientId: string
  redirectUri: string
  state: string
  codeChallenge: string
  idpHint?: string
}): string {
  const query = new URLSearchParams({
    client_id: params.clientId,
    response_type: 'code',
    scope: 'openid profile email',
    redirect_uri: params.redirectUri,
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
    ...(params.idpHint ? { kc_idp_hint: params.idpHint } : {}),
  })
  return `${params.keycloakUrl}/realms/${params.realm}/protocol/openid-connect/auth?${query}`
}
