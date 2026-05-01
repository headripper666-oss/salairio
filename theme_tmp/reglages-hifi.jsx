/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle */

const { useState, useEffect } = React;

const I = {
  home:  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>,
  trend: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></svg>,
  clock: <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  gift:  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13h18M12 9v11M8 9a3 3 0 1 1 4-3 3 3 0 1 1 4 3"/></svg>,
  cal:   <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  cog:   <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.4l2-1.5-2-3.5-2.4 1A7 7 0 0 0 14 4.6L13.6 2h-3.2L10 4.6a7 7 0 0 0-2.5 2l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .5 0 1 .1 1.4l-2 1.5 2 3.5 2.4-1c.7.9 1.6 1.5 2.5 2L10.4 22h3.2l.4-2.6c1-.5 1.8-1.1 2.5-2l2.4 1 2-3.5-2-1.5c.1-.4.1-.9.1-1.4z"/></svg>,
  out:   <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  sun:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  moon:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>,
  chev:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
  euro:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 7a6 6 0 1 0 0 10M3 11h11M3 14h10"/></svg>,
  bolt:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>,
  leaf:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20a8 8 0 0 1 8-8V4a16 16 0 0 0-16 16h8z"/><path d="M3 20c5-5 8-7 16-8"/></svg>,
  bell:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
};

const Sidebar = ({ active }) => {
  const items = [["Accueil", I.home], ["Synthèse mensuelle", I.trend], ["Compteur heures", I.clock], ["Primes", I.gift], ["Tableau annuel", I.cal], ["Réglages", I.cog]];
  return (
    <aside className="side">
      <div className="brand"><div className="mark">S</div><div className="name">salairio</div></div>
      <div>
        <div className="lbl" style={{ marginBottom: 8, paddingLeft: 4 }}>navigation</div>
        <nav className="nav">{items.map(([n, ico]) => <div key={n} className={`item ${active === n ? "on" : ""}`}>{ico}<span>{n}</span></div>)}</nav>
      </div>
      <div className="footer">
        <div className="me"><div className="av">M</div><div><div style={{ fontSize: 13, fontWeight: 600 }}>Marine</div><div className="mail">marine@gmail.com</div></div></div>
        <div className="out">{I.out}<span>Déconnexion</span></div>
      </div>
    </aside>
  );
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "cosy",
  "hue": "amber"
}/*EDITMODE-END*/;

// Section card (collapsible)
const Section = ({ ico, title, children, defaultOpen = false, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 14,
        padding: "16px 20px", background: "transparent", border: "none",
        cursor: "pointer", color: "var(--ink)", textAlign: "left",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: open ? "var(--ink)" : "var(--paper-3)",
          color: open ? "var(--paper)" : "var(--ink-2)",
          display: "grid", placeItems: "center", flexShrink: 0,
          transition: "all .2s ease",
        }}>{ico}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 18, lineHeight: 1.1 }}>{title}</div>
          {badge && <div className="lbl" style={{ marginTop: 3 }}>{badge}</div>}
        </div>
        <div style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s ease", color: "var(--ink-3)" }}>{I.chev}</div>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px" }}>{children}</div>
      )}
    </div>
  );
};

// Time input mock (hh:mm)
const TimeInput = ({ value, label }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 110 }}>
    <div className="lbl">{label}</div>
    <div style={{
      padding: "10px 14px", borderRadius: 12,
      background: "var(--paper)", border: "1px solid var(--rule)",
      fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: 500,
      letterSpacing: ".05em",
    }}>{value}</div>
  </div>
);

// Toggle row
const ToggleRow = ({ label, on, value, sub }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14,
    padding: "12px 14px", borderRadius: 14,
    background: on ? "color-mix(in oklab, var(--amber-soft) 50%, var(--paper))" : "var(--paper)",
    border: `1px solid ${on ? "rgba(214,138,60,.35)" : "var(--rule)"}`,
    transition: "all .15s ease",
  }}>
    <div style={{
      width: 38, height: 22, borderRadius: 999,
      background: on ? "var(--moss)" : "var(--paper-3)",
      border: "1px solid var(--rule)", position: "relative",
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 1, left: on ? 17 : 1,
        width: 18, height: 18, borderRadius: 999,
        background: on ? "#fff" : "var(--ink)",
        transition: "left .2s ease",
      }}/>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: on ? "var(--ink)" : "var(--ink-2)", fontStyle: on ? "normal" : "italic" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>}
    </div>
    <div style={{
      padding: "6px 12px", borderRadius: 10,
      background: "var(--paper-2)", border: "1px solid var(--rule)",
      fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 600,
      minWidth: 56, textAlign: "right",
      opacity: on ? 1 : .4,
    }}>{value}</div>
  </div>
);

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [calcMode, setCalcMode] = useState("priorite");

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = tweaks.theme;
    root.dataset.density = tweaks.density;
    root.dataset.hue = tweaks.hue;
  }, [tweaks.theme, tweaks.density, tweaks.hue]);

  return (
    <>
      <div className="app">
        <Sidebar active="Réglages"/>
        <main className="main">
          <div className="top">
            <div className="greeting">
              <div className="lbl">paramètres de paie & règles métier</div>
              <h1>Réglages</h1>
              <p>Ajuste comment Salairio calcule ton net : tes horaires de poste, les majorations qui s'appliquent, tes congés et tes primes.</p>
            </div>
            <div className="top-actions">
              <button className="theme-toggle"
                onClick={() => setTweak("theme", tweaks.theme === "light" ? "dark" : "light")}>
                {tweaks.theme === "light" ? I.moon : I.sun}
                <span>{tweaks.theme === "light" ? "Mode nuit" : "Mode jour"}</span>
              </button>
              <button style={{
                padding: "10px 18px", borderRadius: 999,
                background: "var(--ink)", color: "var(--paper)",
                border: "none", cursor: "pointer",
                fontFamily: "Inter", fontSize: 13, fontWeight: 600,
              }}>Enregistrer</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "start" }}>
            {/* sub-nav rail */}
            <aside style={{ position: "sticky", top: 28, display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="lbl" style={{ paddingLeft: 12, marginBottom: 6 }}>sections</div>
              {[
                ["Paramètres de paie", I.euro, false],
                ["Horaires des postes", I.clock, true],
                ["Majorations", I.bolt, true],
                ["Congés & récup", I.leaf, false],
                ["Primes", I.gift, false],
                ["Alertes", I.bell, false],
              ].map(([n, ico, on]) => (
                <div key={n} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 12,
                  background: on ? "var(--paper-2)" : "transparent",
                  color: on ? "var(--ink)" : "var(--ink-2)",
                  fontSize: 13, fontWeight: on ? 600 : 500,
                  cursor: "default",
                  border: on ? "1px solid var(--rule)" : "1px solid transparent",
                }}>
                  {ico}<span>{n}</span>
                </div>
              ))}
            </aside>

            {/* content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Paramètres de paie — collapsed */}
              <Section ico={I.euro} title="Paramètres de paie" badge="taux horaire · contrat · mutuelle"/>

              {/* Horaires — open */}
              <Section ico={I.clock} title="Horaires des postes" defaultOpen={true} badge="2 postes définis · modifiables">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* matin */}
                  <div style={{
                    padding: 18, borderRadius: 16,
                    background: "color-mix(in oklab, #d6e0f0 40%, var(--paper-2))",
                    border: "1px solid rgba(110,140,200,.3)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{
                        padding: "3px 10px", borderRadius: 999,
                        background: "rgba(110,140,200,.4)", color: "#2b3a55",
                        fontSize: 11, fontWeight: 700, letterSpacing: ".05em",
                      }}>POSTE MATIN</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <TimeInput label="DÉBUT" value="06 : 30"/>
                      <TimeInput label="FIN" value="16 : 50"/>
                      <TimeInput label="PAUSE" value="0 min"/>
                    </div>
                    <div className="hand" style={{ marginTop: 12, fontSize: 16, color: "#2b3a55" }}>
                      ≈ 10h20 effectif
                    </div>
                  </div>
                  {/* aprem */}
                  <div style={{
                    padding: 18, borderRadius: 16,
                    background: "color-mix(in oklab, #d9d2ea 40%, var(--paper-2))",
                    border: "1px solid rgba(140,120,180,.3)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{
                        padding: "3px 10px", borderRadius: 999,
                        background: "rgba(140,120,180,.4)", color: "#3c2c5a",
                        fontSize: 11, fontWeight: 700, letterSpacing: ".05em",
                      }}>POSTE APRÈS-MIDI</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <TimeInput label="DÉBUT" value="11 : 10"/>
                      <TimeInput label="FIN" value="21 : 30"/>
                      <TimeInput label="PAUSE" value="0 min"/>
                    </div>
                    <div className="hand" style={{ marginTop: 12, fontSize: 16, color: "#3c2c5a" }}>
                      ≈ 10h20 effectif
                    </div>
                  </div>
                </div>
                <button style={{
                  marginTop: 14, width: "100%", padding: 14,
                  borderRadius: 14, background: "transparent",
                  border: "1.5px dashed var(--rule)", cursor: "pointer",
                  color: "var(--ink-3)", fontSize: 13, fontWeight: 500,
                }}>+ Ajouter un poste</button>
              </Section>

              {/* Majorations — open */}
              <Section ico={I.bolt} title="Majorations" defaultOpen={true} badge="priorité (max) · 4 actifs">
                <div style={{ marginBottom: 14 }}>
                  <div className="lbl" style={{ marginBottom: 8 }}>mode de calcul</div>
                  <div style={{
                    display: "inline-flex", padding: 4, borderRadius: 14,
                    background: "var(--paper)", border: "1px solid var(--rule)",
                  }}>
                    {[["priorite", "Priorité (max)"], ["cumul", "Cumul (addition)"]].map(([v, l]) => (
                      <button key={v} onClick={() => setCalcMode(v)} style={{
                        padding: "8px 18px", borderRadius: 10,
                        background: calcMode === v ? "var(--amber)" : "transparent",
                        color: calcMode === v ? "#2a1a05" : "var(--ink-2)",
                        border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: calcMode === v ? 600 : 500,
                      }}>{l}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>
                    {calcMode === "priorite"
                      ? "Seule la majoration la plus haute s'applique quand plusieurs se cumulent."
                      : "Toutes les majorations applicables s'additionnent."}
                  </div>
                </div>

                <div className="lbl" style={{ marginBottom: 8 }}>taux par type</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <ToggleRow label="Heures supp. (25 %)" on={true}  value="25 %"  sub="à partir de la 36ᵉ heure"/>
                  <ToggleRow label="Heures supp. (50 %)" on={false} value="50 %"  sub="à partir de la 44ᵉ heure"/>
                  <ToggleRow label="Dimanche"            on={true}  value="25 %"  sub="appliqué sur l'intégralité du poste"/>
                  <ToggleRow label="Jour férié"          on={true}  value="100 %" sub="hors 1ᵉʳ mai (réglé séparément)"/>
                  <ToggleRow label="1ᵉʳ Mai"             on={true}  value="100 %" sub="majoration légale obligatoire"/>
                  <ToggleRow label="Jour supplémentaire" on={false} value="0 %"   sub="poste pris en plus du planning"/>
                </div>
              </Section>

              {/* Congés — collapsed */}
              <Section ico={I.leaf} title="Congés & récup" badge="2 récup à poser · 0 congé acquis"/>

              {/* Primes — collapsed */}
              <Section ico={I.gift} title="Primes" badge="3 primes actives ce mois"/>

              {/* Alertes — collapsed */}
              <Section ico={I.bell} title="Alertes" badge="rappels avant chaque poste · activé"/>
            </div>
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
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
