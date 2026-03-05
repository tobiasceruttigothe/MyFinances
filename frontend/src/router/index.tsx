import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/components/shared/AppLayout'

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))
const OAuthCallbackPage = lazy(() => import('@/features/auth/OAuthCallbackPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const TransactionsPage = lazy(() => import('@/features/transactions/TransactionsPage'))
const CategoriesPage = lazy(() => import('@/features/categories/CategoriesPage'))
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'))
const InvestmentsPage = lazy(() => import('@/features/investments/InvestmentsPage'))
const GoalsPage = lazy(() => import('@/features/goals/GoalsPage'))
const GoalDetailPage = lazy(() => import('@/features/goals/GoalDetailPage'))
const ProfilePage = lazy(() => import('@/features/auth/ProfilePage'))

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    // OAuth callback — outside PublicRoute/ProtectedRoute so it always renders
    path: '/auth/callback',
    element: <Suspense fallback={<Loading />}><OAuthCallbackPage /></Suspense>,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <Suspense fallback={<Loading />}><LoginPage /></Suspense>,
      },
      {
        path: '/register',
        element: <Suspense fallback={<Loading />}><RegisterPage /></Suspense>,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense>,
          },
          {
            path: '/transactions',
            element: <Suspense fallback={<Loading />}><TransactionsPage /></Suspense>,
          },
          {
            path: '/categories',
            element: <Suspense fallback={<Loading />}><CategoriesPage /></Suspense>,
          },
          {
            path: '/reports',
            element: <Suspense fallback={<Loading />}><ReportsPage /></Suspense>,
          },
          {
            path: '/investments',
            element: <Suspense fallback={<Loading />}><InvestmentsPage /></Suspense>,
          },
          {
            path: '/goals',
            element: <Suspense fallback={<Loading />}><GoalsPage /></Suspense>,
          },
          {
            path: '/goals/:id',
            element: <Suspense fallback={<Loading />}><GoalDetailPage /></Suspense>,
          },
          {
            path: '/profile',
            element: <Suspense fallback={<Loading />}><ProfilePage /></Suspense>,
          },
        ],
      },
    ],
  },
])
