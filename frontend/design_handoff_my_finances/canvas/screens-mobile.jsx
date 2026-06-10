// Mobile screens for the Cuaderno design system.
// All wrapped in <IOSDevice>. 402×874 default canvas.
// Custom Cuaderno header + bottom tab — no iOS chrome (other than status bar / home).

const { C: mC, fontSans: mSans, fontSerif: mSerif, fontMono: mMono } = window.Cuaderno;
const { fmt: mFmt, fmtPct: mFmtPct,
        SUMMARY: mSUM, RECENT: mREC, CATEGORIES: mCATS,
        GOALS_DETAIL: mGOALS, INVESTMENTS: mINV, PORTFOLIO: mPORT, SPARK: mSPARK } = window.MF;

const TINTA = {
  bg:    '#1f2a38',
  bg2:   '#27374a',
  rule:  '#36465a',
  ink:   '#ecdfbd',
  sepia: '#c7a974',
  sage:  '#9ec79c',
  wine:  '#d27e7e',
  gold:  '#d4a85a',
};

// ──────────────────────────── primitives ──────────────────────────────────

function MStatusSpacer() {
  // Reserve room for status bar (the iOS frame draws it absolutely on top).
  return <div style={{ height: 50 }} />;
}

function MHeader({ kicker, title, italic, right, onPaper = true }) {
  const palette = onPaper ? mC : TINTA;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      padding: '12px 22px 18px',
    }}>
      <div>
        {kicker && (
          <div style={{
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: palette.sepia, fontWeight: 600,
          }}>{kicker}</div>
        )}
        <div style={{
          fontFamily: mSerif, fontWeight: 400, fontSize: 28,
          letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 4,
          color: palette.ink,
        }}>{title}{italic && <em style={{ color: palette.sepia }}> {italic}</em>}</div>
      </div>
      {right}
    </div>
  );
}

function MTabBar({ active = 'Hoy', onPaper = true }) {
  const palette = onPaper ? mC : TINTA;
  const tabs = [
    ['Hoy', '☼'],
    ['Mov.', '↔'],
    ['+', null],
    ['Metas', '◯'],
    ['Más', '☰'],
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      padding: '10px 14px 26px',
      background: onPaper
        ? 'linear-gradient(to top, rgba(244,236,221,0.96) 60%, rgba(244,236,221,0.0))'
        : 'linear-gradient(to top, rgba(31,42,56,0.96) 60%, rgba(31,42,56,0))',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        background: onPaper ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${palette.rule}`,
        borderRadius: 999, padding: '6px 8px',
      }}>
        {tabs.map(([label, icon]) => {
          const a = label === active;
          if (label === '+') {
            return (
              <button key={label} style={{
                all: 'unset', cursor: 'pointer',
                width: 44, height: 44, borderRadius: 999,
                background: palette.ink, color: palette.bg || mC.paper,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontFamily: mSerif, lineHeight: 1,
                marginTop: -4, alignSelf: 'center',
                boxShadow: '0 6px 14px -6px rgba(0,0,0,0.3)',
              }}>+</button>
            );
          }
          return (
            <button key={label} style={{
              all: 'unset', cursor: 'pointer',
              padding: '6px 10px', borderRadius: 999,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              minWidth: 48,
            }}>
              <span style={{
                fontSize: 14, color: a ? palette.ink : palette.sepia,
              }}>{icon}</span>
              <span style={{
                fontFamily: mSerif, fontSize: 10.5,
                fontStyle: a ? 'italic' : 'normal',
                color: a ? palette.ink : palette.sepia,
              }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────── DASHBOARD ────────────────────────────────────
function MobileDashboard() {
  const greeting = 'Buenas tardes,';
  return (
    <IOSDevice>
      <div style={{
        height: '100%', overflow: 'auto',
        background: mC.paper, color: mC.ink, fontFamily: mSans,
        backgroundImage:
          'radial-gradient(circle at 25% 10%, rgba(255,255,255,0.6), transparent 60%),' +
          'radial-gradient(circle at 90% 95%, rgba(196,170,120,0.16), transparent 50%)',
        paddingBottom: 120,
      }}>
        <MStatusSpacer />
        <MHeader
          kicker="Jueves · 14 de mayo"
          title={greeting}
          italic="Tobías."
          right={
            <div style={{
              width: 38, height: 38, borderRadius: 999,
              background: mC.ink, color: mC.paper,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: mSerif, fontStyle: 'italic', fontSize: 15,
            }}>TC</div>
          }
        />

        {/* Balance hero — like the ledger row but stacked */}
        <div style={{
          margin: '0 22px 14px',
          border: `1px solid ${mC.rule}`, borderRadius: 12,
          background: 'rgba(255,255,255,0.45)',
          padding: '18px 20px',
        }}>
          <div style={{
            fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: mC.sepia, fontWeight: 600,
          }}>En tu cuenta</div>
          <div style={{
            fontFamily: mSerif, fontSize: 38, letterSpacing: '-0.03em',
            marginTop: 6, lineHeight: 1,
          }}>{mFmt(mSUM.balance)}</div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 14, paddingTop: 14,
            borderTop: `1px dashed ${mC.rule}`,
            fontSize: 12.5,
          }}>
            <div>
              <div style={{ color: mC.sepia, fontSize: 11 }}>Ingresos mayo</div>
              <div style={{ fontFamily: mSerif, fontSize: 16, color: mC.sage, fontStyle: 'italic' }}>
                + {mFmt(mSUM.income)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: mC.sepia, fontSize: 11 }}>Gastos mayo</div>
              <div style={{ fontFamily: mSerif, fontSize: 16, color: mC.wine, fontStyle: 'italic' }}>
                − {mFmt(mSUM.expense)}
              </div>
            </div>
          </div>
        </div>

        {/* Inline progress: budget consumed */}
        <div style={{ margin: '0 22px 18px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11.5, color: mC.sepia, marginBottom: 7,
          }}>
            <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 13, color: mC.ink }}>
              Tasa de ahorro
            </span>
            <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 13, color: mC.sage }}>40 %</span>
          </div>
          <div style={{
            height: 5, background: mC.sepiaSoft, borderRadius: 999, overflow: 'hidden',
          }}>
            <div style={{ width: '40%', height: '100%', background: mC.sage }} />
          </div>
        </div>

        {/* Top categories list */}
        <div style={{
          margin: '0 22px 18px',
          border: `1px solid ${mC.rule}`, borderRadius: 12,
          background: 'rgba(255,255,255,0.45)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: `1px solid ${mC.rule}`,
          }}>
            <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 15 }}>Dónde se fue</span>
            <span style={{ fontSize: 11, color: mC.sepia, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Top 4</span>
          </div>
          {mCATS.slice(0, 4).map((c, i) => {
            const max = mCATS[0].value;
            const pct = (c.value / max) * 100;
            return (
              <div key={c.name} style={{
                display: 'grid', gridTemplateColumns: '28px 90px 1fr 80px',
                gap: 10, padding: '10px 16px', alignItems: 'center',
                borderBottom: i < 3 ? `1px solid ${mC.ruleSoft}` : 'none',
              }}>
                <span style={{ fontSize: 15 }}>{c.icon}</span>
                <span style={{ fontFamily: mSerif, fontSize: 13.5 }}>{c.name}</span>
                <div style={{
                  height: 3, background: mC.sepiaSoft, borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{ width: pct + '%', height: '100%', background: mC.ink }} />
                </div>
                <span style={{ fontFamily: mMono, fontSize: 11.5, textAlign: 'right', color: mC.ink }}>
                  {mFmt(c.value)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Recent — compact ledger style */}
        <div style={{ margin: '0 22px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '0 4px 8px', marginBottom: 6,
            borderBottom: `1px solid ${mC.rule}`,
          }}>
            <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 15 }}>Movimientos recientes</span>
            <span style={{ fontSize: 11, color: mC.sepia, textDecoration: 'underline', textUnderlineOffset: 2 }}>Ver todo →</span>
          </div>
          {mREC.slice(0, 4).map((t) => (
            <div key={t.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 100px',
              gap: 10, padding: '9px 4px', alignItems: 'center',
              borderBottom: `1px solid ${mC.ruleSoft}`,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: mSerif, fontSize: 14, lineHeight: 1.2, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {t.desc}
                </div>
                <div style={{ fontSize: 10.5, color: mC.sepia, marginTop: 1, fontFamily: mMono }}>
                  {t.date}
                </div>
              </div>
              <span style={{
                fontFamily: mSerif, fontSize: 15, textAlign: 'right',
                color: t.type === 'INCOME' ? mC.sage : mC.ink,
              }}>{mFmt(t.amount, { sign: true })}</span>
            </div>
          ))}
        </div>

        <MTabBar active="Hoy" onPaper />
      </div>
    </IOSDevice>
  );
}

// ──────────────────────────── QUICK ADD ─────────────────────────────────────
// The killer flow: open the app, type the gasto, hit enter.
function MobileQuickAdd() {
  const recents = ['Supermercado', 'Restaurantes', 'Transporte', 'Servicios', 'Salud', 'Entretenimiento'];
  return (
    <IOSDevice keyboard>
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: mC.paper, color: mC.ink, fontFamily: mSans,
        backgroundImage:
          'radial-gradient(circle at 25% 10%, rgba(255,255,255,0.6), transparent 60%),' +
          'radial-gradient(circle at 90% 95%, rgba(196,170,120,0.16), transparent 50%)',
      }}>
        <MStatusSpacer />

        {/* Header — modal-y */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '8px 22px 18px',
        }}>
          <span style={{
            fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: mC.sepia, fontWeight: 600,
          }}>Anotar gasto</span>
          <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 14, color: mC.sepia }}>
            cancelar
          </span>
        </div>

        {/* The amount being typed */}
        <div style={{ padding: '0 22px', marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: mC.sepia, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
            Importe
          </div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6,
            paddingBottom: 8, borderBottom: `1px solid ${mC.ink}`,
          }}>
            <span style={{ fontFamily: mSerif, fontSize: 28, color: mC.sepia }}>$</span>
            <span style={{ fontFamily: mSerif, fontSize: 52, letterSpacing: '-0.03em', lineHeight: 1 }}>
              4.200
            </span>
            <span style={{
              width: 1.5, height: 38, background: mC.ink, marginLeft: 4,
              animation: 'cuaderno-blink 1s infinite',
            }} />
          </div>
          <style>{`@keyframes cuaderno-blink { 50% { opacity: 0; } }`}</style>
        </div>

        {/* Description input (selected) */}
        <div style={{ padding: '0 22px', marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: mC.sepia, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
            Descripción
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
            paddingBottom: 8, borderBottom: `1px solid ${mC.rule}`,
          }}>
            <span style={{
              fontFamily: mSerif, fontSize: 19, fontStyle: 'italic', color: mC.sepia,
            }}>Café y medialunas|</span>
          </div>
        </div>

        {/* Quick category chips */}
        <div style={{ padding: '0 22px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: mC.sepia, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
            Categoría · sugerencias
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {recents.map((c, i) => (
              <span key={c} style={{
                padding: '6px 11px', borderRadius: 999,
                border: `1px solid ${i === 1 ? mC.ink : mC.rule}`,
                background: i === 1 ? mC.ink : 'rgba(255,255,255,0.4)',
                color: i === 1 ? mC.paper : mC.ink,
                fontFamily: mSerif, fontSize: 13,
                fontStyle: i === 1 ? 'italic' : 'normal',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                {i === 1 && <span style={{ fontSize: 10 }}>❧</span>}
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ──────────────────────────── TRANSACCIONES ────────────────────────────────
function MobileTransactions() {
  const grouped = [
    { day: 'Hoy', net: 503660, items: mREC.slice(0, 2) },
    { day: 'Ayer', net: -5490, items: mREC.slice(2, 4) },
    { day: '12 may', net: -18400, items: mREC.slice(4, 5) },
    { day: '11 may', net: -24500, items: mREC.slice(5, 6) },
  ];
  return (
    <IOSDevice>
      <div style={{
        height: '100%', overflow: 'auto', position: 'relative',
        background: mC.paper, color: mC.ink, fontFamily: mSans,
        backgroundImage:
          'radial-gradient(circle at 25% 10%, rgba(255,255,255,0.6), transparent 60%),' +
          'radial-gradient(circle at 90% 95%, rgba(196,170,120,0.16), transparent 50%)',
        paddingBottom: 120,
      }}>
        <MStatusSpacer />
        <MHeader
          kicker="Mayo · 14 entradas"
          title="Movimientos"
          right={<span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 14, color: mC.sepia }}>filtros</span>}
        />

        {/* Search like a paper note */}
        <div style={{
          margin: '0 22px 18px',
          padding: '10px 14px', borderRadius: 999,
          border: `1px solid ${mC.rule}`,
          background: 'rgba(255,255,255,0.45)',
          fontSize: 13.5, color: mC.sepia, fontStyle: 'italic',
          fontFamily: mSerif, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⌕</span>
          buscar entre tus anotaciones…
        </div>

        {grouped.map((grp) => (
          <div key={grp.day} style={{ marginBottom: 18 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '0 22px 6px',
              marginBottom: 0,
            }}>
              <span style={{
                fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: mC.sepia, fontWeight: 600,
              }}>{grp.day}</span>
              <span style={{
                fontFamily: mMono, fontSize: 11.5,
                color: grp.net >= 0 ? mC.sage : mC.ink,
              }}>Neto {mFmt(grp.net, { sign: true })}</span>
            </div>
            <div style={{
              margin: '0 22px',
              borderTop: `1px solid ${mC.rule}`,
            }}>
              {grp.items.map((t) => (
                <div key={t.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 110px',
                  gap: 12, padding: '11px 4px', alignItems: 'center',
                  borderBottom: `1px solid ${mC.ruleSoft}`,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: mSerif, fontSize: 15, lineHeight: 1.2 }}>
                      {t.desc}
                    </div>
                    <div style={{ fontSize: 10.5, color: mC.sepia, marginTop: 1, display: 'flex', gap: 8 }}>
                      <span style={{ fontFamily: mMono }}>{t.date.split('·')[1]?.trim() ?? ''}</span>
                      <span>·</span>
                      <span>{t.category}</span>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: mSerif, fontSize: 16, textAlign: 'right',
                    color: t.type === 'INCOME' ? mC.sage : mC.ink,
                  }}>{mFmt(t.amount, { sign: true })}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <MTabBar active="Mov." onPaper />
      </div>
    </IOSDevice>
  );
}

// ──────────────────────────── INVERSIONES (TINTA) ───────────────────────────
function MobileInvestments() {
  return (
    <IOSDevice dark>
      <div style={{
        height: '100%', overflow: 'auto', position: 'relative',
        background: TINTA.bg, color: TINTA.ink, fontFamily: mSans,
        backgroundImage:
          'radial-gradient(circle at 20% 10%, rgba(212,168,90,0.08), transparent 55%)',
        paddingBottom: 120,
      }}>
        <MStatusSpacer />

        {/* Custom dark header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          padding: '12px 22px 18px',
        }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: TINTA.sepia, fontWeight: 600 }}>
              Portafolio · 14 may
            </div>
            <div style={{ fontFamily: mSerif, fontSize: 30, letterSpacing: '-0.025em', marginTop: 4, color: TINTA.ink }}>
              Tu portafolio
            </div>
          </div>
          <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 14, color: TINTA.sepia }}>filtros</span>
        </div>

        {/* Hero number */}
        <div style={{
          margin: '0 22px 14px',
          border: `1px solid ${TINTA.rule}`, borderRadius: 12,
          background: 'rgba(255,255,255,0.03)',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: TINTA.sepia, fontWeight: 600 }}>
            Valor actual
          </div>
          <div style={{
            fontFamily: mSerif, fontSize: 38, letterSpacing: '-0.03em',
            marginTop: 6, lineHeight: 1, color: TINTA.ink,
          }}>
            <span style={{ color: TINTA.gold, fontSize: 26 }}>$ </span>
            {new Intl.NumberFormat('es-AR').format(mPORT.current)}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 14, paddingTop: 14,
            borderTop: `1px dashed ${TINTA.rule}`,
          }}>
            <div>
              <div style={{ fontSize: 10.5, color: TINTA.sepia, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Invertido</div>
              <div style={{ fontFamily: mSerif, fontSize: 15, marginTop: 4, color: TINTA.ink }}>
                $ {new Intl.NumberFormat('es-AR').format(mPORT.invested)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10.5, color: TINTA.sepia, letterSpacing: '0.04em', textTransform: 'uppercase' }}>ROI</div>
              <div style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 18, color: TINTA.sage, marginTop: 2 }}>
                {mFmtPct(mPORT.roi, 2)}
              </div>
            </div>
          </div>
        </div>

        {/* Period selector */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '0 22px 14px',
          fontSize: 12, fontFamily: mSerif,
        }}>
          {['1S', '1M', '3M', '6M', 'YTD', '1A', 'Todo'].map((p, i) => (
            <span key={p} style={{
              color: i === 2 ? TINTA.ink : TINTA.sepia,
              fontStyle: i === 2 ? 'italic' : 'normal',
              textDecoration: i === 2 ? 'underline' : 'none',
              textUnderlineOffset: 4,
              textDecorationColor: TINTA.gold,
            }}>{p}</span>
          ))}
        </div>

        {/* Holdings list */}
        <div style={{ margin: '0 22px' }}>
          <div style={{
            fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: TINTA.sepia, fontWeight: 600,
            padding: '0 0 8px',
            display: 'flex', justifyContent: 'space-between',
            borderBottom: `1px solid ${TINTA.rule}`,
          }}>
            <span>Posiciones · 6</span>
            <span style={{ fontFamily: mSerif, fontStyle: 'italic', textTransform: 'none', letterSpacing: '0.02em' }}>peso · ROI</span>
          </div>
          {mINV.slice(0, 5).map((inv) => {
            const positive = inv.roi >= 0;
            const peso = ((inv.current / mPORT.current) * 100).toFixed(1);
            return (
              <div key={inv.id} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 90px',
                gap: 10, padding: '12px 0', alignItems: 'center',
                borderBottom: `1px solid rgba(54,70,90,0.55)`,
              }}>
                <div>
                  <div style={{ fontFamily: mSerif, fontSize: 16, color: TINTA.gold, letterSpacing: '0.01em' }}>
                    {inv.ticker}
                  </div>
                  <div style={{ fontSize: 9.5, color: TINTA.sepia, marginTop: 1 }}>{inv.type}</div>
                </div>
                <div>
                  <div style={{ fontFamily: mSerif, fontSize: 13.5, color: TINTA.ink, lineHeight: 1.2 }}>
                    {inv.desc}
                  </div>
                  <div style={{ fontFamily: mMono, fontSize: 10.5, color: TINTA.sepia, marginTop: 2 }}>
                    $ {new Intl.NumberFormat('es-AR').format(inv.current)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: mSerif, fontSize: 16, fontStyle: 'italic',
                    color: positive ? TINTA.sage : TINTA.wine,
                  }}>{mFmtPct(inv.roi)}</div>
                  <div style={{ fontFamily: mMono, fontSize: 10, color: TINTA.sepia, marginTop: 2 }}>{peso}%</div>
                </div>
              </div>
            );
          })}
        </div>

        <MTabBar active="Más" onPaper={false} />
      </div>
    </IOSDevice>
  );
}

// ──────────────────────────── METAS ────────────────────────────────────────
function MobileGoals() {
  return (
    <IOSDevice>
      <div style={{
        height: '100%', overflow: 'auto', position: 'relative',
        background: mC.paper, color: mC.ink, fontFamily: mSans,
        backgroundImage:
          'radial-gradient(circle at 25% 10%, rgba(255,255,255,0.6), transparent 60%),' +
          'radial-gradient(circle at 90% 95%, rgba(196,170,120,0.16), transparent 50%)',
        paddingBottom: 120,
      }}>
        <MStatusSpacer />
        <MHeader
          kicker="4 activas"
          title="Tus"
          italic="propósitos."
          right={
            <button style={{
              all: 'unset', cursor: 'pointer',
              width: 38, height: 38, borderRadius: 999,
              background: mC.ink, color: mC.paper,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: mSerif, fontSize: 22, lineHeight: 1,
            }}>+</button>
          }
        />

        {/* Combined progress strip */}
        <div style={{
          margin: '0 22px 18px',
          padding: '14px 18px',
          border: `1px solid ${mC.rule}`, borderRadius: 12,
          background: 'rgba(255,255,255,0.45)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 14, color: mC.sepia }}>
              Total ahorrado
            </span>
            <span style={{ fontFamily: mSerif, fontSize: 22, letterSpacing: '-0.02em' }}>
              {mFmt(1690000)}
            </span>
          </div>
          <div style={{ height: 5, background: mC.sepiaSoft, borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ width: '53%', height: '100%', background: mC.sage }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 6,
            fontSize: 10.5, color: mC.sepia, fontFamily: mMono,
          }}>
            <span>53 % alcanzado</span>
            <span>objetivo {mFmt(3180000)}</span>
          </div>
        </div>

        {/* Goals list (stacked cards) */}
        <div style={{ margin: '0 22px' }}>
          {mGOALS.map((g, i) => (
            <div key={g.id} style={{
              padding: '14px 0',
              borderTop: i === 0 ? `1px solid ${mC.rule}` : 'none',
              borderBottom: `1px solid ${mC.ruleSoft}`,
              display: 'grid', gridTemplateColumns: '38px 1fr 56px',
              gap: 12, alignItems: 'center',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: mC.sepiaSoft, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{g.icon}</div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: mSerif, fontSize: 15, fontWeight: 500 }}>{g.name}</span>
                </div>
                <div style={{ fontSize: 10.5, color: mC.sepia, fontFamily: mMono, marginTop: 1 }}>
                  {mFmt(g.current)} de {mFmt(g.target)} · ETA {g.eta}
                </div>
                <div style={{
                  marginTop: 6, height: 4, background: mC.sepiaSoft, borderRadius: 999, overflow: 'hidden',
                }}>
                  <div style={{
                    width: g.percent + '%', height: '100%',
                    background: g.percent >= 80 ? mC.sage : mC.ink,
                  }} />
                </div>
              </div>
              <span style={{
                fontFamily: mSerif, fontStyle: 'italic', fontSize: 22,
                textAlign: 'right',
                color: g.percent >= 80 ? mC.sage : mC.ink,
              }}>{g.percent}%</span>
            </div>
          ))}
        </div>

        <MTabBar active="Metas" onPaper />
      </div>
    </IOSDevice>
  );
}

// ──────────────────────────── META DETALLE ─────────────────────────────────
function MobileGoalDetail() {
  const g = mGOALS[0];
  return (
    <IOSDevice>
      <div style={{
        height: '100%', overflow: 'auto', position: 'relative',
        background: mC.paper, color: mC.ink, fontFamily: mSans,
        backgroundImage:
          'radial-gradient(circle at 25% 10%, rgba(255,255,255,0.6), transparent 60%),' +
          'radial-gradient(circle at 90% 95%, rgba(196,170,120,0.16), transparent 50%)',
        paddingBottom: 120,
      }}>
        <MStatusSpacer />

        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 22px 18px',
        }}>
          <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 14, color: mC.sepia }}>
            ← Metas
          </span>
          <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 14, color: mC.sepia }}>
            editar
          </span>
        </div>

        {/* Hero */}
        <div style={{
          padding: '0 22px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', marginBottom: 22,
        }}>
          <div style={{
            fontSize: 48, width: 80, height: 80, borderRadius: 16,
            background: mC.sepiaSoft, display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 10,
          }}>{g.icon}</div>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: mC.sepia, fontWeight: 600 }}>
            {g.category}
          </div>
          <div style={{ fontFamily: mSerif, fontSize: 26, letterSpacing: '-0.02em', marginTop: 4 }}>
            {g.name}
          </div>
          <div style={{
            fontFamily: mSerif, fontStyle: 'italic', fontSize: 13,
            color: mC.sepia, marginTop: 8, lineHeight: 1.4, maxWidth: 280,
          }}>«{g.note}»</div>
        </div>

        {/* Big number */}
        <div style={{
          margin: '0 22px 16px',
          padding: '20px 20px 18px',
          border: `1px solid ${mC.rule}`, borderRadius: 12,
          background: 'rgba(255,255,255,0.45)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: mC.sepia, fontWeight: 600 }}>
            Ahorrado de {mFmt(g.target)}
          </div>
          <div style={{
            fontFamily: mSerif, fontSize: 44, letterSpacing: '-0.03em',
            marginTop: 4, lineHeight: 1,
          }}>{mFmt(g.current)}</div>
          <div style={{ marginTop: 14, height: 8, background: mC.sepiaSoft, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: g.percent + '%', height: '100%', background: mC.sage }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 8,
            fontSize: 11, color: mC.sepia,
          }}>
            <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 13, color: mC.sage }}>{g.percent}%</span>
            <span style={{ fontFamily: mSerif, fontStyle: 'italic' }}>faltan {mFmt(g.target - g.current)}</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
          margin: '0 22px 18px',
        }}>
          {[
            ['Aporte mensual', mFmt(g.monthly)],
            ['ETA estimada', g.eta],
          ].map(([l, v]) => (
            <div key={l} style={{
              border: `1px solid ${mC.rule}`, borderRadius: 10,
              background: 'rgba(255,255,255,0.45)',
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: mC.sepia, fontWeight: 600 }}>{l}</div>
              <div style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 17, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Aporte CTA */}
        <div style={{ margin: '0 22px 18px' }}>
          <button style={{
            all: 'unset', cursor: 'pointer', width: '100%',
            background: mC.ink, color: mC.paper,
            padding: '14px', borderRadius: 999,
            textAlign: 'center', fontSize: 14, fontWeight: 600,
            boxSizing: 'border-box',
          }}>+ Sumar un aporte</button>
        </div>

        {/* History list */}
        <div style={{ margin: '0 22px' }}>
          <div style={{
            fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: mC.sepia, fontWeight: 600,
            padding: '0 0 8px',
            borderBottom: `1px solid ${mC.rule}`,
          }}>Últimos aportes</div>
          {g.history.slice(0, 4).map((h, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 90px',
              gap: 10, padding: '10px 0', alignItems: 'center',
              borderBottom: `1px solid ${mC.ruleSoft}`,
            }}>
              <span style={{ fontFamily: mMono, fontSize: 11, color: mC.sepia }}>{h.date}</span>
              <span style={{ fontFamily: mSerif, fontSize: 13.5 }}>{h.source}</span>
              <span style={{ fontFamily: mSerif, fontStyle: 'italic', fontSize: 14, textAlign: 'right', color: mC.sage }}>
                + {mFmt(h.amount)}
              </span>
            </div>
          ))}
        </div>

        <MTabBar active="Metas" onPaper />
      </div>
    </IOSDevice>
  );
}

// ──────────────────────────── LOGIN ────────────────────────────────────────
function MobileLogin() {
  return (
    <IOSDevice>
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: mC.paper, color: mC.ink, fontFamily: mSans,
        backgroundImage:
          'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.6), transparent 55%),' +
          'radial-gradient(circle at 80% 90%, rgba(196,170,120,0.22), transparent 50%)',
        padding: '70px 26px 40px',
      }}>
        {/* Wordmark */}
        <div>
          <div style={{ fontFamily: mSerif, fontSize: 22, letterSpacing: '-0.02em', fontWeight: 500 }}>
            MyFinances<span style={{ color: mC.wine }}>.</span>
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: mC.sepia, fontWeight: 600, marginTop: 4 }}>
            Cuaderno de cuentas
          </div>
        </div>

        {/* Quote / story */}
        <div style={{ marginTop: 'auto', marginBottom: 26 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: mC.sepia, fontWeight: 600 }}>
            Bienvenido, otra vez.
          </div>
          <div style={{
            fontFamily: mSerif, fontWeight: 400, fontSize: 32,
            letterSpacing: '-0.025em', lineHeight: 1.1, margin: '10px 0 0',
          }}>
            Abrí <em style={{ color: mC.sepia }}>tu cuaderno.</em>
          </div>
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: mC.sepia, fontWeight: 600, marginBottom: 6 }}>
            Email
          </div>
          <div style={{
            borderBottom: `1px solid ${mC.ink}`, paddingBottom: 6,
            fontFamily: mSerif, fontSize: 17,
          }}>tobias.cerutti@gmail.com</div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: mC.sepia, fontWeight: 600, marginBottom: 6 }}>
            <span>Contraseña</span>
            <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>Olvidé</span>
          </div>
          <div style={{
            borderBottom: `1px solid ${mC.rule}`, paddingBottom: 6,
            fontFamily: mSerif, fontSize: 17, letterSpacing: '0.18em',
          }}>••••••••</div>
        </div>

        {/* CTA */}
        <button style={{
          all: 'unset', cursor: 'pointer', width: '100%',
          background: mC.ink, color: mC.paper, padding: '14px 18px',
          borderRadius: 999, fontSize: 14, fontWeight: 600,
          textAlign: 'center', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Entrar al cuaderno <span style={{ fontSize: 16 }}>→</span>
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          margin: '18px 0', fontSize: 11, color: mC.sepia,
          fontStyle: 'italic', fontFamily: mSerif,
        }}>
          <div style={{ flex: 1, height: 1, background: mC.rule }} /> o continuá con <div style={{ flex: 1, height: 1, background: mC.rule }} />
        </div>

        <button style={{
          all: 'unset', cursor: 'pointer', width: '100%',
          border: `1px solid ${mC.rule}`, padding: '12px 18px',
          borderRadius: 999, fontSize: 13.5, fontWeight: 600,
          textAlign: 'center', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10, boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.4)',
        }}>
          <span style={{
            width: 16, height: 16, borderRadius: 999,
            background: 'conic-gradient(from -90deg, #ea4335, #fbbc04 90deg, #34a853 180deg, #4285f4 270deg, #ea4335)',
            display: 'inline-block',
          }} />
          Google
        </button>

        <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 22, fontSize: 12, color: mC.sepia }}>
          ¿Primera vez? <span style={{ color: mC.ink, fontFamily: mSerif, fontStyle: 'italic', textDecoration: 'underline', textUnderlineOffset: 3 }}>Empezá tu cuaderno</span>
        </div>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, {
  MobileDashboard, MobileQuickAdd, MobileTransactions,
  MobileInvestments, MobileGoals, MobileGoalDetail, MobileLogin,
});
