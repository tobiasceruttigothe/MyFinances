import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-paper">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink" />
    </div>
  )
}
