import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/shared/AppLayout'
import { ProtectedRoute, PublicRoute, Loading } from './components'

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
