/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle */

const { useEffect } = React;

// ──────────────────────────────────────────────────────────
// Custom illustrations — simple monochrome line+fill
// ──────────────────────────────────────────────────────────

const MoonStarsIllu = ({ stroke = "#f1c987", fill = "#f1c987" }) => (
  <svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" fill="none">
    <defs>
      <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={fill} stopOpacity=".18"/>
        <stop offset="100%" stopColor={fill} stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="120" cy="100" r="90" fill="url(#moon-glow)"/>
    {/* Moon crescent */}
    <path
      d="M150 60 a 50 50 0 1 0 0 80 a 38 38 0 1 1 0 -80 z"
      fill={fill} opacity=".95"/>
    {/* tiny craters */}
    <circle cx="138" cy="86" r="3" fill="#e0a868" opacity=".5"/>
    <circle cx="148" cy="110" r="4" fill="#e0a868" opacity=".5"/>
    <circle cx="128" cy="118" r="2.5" fill="#e0a868" opacity=".5"/>
    {/* stars */}
    <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
      <path d="M50 50 v10 M45 55 h10"/>
      <path d="M70 130 v8 M66 134 h8"/>
      <path d="M30 110 v6 M27 113 h6"/>
      <path d="M180 40 v6 M177 43 h6"/>
    </g>
  </svg>
);

const TeacupIllu = ({ stroke = "#5a3a14", accent = "#d68a3c" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* steam */}
    <path d="M22 10 q -3 6 0 12 M32 8 q -3 6 0 12 M42 10 q -3 6 0 12"
      stroke={stroke} strokeWidth="1.6" strokeLinecap="round" opacity=".55" fill="none"/>
    {/* cup body */}
    <path d="M14 28 h36 v14 a14 14 0 0 1 -14 14 h-8 a14 14 0 0 1 -14 -14 z"
      fill={accent} stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/>
    {/* rim */}
    <ellipse cx="32" cy="28" rx="18" ry="3" fill="#3a230a" opacity=".25"/>
    {/* handle */}
    <path d="M50 32 q 8 0 8 8 q 0 8 -8 8" stroke={stroke} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    {/* saucer */}
    <ellipse cx="32" cy="58" rx="22" ry="3" fill={stroke} opacity=".25"/>
  </svg>
);

const PlantIllu = ({ stroke = "#3a4d2a", leaf = "#6b8a5a", pot = "#c87067" }) => (
  <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* leaves */}
    <path d="M24 32 q -10 -8 -14 -22 q 12 4 14 22 z" fill={leaf} stroke={stroke} strokeWidth="1.4"/>
    <path d="M24 32 q 10 -8 14 -22 q -12 4 -14 22 z" fill={leaf} stroke={stroke} strokeWidth="1.4" opacity=".85"/>
    <path d="M24 32 q 0 -10 0 -22" stroke={stroke} strokeWidth="1.4"/>
    {/* pot */}
    <path d="M10 36 h28 l -3 16 h-22 z" fill={pot} stroke="#8a3e35" strokeWidth="1.4" strokeLinejoin="round"/>
    <rect x="9" y="34" width="30" height="4" rx="1" fill="#a04a3e" stroke="#8a3e35" strokeWidth="1.2"/>
  </svg>
);

const CoinJarIllu = () => (
  <svg viewBox="0 0 64 64" fill="none">
    <path d="M14 22 h36 v32 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 z"
      fill="#f1c987" stroke="#5a3a14" strokeWidth="1.8"/>
    <ellipse cx="32" cy="22" rx="18" ry="4" fill="#e0a868" stroke="#5a3a14" strokeWidth="1.8"/>
    <rect x="26" y="20" width="12" height="3" rx="1" fill="#5a3a14"/>
    {/* coins inside */}
    <circle cx="24" cy="40" r="4" fill="#d68a3c"/>
    <circle cx="34" cy="46" r="3.5" fill="#d68a3c"/>
    <circle cx="42" cy="38" r="3" fill="#d68a3c"/>
  </svg>
);

// ──────────────────────────────────────────────────────────
// Sparkline
// ──────────────────────────────────────────────────────────

const Sparkline = ({ data = [], stroke = "#f1c987", fill = "rgba(241,201,135,.18)" }) => {
  const W = 320, H = 92, PAD = 4;
  const max = Math.max(...data), min = Math.min(...data);
  const xs = data.map((_, i) => PAD + (i * (W - PAD*2)) / (data.length - 1));
  const ys = data.map(v => H - PAD - ((v - min) / (max - min || 1)) * (H - PAD*2));
  const path = xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
  const area = `${path} L ${W-PAD} ${H-PAD} L ${PAD} ${H-PAD} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark" preserveAspectRatio="none">
      <path d={area} fill={fill}/>
      <path d={path} stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3.5" fill={stroke}/>
    </svg>
  );
};

// ──────────────────────────────────────────────────────────
// Sidebar nav icons
// ──────────────────────────────────────────────────────────

const I = {
  home:    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>,
  trend:   <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></svg>,
  clock:   <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  gift:    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13h18M12 9v11M8 9a3 3 0 1 1 4-3 3 3 0 1 1 4 3"/></svg>,
  cal:     <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  cog:     <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.97 7.97 0 0 0 0-6l2-1.5-2-3.5-2.4 1a8 8 0 0 0-5.2-3l-.4-2.5h-4l-.4 2.5a8 8 0 0 0-5.2 3L0 4l-2 3.5L0 9a7.97 7.97 0 0 0 0 6l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 5.2 3l.4 2.5h4l.4-2.5a8 8 0 0 0 5.2-3l2.4 1 2-3.5z" transform="translate(2)"/></svg>,
  out:     <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  arrL:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  arrR:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
  sun:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  moon:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>,
  search:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  plus:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
};

// ──────────────────────────────────────────────────────────
// Calendar data — april 2026 (well-filled month)
// April 1 2026 is a Wednesday → grid starts Mon=blank, Tue=blank, Wed=1
// ──────────────────────────────────────────────────────────

// each entry: type (matin|aprem|recup|conge|ferie), hours (display), majoration?
const SCHEDULE = {
  1: ["matin", "06:30 → 16:50"],
  2: ["aprem", "11:10 → 21:30"],
  3: ["matin", "06:30 → 16:50"],
  // 4-5 weekend
  6: ["matin", "06:30 → 16:50"],
  7: ["aprem", "11:10 → 21:30"],
  8: ["recup", "récup"],
  9: ["matin", "06:30 → 16:50"],
  10: ["aprem", "11:10 → 21:30"],
  // 11-12 weekend
  13: ["matin", "06:30 → 16:50"],
  14: ["aprem", "11:10 → 21:30"],
  15: ["matin", "06:30 → 16:50"],
  16: ["aprem", "11:10 → 21:30"],
  17: ["recup", "récup"],
  // 18-19 weekend
  19: ["matin", "+25%"],   // dimanche
  20: ["aprem", "11:10 → 21:30"],
  21: ["matin", "06:30 → 16:50"],
  22: ["aprem", "11:10 → 21:30"],
  23: ["matin", "06:30 → 16:50"],
  24: ["aprem", "11:10 → 21:30"],
  // 25-26
  26: ["conge", "congé"],
  27: ["matin", "06:30 → 16:50"],
  28: ["aprem", "11:10 → 21:30"],
  29: ["recup", "récup"],
  30: ["matin", "06:30 → 16:50"],
};

const TODAY = 27;

const Calendar = () => {
  // April 2026 — 1st = Wednesday → 2 leading blanks (mon, tue)
  const cells = [];
  for (let i = 0; i < 2; i++) cells.push({ blank: true, key: `b${i}` });
  for (let d = 1; d <= 30; d++) {
    const e = SCHEDULE[d];
    cells.push({ d, type: e?.[0], detail: e?.[1] });
  }
  // pad to 35
  while (cells.length < 35) cells.push({ blank: true, key: `t${cells.length}` });

  const tagLabel = (t) => ({ matin:"M", aprem:"A", recup:"R", conge:"C", ferie:"F" }[t] || "");

  return (
    <div className="cal">
      {["lun","mar","mer","jeu","ven","sam","dim"].map((d, i) => <div key={i} className="h">{d}</div>)}
      {cells.map((c, i) => {
        if (c.blank) return <div key={c.key || i} className="cell dim"></div>;
        const cls = `cell ${c.type || ""} ${c.d === TODAY ? "today" : ""}`;
        return (
          <div key={c.d} className={cls}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <span className="num">{c.d}</span>
              {c.type && <span className="tag">{tagLabel(c.type)}</span>}
            </div>
            {c.type && c.type !== "recup" && c.type !== "conge" && (
              <div className="hours">{c.detail}</div>
            )}
            {(c.type === "recup" || c.type === "conge") && (
              <div className="hours" style={{ fontStyle: "italic", opacity: .8 }}>{c.detail}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// Main screen
// ──────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "cosy",
  "hue": "amber",
  "month": "avril 2026"
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // sync to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = tweaks.theme;
    root.dataset.density = tweaks.density;
    root.dataset.hue = tweaks.hue;
  }, [tweaks.theme, tweaks.density, tweaks.hue]);

  return (
    <>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="side">
          <div className="brand">
            <div className="mark">S</div>
            <div className="name">salairio</div>
          </div>

          <div>
            <div className="lbl" style={{ marginBottom: 8, paddingLeft: 4 }}>navigation</div>
            <nav className="nav">
              <div className="item on">{I.home}<span>Accueil</span></div>
              <div className="item">{I.trend}<span>Synthèse mensuelle</span></div>
              <div className="item">{I.clock}<span>Compteur heures</span></div>
              <div className="item">{I.gift}<span>Primes</span></div>
              <div className="item">{I.cal}<span>Tableau annuel</span></div>
              <div className="item">{I.cog}<span>Réglages</span></div>
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

        {/* MAIN */}
        <main className="main">
          {/* TOP */}
          <div className="top">
            <div className="greeting">
              <div className="lbl">tableau de bord — {tweaks.month}</div>
              <h1>Bonsoir Marine.</h1>
              <p>Voici comment se présente ton mois — il te reste 3 postes avant de boucler avril, et un joli petit déficit horaire à rattraper.</p>
            </div>
            <div className="top-actions">
              <button
                className="theme-toggle"
                onClick={() => setTweak("theme", tweaks.theme === "light" ? "dark" : "light")}
                title="Basculer thème"
              >
                {tweaks.theme === "light" ? I.moon : I.sun}
                <span>{tweaks.theme === "light" ? "Mode nuit" : "Mode jour"}</span>
              </button>
              <div className="month-pick">
                <div className="arr">{I.arrL}</div>
                <div className="label">{tweaks.month}</div>
                <div className="arr">{I.arrR}</div>
              </div>
              <div className="icon-btn" title="Rechercher">{I.search}</div>
              <div className="icon-btn" title="Ajouter un poste" style={{ background: "var(--ink)", color: "var(--paper)", borderColor: "transparent" }}>{I.plus}</div>
            </div>
          </div>

          {/* HERO */}
          <section className="hero">
            <div className="stars"></div>
            <div className="hero-row">
              <div>
                <div className="lbl">net après prélèvement</div>
                <h2>1 786<span className="cents">,47 €</span></h2>
                <div className="sub">Estimation actualisée à partir des postes saisis. Il reste <b style={{ color: "#f1c987" }}>3 jours</b> à pointer pour finir avril.</div>
                <div className="hero-pills">
                  <span className="pill amber">+0,8% vs mars</span>
                  <span className="pill moss">+2h25 crédit</span>
                  <span className="pill">−10h20 débit</span>
                  <span className="pill dim">3 primes ce mois</span>
                </div>
              </div>

              <div className="hero-illu">
                <MoonStarsIllu/>
              </div>

              <div>
                <div className="lbl" style={{ marginBottom: 4 }}>net sur 12 mois</div>
                <Sparkline data={[1612, 1648, 1701, 1665, 1722, 1738, 1689, 1755, 1748, 1701, 1748, 1786]} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize: 11, fontFamily:"JetBrains Mono", color:"#cfc6b3", marginTop: 2 }}>
                  <span>mai</span><span>août</span><span>nov</span><span>avr</span>
                </div>
              </div>
            </div>
          </section>

          {/* KPI ROW */}
          <div className="kpi-row">
            <div className="kpi amber">
              <div className="lbl">postes ce mois</div>
              <div className="v">22</div>
              <div className="s">14 matin · 7 aprem · 1 dimanche</div>
              <svg className="glyph" viewBox="0 0 24 24" fill="none" stroke="#5a3a14" strokeWidth="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/></svg>
            </div>
            <div className="kpi">
              <div className="lbl">heures sup.</div>
              <div className="v">6h15</div>
              <div className="s">majoration moyenne 25%</div>
            </div>
            <div className="kpi moss">
              <div className="lbl">récup à poser</div>
              <div className="v">2j</div>
              <div className="s">avant fin juin</div>
            </div>
            <div className="kpi">
              <div className="lbl">solde compteur</div>
              <div className="v" style={{ color: "var(--rose)" }}>−7h55</div>
              <div className="s">déficit doux, rattrapable</div>
            </div>
          </div>

          {/* GRID 2 — calendar + rail */}
          <div className="grid-2">
            <section className="panel">
              <div className="panel-h">
                <h3>Calendrier d'avril</h3>
                <div className="legend">
                  <span><span className="d" style={{ background:"#d6e0f0" }}/>Matin</span>
                  <span><span className="d" style={{ background:"#d9d2ea" }}/>Après-midi</span>
                  <span><span className="d" style={{ background:"#c8dfd8" }}/>Récup</span>
                  <span><span className="d" style={{ background:"#f0c5bd" }}/>Congé</span>
                </div>
              </div>
              <Calendar/>
            </section>

            <aside className="rail">
              <div className="advice">
                <div className="illu"><TeacupIllu/></div>
                <div className="body">
                  <span className="hand">« beau mois, Marine »</span>
                  <div className="text">
                    Plus que <b>2 postes du soir</b> avant de retrouver l'équilibre horaire.
                    Et n'oublie pas le <b>1er mai</b> qui s'annonce — c'est +100% sur ton poste matin.
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-h">
                  <h3>À venir</h3>
                  <span className="lbl">5 prochains</span>
                </div>
                <div className="upcoming">
                  <div className="row-up matin">
                    <div className="ico">M</div>
                    <div className="date">lun 27</div>
                    <div className="what">Poste matin</div>
                    <div className="meta">10h20</div>
                  </div>
                  <div className="row-up aprem">
                    <div className="ico">A</div>
                    <div className="date">mar 28</div>
                    <div className="what">Poste après-midi</div>
                    <div className="meta">10h20</div>
                  </div>
                  <div className="row-up recup">
                    <div className="ico">R</div>
                    <div className="date">mer 29</div>
                    <div className="what">Récup posée</div>
                    <div className="meta">—</div>
                  </div>
                  <div className="row-up matin">
                    <div className="ico">M</div>
                    <div className="date">jeu 30</div>
                    <div className="what">Poste matin</div>
                    <div className="meta">10h20</div>
                  </div>
                  <div className="row-up ferie">
                    <div className="ico">★</div>
                    <div className="date">ven 1ᵉʳ</div>
                    <div className="what">1ᵉʳ mai · férié</div>
                    <div className="meta">+100%</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* RECAP */}
          <div className="recap">
            <section className="panel">
              <div className="panel-h">
                <h3>D'où vient ton net</h3>
                <span className="lbl">avril 2026</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap: 6, fontFamily:"JetBrains Mono", fontSize: 13 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}><span>Brut total</span><span>2 426,72 €</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", color:"var(--rose)" }}><span>Cotisations & mutuelle</span><span>− 563,88 €</span></div>
                <div style={{ display:"flex", justifyContent:"space-between" }}><span>Net imposable</span><span>1 862,84 €</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", color:"var(--rose)" }}><span>Prélèvement à la source</span><span>− 76,38 €</span></div>
              </div>
              <div className="stack">
                <div style={{ width:"73%", background:"var(--moss)" }}>net 73%</div>
                <div style={{ width:"22%", background:"var(--rose)" }}>cot. 22%</div>
                <div style={{ width:"5%",  background:"var(--ink)" }}>pas</div>
              </div>
            </section>

            <section className="panel" style={{ display:"flex", gap: 18, alignItems:"center" }}>
              <div style={{ width: 80, height: 80, flexShrink: 0 }}><PlantIllu/></div>
              <div>
                <div className="lbl">cap pour mai</div>
                <h3 style={{ fontFamily:"Fraunces", fontSize: 22, margin: "4px 0 8px", fontWeight: 600 }}>Un mois plus calme</h3>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Tu as <b>2 récups à poser</b> avant fin juin et une prime exceptionnelle attendue. Garde de la marge — tout va bien.
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* TWEAKS */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Apparence">
          <TweakRadio
            label="Thème"
            value={tweaks.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[
              { value: "light", label: "Jour" },
              { value: "dark",  label: "Nuit" },
            ]}
          />
          <TweakRadio
            label="Densité"
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "cosy",    label: "Aérée" },
              { value: "compact", label: "Compacte" },
            ]}
          />
          <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
            <div style={{ fontSize: 12, color:"var(--ink-2)" }}>Couleur d'accent</div>
            <div className="swatches">
              {[
                ["amber", "#d68a3c"],
                ["moss",  "#6b8a5a"],
                ["rose",  "#c87067"],
              ].map(([v, c]) => (
                <div key={v}
                  className={`sw ${tweaks.hue === v ? "on" : ""}`}
                  style={{ background: c }}
                  onClick={() => setTweak("hue", v)}/>
              ))}
            </div>
          </div>
        </TweakSection>

        <TweakSection title="Données">
          <TweakRadio
            label="Mois affiché"
            value={tweaks.month}
            onChange={(v) => setTweak("month", v)}
            options={[
              { value: "mars 2026",  label: "mars" },
              { value: "avril 2026", label: "avril" },
              { value: "mai 2026",   label: "mai" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
