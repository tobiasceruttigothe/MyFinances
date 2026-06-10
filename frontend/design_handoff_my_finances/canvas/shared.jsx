// Shared data + tiny helpers used across all 3 directions.
// Same numbers everywhere so the comparison is honest.

const USER = { firstName: 'Tobías', lastName: 'Cerutti' };
const CURRENCY = 'ARS';

const fmt = (n, opts = {}) => {
  const { sign = false, decimals = 0 } = opts;
  const v = Math.abs(n);
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
  if (sign) return (n >= 0 ? '+' : '−') + ' $ ' + formatted;
  return (n < 0 ? '−' : '') + '$ ' + formatted;
};

const fmtPct = (n, decimals = 1) =>
  (n >= 0 ? '+' : '') + n.toFixed(decimals) + '%';

const SUMMARY = {
  balance: 487250,
  investments: 1245800,
  netWorth: 1733050,
  income: 720000,
  expense: 432180,
  net: 287820,
  savingsRate: 39.97,
};

const CATEGORIES = [
  { name: 'Supermercado', value: 98400, icon: '🛒' },
  { name: 'Restaurantes', value: 76200, icon: '🍽' },
  { name: 'Transporte', value: 54300, icon: '🚇' },
  { name: 'Servicios', value: 42800, icon: '⚡' },
  { name: 'Salud', value: 28600, icon: '⚕' },
  { name: 'Entretenimiento', value: 22100, icon: '🎬' },
];

const RECENT = [
  { id: 1, date: 'Hoy · 14:32', desc: 'Coto Caballito', category: 'Supermercado', amount: -12840, type: 'EXPENSE' },
  { id: 2, date: 'Hoy · 09:00', desc: 'Sueldo mayo', category: 'Salario', amount: 520000, type: 'INCOME' },
  { id: 3, date: 'Ayer · 18:45', desc: 'SUBE recarga', category: 'Transporte', amount: -3500, type: 'EXPENSE' },
  { id: 4, date: 'Ayer · 10:12', desc: 'Spotify Premium', category: 'Entretenimiento', amount: -1990, type: 'EXPENSE' },
  { id: 5, date: '12 may · 19:20', desc: 'Edenor — factura', category: 'Servicios', amount: -18400, type: 'EXPENSE' },
  { id: 6, date: '11 may · 21:08', desc: 'Don Julio — cena', category: 'Restaurantes', amount: -24500, type: 'EXPENSE' },
  { id: 7, date: '10 may · 16:00', desc: 'Farmacity', category: 'Salud', amount: -6320, type: 'EXPENSE' },
  { id: 8, date: '09 may · 12:30', desc: 'Freelance — proyecto', category: 'Freelance', amount: 200000, type: 'INCOME' },
];

const GOALS = [
  { name: 'Vacaciones Bariloche', icon: '🏔', current: 325000, target: 500000, percent: 65 },
  { name: 'Notebook nueva', icon: '💻', current: 480000, target: 1500000, percent: 32 },
  { name: 'Fondo emergencia', icon: '🛡', current: 840000, target: 1000000, percent: 84 },
];

const INVESTMENTS = [
  { id: 1, ticker: 'AAPL', type: 'Acción', desc: 'Apple Inc.', initial: 180000, current: 215400, roi: 19.7, country: 'US' },
  { id: 2, ticker: 'BTC', type: 'Crypto', desc: 'Bitcoin', initial: 250000, current: 312500, roi: 25.0, country: '—' },
  { id: 3, ticker: 'PF-GAL', type: 'Plazo fijo', desc: 'PF Galicia 30d · 118% TNA', initial: 200000, current: 213400, roi: 6.7, country: 'AR' },
  { id: 4, ticker: 'TSLA', type: 'CEDEAR', desc: 'Tesla CEDEAR', initial: 90000, current: 76200, roi: -15.3, country: 'AR' },
  { id: 5, ticker: 'AL30', type: 'Bono', desc: 'Bonar 2030', initial: 150000, current: 189300, roi: 26.2, country: 'AR' },
  { id: 6, ticker: 'QQQ', type: 'ETF', desc: 'Invesco QQQ Trust', initial: 120000, current: 138400, roi: 15.3, country: 'US' },
];

const PORTFOLIO = {
  invested: 990000,
  current: 1245800,
  profit: 255800,
  roi: 25.84,
};

// 12-point sparkline data (relative)
const SPARK = {
  AAPL: [62, 64, 61, 65, 68, 66, 70, 73, 71, 75, 78, 76],
  BTC:  [40, 45, 42, 48, 52, 55, 50, 58, 62, 66, 70, 68],
  'PF-GAL': [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61],
  TSLA: [80, 78, 75, 72, 68, 64, 62, 58, 55, 50, 48, 46],
  AL30: [50, 52, 55, 58, 56, 60, 62, 65, 68, 70, 72, 74],
  QQQ:  [55, 56, 58, 57, 60, 62, 61, 64, 66, 65, 67, 68],
};

// Days of the month: cashflow per day for last 30 days (positive=in, negative=out)
const CASHFLOW = [
  +520000, -8400, -3200, -1990, -12500, -4800, -22000, -3500, -1200, -8900,
  -14500, -3200, -6700, -42000, -3500, -2100, -18400, -8900, -3500, -24500,
  -6320, -3200, -200000 + -1990, -3500, -8400, -12840, -3500, -1990, -12840, -3500,
];

// Last 6 months — for the Reports screen
// {month, income, expense}
const MONTHS = [
  { m: 'Dic 25', income: 580000, expense: 410000 },
  { m: 'Ene 26', income: 620000, expense: 380000 },
  { m: 'Feb 26', income: 640000, expense: 425000 },
  { m: 'Mar 26', income: 680000, expense: 445000 },
  { m: 'Abr 26', income: 700000, expense: 460000 },
  { m: 'May 26', income: 720000, expense: 432180 },
];

// Categories with extra metadata for the Categories page
const CATEGORIES_FULL = [
  { name: 'Supermercado',   icon: '🛒', kind: 'EXPENSE', month: 98400,  txs: 14, color: '#7c5a2a', budget: 110000 },
  { name: 'Restaurantes',   icon: '🍽', kind: 'EXPENSE', month: 76200,  txs: 9,  color: '#9a3a2e', budget: 80000  },
  { name: 'Transporte',     icon: '🚇', kind: 'EXPENSE', month: 54300,  txs: 22, color: '#5e7a4f', budget: 60000  },
  { name: 'Servicios',      icon: '⚡', kind: 'EXPENSE', month: 42800,  txs: 6,  color: '#d4a657', budget: 50000  },
  { name: 'Salud',          icon: '⚕', kind: 'EXPENSE', month: 28600,  txs: 4,  color: '#6a909e', budget: 40000  },
  { name: 'Entretenimiento',icon: '🎬', kind: 'EXPENSE', month: 22100,  txs: 5,  color: '#a07b4f', budget: 30000  },
  { name: 'Hogar',          icon: '🏠', kind: 'EXPENSE', month: 18400,  txs: 3,  color: '#8aa67a', budget: 25000  },
  { name: 'Educación',      icon: '📚', kind: 'EXPENSE', month: 12000,  txs: 1,  color: '#b8895a', budget: 20000  },
  { name: 'Salario',        icon: '💼', kind: 'INCOME',  month: 520000, txs: 1,  color: '#5e7a4f', budget: null   },
  { name: 'Freelance',      icon: '✦', kind: 'INCOME',  month: 200000, txs: 2,  color: '#7c5a2a', budget: null   },
];

// Goals with detailed contribution history
const GOALS_DETAIL = [
  {
    id: 1, name: 'Vacaciones Bariloche', icon: '🏔', category: 'Viaje',
    current: 325000, target: 500000, percent: 65,
    monthly: 50000, eta: 'Ago 26',
    note: 'Cabaña en Villa Catedral, 7 noches, mediados de agosto.',
    history: [
      { date: '12 may', amount: 50000, source: 'Aporte mensual' },
      { date: '15 abr', amount: 50000, source: 'Aporte mensual' },
      { date: '02 abr', amount: 25000, source: 'Extra' },
      { date: '12 mar', amount: 50000, source: 'Aporte mensual' },
      { date: '14 feb', amount: 50000, source: 'Aporte mensual' },
      { date: '12 ene', amount: 50000, source: 'Aporte mensual' },
      { date: '20 dic', amount: 50000, source: 'Aguinaldo' },
    ],
    projection: [120000, 170000, 220000, 245000, 295000, 325000, 375000, 425000, 475000, 500000],
  },
  { id: 2, name: 'Notebook nueva', icon: '💻', category: 'Bien durable',
    current: 480000, target: 1500000, percent: 32, monthly: 120000, eta: 'Ene 27' },
  { id: 3, name: 'Fondo emergencia', icon: '🛡', category: 'Reserva',
    current: 840000, target: 1000000, percent: 84, monthly: 30000, eta: 'Jul 26' },
  { id: 4, name: 'Curso de cocina', icon: '🍳', category: 'Formación',
    current: 45000, target: 180000, percent: 25, monthly: 15000, eta: 'Oct 26' },
];

window.MF = {
  USER, CURRENCY, fmt, fmtPct,
  SUMMARY, CATEGORIES, RECENT, GOALS,
  INVESTMENTS, PORTFOLIO, SPARK, CASHFLOW,
  MONTHS, CATEGORIES_FULL, GOALS_DETAIL,
};
