import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { ToastProvider } from '@/components/ui/toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
})

function SessionRestorer() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken')
    // Defensive: treat the literal strings "undefined"/"null" as absent. They
    // can be left over from the pre-c0b2e94 bug where setItem coerced an
    // undefined value into a string. Self-heal by removing the poisoned entry
    // so the next login starts from a clean slate.
    if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
      if (refreshToken) localStorage.removeItem('refreshToken')
      return
    }

    authApi
      .refreshToken(refreshToken)
      .then((data) => {
        setTokens(data.accessToken, data.refreshToken)
        return authApi.getProfile()
      })
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem('refreshToken')
      })
  }, [setTokens, setUser])

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SessionRestorer />
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  )
}
