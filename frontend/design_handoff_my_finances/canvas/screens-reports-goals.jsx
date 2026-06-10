// Reports + Goals (list + detail). Cuaderno paper aesthetic.

const { C, fontSans, fontSerif, fontMono,
        CuadernoPage, PageHead, InkButton, PaperCard, SectionTitle } = window.Cuaderno;
const { fmt, fmtPct, MONTHS, CATEGORIES_FULL, GOALS_DETAIL } = window.MF;

// ──────────────────────────────── REPORTES ────────────────────────────────
function ReportsScreen() {
  // line chart bounds
  const maxV = Math.max(...MONTHS.map((m) => Math.max(m.income, m.expense)));
  const w = 760, h = 180, padX = 28, padY = 16;
  const step = (w - padX * 2) / (MONTHS.length - 1);
  const yFor = (v) => h - padY - ((v / maxV) * (h - padY * 2));

  const incomePath = MONTHS.map((m, i) => `${i === 0 ? 'M' : 'L'} ${padX + i * step} ${yFor(m.income)}`).join(' ');
  const expensePath = MONTHS.map((m, i) => `${i === 0 ? 'M' : 'L'} ${padX + i * step} ${yFor(m.expense)}`).join(' ');
  const savingsBars = MONTHS.map((m) => ((m.income - m.expense) / m.income) * 100);

  // top categories from data
  const topCats = CATEGORIES_FULL.filter((c) => c.kind === 'EXPENSE').slice(0, 5);
  const totalExp = topCats.reduce((s, c) => s + c.month, 0);

  return (
    <CuadernoPage active="Reportes" subtitle="Cuaderno de cuentas">
      <PageHead eyebrow="Reportes · semestre" title="Mayo " right={<InkButton variant="outline">Exportar PDF</InkButton>}>
        <em style={{ color: C.sepia }}>en revisión.</em>
      </PageHead>

      {/* Top KPIs */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
        border: `1px solid ${C.rule}`, borderRadius: 8,
        background: 'rgba(255,255,255,0.4)', marginBottom: 22,
      }}>
        {[
          { l: 'Ingreso medio', v: '$ 656.667', hint: '6 meses' },
          { l: 'Gasto medio', v: '$ 425.363', hint: 'tendencia ↗ + 5,2 %' },
          { l: 'Ahorro medio', v: fmt(231304), hint: '35,2 % del ingreso', sage: true },
          { l: 'Mejor mes', v: 'Mayo', hint: '40,0 % de ahorro', gold: true },
        ].map((k, i) => (
          <div key={i} style={{
            padding: '18px 22px',
            borderRight: i < 3 ? `1px solid ${C.rule}` : 'none',
          }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: C.sepia, fontWeight: 600,
            }}>{k.l}</div>
            <div style={{
              fontFamily: fontSerif, fontSize: 26, fontWeight: 400,
              letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1,
              color: k.sage ? C.sage : k.gold ? C.gold : C.ink,
            }}>{k.v}</div>
            <div style={{ fontSize: 11.5, marginTop: 8, color: C.sepia }}>{k.hint}</div>
          </div>
        ))}
      </div>

      {/* Income vs expense line chart */}
      <PaperCard style={{ marginBottom: 18 }}>
        <SectionTitle right={
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span style={{ color: C.sage, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 2, background: C.sage }} /> Ingresos
            </span>
            <span style={{ color: C.wine, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 2, background: C.wine, borderTop: `2px dashed ${C.wine}`, height: 0 }} /> Gastos
            </span>
          </div>
        }>Ingresos vs gastos · seis meses</SectionTitle>

        <svg width={w} height={h} style={{ width: '100%', height: 200, display: 'block' }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          {/* grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line key={p} x1={padX} x2={w - padX} y1={yFor(maxV * (1 - p))} y2={yFor(maxV * (1 - p))}
                  stroke={C.sepiaSoft} strokeWidth="1" strokeDasharray={p === 0 || p === 1 ? '0' : '2 4'} />
          ))}
          {/* income */}
          <path d={incomePath} fill="none" stroke={C.sage} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {MONTHS.map((m, i) => (
            <circle key={i} cx={padX + i * step} cy={yFor(m.income)} r="3" fill={C.sage} />
          ))}
          {/* expense */}
          <path d={expensePath} fill="none" stroke={C.wine} strokeWidth="1.5" strokeDasharray="3 3" />
          {MONTHS.map((m, i) => (
            <circle key={i} cx={padX + i * step} cy={yFor(m.expense)} r="2.5" fill={C.wine} />
          ))}
          {/* month labels */}
          {MONTHS.map((m, i) => (
            <text key={i} x={padX + i * step} y={h - 2} textAnchor="middle"
                  fontFamily={fontMono} fontSize="10" fill={C.sepia}>{m.m}</text>
          ))}
        </svg>
      </PaperCard>

      {/* Two columns: savings rate + category breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 18 }}>
        <PaperCard>
          <SectionTitle>Tasa de ahorro</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 110, padding: '4px 0 8px' }}>
            {savingsBars.map((p, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontFamily: fontSerif, fontSize: 13, fontStyle: 'italic',
                  color: i === savingsBars.length - 1 ? C.sage : C.ink,
                }}>{p.toFixed(0)}%</span>
                <div style={{
                  width: '100%', height: (p / 50) * 80,
                  background: i === savingsBars.length - 1 ? C.sage : C.sepiaSoft,
                  borderRadius: '2px 2px 0 0',
                }} />
                <span style={{ fontFamily: fontMono, fontSize: 9.5, color: C.sepia }}>{MONTHS[i].m.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${C.rule}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          }}>
            <span style={{ fontSize: 12, color: C.sepia }}>Promedio del semestre</span>
            <span style={{ fontFamily: fontSerif, fontSize: 20, fontStyle: 'italic' }}>35,2 %</span>
          </div>
        </PaperCard>

        <PaperCard>
          <SectionTitle right={
            <span style={{ fontSize: 11, color: C.sepia, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Mayo</span>
          }>Composición del gasto</SectionTitle>

          {/* horizontal bar with category segments */}
          <div style={{ display: 'flex', height: 10, borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
            {topCats.map((c) => (
              <div key={c.name} style={{ width: ((c.month / totalExp) * 100) + '%', background: c.color }} />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topCats.map((c) => {
              const pct = (c.month / totalExp) * 100;
              return (
                <div key={c.name} style={{
                  display: 'grid', gridTemplateColumns: '20px 1fr 60px 86px',
                  gap: 12, alignItems: 'center',
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c.color }} />
                  <span style={{ fontFamily: fontSerif, fontSize: 14 }}>{c.name}</span>
                  <span style={{ fontFamily: fontMono, fontSize: 11.5, color: C.sepia, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
                  <span style={{ fontFamily: fontMono, fontSize: 12.5, textAlign: 'right' }}>{fmt(c.month)}</span>
                </div>
              );
            })}
          </div>
        </PaperCard>
      </div>
    </CuadernoPage>
  );
}

// ──────────────────────────────── METAS · LISTA ────────────────────────────
function GoalsScreen() {
  return (
    <CuadernoPage active="Metas" subtitle="Cuaderno de cuentas">
      <PageHead eyebrow="Metas · 4 activas" title="Tus " right={<InkButton icon="+">Nueva meta</InkButton>}>
        <em style={{ color: C.sepia }}>propósitos.</em>
      </PageHead>

      {/* Summary row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
        border: `1px solid ${C.rule}`, borderRadius: 8,
        background: 'rgba(255,255,255,0.4)', marginBottom: 22,
      }}>
        {[
          { l: 'Total ahorrado', v: fmt(1690000), hint: 'entre todas las metas' },
          { l: 'Objetivo combinado', v: fmt(3180000), hint: '53 % alcanzado' },
          { l: 'Próxima en cumplir', v: 'Fondo emergencia', hint: 'estimado julio · 84 %', primary: true },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '18px 22px',
            borderRight: i < 2 ? `1px solid ${C.rule}` : 'none',
            background: s.primary ? 'rgba(94,122,79,0.06)' : 'transparent',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.sepia, fontWeight: 600 }}>{s.l}</div>
            <div style={{
              fontFamily: fontSerif, fontSize: s.primary ? 22 : 26, fontWeight: 400,
              letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.1,
              color: s.primary ? C.sage : C.ink,
            }}>{s.v}</div>
            <div style={{ fontSize: 11.5, marginTop: 8, color: C.sepia }}>{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Goals list — cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {GOALS_DETAIL.map((g) => (
          <PaperCard key={g.id} padding="20px 22px" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                fontSize: 28, width: 44, height: 44, borderRadius: 8,
                background: C.sepiaSoft, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>{g.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: fontSerif, fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em' }}>{g.name}</div>
                  <span style={{ fontFamily: fontSerif, fontSize: 22, fontStyle: 'italic', color: g.percent >= 80 ? C.sage : C.ink }}>
                    {g.percent}%
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: C.sepia, letterSpacing: '0.06em', marginTop: 2 }}>
                  {g.category} · ETA {g.eta}
                </div>
              </div>
            </div>

            {/* progress */}
            <div style={{ marginTop: 16, height: 6, background: C.sepiaSoft, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: g.percent + '%', height: '100%', background: g.percent >= 80 ? C.sage : C.ink }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 8,
              fontFamily: fontMono, fontSize: 11.5, color: C.sepia,
            }}>
              <span>{fmt(g.current)}</span>
              <span>{fmt(g.target)}</span>
            </div>

            {/* meta row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.rule}`,
              fontSize: 12,
            }}>
              <span style={{ color: C.sepia }}>Aporte mensual</span>
              <span style={{ fontFamily: fontSerif, fontStyle: 'italic' }}>{fmt(g.monthly)}</span>
            </div>
          </PaperCard>
        ))}
      </div>
    </CuadernoPage>
  );
}

// ──────────────────────────────── META DETALLE ──────────────────────────────
function GoalDetailScreen() {
  const g = GOALS_DETAIL[0]; // Bariloche
  const remaining = g.target - g.current;

  // Projection chart (the goal trajectory + dotted forward)
  const series = g.projection; // 10 points
  const cw = 720, ch = 130, pad = 8;
  const sMax = g.target;
  const sStep = (cw - pad * 2) / (series.length - 1);
  const sY = (v) => ch - pad - ((v / sMax) * (ch - pad * 2));
  const filledIdx = 6; // first 7 points are "actual", rest projected
  const actualPath = series.slice(0, filledIdx + 1).map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * sStep} ${sY(v)}`).join(' ');
  const projPath = series.slice(filledIdx).map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad + (filledIdx + i) * sStep} ${sY(v)}`).join(' ');
  const areaPath = actualPath + ` L ${pad + filledIdx * sStep} ${ch - pad} L ${pad} ${ch - pad} Z`;

  return (
    <CuadernoPage active="Metas" subtitle="Cuaderno de cuentas">
      {/* breadcrumb */}
      <div style={{
        fontSize: 11.5, color: C.sepia, marginBottom: 12,
        letterSpacing: '0.04em',
      }}>
        ← <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>Metas</span> · {g.category}
      </div>

      {/* Hero */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{
            fontSize: 56, width: 80, height: 80, borderRadius: 12,
            background: C.sepiaSoft, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>{g.icon}</div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.sepia, fontWeight: 600 }}>
              Meta · {g.category}
            </div>
            <h1 style={{ fontFamily: fontSerif, fontWeight: 400, fontSize: 36, letterSpacing: '-0.025em', margin: '4px 0 0', lineHeight: 1.05 }}>
              {g.name}
            </h1>
            <div style={{ fontSize: 13, color: C.sepia, marginTop: 6, fontStyle: 'italic', fontFamily: fontSerif, maxWidth: 480 }}>
              «{g.note}»
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <InkButton variant="outline">Editar</InkButton>
          <InkButton icon="+">Aporte</InkButton>
        </div>
      </div>

      {/* Progress hero block */}
      <PaperCard style={{ marginBottom: 18, padding: '22px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.sepia, fontWeight: 600 }}>
              Ahorrado de {fmt(g.target)}
            </div>
            <div style={{
              fontFamily: fontSerif, fontSize: 44, letterSpacing: '-0.03em', marginTop: 4, lineHeight: 1,
            }}>{fmt(g.current)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: fontSerif, fontSize: 32, fontStyle: 'italic', color: C.sage, lineHeight: 1 }}>{g.percent}%</div>
            <div style={{ fontSize: 11.5, color: C.sepia, marginTop: 4, fontStyle: 'italic', fontFamily: fontSerif }}>
              faltan {fmt(remaining)}
            </div>
          </div>
        </div>
        <div style={{ height: 10, background: C.sepiaSoft, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: g.percent + '%', height: '100%', background: C.sage }} />
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          marginTop: 18, paddingTop: 14, borderTop: `1px dashed ${C.rule}`,
        }}>
          {[
            { l: 'Aporte mensual', v: fmt(g.monthly) },
            { l: 'Estimado completar', v: g.eta },
            { l: 'Aportes hechos', v: g.history.length + ' veces' },
          ].map((s, i) => (
            <div key={i} style={{ borderRight: i < 2 ? `1px solid ${C.ruleSoft}` : 'none', paddingLeft: i > 0 ? 22 : 0 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.sepia }}>{s.l}</div>
              <div style={{ fontFamily: fontSerif, fontSize: 18, marginTop: 4, fontStyle: 'italic' }}>{s.v}</div>
            </div>
          ))}
        </div>
      </PaperCard>

      {/* Bottom: projection + history */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
        <PaperCard>
          <SectionTitle right={<span style={{ fontSize: 11, color: C.sepia, letterSpacing: '0.12em', textTransform: 'uppercase' }}>10 meses</span>}>
            Trayectoria proyectada
          </SectionTitle>
          <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{ width: '100%', height: 140, display: 'block' }} preserveAspectRatio="none">
            {/* horizontal axis */}
            <line x1={pad} x2={cw - pad} y1={ch - pad} y2={ch - pad} stroke={C.sepiaSoft} />
            {/* target line */}
            <line x1={pad} x2={cw - pad} y1={sY(g.target)} y2={sY(g.target)} stroke={C.sepia} strokeDasharray="2 4" strokeWidth="1" />
            <text x={cw - pad} y={sY(g.target) - 4} textAnchor="end" fontFamily={fontMono} fontSize="10" fill={C.sepia}>objetivo {fmt(g.target)}</text>
            {/* area for actual */}
            <path d={areaPath} fill={C.sage} opacity="0.12" />
            {/* actual path */}
            <path d={actualPath} fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" />
            {/* projected dotted */}
            <path d={projPath} fill="none" stroke={C.sepia} strokeWidth="1.5" strokeDasharray="3 3" />
            {/* dots */}
            {series.map((v, i) => (
              <circle key={i} cx={pad + i * sStep} cy={sY(v)} r="2.5"
                      fill={i <= filledIdx ? C.sage : 'white'}
                      stroke={i <= filledIdx ? C.sage : C.sepia} strokeWidth="1.2" />
            ))}
            {/* "today" marker */}
            <text x={pad + filledIdx * sStep} y={ch - 1} textAnchor="middle" fontFamily={fontMono} fontSize="9" fill={C.ink} fontWeight="700">HOY</text>
          </svg>
        </PaperCard>

        <PaperCard padding="18px 0 12px">
          <SectionTitle right={<span style={{ fontSize: 11.5, color: C.sepia, textDecoration: 'underline', textUnderlineOffset: 3, paddingRight: 22 }}>Ver todo →</span>}>
            <span style={{ paddingLeft: 22 }}>Aportes</span>
          </SectionTitle>
          {g.history.slice(0, 5).map((h, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '78px 1fr 90px',
              gap: 12, padding: '10px 22px', alignItems: 'center',
              borderTop: `1px solid ${C.ruleSoft}`,
            }}>
              <span style={{ fontFamily: fontMono, fontSize: 11.5, color: C.sepia }}>{h.date}</span>
              <span style={{ fontFamily: fontSerif, fontSize: 14 }}>{h.source}</span>
              <span style={{ fontFamily: fontSerif, fontSize: 16, textAlign: 'right', color: C.sage, fontStyle: 'italic' }}>
                + {fmt(h.amount)}
              </span>
            </div>
          ))}
        </PaperCard>
      </div>
    </CuadernoPage>
  );
}

Object.assign(window, { ReportsScreen, GoalsScreen, GoalDetailScreen });
