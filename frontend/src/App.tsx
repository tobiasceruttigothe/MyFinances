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
    if (!refreshToken) return

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
