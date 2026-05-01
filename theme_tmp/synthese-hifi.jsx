/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakRadio */

const { useEffect } = React;

// Shared illu reused
const TeacupIllu = ({ stroke = "#5a3a14", accent = "#d68a3c" }) => (
  <svg viewBox="0 0 64 64" fill="none">
    <path d="M22 10 q -3 6 0 12 M32 8 q -3 6 0 12 M42 10 q -3 6 0 12"
      stroke={stroke} strokeWidth="1.6" strokeLinecap="round" opacity=".55"/>
    <path d="M14 28 h36 v14 a14 14 0 0 1 -14 14 h-8 a14 14 0 0 1 -14 -14 z"
      fill={accent} stroke={stroke} strokeWidth="1.8"/>
    <ellipse cx="32" cy="28" rx="18" ry="3" fill="#3a230a" opacity=".25"/>
    <path d="M50 32 q 8 0 8 8 q 0 8 -8 8" stroke={stroke} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <ellipse cx="32" cy="58" rx="22" ry="3" fill={stroke} opacity=".25"/>
  </svg>
);

const PlantIllu = ({ stroke = "#3a4d2a", leaf = "#6b8a5a", pot = "#c87067" }) => (
  <svg viewBox="0 0 48 56" fill="none">
    <path d="M24 32 q -10 -8 -14 -22 q 12 4 14 22 z" fill={leaf} stroke={stroke} strokeWidth="1.4"/>
    <path d="M24 32 q 10 -8 14 -22 q -12 4 -14 22 z" fill={leaf} stroke={stroke} strokeWidth="1.4" opacity=".85"/>
    <path d="M24 32 q 0 -10 0 -22" stroke={stroke} strokeWidth="1.4"/>
    <path d="M10 36 h28 l -3 16 h-22 z" fill={pot} stroke="#8a3e35" strokeWidth="1.4"/>
    <rect x="9" y="34" width="30" height="4" rx="1" fill="#a04a3e" stroke="#8a3e35" strokeWidth="1.2"/>
  </svg>
);

const I = {
  home:  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>,
  trend: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></svg>,
  clock: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  gift:  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13h18M12 9v11M8 9a3 3 0 1 1 4-3 3 3 0 1 1 4 3"/></svg>,
  cal:   <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  cog:   <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.4l2-1.5-2-3.5-2.4 1A7 7 0 0 0 14 4.6L13.6 2h-3.2L10 4.6a7 7 0 0 0-2.5 2l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .5 0 1 .1 1.4l-2 1.5 2 3.5 2.4-1c.7.9 1.6 1.5 2.5 2L10.4 22h3.2l.4-2.6c1-.5 1.8-1.1 2.5-2l2.4 1 2-3.5-2-1.5c.1-.4.1-.9.1-1.4z"/></svg>,
  out:   <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  arrL:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  arrR:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
  sun:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  moon:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>,
  save:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>,
};

const Sidebar = ({ active }) => {
  const items = [
    ["Accueil", I.home],
    ["Synthèse mensuelle", I.trend],
    ["Compteur heures", I.clock],
    ["Primes", I.gift],
    ["Tableau annuel", I.cal],
    ["Réglages", I.cog],
  ];
  return (
    <aside className="side">
      <div className="brand">
        <div className="mark">S</div>
        <div className="name">salairio</div>
      </div>
      <div>
        <div className="lbl" style={{ marginBottom: 8, paddingLeft: 4 }}>navigation</div>
        <nav className="nav">
          {items.map(([n, ico]) => (
            <div key={n} className={`item ${active === n ? "on" : ""}`}>{ico}<span>{n}</span></div>
          ))}
        </nav>
      </div>
      <div className="footer">
        <div className="me">
          <div className="av">M</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Marine</div>
            <div className="mail">marine@gmail.com</div>
          </div>
        </div>
        <div className="out">{I.out}<span>Déconnexion</span></div>
      </div>
    </aside>
  );
};

// ──────────────────────────────────────────────────────────
// SYNTHÈSE A — receipt + breakdown
// ──────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "cosy",
  "hue": "amber",
  "month": "avril 2026"
}/*EDITMODE-END*/;

const Bars = ({ data, labels, highlight = data.length - 1 }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap: 10, height: 130, padding: "8px 4px" }}>
      {data.map((v, i) => (
        <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: 6, flex: 1 }}>
          <div style={{
            width: "100%", maxWidth: 22,
            height: `${(v / max) * 110}px`,
            background: i === highlight ? "var(--amber)" : "var(--ink)",
            borderRadius: "4px 4px 2px 2px",
            opacity: i === highlight ? 1 : 0.65,
          }}/>
          <div style={{ fontFamily:"JetBrains Mono", fontSize: 10, color: "var(--ink-3)" }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = tweaks.theme;
    root.dataset.density = tweaks.density;
    root.dataset.hue = tweaks.hue;
  }, [tweaks.theme, tweaks.density, tweaks.hue]);

  return (
    <>
      <div className="app">
        <Sidebar active="Synthèse mensuelle"/>

        <main className="main">
          <div className="top">
            <div className="greeting">
              <div className="lbl">synthèse — {tweaks.month}</div>
              <h1>Ce que tu vas toucher.</h1>
              <p>Ton estimation détaillée pour le mois, avec la décomposition de la fiche de paie et l'évolution sur l'année.</p>
            </div>
            <div className="top-actions">
              <button className="theme-toggle"
                onClick={() => setTweak("theme", tweaks.theme === "light" ? "dark" : "light")}>
                {tweaks.theme === "light" ? I.moon : I.sun}
                <span>{tweaks.theme === "light" ? "Mode nuit" : "Mode jour"}</span>
              </button>
              <div className="month-pick">
                <div className="arr">{I.arrL}</div>
                <div className="label">{tweaks.month}</div>
                <div className="arr">{I.arrR}</div>
              </div>
            </div>
          </div>

          {/* RECEIPT + BREAKDOWN */}
          <div style={{ display:"grid", gridTemplateColumns: "minmax(420px, 480px) 1fr", gap: 24, alignItems:"start" }}>

            {/* receipt */}
            <section style={{
              background: "linear-gradient(180deg, #fbf6ea 0%, #f5edd9 100%)",
              padding: "32px 32px 18px",
              boxShadow: "0 12px 32px -16px rgba(29,26,23,.3), 0 1px 0 rgba(29,26,23,.08)",
              position: "relative",
              clipPath: "polygon(0 0,100% 0,100% calc(100% - 14px),96% 100%,92% calc(100% - 8px),88% 100%,84% calc(100% - 8px),80% 100%,76% calc(100% - 8px),72% 100%,68% calc(100% - 8px),64% 100%,60% calc(100% - 8px),56% 100%,52% calc(100% - 8px),48% 100%,44% calc(100% - 8px),40% 100%,36% calc(100% - 8px),32% 100%,28% calc(100% - 8px),24% 100%,20% calc(100% - 8px),16% 100%,12% calc(100% - 8px),8% 100%,4% calc(100% - 8px),0 calc(100% - 14px))",
              color: "#1d1a17",
            }}>
              <div style={{ textAlign:"center", marginBottom: 18 }}>
                <div className="hand" style={{ fontSize: 22, color: "#5a3a14" }}>· salairio ·</div>
                <div className="lbl" style={{ marginTop: 4 }}>reçu mensuel · avril 2026</div>
                <div className="lbl" style={{ fontSize: 9, marginTop: 2, color: "#8a8278" }}>estimation indicative · n'a pas valeur de bulletin</div>
              </div>

              <div style={{
                height: 1, background: "repeating-linear-gradient(90deg, #1d1a17 0 4px, transparent 4px 8px)",
                opacity: .35, marginBottom: 16,
              }}/>

              <div style={{ display:"flex", flexDirection:"column", gap: 8, fontFamily:"JetBrains Mono", fontSize: 13 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>Salaire de base</span><span>2 426,72 €</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>Heures supp. (6h15)</span><span style={{ color:"var(--moss)" }}>+ 142,50 €</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span>Majoration dimanche</span><span style={{ color:"var(--moss)" }}>+ 52,80 €</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight: 600, paddingTop: 6, borderTop: "1px solid rgba(29,26,23,.15)" }}>
                  <span>Brut total</span><span>2 622,02 €</span>
                </div>

                <div style={{ height: 8 }}/>

                <div style={{ display:"flex", justifyContent:"space-between", color:"var(--rose)" }}>
                  <span>Cotisations salariales</span><span>− 533,88 €</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", color:"var(--rose)" }}>
                  <span>Mutuelle (part salariale)</span><span>− 30,00 €</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop: 6, borderTop: "1px solid rgba(29,26,23,.15)" }}>
                  <span>Net imposable</span><span>2 058,14 €</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", color:"var(--rose)" }}>
                  <span>Prélèvement à la source (4,1 %)</span><span>− 84,38 €</span>
                </div>
              </div>

              <div style={{
                margin: "14px 0",
                height: 8,
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='8'><path d='M2 4 Q 25 0 50 4 T 100 4 T 150 4 T 200 4' stroke='%231d1a17' stroke-width='1.2' fill='none' opacity='.5'/></svg>\")",
                backgroundRepeat: "repeat-x",
              }}/>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                <span style={{ fontFamily:"Fraunces", fontWeight: 600, fontSize: 22 }}>Net après PAS</span>
                <span style={{ fontFamily:"Fraunces", fontWeight: 700, fontSize: 36, color:"#5a3a14" }}>1 973,76 €</span>
              </div>

              <div style={{
                marginTop: 18, display:"flex", justifyContent:"center",
              }}>
                <button style={{
                  display:"inline-flex", alignItems:"center", gap: 8,
                  padding: "12px 24px", borderRadius: 999,
                  background: "var(--ink)", color: "var(--paper)",
                  border: "none", cursor:"pointer",
                  fontFamily: "Inter", fontSize: 14, fontWeight: 600,
                }}>
                  {I.save} Sauvegarder l'estimation
                </button>
              </div>
            </section>

            {/* right column */}
            <div style={{ display:"flex", flexDirection:"column", gap: 20 }}>
              {/* repartition */}
              <section className="panel">
                <div className="panel-h">
                  <h3>D'où vient ton net</h3>
                  <span className="lbl">73% qui arrive sur ton compte</span>
                </div>
                <div style={{
                  display:"flex", height: 36, borderRadius: 999, overflow:"hidden",
                  border:"1px solid var(--rule)",
                }}>
                  <div style={{ width:"75%", background:"var(--moss)", display:"grid", placeItems:"center", color:"#f6f1e7", fontFamily:"JetBrains Mono", fontSize: 12, fontWeight: 600 }}>net 75%</div>
                  <div style={{ width:"22%", background:"var(--rose)", display:"grid", placeItems:"center", color:"#f6f1e7", fontFamily:"JetBrains Mono", fontSize: 12, fontWeight: 600 }}>cot. 22%</div>
                  <div style={{ width:"3%",  background:"var(--ink)" }}/>
                </div>
                <div className="legend" style={{ marginTop: 14 }}>
                  <span><span className="d" style={{ background:"var(--moss)" }}/>Net qui arrive sur ton compte · 1 973,76 €</span>
                  <span><span className="d" style={{ background:"var(--rose)" }}/>Cotisations & mutuelle · 563,88 €</span>
                  <span><span className="d" style={{ background:"var(--ink)" }}/>Prélèvement à la source · 84,38 €</span>
                </div>
              </section>

              {/* compteur */}
              <section className="panel">
                <div className="panel-h">
                  <h3>Compteur du mois</h3>
                  <span className="pill" style={{ background:"var(--paper-3)", color:"var(--ink-2)", border:"1px solid var(--rule)" }}>≈ équilibré</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 12 }}>
                  <div style={{
                    padding: 16, borderRadius: 16,
                    background: "color-mix(in oklab, var(--moss) 22%, var(--paper-2))",
                    border: "1px solid color-mix(in oklab, var(--moss) 40%, transparent)",
                  }}>
                    <div className="lbl">crédit</div>
                    <div style={{ fontFamily:"Fraunces", fontWeight: 600, fontSize: 30, marginTop: 4, color: "var(--moss)" }}>+2h25</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>heures de plus</div>
                  </div>
                  <div style={{
                    padding: 16, borderRadius: 16,
                    background: "var(--ink)", color: "var(--paper)",
                  }}>
                    <div className="lbl" style={{ color: "var(--amber-soft)" }}>débit</div>
                    <div style={{ fontFamily:"Fraunces", fontWeight: 600, fontSize: 30, marginTop: 4 }}>−10h20</div>
                    <div style={{ fontSize: 12, opacity: .7 }}>heures dûes</div>
                  </div>
                  <div style={{
                    padding: 16, borderRadius: 16,
                    background: "var(--amber-soft)",
                    border: "1px solid rgba(214,138,60,.4)",
                    color: "#3d2a0a",
                  }}>
                    <div className="lbl" style={{ color: "rgba(74,68,61,.7)" }}>solde</div>
                    <div style={{ fontFamily:"Fraunces", fontWeight: 600, fontSize: 30, marginTop: 4 }}>−7h55</div>
                    <div style={{ fontSize: 12, color: "rgba(74,68,61,.8)" }}>déficit doux</div>
                  </div>
                </div>
              </section>

              {/* 12 mois */}
              <section className="panel">
                <div className="panel-h">
                  <h3>12 derniers mois</h3>
                  <span className="lbl">net après prélèvement</span>
                </div>
                <Bars
                  data={[1612, 1648, 1701, 1665, 1722, 1738, 1689, 1755, 1748, 1701, 1748, 1973]}
                  labels={["mai","jun","jul","aoû","sep","oct","nov","déc","jan","fév","mar","avr"]}
                />
              </section>
            </div>
          </div>

          {/* COSY ROW */}
          <div className="recap">
            <section className="advice" style={{ alignItems: "center" }}>
              <div className="illu" style={{ width: 76, height: 76 }}><TeacupIllu/></div>
              <div className="body">
                <span className="hand">« beau mois, Marine »</span>
                <div className="text">
                  Tu es à <b>+38€</b> vs mars malgré un déficit horaire. Tes heures sup compensent — continue comme ça pour mai.
                </div>
              </div>
            </section>
            <section className="panel" style={{ display:"flex", gap: 18, alignItems:"center" }}>
              <div style={{ width: 80, height: 80, flexShrink: 0 }}><PlantIllu/></div>
              <div>
                <div className="lbl">cap pour mai</div>
                <h3 style={{ fontFamily:"Fraunces", fontSize: 22, margin: "4px 0 8px", fontWeight: 600 }}>+100% le 1ᵉʳ</h3>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Le 1ᵉʳ mai férié va te rapporter une jolie majoration. Mai s'annonce calme côté postes.
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Apparence">
          <TweakRadio label="Thème" value={tweaks.theme} onChange={(v) => setTweak("theme", v)}
            options={[{ value:"light", label:"Jour" }, { value:"dark", label:"Nuit" }]}/>
          <TweakRadio label="Densité" value={tweaks.density} onChange={(v) => setTweak("density", v)}
            options={[{ value:"cosy", label:"Aérée" }, { value:"compact", label:"Compacte" }]}/>
        </TweakSection>
        <TweakSection title="Données">
          <TweakRadio label="Mois affiché" value={tweaks.month} onChange={(v) => setTweak("month", v)}
            options={[
              { value:"mars 2026", label:"mars" },
              { value:"avril 2026", label:"avril" },
              { value:"mai 2026", label:"mai" },
            ]}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
