/* global React */
/* mobile screens for Salairio wireframes — uses IOSDevice from ios-frame.jsx */

const { IOSDevice } = window;

// ---------- shared mobile atoms ----------

const MTopBar = ({ title, sub, right }) => (
  <div className="row between" style={{ padding: "10px 16px 8px" }}>
    <div>
      {sub && <div className="lbl" style={{ fontSize: 9 }}>{sub}</div>}
      <div style={{ fontFamily: "Caveat", fontSize: 28, lineHeight: 1 }}>{title}</div>
    </div>
    <div className="row gap-2">{right}</div>
  </div>
);

const MTabbar = ({ active = "Accueil" }) => {
  const items = [
    ["Accueil", "🏠"],
    ["Synthèse", "📈"],
    ["Heures", "⏱"],
    ["Réglages", "⚙"],
  ];
  return (
    <div
      style={{
        position: "absolute", left: 8, right: 8, bottom: 16,
        background: "var(--paper)",
        border: "1.5px solid var(--ink)",
        borderRadius: 22,
        padding: "8px 6px",
        display: "flex", justifyContent: "space-around",
        boxShadow: "0 4px 0 -1px rgba(29,26,23,.25)",
      }}
    >
      {items.map(([n, e]) => (
        <div key={n} className="col center" style={{
          gap: 2, padding: "4px 10px",
          borderRadius: 14,
          background: active === n ? "var(--ink)" : "transparent",
          color: active === n ? "var(--paper)" : "var(--ink-2)",
          minWidth: 64,
        }}>
          <span style={{ fontSize: 14 }}>{e}</span>
          <span style={{ fontFamily: "Patrick Hand", fontSize: 11 }}>{n}</span>
        </div>
      ))}
    </div>
  );
};

// ---------- 1 · ACCUEIL MOBILE ----------

const MAccueil = () => (
  <div style={{ background: "var(--paper)", height: "100%", overflow: "hidden", position: "relative", paddingBottom: 80 }}>
    <MTopBar
      title="Bonsoir Lou."
      sub="avril 2026"
      right={<><div className="icn">‹</div><div className="icn">›</div></>}
    />
    <div style={{ padding: "0 14px 16px", overflow: "auto", height: "calc(100% - 70px)" }}>
      {/* hero */}
      <div className="box p-3 amber-soft mb-3">
        <div className="lbl">net estimé · avr.</div>
        <div className="mono" style={{ fontSize: 32, lineHeight: 1.05 }}>1 786 €</div>
        <div className="row gap-2 mt-2" style={{ flexWrap: "wrap" }}>
          <span className="pill">+2h25 crédit</span>
          <span className="pill dark">−10h20 débit</span>
        </div>
      </div>

      <div className="row gap-2 mb-3">
        <div className="box p-3 night-fill grow">
          <div className="lbl" style={{ color: "var(--amber-soft)" }}>compteur</div>
          <div className="mono" style={{ fontSize: 22 }}>−7h55</div>
          <div className="xs" style={{ color: "#cfc6b3" }}>déficit doux</div>
        </div>
        <div className="box p-3 grow">
          <div className="lbl">postes</div>
          <div className="mono" style={{ fontSize: 22 }}>18</div>
          <div className="xs">ce mois-ci</div>
        </div>
      </div>

      {/* mini calendar (compact) */}
      <div className="box p-3 mb-3">
        <div className="row between mb-2">
          <h3 style={{ fontSize: 18 }}>Calendrier</h3>
          <span className="xs hand">tape pour saisir</span>
        </div>
        <div className="cal" style={{ gap: 3 }}>
          {["L","M","M","J","V","S","D"].map((d, i) => <div key={i} className="h" style={{ fontSize: 9 }}>{d}</div>)}
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i - 1;
            const inMonth = day >= 1 && day <= 30;
            const tag = day === 27 ? "matin" : day === 28 ? "aprem" : day === 29 ? "recup" : day === 26 ? "conge" : "";
            return (
              <div key={i} className={`cell ${tag} ${!inMonth ? "dim" : ""}`}
                style={{ aspectRatio: "unset", height: 32, padding: "2px 4px", fontSize: 11 }}>
                {inMonth ? day : ""}
              </div>
            );
          })}
        </div>
      </div>

      <div className="box p-3 amber-fill">
        <div className="row gap-2" style={{ alignItems: "center" }}>
          <div className="ph" style={{ width: 44, height: 44, borderColor: "var(--ink)" }}>illu</div>
          <div className="hand small" style={{ color: "var(--ink)" }}>
            « plus que 2 postes du soir avant l'équilibre »
          </div>
        </div>
      </div>
    </div>
    <MTabbar active="Accueil" />
  </div>
);

// ---------- 2 · SYNTHÈSE MOBILE ----------

const MSynthese = () => (
  <div style={{ background: "var(--paper)", height: "100%", overflow: "hidden", position: "relative", paddingBottom: 80 }}>
    <MTopBar
      title="Synthèse"
      sub="avril 2026"
      right={<><div className="icn">‹</div><div className="icn">›</div></>}
    />
    <div style={{ padding: "0 14px 16px", overflow: "auto", height: "calc(100% - 70px)" }}>
      <div className="box p-4 night-fill mb-3">
        <div className="lbl" style={{ color: "var(--amber-soft)" }}>net après prélèvement</div>
        <div style={{ fontFamily: "Caveat", fontSize: 44, lineHeight: 1 }}>1 786,47 €</div>
        <div className="xs" style={{ color: "#cfc6b3" }}>déposé entre le 28 et 30 avr.</div>
      </div>

      <div className="box p-3 mb-3">
        <div className="lbl mb-2">décomposition</div>
        <div className="col gap-1 mono" style={{ fontSize: 13 }}>
          <div className="row between"><span>Brut</span><span>2 426,72 €</span></div>
          <div className="row between" style={{ color: "var(--rose)" }}><span>Cotisations</span><span>−533,88 €</span></div>
          <div className="row between" style={{ color: "var(--rose)" }}><span>Mutuelle</span><span>−30,00 €</span></div>
          <div className="row between"><span>Net imposable</span><span>1 862,84 €</span></div>
          <div className="row between" style={{ color: "var(--rose)" }}><span>PAS</span><span>−76,38 €</span></div>
        </div>
        <div className="squig my-2"></div>
        <div style={{ display: "flex", height: 24, borderRadius: 999, overflow: "hidden", border: "1.25px solid var(--ink)" }}>
          <div style={{ width: "73%", background: "var(--moss)" }} />
          <div style={{ width: "22%", background: "var(--rose)" }} />
          <div style={{ width: "5%",  background: "var(--ink)" }} />
        </div>
      </div>

      <div className="row gap-2 mb-3">
        <div className="box p-3 grow moss-fill">
          <div className="lbl" style={{ color: "var(--paper)" }}>crédit</div>
          <div className="mono" style={{ fontSize: 20 }}>+2h25</div>
        </div>
        <div className="box p-3 grow ink-fill">
          <div className="lbl" style={{ color: "var(--amber-soft)" }}>débit</div>
          <div className="mono" style={{ fontSize: 20 }}>−10h20</div>
        </div>
      </div>

      <div className="btn primary center" style={{ width: "100%", justifyContent: "center" }}>💾 Sauvegarder</div>
    </div>
    <MTabbar active="Synthèse" />
  </div>
);

// ---------- 3 · RÉGLAGES MOBILE (accordéon) ----------

const MReglages = () => (
  <div style={{ background: "var(--paper)", height: "100%", overflow: "hidden", position: "relative", paddingBottom: 80 }}>
    <MTopBar title="Réglages" sub="paie & règles métier" />
    <div style={{ padding: "0 14px 16px", overflow: "auto", height: "calc(100% - 70px)" }}>
      {/* collapsed */}
      <div className="box p-3 mb-2 row between" style={{ alignItems: "center" }}>
        <div className="row gap-2"><span>💶</span><span>Paramètres de paie</span></div>
        <span style={{ fontFamily: "JetBrains Mono", fontSize: 16 }}>›</span>
      </div>

      {/* expanded — horaires */}
      <div className="box p-3 mb-2">
        <div className="row between mb-2">
          <div className="row gap-2"><span>⏰</span><span style={{ fontFamily: "Patrick Hand", fontSize: 16 }}>Horaires des postes</span></div>
          <span className="mono" style={{ fontSize: 14 }}>⌃</span>
        </div>
        <div className="box p-2 amber-soft mb-2">
          <div className="lbl mb-1">matin</div>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            <span className="input" style={{ fontSize: 12, padding: "6px 8px" }}>06:30</span>
            <span className="input" style={{ fontSize: 12, padding: "6px 8px" }}>16:50</span>
            <span className="input" style={{ fontSize: 12, padding: "6px 8px" }}>0 min</span>
          </div>
        </div>
        <div className="box p-2" style={{ background: "#d6d2ea" }}>
          <div className="lbl mb-1">après-midi</div>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            <span className="input" style={{ fontSize: 12, padding: "6px 8px" }}>11:10</span>
            <span className="input" style={{ fontSize: 12, padding: "6px 8px" }}>21:30</span>
            <span className="input" style={{ fontSize: 12, padding: "6px 8px" }}>0 min</span>
          </div>
        </div>
      </div>

      {/* expanded — majorations */}
      <div className="box p-3 mb-2">
        <div className="row between mb-2">
          <div className="row gap-2"><span>⚡</span><span style={{ fontFamily: "Patrick Hand", fontSize: 16 }}>Majorations</span></div>
          <span className="mono" style={{ fontSize: 14 }}>⌃</span>
        </div>
        <div className="seg amber mb-2" style={{ width: "100%" }}>
          <div className="on grow center" style={{ fontSize: 12 }}>priorité</div>
          <div className="grow center" style={{ fontSize: 12 }}>cumul</div>
        </div>
        <div className="col gap-2">
          {[
            ["Heures supp. 25%", true,  "25%"],
            ["Dimanche",         true,  "25%"],
            ["Jour férié",       true,  "100%"],
            ["1er mai",          true,  "100%"],
          ].map(([n, on, v], i) => (
            <div key={i} className="row gap-2" style={{
              padding: "8px 10px",
              border: "1.25px solid rgba(29,26,23,.25)",
              borderRadius: 10, alignItems: "center"
            }}>
              <div className={`toggle ${on ? "on" : ""}`} style={{ transform: "scale(.85)" }} />
              <div className="grow" style={{ fontSize: 13 }}>{n}</div>
              <span className="input" style={{ fontSize: 12, padding: "4px 8px", minWidth: 44, textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="box p-3 mb-2 row between" style={{ alignItems: "center" }}>
        <div className="row gap-2"><span>🌿</span><span>Congés & récup</span></div>
        <span className="mono" style={{ fontSize: 16 }}>›</span>
      </div>
      <div className="box p-3 mb-2 row between" style={{ alignItems: "center" }}>
        <div className="row gap-2"><span>🎁</span><span>Primes</span></div>
        <span className="mono" style={{ fontSize: 16 }}>›</span>
      </div>
    </div>
    <MTabbar active="Réglages" />
  </div>
);

// ---------- responsive guide ----------

const ResponsiveGuide = () => (
  <div className="wf p-6 col gap-4" style={{ width: 1100 }}>
    <div className="row between">
      <div>
        <h1 className="underline-sketch" style={{ fontSize: 44 }}>Règles responsive</h1>
        <div className="small mt-2">Une seule app — desktop & smartphone. Tokens partagés, layout adaptatif.</div>
      </div>
      <div className="note" style={{ transform: "rotate(1deg)" }}>
        Mobile-first sur le contenu, desktop pour la sidebar et les colonnes multiples.
      </div>
    </div>

    <div className="row gap-4">
      <div className="box p-4 grow">
        <div className="lbl mb-2">breakpoints</div>
        <div className="col gap-2 mono" style={{ fontSize: 13 }}>
          <div className="row between"><span>sm — mobile</span><span>≤ 640 px</span></div>
          <div className="row between"><span>md — tablette</span><span>641 – 1024 px</span></div>
          <div className="row between"><span>lg — desktop</span><span>≥ 1025 px</span></div>
        </div>
      </div>
      <div className="box p-4 grow">
        <div className="lbl mb-2">navigation</div>
        <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li><b>Mobile</b> · tab bar 4 entrées en bas, pas de sidebar</li>
          <li><b>Tablette</b> · sidebar en rail compact (icônes seules)</li>
          <li><b>Desktop</b> · sidebar 200 px avec libellés</li>
        </ul>
      </div>
      <div className="box p-4 grow">
        <div className="lbl mb-2">grilles</div>
        <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li><b>Mobile</b> · 1 colonne, KPI empilés</li>
          <li><b>Tablette</b> · 2 colonnes max, calendrier compact</li>
          <li><b>Desktop</b> · 3 colonnes, calendrier généreux</li>
        </ul>
      </div>
    </div>

    <div className="box p-4">
      <div className="lbl mb-2">adaptations clés par écran</div>
      <div className="row gap-4" style={{ flexWrap: "wrap" }}>
        <div className="col gap-1 grow" style={{ minWidth: 240 }}>
          <h3 style={{ fontSize: 18 }}>Accueil</h3>
          <div className="small">KPIs hero plein largeur, calendrier passe en cellules carrées 32px sans heures inline ; tap = saisie en bottom sheet.</div>
        </div>
        <div className="col gap-1 grow" style={{ minWidth: 240 }}>
          <h3 style={{ fontSize: 18 }}>Synthèse</h3>
          <div className="small">Reçu papier devient une carte simple ; barre de répartition pleine largeur ; 12 mois en scroll horizontal.</div>
        </div>
        <div className="col gap-1 grow" style={{ minWidth: 240 }}>
          <h3 style={{ fontSize: 18 }}>Réglages</h3>
          <div className="small">Sub-nav latérale → <b>accordéon</b> vertical. Inputs horaires en chips tappables qui ouvrent un picker natif.</div>
        </div>
      </div>
    </div>

    <div className="box p-4">
      <div className="lbl mb-2">ergonomie tactile</div>
      <ul className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
        <li>Hit-target minimum <b>44 × 44 px</b> sur tout élément interactif</li>
        <li>Type minimum <b>14 px</b> sur mobile (chiffres mono, 16 px+ pour les montants clés)</li>
        <li>Padding écran <b>14 px</b> latéral, <b>16 px</b> entre cartes</li>
        <li>Pas de hover-only — chaque action a un état tap visible (background plein)</li>
        <li>Bottom sheet pour saisies horaires & primes ; modale plein écran pour onboarding</li>
      </ul>
    </div>
  </div>
);

Object.assign(window, { MAccueil, MSynthese, MReglages, ResponsiveGuide });
