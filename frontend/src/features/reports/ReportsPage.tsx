import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2 } from 'lucide-react'
import { reportsApi } from '@/api/reports'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercent } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { cn } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user)
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)

  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: () => reportsApi.getMonthlySummary(year, month),
  })

  const { data: comparison } = useQuery({
    queryKey: ['reports', 'monthly-comparison', 6],
    queryFn: () => reportsApi.getMonthlyComparison(6),
  })

  const { data: allExpenses } = useQuery({
    queryKey: ['reports', 'all-by-category', 'expenses'],
    queryFn: reportsApi.getAllExpensesByCategory,
  })

  const comparisonChartData = comparison?.map((m) => ({
    name: m.monthName.slice(0, 3),
    Ingresos: m.totalIncome,
    Gastos: m.totalExpense,
  })) ?? []

  const expensePieData = monthly?.expensesByCategory.slice(0, 7).map((c) => ({
    name: c.categoryName,
    value: c.totalAmount,
    pct: c.percentage,
  })) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500 text-sm mt-0.5">Analizá tu comportamiento financiero</p>
      </div>

      {/* Month selector */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Mes</label>
            <select
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Año</label>
            <select
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-400 ml-auto">
            {MONTHS[month - 1]} {year}
          </p>
        </CardContent>
      </Card>

      {/* Monthly KPIs */}
      {loadingMonthly ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : monthly ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-emerald-600 mb-1 font-medium">Ingresos</p>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(monthly.totalIncome, user?.currency)}</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-red-600 mb-1 font-medium">Gastos</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(monthly.totalExpense, user?.currency)}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1 font-medium">Balance</p>
              <p className={cn('text-xl font-bold', monthly.balance >= 0 ? 'text-gray-900' : 'text-red-500')}>
                {formatCurrency(monthly.balance, user?.currency)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-blue-600 mb-1 font-medium">Tasa de ahorro</p>
              <p className="text-xl font-bold text-blue-700">{formatPercent(monthly.savingsRate)}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* 6-month bar chart */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">Ingresos vs Gastos (últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          {comparisonChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparisonChartData} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => formatCurrency(v as number, user?.currency)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart2 className="w-10 h-10 text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Sin datos disponibles aún</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900">Gastos por categoría este mes</CardTitle>
          </CardHeader>
          <CardContent>
            {expensePieData.length > 0 ? (
              <div className="flex gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={expensePieData} cx="50%" cy="50%" outerRadius={72} dataKey="value" paddingAngle={2}>
                      {expensePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(v as number, user?.currency)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {expensePieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600 truncate max-w-[100px]">{d.name}</span>
                      </div>
                      <span className="text-gray-500 font-medium">{formatPercent(d.pct)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-gray-400">Sin gastos este mes</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900">Desglose histórico de gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {allExpenses && allExpenses.categories.length > 0 ? (
              <div className="space-y-3.5">
                {allExpenses.categories.slice(0, 6).map((c) => (
                  <div key={c.categoryId}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-700 font-medium">{c.categoryName}</span>
                      <span className="text-gray-500">
                        {formatCurrency(c.totalAmount, user?.currency)} · {formatPercent(c.percentage)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                  Total histórico: <span className="font-semibold text-gray-600">{formatCurrency(allExpenses.grandTotal, user?.currency)}</span>
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-gray-400">Sin datos históricos todavía</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
