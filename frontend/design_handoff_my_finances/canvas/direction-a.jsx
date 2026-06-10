// Direction A — "Cuaderno & Terminal"
// Daily: cream paper, editorial serif, ink ledger.
// Investments: pure black Bloomberg-style terminal, mono numbers.

const { fmt, fmtPct, USER, SUMMARY, CATEGORIES, RECENT, GOALS, INVESTMENTS, PORTFOLIO, SPARK, CASHFLOW } = window.MF;

const inkA   = '#1a1612';
const paperA = '#f4ecdd';
const paper2 = '#ede2cd';
const rule   = '#c9bca0';
const sepia  = '#7c5a2a';
const sage   = '#5e7a4f';
const wine   = '#9a3a2e';

// ───────────────────────────────────────────── A · DAILY ──────────────────────
function ADaily() {
  const navItems = [
    ['Hoy', true], ['Transacciones', false], ['Categorías', false],
    ['Reportes', false], ['Metas', false], ['Inversiones', false, true],
  ];
  return (
    <div className="artboard" style={{
      width: 1280, height: 800, background: paperA, color: inkA,
      fontFamily: '"Hanken Grotesk", sans-serif', display: 'flex',
      backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5), transparent 50%), radial-gradient(circle at 80% 90%, rgba(196,170,120,0.18), transparent 40%)',
    }}>
      {/* Sidebar */}
      <aside style={{ width: 224, padding: '28px 22px', borderRight: `1px solid ${rule}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: '"Newsreader", serif', fontWeight: 500, fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1 }}>
          MyFinances<span style={{ color: wine }}>.</span>
        </div>
        <div style={{ fontSize: 10.5, color: sepia, marginTop: 4, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Cuaderno de cuentas</div>

        <nav style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(([label, active, separator], i) => (
            <React.Fragment key={i}>
              {separator && <div style={{ height: 1, background: rule, margin: '10px 0' }} />}
              <button style={{
                all: 'unset', cursor: 'pointer', padding: '8px 10px', borderRadius: 4,
                fontFamily: '"Newsreader", serif', fontSize: 17, letterSpacing: '-0.01em',
                fontStyle: active ? 'italic' : 'normal',
                background: active ? inkA : 'transparent', color: active ? paperA : inkA,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {active && <span style={{ fontSize: 11 }}>❧</span>}
                {label}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', fontSize: 11.5, color: sepia, lineHeight: 1.55, fontStyle: 'italic', fontFamily: '"Newsreader", serif' }}>
          «Quien no sabe lo que gasta, ignora lo que vale.»
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px 44px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: sepia, fontWeight: 600 }}>
              Jueves · 14 de mayo, 2026
            </div>
            <h1 style={{
              fontFamily: '"Newsreader", serif', fontWeight: 400, fontSize: 40,
              letterSpacing: '-0.025em', lineHeight: 1.05, margin: '6px 0 0',
            }}>
              Buenas tardes, <em style={{ color: sepia }}>Tobías.</em>
            </h1>
          </div>
          <button style={{
            all: 'unset', cursor: 'pointer',
            background: inkA, color: paperA, padding: '11px 18px', borderRadius: 999,
            fontSize: 13.5, fontWeight: 600, letterSpacing: '0.01em',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Anotar un gasto
          </button>
        </div>

        {/* Ledger stat row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: 0,
          border: `1px solid ${rule}`, borderRadius: 8, background: 'rgba(255,255,255,0.4)',
          marginBottom: 22,
        }}>
          {[
            { label: 'En cuenta', value: SUMMARY.balance, hint: '+ $ 287.820 este mes', tone: sage },
            { label: 'Invertido', value: SUMMARY.investments, hint: 'ROI total +25,8 %', tone: sepia },
            { label: 'Patrimonio neto', value: SUMMARY.netWorth, hint: '↗ + 18 % vs. enero', tone: inkA, primary: true },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '20px 24px', borderRight: i < 2 ? `1px solid ${rule}` : 'none',
              background: s.primary ? 'rgba(26,22,18,0.04)' : 'transparent',
            }}>
              <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: sepia, fontWeight: 600 }}>{s.label}</div>
              <div style={{
                fontFamily: '"Newsreader", serif', fontSize: s.primary ? 36 : 30, fontWeight: 400,
                letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1,
              }}>{fmt(s.value)}</div>
              <div style={{ fontSize: 12, marginTop: 8, color: s.tone, fontWeight: 500 }}>{s.hint}</div>
            </div>
          ))}
        </div>

        {/* Two columns: month + categories */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22 }}>
          {/* Mes en curso */}
          <div style={{ border: `1px solid ${rule}`, borderRadius: 8, padding: '18px 22px', background: 'rgba(255,255,255,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div style={{ fontFamily: '"Newsreader", serif', fontSize: 19, fontStyle: 'italic', fontWeight: 500 }}>Mes en curso</div>
              <div style={{ fontSize: 11, color: sepia, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Mayo</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BarRow label="Ingresos" amount={SUMMARY.income} max={SUMMARY.income} color={sage} />
              <BarRow label="Gastos"   amount={SUMMARY.expense} max={SUMMARY.income} color={wine} />
            </div>

            <div style={{ borderTop: `1px dashed ${rule}`, marginTop: 14, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12.5, color: sepia, fontWeight: 600, letterSpacing: '0.02em' }}>Balance neto</span>
              <span style={{ fontFamily: '"Newsreader", serif', fontSize: 24, color: sage }}>{fmt(SUMMARY.net, { sign: true })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: sepia, letterSpacing: '0.06em' }}>Tasa de ahorro</span>
              <span style={{ fontSize: 11.5, fontFamily: '"Newsreader", serif', fontStyle: 'italic' }}>40 %</span>
            </div>
          </div>

          {/* Categorias */}
          <div style={{ border: `1px solid ${rule}`, borderRadius: 8, padding: '18px 22px', background: 'rgba(255,255,255,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div style={{ fontFamily: '"Newsreader", serif', fontSize: 19, fontStyle: 'italic', fontWeight: 500 }}>Dónde se fue</div>
              <div style={{ fontSize: 11, color: sepia, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Top 6</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CATEGORIES.map((c, i) => {
                const max = CATEGORIES[0].value;
                const pct = (c.value / max) * 100;
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 86px', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontFamily: '"Newsreader", serif' }}>{c.name}</span>
                    <div style={{ height: 4, background: 'rgba(124,90,42,0.12)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: pct + '%', height: '100%', background: inkA }} />
                    </div>
                    <span style={{ fontSize: 12.5, fontFamily: '"JetBrains Mono", monospace', textAlign: 'right', color: inkA }}>
                      {fmt(c.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ledger entries */}
        <div style={{ border: `1px solid ${rule}`, borderRadius: 8, background: 'rgba(255,255,255,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 22px', borderBottom: `1px solid ${rule}` }}>
            <div style={{ fontFamily: '"Newsreader", serif', fontSize: 19, fontStyle: 'italic', fontWeight: 500 }}>Movimientos recientes</div>
            <span style={{ fontSize: 11.5, color: sepia, textDecoration: 'underline', textUnderlineOffset: 3 }}>Ver todo →</span>
          </div>
          <div>
            {RECENT.slice(0, 4).map((t, i) => (
              <div key={t.id} style={{
                display: 'grid', gridTemplateColumns: '110px 1fr 140px 130px',
                gap: 16, alignItems: 'center', padding: '11px 22px',
                borderBottom: i < 3 ? `1px solid rgba(201,188,160,0.5)` : 'none',
              }}>
                <span style={{ fontSize: 11.5, fontFamily: '"JetBrains Mono", monospace', color: sepia }}>{t.date}</span>
                <span style={{ fontFamily: '"Newsreader", serif', fontSize: 16 }}>{t.desc}</span>
                <span style={{ fontSize: 11.5, color: sepia, letterSpacing: '0.04em' }}>{t.category}</span>
                <span style={{
                  fontFamily: '"Newsreader", serif', fontSize: 18, textAlign: 'right',
                  color: t.type === 'INCOME' ? sage : inkA,
                }}>{fmt(t.amount, { sign: true })}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function BarRow({ label, amount, max, color }) {
  const pct = (amount / max) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.02em' }}>{label}</span>
        <span style={{ fontFamily: '"Newsreader", serif', fontSize: 17, color }}>{fmt(amount)}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(124,90,42,0.12)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: color }} />
      </div>
    </div>
  );
}

// ─────────────────────────────── A · INVESTMENTS (CUADERNO ENCUADERNADO) ─────
// Same DNA as the daily notebook (Newsreader serif, sepia/sage/wine accents),
// but on darker, warmer paper — never black.
// Multiple palettes so we can compare tones side by side.

const INVEST_PALETTES = {
  // 1 · Cuero — dark warm brown leather binding
  cuero: {
    bg:    '#3a2d1e',
    rule:  '#574232',
    ink:   '#f1e4c8',
    sepia: '#cbab74',
    sage:  '#a3c089',
    wine:  '#cc7a6f',
    gold:  '#d8ad5a',
    name:  'Cuero',
    subtitle: 'Marrón oscuro cálido',
  },
  // 2 · Café — like coffee-stained paper, the lighter end
  cafe: {
    bg:    '#574127',
    rule:  '#74583a',
    ink:   '#f6ead0',
    sepia: '#d6b97e',
    sage:  '#aac98e',
    wine:  '#d68575',
    gold:  '#e0b162',
    name:  'Café',
    subtitle: 'Marrón medio',
  },
  // 3 · Tabaco — warm tan, almost like aged kraft paper
  tabaco: {
    bg:    '#7a5d3b',
    rule:  '#947452',
    ink:   '#fbf1d8',
    sepia: '#e6c98b',
    sage:  '#b8d39a',
    wine:  '#e09181',
    gold:  '#ecbb68',
    name:  'Tabaco',
    subtitle: 'Marrón claro / sepia',
  },
  // 4 · Tinta — deep ink-blue notebook cover (cooler alternative)
  tinta: {
    bg:    '#1f2a38',
    rule:  '#36465a',
    ink:   '#ecdfbd',
    sepia: '#c7a974',
    sage:  '#9ec79c',
    wine:  '#d27e7e',
    gold:  '#d4a85a',
    name:  'Tinta',
    subtitle: 'Azul tinta profundo',
  },
};

function AInvest({ palette = INVEST_PALETTES.cuero }) {
  const { bg: nightBg, rule: nightRule, ink: nightInk, sepia: sepia2, sage: sageDark, wine: wineDark, gold } = palette;
  const total = PORTFOLIO.current;

  return (
    <div className="artboard" style={{
      width: 1280, height: 800, background: nightBg, color: nightInk,
      fontFamily: '"Hanken Grotesk", sans-serif', display: 'flex',
      backgroundImage:
        'radial-gradient(circle at 20% 10%, rgba(212,166,87,0.06), transparent 55%),' +
        'radial-gradient(circle at 100% 100%, rgba(154,184,128,0.04), transparent 50%)',
    }}>
      {/* Sidebar — same shape as the daily notebook */}
      <aside style={{
        width: 224, padding: '28px 22px',
        borderRight: `1px solid ${nightRule}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          fontFamily: '"Newsreader", serif', fontWeight: 500, fontSize: 22,
          letterSpacing: '-0.02em', lineHeight: 1, color: nightInk,
        }}>
          MyFinances<span style={{ color: gold }}>.</span>
        </div>
        <div style={{
          fontSize: 10.5, color: sepia2, marginTop: 4,
          letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>Libro de inversiones</div>

        <nav style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Portafolio', true],
            ['Posiciones', false],
            ['Allocation', false],
            ['Rendimiento', false],
            ['Riesgo', false],
            ['Histórico', false],
            ['Cuaderno diario', false, true],
          ].map(([label, active, separator], i) => (
            <React.Fragment key={i}>
              {separator && <div style={{ height: 1, background: nightRule, margin: '10px 0' }} />}
              <button style={{
                all: 'unset', cursor: 'pointer', padding: '8px 10px', borderRadius: 4,
                fontFamily: '"Newsreader", serif', fontSize: 17, letterSpacing: '-0.01em',
                fontStyle: active ? 'italic' : 'normal',
                background: active ? nightInk : 'transparent',
                color: active ? nightBg : nightInk,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {active && <span style={{ fontSize: 11 }}>❧</span>}
                {label}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div style={{
          marginTop: 'auto', fontSize: 11.5, color: sepia2, lineHeight: 1.55,
          fontStyle: 'italic', fontFamily: '"Newsreader", serif',
        }}>
          «El interés compuesto es la octava maravilla del mundo.»
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px 44px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
          <div>
            <div style={{
              fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: sepia2, fontWeight: 600,
            }}>
              Portafolio · cierre 13 de mayo
            </div>
            <h1 style={{
              fontFamily: '"Newsreader", serif', fontWeight: 400, fontSize: 36,
              letterSpacing: '-0.025em', lineHeight: 1.05, margin: '6px 0 0',
            }}>
              Tu portafolio rinde <em style={{ color: sageDark }}>+ 25,8 %.</em>
            </h1>
          </div>
          <button style={{
            all: 'unset', cursor: 'pointer',
            background: nightInk, color: nightBg, padding: '11px 18px', borderRadius: 999,
            fontSize: 13.5, fontWeight: 600, letterSpacing: '0.01em',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nueva posición
          </button>
        </div>

        {/* Ledger stat row — mirrors the daily layout exactly */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 0,
          border: `1px solid ${nightRule}`, borderRadius: 8,
          background: 'rgba(255,255,255,0.02)', marginBottom: 22,
        }}>
          {[
            { label: 'Invertido', value: PORTFOLIO.invested, hint: 'capital colocado', tone: sepia2 },
            { label: 'Valor actual', value: PORTFOLIO.current, hint: '6 activos', tone: sepia2 },
            {
              label: 'Ganancia bruta', value: PORTFOLIO.profit,
              hint: 'ROI total + 25,84 %', tone: sageDark, primary: true,
            },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '20px 24px', borderRight: i < 2 ? `1px solid ${nightRule}` : 'none',
              background: s.primary ? 'rgba(154,184,128,0.05)' : 'transparent',
            }}>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: sepia2, fontWeight: 600,
              }}>{s.label}</div>
              <div style={{
                fontFamily: '"Newsreader", serif',
                fontSize: s.primary ? 36 : 30, fontWeight: 400,
                letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1,
                color: s.primary ? sageDark : nightInk,
              }}>{s.primary ? fmt(s.value, { sign: true }) : fmt(s.value)}</div>
              <div style={{ fontSize: 12, marginTop: 8, color: s.tone, fontWeight: 500 }}>{s.hint}</div>
            </div>
          ))}
        </div>

        {/* Period selector — restrained, no terminal pills */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 14,
        }}>
          <div style={{ fontFamily: '"Newsreader", serif', fontSize: 19, fontStyle: 'italic', fontWeight: 500 }}>
            Composición y rendimiento
          </div>
          <div style={{ display: 'flex', gap: 18, fontSize: 12, color: sepia2 }}>
            {['1S', '1M', '3M', '6M', 'YTD', '1A', 'Todo'].map((p, i) => (
              <button key={p} style={{
                all: 'unset', cursor: 'pointer',
                fontFamily: '"Newsreader", serif', fontSize: 14,
                fontStyle: i === 2 ? 'italic' : 'normal',
                color: i === 2 ? nightInk : sepia2,
                textDecoration: i === 2 ? `underline` : 'none',
                textUnderlineOffset: 4,
                textDecorationColor: gold,
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Holdings ledger */}
        <div style={{
          border: `1px solid ${nightRule}`, borderRadius: 8,
          background: 'rgba(255,255,255,0.02)', marginBottom: 16,
        }}>
          {/* header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '70px 1fr 100px 130px 130px 90px 70px',
            gap: 12, padding: '11px 22px',
            fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: sepia2, fontWeight: 600,
            borderBottom: `1px solid ${nightRule}`,
          }}>
            <span>Activo</span>
            <span>Descripción</span>
            <span style={{ textAlign: 'right' }}>30 d</span>
            <span style={{ textAlign: 'right' }}>Invertido</span>
            <span style={{ textAlign: 'right' }}>Actual</span>
            <span style={{ textAlign: 'right' }}>ROI</span>
            <span style={{ textAlign: 'right' }}>Peso</span>
          </div>
          {INVESTMENTS.map((inv, i) => {
            const positive = inv.roi >= 0;
            const peso = (inv.current / total) * 100;
            return (
              <div key={inv.id} style={{
                display: 'grid',
                gridTemplateColumns: '70px 1fr 100px 130px 130px 90px 70px',
                gap: 12, padding: '12px 22px', alignItems: 'center',
                borderBottom: i < INVESTMENTS.length - 1 ? `1px solid rgba(58,45,31,0.6)` : 'none',
              }}>
                <span style={{
                  fontFamily: '"Newsreader", serif', fontSize: 16, fontWeight: 500,
                  color: gold, letterSpacing: '0.01em',
                }}>{inv.ticker}</span>
                <div>
                  <div style={{ fontFamily: '"Newsreader", serif', fontSize: 15, color: nightInk }}>
                    {inv.desc}
                  </div>
                  <div style={{ fontSize: 11, color: sepia2, marginTop: 2 }}>
                    {inv.type} · {inv.country}
                  </div>
                </div>
                <div style={{ justifySelf: 'end' }}>
                  <NightSparkline data={SPARK[inv.ticker]} positive={positive} sage={sageDark} wine={wineDark} />
                </div>
                <span style={{
                  textAlign: 'right', fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12.5, color: nightInk, fontWeight: 400,
                }}>
                  {new Intl.NumberFormat('es-AR').format(inv.initial)}
                </span>
                <span style={{
                  textAlign: 'right', fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13, color: nightInk, fontWeight: 500,
                }}>
                  {new Intl.NumberFormat('es-AR').format(inv.current)}
                </span>
                <span style={{
                  textAlign: 'right', fontFamily: '"Newsreader", serif',
                  fontSize: 16, fontStyle: 'italic',
                  color: positive ? sageDark : wineDark,
                }}>
                  {fmtPct(inv.roi)}
                </span>
                <span style={{
                  textAlign: 'right', fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11.5, color: sepia2,
                }}>{peso.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>

        {/* Allocation footer — paper-ledger style */}
        <div style={{
          border: `1px solid ${nightRule}`, borderRadius: 8, padding: '14px 22px',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: sepia2, marginBottom: 12, fontWeight: 600,
          }}>
            <span>Alocación</span>
            <span style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', textTransform: 'none', letterSpacing: '0.02em' }}>
              Σ 100,0 %
            </span>
          </div>
          <div style={{ display: 'flex', height: 6, borderRadius: 2, overflow: 'hidden' }}>
            {INVESTMENTS.map((inv, i) => {
              const peso = (inv.current / total) * 100;
              // restrained palette: variations of sepia/sage/wine, not rainbow
              const colors = [gold, sageDark, sepia2, wineDark, '#a07b4f', '#8aa67a'];
              return <div key={inv.id} style={{ width: peso + '%', background: colors[i] }} />;
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 12 }}>
            {INVESTMENTS.map((inv, i) => {
              const colors = [gold, sageDark, sepia2, wineDark, '#a07b4f', '#8aa67a'];
              const peso = (inv.current / total) * 100;
              return (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i] }} />
                  <span style={{ fontFamily: '"Newsreader", serif', color: nightInk }}>{inv.ticker}</span>
                  <span style={{ color: sepia2, fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>
                    {peso.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function NightSparkline({ data, positive, sage, wine }) {
  const w = 80, h = 22;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');
  const last = data[data.length - 1];
  const lastY = h - ((last - min) / range) * h;
  const color = positive ? sage : wine;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
      <circle cx={w} cy={lastY} r={1.8} fill={color} />
    </svg>
  );
}

// ───────────────────────────────────────────── A · TRANSACTIONS ───────────────
function ATransactions() {
  // Wider list with sticky add row at top
  const txs = [
    ...RECENT,
    { id: 9, date: '08 may · 20:15', desc: 'Uber Negro y Blanco', category: 'Transporte', amount: -4800, type: 'EXPENSE' },
    { id: 10, date: '08 may · 13:00', desc: 'Mercado del Centro', category: 'Supermercado', amount: -8400, type: 'EXPENSE' },
    { id: 11, date: '07 may · 19:00', desc: 'Cine — Hoyts', category: 'Entretenimiento', amount: -7200, type: 'EXPENSE' },
    { id: 12, date: '06 may · 11:00', desc: 'Devolución MercadoLibre', category: 'Otros', amount: 4500, type: 'INCOME' },
  ];

  // Group by day
  const groups = txs.reduce((acc, t) => {
    const day = t.date.split('·')[0].trim();
    (acc[day] = acc[day] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="artboard" style={{
      width: 1280, height: 800, background: paperA, color: inkA,
      fontFamily: '"Hanken Grotesk", sans-serif', display: 'flex',
    }}>
      <aside style={{ width: 224, padding: '28px 22px', borderRight: `1px solid ${rule}` }}>
        <div style={{ fontFamily: '"Newsreader", serif', fontWeight: 500, fontSize: 22 }}>MyFinances<span style={{ color: wine }}>.</span></div>
        <div style={{ fontSize: 10.5, color: sepia, marginTop: 4, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Cuaderno de cuentas</div>
        <nav style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[['Hoy', false], ['Transacciones', true], ['Categorías', false], ['Reportes', false], ['Metas', false]].map(([l, a], i) => (
            <button key={i} style={{
              all: 'unset', cursor: 'pointer', padding: '8px 10px', borderRadius: 4,
              fontFamily: '"Newsreader", serif', fontSize: 17,
              fontStyle: a ? 'italic' : 'normal',
              background: a ? inkA : 'transparent', color: a ? paperA : inkA,
            }}>{a ? '❧ ' : ''}{l}</button>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '28px 44px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: sepia, fontWeight: 600 }}>Cuaderno</div>
            <h1 style={{ fontFamily: '"Newsreader", serif', fontSize: 36, fontWeight: 400, margin: '4px 0 0', letterSpacing: '-0.025em' }}>
              Transacciones <em style={{ color: sepia }}>de mayo</em>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              all: 'unset', cursor: 'pointer', padding: '9px 14px', border: `1px solid ${rule}`,
              borderRadius: 6, fontSize: 13, fontFamily: '"Newsreader", serif',
            }}>Filtros</button>
            <button style={{
              all: 'unset', cursor: 'pointer', padding: '9px 14px', border: `1px solid ${rule}`,
              borderRadius: 6, fontSize: 13, fontFamily: '"Newsreader", serif',
            }}>Exportar</button>
          </div>
        </div>

        {/* Quick add row */}
        <div style={{
          border: `1px solid ${inkA}`, background: 'rgba(255,255,255,0.6)',
          borderRadius: 8, padding: '12px 16px', display: 'grid',
          gridTemplateColumns: '36px 1fr 160px 140px 110px', gap: 12, alignItems: 'center',
          marginBottom: 18,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 999, background: inkA, color: paperA,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>+</div>
          <input
            defaultValue="Anotá un gasto rápido — ej. café con leche"
            style={{
              all: 'unset', fontFamily: '"Newsreader", serif', fontSize: 17, fontStyle: 'italic',
              color: sepia, width: '100%',
            }}
          />
          <select defaultValue="Restaurantes" style={{
            all: 'unset', cursor: 'pointer', fontSize: 12.5, fontFamily: '"Hanken Grotesk", sans-serif',
            padding: '6px 10px', border: `1px solid ${rule}`, borderRadius: 4, color: inkA,
          }}>
            <option>Restaurantes ▾</option>
          </select>
          <input defaultValue="$ 4.200" style={{
            all: 'unset', fontFamily: '"Newsreader", serif', fontSize: 17,
            padding: '6px 10px', border: `1px solid ${rule}`, borderRadius: 4, textAlign: 'right',
          }} />
          <button style={{
            all: 'unset', cursor: 'pointer', background: inkA, color: paperA,
            padding: '8px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, textAlign: 'center',
          }}>Guardar ↵</button>
        </div>

        {/* Grouped list */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {Object.entries(groups).map(([day, items]) => {
            const dayTotal = items.reduce((s, t) => s + t.amount, 0);
            return (
              <div key={day} style={{ marginBottom: 18 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: sepia, fontWeight: 600, marginBottom: 6, paddingBottom: 5,
                  borderBottom: `1px solid ${rule}`,
                }}>
                  <span>{day}</span>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', color: dayTotal >= 0 ? sage : inkA }}>
                    Neto {fmt(dayTotal, { sign: true })}
                  </span>
                </div>
                {items.map((t) => (
                  <div key={t.id} style={{
                    display: 'grid', gridTemplateColumns: '90px 1fr 150px 130px',
                    gap: 16, padding: '8px 0', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 11.5, fontFamily: '"JetBrains Mono", monospace', color: sepia }}>
                      {t.date.split('·')[1].trim()}
                    </span>
                    <span style={{ fontFamily: '"Newsreader", serif', fontSize: 16 }}>{t.desc}</span>
                    <span style={{ fontSize: 11.5, color: sepia }}>{t.category}</span>
                    <span style={{
                      fontFamily: '"Newsreader", serif', fontSize: 18, textAlign: 'right',
                      color: t.type === 'INCOME' ? sage : inkA,
                    }}>{fmt(t.amount, { sign: true })}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { ADaily, AInvest, ATransactions, INVEST_PALETTES });
