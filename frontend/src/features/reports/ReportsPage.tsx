import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports'
import { useAuthStore } from '@/stores/authStore'
import { CardSkeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import {
  CHART_COLORS, CHART_RULE, CHART_SAGE, CHART_WINE,
  CHART_TICK_STYLE, CHART_GRID_PROPS, CHART_TOOLTIP_STYLE,
} from '@/lib/chart-colors'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

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
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">Reportes</div>
          <h1 className="font-serif font-normal text-[36px] leading-[1.05] tracking-tight mt-1">
            {MONTHS[month - 1]} <em className="text-sepia">en revisión.</em>
          </h1>
        </div>
        <div className="flex items-baseline gap-3">
          <select
            className="font-serif text-[15px] bg-transparent outline-none border-b border-rule focus:border-ink transition-colors py-1 pr-2"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Mes"
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            className="font-mono text-[14px] bg-transparent outline-none border-b border-rule focus:border-ink transition-colors py-1 pr-2"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Año"
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loadingMonthly ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : monthly ? (
        <div className="grid grid-cols-2 md:grid-cols-4 border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] overflow-hidden">
          <KpiCell label="Ingresos" value={formatCurrency(monthly.totalIncome, user?.currency)} tone="sage" />
          <KpiCell label="Gastos" value={formatCurrency(monthly.totalExpense, user?.currency)} tone="wine" withLeftRule />
          <KpiCell
            label="Balance"
            value={formatCurrency(monthly.balance, user?.currency)}
            tone={monthly.balance >= 0 ? 'ink' : 'wine'}
            withLeftRule
          />
          <KpiCell
            label="Tasa de ahorro"
            value={formatPercent(monthly.savingsRate)}
            tone="gold"
            withLeftRule
          />
        </div>
      ) : null}

      <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[18px_22px]">
        <SectionTitle title="Ingresos vs gastos · seis meses" />
        {comparisonChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparisonChartData} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
              <CartesianGrid {...CHART_GRID_PROPS} />
              <XAxis dataKey="name" tick={CHART_TICK_STYLE} axisLine={{ stroke: CHART_RULE }} tickLine={false} />
              <YAxis
                tick={CHART_TICK_STYLE}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => formatCurrency(v as number, user?.currency)}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Newsreader, serif', fontStyle: 'italic' }} />
              <Bar dataKey="Ingresos" fill={CHART_SAGE} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Gastos" fill={CHART_WINE} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="font-serif italic text-sepia text-[15px] py-8 text-center">
            Sin datos del semestre todavía.
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
        <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[18px_22px]">
          <SectionTitle title="Composición del gasto" right={MONTHS[month - 1]?.toUpperCase()} />
          {expensePieData.length > 0 ? (
            <div className="flex gap-5 items-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={expensePieData} cx="50%" cy="50%" outerRadius={72} dataKey="value" paddingAngle={2}>
                    {expensePieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(v as number, user?.currency)}
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {expensePieData.map((d, i) => (
                  <div key={d.name} className="grid grid-cols-[14px_1fr_50px] gap-2 items-center">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="font-serif text-[13px] truncate">{d.name}</span>
                    <span className="font-mono text-[11.5px] text-sepia text-right">{formatPercent(d.pct)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="font-serif italic text-sepia text-[15px] py-8 text-center">
              Sin gastos este mes.
            </p>
          )}
        </section>

        <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[18px_22px]">
          <SectionTitle title="Desglose histórico" />
          {allExpenses && allExpenses.categories.length > 0 ? (
            <div className="space-y-3">
              {allExpenses.categories.slice(0, 6).map((c, i) => (
                <div key={c.categoryId}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-serif text-[14px]">{c.categoryName}</span>
                    <span className="font-mono text-[11.5px] text-sepia">
                      {formatCurrency(c.totalAmount, user?.currency)} · {formatPercent(c.percentage)}
                    </span>
                  </div>
                  <div className="h-1 bg-sepia-soft rounded-pill overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${c.percentage}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-baseline justify-between border-t border-dashed border-rule pt-3 mt-3">
                <span className="text-[11px] uppercase tracking-[0.14em] text-sepia">Total histórico</span>
                <span className="font-serif italic text-[16px]">
                  {formatCurrency(allExpenses.grandTotal, user?.currency)}
                </span>
              </div>
            </div>
          ) : (
            <p className="font-serif italic text-sepia text-[15px] py-8 text-center">
              Aún no hay historia que contar.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

const TONE: Record<string, string> = {
  sage: 'text-sage',
  wine: 'text-wine',
  ink:  'text-ink',
  gold: 'text-gold',
}

function KpiCell({
  label, value, tone = 'ink', withLeftRule,
}: {
  label: string
  value: string
  tone?: 'sage' | 'wine' | 'ink' | 'gold'
  withLeftRule?: boolean
}) {
  return (
    <div className={cn('p-[18px_22px]', withLeftRule && 'md:border-l border-rule')}>
      <div className="text-[11px] tracking-[0.18em] uppercase text-sepia font-semibold">{label}</div>
      <div className={cn('font-serif font-normal text-[26px] mt-1.5 leading-none tracking-tight', TONE[tone])}>
        {value}
      </div>
    </div>
  )
}

function SectionTitle({ title, right }: { title: string; right?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3.5">
      <h2 className="font-serif italic font-medium text-[19px]">{title}</h2>
      {right && <span className="text-[11px] tracking-[0.14em] uppercase text-sepia">{right}</span>}
    </div>
  )
}
