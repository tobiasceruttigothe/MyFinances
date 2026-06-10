import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { transactionsApi } from '@/api/transactions'
import { reportsApi } from '@/api/reports'
import { goalsApi } from '@/api/goals'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { CardSkeleton, TableRowSkeleton } from '@/components/ui/skeleton'
import { Fini, FiniSays, type FiniMood } from '@/components/shared/Fini'
import { CHART_COLORS } from '@/lib/chart-colors'
import { formatCurrency, currentYearMonth, cn } from '@/lib/utils'

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function fullDateLabel(d = new Date()) {
  return `${WEEKDAYS[d.getDay()]} · ${d.getDate()} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

function shortDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()].slice(0, 3)}`
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return '¡Buen día'
  if (h < 18) return '¡Buenas tardes'
  return '¡Buenas noches'
}

/* Fini reacciona al mes: festeja si ahorraste fuerte, se preocupa si el
   balance es negativo. */
function finiState(net: number, savingsRate: number, hasData: boolean): { mood: FiniMood; says: string } {
  if (!hasData) return { mood: 'sleepy', says: 'Mes nuevo, panza vacía. Contame qué gastaste y arrancamos.' }
  if (net < 0) return { mood: 'worried', says: 'Ojo: este mes salió más plata de la que entró. Revisemos dónde se fue.' }
  if (savingsRate >= 20) return { mood: 'party', says: `¡Mes a puro ahorro! Guardaste el ${savingsRate.toFixed(0)} % de lo que entró. 🎉` }
  return { mood: 'happy', says: 'Vas bien: entra más de lo que sale. Sigamos así.' }
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

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
  })

  const inProgressGoals = goals?.filter((g) => g.status === 'IN_PROGRESS').slice(0, 3) ?? []
  const topCategories = monthly?.expensesByCategory.slice(0, 6) ?? []
  const maxCategory = topCategories[0]?.totalAmount ?? 1

  const income = monthly?.totalIncome ?? 0
  const expense = monthly?.totalExpense ?? 0
  const maxBar = Math.max(income, expense, 1)
  const net = monthly?.balance ?? 0
  const hasMonthData = income > 0 || expense > 0
  const fini = finiState(net, monthly?.savingsRate ?? 0, hasMonthData)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Fini mood={fini.mood} size={84} animated />
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-sepia font-semibold">
              {fullDateLabel()}
            </div>
            <h1 className="font-serif font-bold text-[38px] leading-[1.05] tracking-tight mt-1">
              {greeting()}, <span className="text-pig-deep">{user?.firstName ?? 'vos'}!</span>
            </h1>
            <p className="text-[13.5px] text-sepia font-semibold mt-1">{fini.says}</p>
          </div>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 bg-ink text-paper rounded-pill px-[18px] py-[11px] text-[13.5px] font-bold leading-none hover:bg-pig-deep transition-colors"
        >
          <span className="text-base leading-none">+</span> Anotar un gasto
        </Link>
      </div>

      {profile && !profile.phoneVerified && (
        <div className="border-2 border-dashed border-pig rounded-md bg-pig-soft p-4 flex items-center justify-between gap-4 flex-wrap">
          <FiniSays mood="neutral" size={56} animated={false}>
            ¿Sabías que me podés mandar un audio por WhatsApp? «Gasté 8 lucas en la
            verdulería» y yo lo anoto solo. Conectá tu número y probalo.
          </FiniSays>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 bg-pig-deep text-white rounded-pill px-[18px] py-[11px] text-[13.5px] font-bold leading-none hover:bg-ink transition-colors"
          >
            Conectar WhatsApp →
          </Link>
        </div>
      )}

      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1.2fr] border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] overflow-hidden">
          <StatCell
            label="En cuenta"
            value={formatCurrency(summary?.accountBalance ?? 0, user?.currency)}
          />
          <StatCell
            label="Invertido"
            value={formatCurrency(summary?.investments ?? 0, user?.currency)}
            withLeftRule
          />
          <StatCell
            label="Patrimonio neto"
            value={formatCurrency(summary?.netWorth ?? 0, user?.currency)}
            primary
            withLeftRule
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
        <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[18px_22px]">
          <SectionTitle title="Mes en curso" right={MONTHS[month - 1]?.toUpperCase()} />

          <div className="flex flex-col gap-2.5">
            <BarRow label="Ingresos" amount={income} max={maxBar} tone="sage" currency={user?.currency} />
            <BarRow label="Gastos" amount={expense} max={maxBar} tone="wine" currency={user?.currency} />
          </div>

          <div className="border-t border-dashed border-rule mt-3.5 pt-3 flex items-baseline justify-between">
            <span className="text-[12.5px] text-sepia font-semibold tracking-wide">Balance neto</span>
            <span className={cn('font-serif text-[24px]', net >= 0 ? 'text-sage' : 'text-wine')}>
              {net >= 0 ? '+ ' : '− '}
              {formatCurrency(Math.abs(net), user?.currency)}
            </span>
          </div>
          {monthly && (
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-[11px] text-sepia tracking-wide">Tasa de ahorro</span>
              <span className="font-serif italic text-[11.5px]">{monthly.savingsRate.toFixed(0)} %</span>
            </div>
          )}
        </section>

        <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[18px_22px]">
          <SectionTitle title="Dónde se fue" right="TOP 6" />

          {topCategories.length > 0 ? (
            <div className="flex flex-col gap-2">
              {topCategories.map((c, i) => {
                const pct = (c.totalAmount / maxCategory) * 100
                return (
                  <div
                    key={c.categoryName}
                    className="grid grid-cols-[110px_1fr_86px] gap-3 items-center"
                  >
                    <span className="font-serif text-[13px] truncate">{c.categoryName}</span>
                    <div className="h-2 bg-sepia-soft rounded-pill overflow-hidden">
                      <div
                        className="h-full rounded-pill"
                        style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                    <span className="font-mono text-[12.5px] text-right text-ink">
                      {formatCurrency(c.totalAmount, user?.currency)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-4">
              <FiniSays mood="sleepy" size={60}>
                Sin gastos este mes. O sos un genio del ahorro… o te olvidaste de anotar. 😉
              </FiniSays>
            </div>
          )}
        </section>
      </div>

      <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px]">
        <div className="flex items-baseline justify-between px-[22px] py-3.5 border-b border-rule">
          <h2 className="font-serif italic font-medium text-[19px]">Movimientos recientes</h2>
          <Link to="/transactions" className="text-[11.5px] text-sepia underline underline-offset-[3px] hover:text-ink transition-colors">
            Ver todo →
          </Link>
        </div>
        <div>
          {loadingRecent ? (
            <>{[...Array(4)].map((_, i) => <TableRowSkeleton key={i} />)}</>
          ) : recent && recent.length > 0 ? (
            recent.slice(0, 6).map((t, i, arr) => (
              <div
                key={t.id}
                className={cn(
                  'grid grid-cols-[110px_1fr_140px_130px] gap-4 items-center px-[22px] py-3',
                  i < arr.length - 1 && 'border-b border-rule-soft',
                )}
              >
                <span className="font-mono text-[11.5px] text-sepia">{shortDate(t.date)}</span>
                <span className="font-serif text-base truncate">{t.description}</span>
                <span className="text-[11.5px] text-sepia tracking-wide truncate">
                  {t.categoryName ?? '—'}
                </span>
                <span className={cn('font-serif text-[18px] text-right', t.type === 'INCOME' ? 'text-sage' : 'text-ink')}>
                  {t.type === 'INCOME' ? '+ ' : '− '}
                  {formatCurrency(t.amount, user?.currency)}
                </span>
              </div>
            ))
          ) : (
            <div className="px-[22px] py-6">
              <FiniSays mood="neutral" size={60}>
                Todavía no anotaste nada.{' '}
                <Link to="/transactions" className="underline underline-offset-[3px] hover:text-ink">
                  Cargá tu primer movimiento →
                </Link>{' '}
                o mandame un audio por WhatsApp.
              </FiniSays>
            </div>
          )}
        </div>
      </section>

      <section className="border border-rule rounded-md bg-paper/40 backdrop-blur-[2px] p-[22px]">
        <div className="flex items-baseline justify-between mb-3.5">
          <h2 className="font-serif italic font-medium text-[19px]">Metas en progreso</h2>
          <Link to="/goals" className="text-[11.5px] text-sepia underline underline-offset-[3px] hover:text-ink transition-colors">
            Ver todo →
          </Link>
        </div>
        {inProgressGoals.length > 0 ? (
          <div className="space-y-5">
            {inProgressGoals.map((g) => (
              <div key={g.id}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-serif text-base flex items-center gap-2">
                    <span className="text-sepia">{g.icon ?? '◇'}</span>
                    {g.name}
                  </span>
                  <span className="font-serif italic text-[14px] text-sepia">
                    {g.progressPercentage.toFixed(0)} %
                  </span>
                </div>
                <div className="h-1.5 bg-sepia-soft rounded-pill overflow-hidden">
                  <div
                    className="h-full bg-ink transition-all duration-500"
                    style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[11px] text-sepia">{formatCurrency(g.currentAmount, user?.currency)}</span>
                  <span className="font-mono text-[11px] text-sepia">{formatCurrency(g.targetAmount, user?.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <FiniSays mood="happy" size={60}>
            Sin metas activas. ¿Unas vacaciones? ¿Un monitor nuevo?{' '}
            <Link to="/goals" className="underline underline-offset-[3px] hover:text-ink">
              Creá tu primera meta →
            </Link>
          </FiniSays>
        )}
      </section>
    </div>
  )
}

function StatCell({
  label,
  value,
  primary,
  withLeftRule,
}: {
  label: string
  value: string
  primary?: boolean
  withLeftRule?: boolean
}) {
  return (
    <div
      className={cn(
        'p-[20px_24px]',
        withLeftRule && 'md:border-l border-rule',
        primary && 'bg-ink/[0.04]',
      )}
    >
      <div className="text-[11px] tracking-[0.18em] uppercase text-sepia font-semibold">{label}</div>
      <div
        className={cn(
          'font-serif font-normal mt-1.5 leading-none tracking-tight',
          primary ? 'text-[36px]' : 'text-[30px]',
        )}
      >
        {value}
      </div>
    </div>
  )
}

function SectionTitle({ title, right }: { title: string; right?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3.5">
      <h2 className="font-serif italic font-medium text-[19px]">{title}</h2>
      {right && (
        <span className="text-[11px] text-sepia tracking-[0.14em] uppercase">{right}</span>
      )}
    </div>
  )
}

function BarRow({
  label,
  amount,
  max,
  tone,
  currency,
}: {
  label: string
  amount: number
  max: number
  tone: 'sage' | 'wine'
  currency?: string
}) {
  const pct = max > 0 ? (amount / max) * 100 : 0
  const colorClass = tone === 'sage' ? 'bg-sage text-sage' : 'bg-wine text-wine'
  const [barBg, textColor] = colorClass.split(' ')
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[12.5px] font-semibold tracking-wide">{label}</span>
        <span className={cn('font-serif text-[17px]', textColor)}>
          {formatCurrency(amount, currency)}
        </span>
      </div>
      <div className="h-1.5 bg-sepia-soft rounded-pill overflow-hidden">
        <div className={cn('h-full', barBg)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
