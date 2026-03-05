import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Wallet, Activity, ArrowRight, Target, ArrowLeftRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { transactionsApi } from '@/api/transactions'
import { reportsApi } from '@/api/reports'
import { goalsApi } from '@/api/goals'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton, TableRowSkeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, currentYearMonth } from '@/lib/utils'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface SummaryCardProps {
  title: string
  value: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  highlight?: boolean
}

function SummaryCard({ title, value, icon: Icon, iconColor, iconBg, highlight }: SummaryCardProps) {
  return (
    <Card className={cn('border-gray-100 shadow-sm', highlight && 'border-blue-200 bg-gradient-to-br from-blue-600 to-blue-700')}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={cn('text-sm font-medium', highlight ? 'text-blue-200' : 'text-gray-500')}>
          {title}
        </CardTitle>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', highlight ? 'bg-white/20' : iconBg)}>
          <Icon className={cn('w-4 h-4', highlight ? 'text-white' : iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn('text-2xl font-bold', highlight ? 'text-white' : 'text-gray-900')}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { year, month } = currentYearMonth()

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['account', 'summary'],
    queryFn: transactionsApi.getAccountSummary,
  })

  const { data: monthly } = useQuery({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: () => reportsApi.getMonthlySummary(year, month),
  })

  const { data: recent, isLoading: loadingRecent } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: transactionsApi.getRecent,
  })

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.getAll,
  })

  const inProgressGoals = goals?.filter((g) => g.status === 'IN_PROGRESS').slice(0, 3) ?? []

  const pieData =
    monthly?.expensesByCategory
      .slice(0, 6)
      .map((c) => ({ name: c.categoryName, value: c.totalAmount })) ?? []

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {user?.firstName ?? 'allí'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Acá está tu resumen financiero actualizado</p>
      </div>

      {/* Summary cards */}
      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            title="Balance de cuenta"
            value={formatCurrency(summary?.accountBalance ?? 0, user?.currency)}
            icon={Wallet}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <SummaryCard
            title="Inversiones"
            value={formatCurrency(summary?.investments ?? 0, user?.currency)}
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <SummaryCard
            title="Patrimonio neto"
            value={formatCurrency(summary?.netWorth ?? 0, user?.currency)}
            icon={Activity}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
            highlight
          />
        </div>
      )}

      {/* Monthly stats + pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Este mes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Ingresos</span>
              </div>
              <span className="font-bold text-emerald-700">{formatCurrency(monthly?.totalIncome ?? 0, user?.currency)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">Gastos</span>
              </div>
              <span className="font-bold text-red-600">{formatCurrency(monthly?.totalExpense ?? 0, user?.currency)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Balance neto</span>
              <span className={cn('text-base font-bold', (monthly?.balance ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {formatCurrency(monthly?.balance ?? 0, user?.currency)}
              </span>
            </div>
            {monthly && (
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Tasa de ahorro</span>
                <span className="font-medium text-gray-600">{monthly.savingsRate.toFixed(1)}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Gastos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(v as number, user?.currency)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="truncate text-gray-600 flex-1">{d.name}</span>
                      <span className="text-gray-400 font-medium">{formatCurrency(d.value, user?.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Sin gastos este mes</p>
                <Link to="/transactions" className="mt-2 text-xs text-blue-500 hover:underline flex items-center gap-1">
                  Registrar transacción <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions + goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Transacciones recientes</CardTitle>
            <Link to="/transactions" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-0.5 font-medium">
              Ver todo <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {loadingRecent ? (
              <div className="divide-y divide-gray-50">
                {[...Array(4)].map((_, i) => <TableRowSkeleton key={i} />)}
              </div>
            ) : recent && recent.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recent.slice(0, 6).map((t) => (
                  <div key={t.id} className="flex items-center px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3"
                      style={{ backgroundColor: t.type === 'INCOME' ? '#d1fae5' : '#fee2e2' }}
                    >
                      {t.type === 'INCOME'
                        ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                    </div>
                    <span className={cn('text-sm font-bold ml-3', t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500')}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ArrowLeftRight className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Sin transacciones aún</p>
                <Link to="/transactions" className="mt-2 text-xs text-blue-500 hover:underline flex items-center gap-1">
                  Crear primera <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Metas en progreso</CardTitle>
            <Link to="/goals" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-0.5 font-medium">
              Ver todo <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {inProgressGoals.length > 0 ? (
              <div className="space-y-5">
                {inProgressGoals.map((g) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        <span>{g.icon ?? '🎯'}</span>
                        {g.name}
                      </span>
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {g.progressPercentage.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-gray-400">{formatCurrency(g.currentAmount, user?.currency)}</span>
                      <span className="text-xs text-gray-400">{formatCurrency(g.targetAmount, user?.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Target className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Sin metas activas</p>
                <Link to="/goals" className="mt-2 text-xs text-blue-500 hover:underline flex items-center gap-1">
                  Crear meta <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
