/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard */

const { useState } = React;

// ---------- shared atoms ----------

const Squig = () => <div className="squig" />;

const Pill = ({ children, variant }) => (
  <span className={`pill ${variant || ""}`}>{children}</span>
);

const Note = ({ children, style }) => (
  <div className="note" style={style}>{children}</div>
);

const Arrow = ({ d = "M2 22 Q 30 0 75 14", style }) => (
  <svg className="arrow" viewBox="0 0 80 30" style={style}>
    <path d={d} stroke="#4a443d" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M70 8 L78 14 L70 18" stroke="#4a443d" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Icn = ({ children }) => <span className="icn">{children}</span>;

// fake handwritten line of placeholder text
const Scribble = ({ w = 120, opacity = .55 }) => (
  <svg width={w} height="6" style={{ opacity }}>
    <path d={`M2 3 Q ${w*.25} 0 ${w*.5} 3 T ${w-2} 3`} stroke="#1d1a17" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  </svg>
);

// ---------- sidebar (re-used) ----------

const Sidebar = ({ active = "Accueil", style = "default" }) => {
  const items = [
    ["Accueil", "🏠"],
    ["Synthèse mensuelle", "📈"],
    ["Compteur heures", "⏱"],
    ["Primes", "✨"],
    ["Tableau annuel", "🗓"],
    ["Réglages", "⚙"],
  ];
  return (
    <div className="col gap-4" style={{ width: 200 }}>
      <div className="row gap-3" style={{ alignItems:"center" }}>
        <div className="box thick" style={{ width:36, height:36, display:"grid", placeItems:"center", background: "var(--amber)" }}>
          <span style={{ fontFamily:"Caveat", fontSize: 22 }}>S</span>
        </div>
        <div style={{ fontFamily:"Caveat", fontSize: 26, letterSpacing:".5px" }}>salairio</div>
      </div>
      <div className="lbl">navigation</div>
      <div className="col" style={{ gap: 4 }}>
        {items.map(([n, e]) => (
          <div key={n} className={`nav-item ${active === n ? "on" : ""}`}>
            <span style={{ fontSize: 14 }}>{e}</span>
            <span>{n}</span>
          </div>
        ))}
      </div>
      <div className="grow" />
      <div className="col gap-2" style={{ borderTop:"1px dashed rgba(29,26,23,.3)", paddingTop: 10 }}>
        <div className="xs">headripper666@gmail.com</div>
        <div className="btn" style={{ padding:"6px 10px", fontSize: 16 }}>↪ Déconnexion</div>
      </div>
    </div>
  );
};

// =========================================================
// 1) DESIGN SYSTEM CARD — tokens & primitives
// =========================================================

const DesignSystem = () => (
  <div className="wf p-6 col gap-5" style={{ width: 1400 }}>
    <div className="row gap-5" style={{ alignItems:"flex-start" }}>
      <div className="grow" style={{ minWidth: 0 }}>
        <h1 className="underline-sketch" style={{ fontSize: 48, lineHeight: 1.05 }}>Cosy · mini design system</h1>
        <div className="small mt-2">tokens, type, composants — la base à recoder</div>
      </div>
      <Note>Direction : « bien-être financier ».
        Papier crème + bleu nuit + ambre. Coins bombés, traits irréguliers, micro-illustrations à la main.</Note>
    </div>

    {/* PALETTE */}
    <div className="box p-5">
      <div className="row between mb-4">
        <h2 style={{ fontSize: 32 }}>Palette</h2>
        <span className="lbl">oklch · neutre chaud + 2 accents</span>
      </div>
      <div className="row gap-4" style={{ flexWrap:"wrap" }}>
        {[
          ["paper",   "#f6f1e7", "fond principal"],
          ["paper-2", "#efe7d6", "fond carte"],
          ["ink",     "#1d1a17", "texte / trait"],
          ["ink-2",   "#4a443d", "texte secondaire"],
          ["ink-3",   "#8a8278", "texte tertiaire"],
          ["night",   "#1f2742", "accent bleu nuit"],
          ["amber",   "#d68a3c", "accent ambre"],
          ["amber-soft","#f1c987","ambre clair"],
          ["moss",    "#6b8a5a", "positif"],
          ["rose",    "#c87067", "alerte douce"],
        ].map(([n,h,d]) => (
          <div key={n} className="col gap-2" style={{ width: 130 }}>
            <div className="swatch" style={{ background:h, color: ["ink","night","moss"].includes(n) ? "#f6f1e7" : "#1d1a17" }}>{h}</div>
            <div className="mono" style={{ fontSize: 11 }}>--{n}</div>
            <div className="xs">{d}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 small">
        <b>Mode sombre cosy</b> : inverser <span className="mono">paper ↔ #141a2b</span>, <span className="mono">ink ↔ #efe7d6</span>. Garder ambre/moss tels quels — ils chantent autant en clair qu'en nuit.
      </div>
    </div>

    {/* TYPE */}
    <div className="row gap-4">
      <div className="box p-5 grow">
        <h2 style={{ fontSize: 32 }} className="mb-3">Typographie</h2>
        <div className="col gap-4">
          <div className="col gap-1">
            <Pill>display · titres</Pill>
            <div style={{ fontFamily:"Fraunces, 'Caveat', serif", fontSize: 40, lineHeight:1.05 }}>Fraunces 40 / 600</div>
          </div>
          <div className="col gap-1">
            <Pill>body · UI</Pill>
            <div style={{ fontFamily:"'Inter', system-ui", fontSize: 20, lineHeight:1.2 }}>Inter 20 / 500 — sous-titres et corps long</div>
          </div>
          <div className="col gap-1">
            <Pill>mono · chiffres</Pill>
            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: 18 }}>1 786,00 €</div>
          </div>
          <div className="col gap-1">
            <Pill variant="amber">accent · sparingly</Pill>
            <div style={{ fontFamily:"Caveat, cursive", fontSize: 26 }}>Caveat — accents manuscrits</div>
          </div>
          <Squig/>
          <div className="small">
            <b>Échelle</b> · 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48. <b>Line-height</b> · 1.5 corps, 1.1 display.
            <br/><b>Numéraux</b> tabular-nums sur tous les montants.
          </div>
        </div>
      </div>

      {/* SPACING / RADIUS / SHADOW */}
      <div className="box p-5" style={{ width: 480 }}>
        <h2 style={{ fontSize: 32 }} className="mb-3">Forme</h2>
        <div className="col gap-3">
          <div>
            <div className="lbl mb-2">rayon</div>
            <div className="row gap-2">
              {[8,16,24,32].map(r => (
                <div key={r} style={{ width:54, height:54, border:"1.5px solid var(--ink)", borderRadius:r }} className="center mono" >{r}</div>
              ))}
            </div>
            <div className="xs mt-2">Toujours <i>bombés / squircle</i> ; jamais d'angle vif.</div>
          </div>
          <div>
            <div className="lbl mb-2">spacing · base 4</div>
            <div className="row gap-2 mono" style={{ fontSize: 12 }}>
              {[4,8,12,16,24,32,48].map(s => (
                <div key={s} className="col gap-2 center"><div style={{ width:s, height:16, background:"var(--ink)" }} /> {s}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="lbl mb-2">élévation</div>
            <div className="row gap-3">
              <div style={{ width:90, height:54, borderRadius:14, background:"var(--paper-2)", boxShadow:"0 1px 0 rgba(29,26,23,.12)" }} className="center xs">flat</div>
              <div style={{ width:90, height:54, borderRadius:14, background:"var(--paper-2)", boxShadow:"0 6px 0 -3px rgba(29,26,23,.18), 0 2px 8px rgba(29,26,23,.08)" }} className="center xs">soft</div>
              <div style={{ width:90, height:54, borderRadius:14, background:"var(--paper-2)", boxShadow:"3px 4px 0 rgba(29,26,23,.7)" }} className="center xs">stamped</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* COMPONENTS */}
    <div className="box p-5">
      <h2 style={{ fontSize: 32 }} className="mb-4">Composants clés</h2>
      <div className="row gap-5" style={{ flexWrap:"wrap" }}>
        <div className="col gap-2">
          <div className="lbl">boutons</div>
          <div className="row gap-3">
            <div className="btn primary">+ Ajouter un poste</div>
            <div className="btn dark">Sauvegarder</div>
            <div className="btn">Annuler</div>
          </div>
        </div>
        <div className="col gap-2">
          <div className="lbl">segmented</div>
          <div className="seg amber">
            <div className="on">Priorité</div>
            <div>Cumul</div>
          </div>
        </div>
        <div className="col gap-2">
          <div className="lbl">toggles</div>
          <div className="row gap-3">
            <div className="toggle on" />
            <div className="toggle" />
          </div>
        </div>
        <div className="col gap-2">
          <div className="lbl">input numérique</div>
          <div className="row gap-2">
            <span className="input">06 : 30</span>
            <span className="input" style={{ minWidth:46 }}>25 %</span>
          </div>
        </div>
        <div className="col gap-2">
          <div className="lbl">pastilles statut</div>
          <div className="row gap-2">
            <Pill variant="moss">+2h25 crédit</Pill>
            <Pill variant="dark">−10h20 débit</Pill>
            <Pill variant="amber">net 1 786 €</Pill>
          </div>
        </div>
      </div>
    </div>

    {/* MICRO ILLUS */}
    <div className="box p-5">
      <h2 style={{ fontSize: 32 }} className="mb-3">Micro‑illustrations (placeholders)</h2>
      <div className="row gap-4">
        {["pot de monnaie","tasse fumante","lune & étoile","sablier","plante en pot","reçu plié"].map(n => (
          <div key={n} className="col gap-2 center">
            <div className="ph" style={{ width:120, height: 90 }}>illu</div>
            <div className="xs hand">{n}</div>
          </div>
        ))}
      </div>
      <div className="small mt-3">À remplacer par traits manuscrits monochromes (1-2 couleurs max). Jamais d'icône SaaS générique.</div>
    </div>
  </div>
);

// =========================================================
// 2) ANALYSE — current vs target
// =========================================================

const AnalyseCard = () => (
  <div className="wf p-6 col gap-4" style={{ width: 1100 }}>
    <h1 className="underline-sketch" style={{ fontSize: 48 }}>Analyse de l'existant</h1>
    <div className="row gap-4">
      <div className="box p-5 grow">
        <h3 style={{ fontSize: 22 }} className="mb-2">Ce qui marche</h3>
        <ul style={{ margin:0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Hiérarchie claire : sidebar / KPIs / contenu</li>
          <li>Distinction matin / aprem / récup / congé par couleur</li>
          <li>Synthèse paie lisible ligne par ligne</li>
          <li>Réglages bien sectionnés (paie · horaires · majorations)</li>
        </ul>
      </div>
      <div className="box p-5 grow">
        <h3 style={{ fontSize: 22 }} className="mb-2">Ce qui fait « SaaS slop »</h3>
        <ul style={{ margin:0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Fond noir pur + cartes gris foncé = froid, hospitalier</li>
          <li>Ambre saturé en accent texte → fatigue visuelle</li>
          <li>Beaucoup de KPIs, peu de contexte humain</li>
          <li>Calendrier vide la moitié du temps, pas d'invitation</li>
          <li>Bouton primaire « bloc plein écran » trop agressif</li>
          <li>Iconographie outline générique (Lucide) sans personnalité</li>
        </ul>
      </div>
      <div className="box p-5 grow night-fill">
        <h3 style={{ fontSize: 22, color:"var(--paper)" }} className="mb-2">Cap visé</h3>
        <ul style={{ margin:0, paddingLeft: 18, lineHeight: 1.6, color:"var(--paper)" }}>
          <li>Bleu nuit doux, pas noir</li>
          <li>Ambre uniquement en accent / CTA</li>
          <li>Coins ronds 16–24, pas de carte plate</li>
          <li>Typo serif douce + manuscrit ponctuel</li>
          <li>Micro-illustrations (lune, tasse, plante)</li>
          <li>Copy chaleureuse (« ce mois-ci », « beau travail »)</li>
        </ul>
      </div>
    </div>
  </div>
);

// =========================================================
// 3) ACCUEIL — 3 directions
// =========================================================

const FrameShell = ({ children, active="Accueil", title }) => (
  <div className="row gap-4 wf p-4" style={{ width: 1280, height: 820 }}>
    <Sidebar active={active} />
    <div className="col grow gap-4" style={{ overflow:"hidden" }}>
      {title}
      {children}
    </div>
  </div>
);

const AccueilA = () => (
  <FrameShell
    title={
      <div className="row between">
        <div>
          <div className="lbl">avril 2026</div>
          <h1 style={{ fontSize: 44, lineHeight:1 }}>Bonsoir Lou.</h1>
          <div className="small">Voici comment se présente ton mois.</div>
        </div>
        <div className="row gap-2">
          <div className="icn">‹</div>
          <div className="pill">avril 2026</div>
          <div className="icn">›</div>
        </div>
      </div>
    }
  >
    {/* hero KPI cards */}
    <div className="row gap-4">
      <div className="box p-4 amber-soft" style={{ flex:2 }}>
        <div className="row between">
          <div className="col">
            <div className="lbl">net estimé · après PAS</div>
            <div className="mono" style={{ fontSize: 44, lineHeight:1.1 }}>1 786 €</div>
            <div className="small">≈ <b>83%</b> de ton net moyen sur 12 mois</div>
          </div>
          <div className="ph" style={{ width:110, height:90 }}>pot de monnaie</div>
        </div>
        <div className="mt-3 row gap-2">
          <Pill variant="moss">+ 2h25 crédit</Pill>
          <Pill variant="amber">3 primes</Pill>
        </div>
      </div>
      <div className="box p-4 night-fill grow">
        <div className="lbl" style={{ color:"var(--amber-soft)" }}>compteur d'heures</div>
        <div className="mono" style={{ fontSize: 36, lineHeight:1.1 }}>−7h55</div>
        <div className="small" style={{ color:"#cfc6b3" }}>solde en déficit, rattrapable d'ici fin de mois</div>
        <div className="mt-3 row gap-2">
          <div className="bars">
            {[28,18,40,12,52,20,30].map((h,i)=> <div key={i} className="b" style={{ height:h, background:"var(--amber-soft)" }} />)}
          </div>
        </div>
      </div>
    </div>

    {/* calendrier */}
    <div className="box p-4 grow">
      <div className="row between mb-3">
        <h2 style={{ fontSize: 26 }}>Calendrier</h2>
        <div className="legend">
          <span><span className="d" style={{ background:"#d6e0f0" }}/>Matin</span>
          <span><span className="d" style={{ background:"#d9d2ea" }}/>Après-midi</span>
          <span><span className="d" style={{ background:"#c8dfd8" }}/>Récup</span>
          <span><span className="d" style={{ background:"#f0c5bd" }}/>Congé</span>
        </div>
      </div>
      <div className="cal">
        {["L","M","M","J","V","S","D"].map((d,i)=><div key={i} className="h">{d}</div>)}
        {Array.from({ length: 35 }).map((_,i)=>{
          const day = i - 1; // april starts on tuesday
          const inMonth = day >= 1 && day <= 30;
          const cls = !inMonth ? "dim"
            : day === 26 ? "conge"
            : [27].includes(day) ? "matin"
            : [28].includes(day) ? "aprem"
            : [29].includes(day) ? "recup"
            : "";
          return (
            <div key={i} className={`cell ${cls}`}>
              <div className="row between"><span>{inMonth ? day : ""}</span>{day===27 && <span className="hand" style={{ fontSize: 11 }}>06h–16h</span>}</div>
              {[27,28,29].includes(day) && <div className="dot" style={{ background:"var(--ink)" }} />}
            </div>
          );
        })}
      </div>
    </div>
  </FrameShell>
);

const AccueilB = () => (
  <FrameShell
    title={
      <div className="row between">
        <div>
          <h1 style={{ fontSize: 36 }}>Avril, en un coup d'œil</h1>
          <div className="small">Centré sur le récap : moins de chiffres, plus de sens.</div>
        </div>
        <div className="seg"><div className="on">Mois</div><div>Année</div></div>
      </div>
    }
  >
    <div className="row gap-4 grow" style={{ overflow:"hidden" }}>
      {/* left : journal column */}
      <div className="col gap-3" style={{ width: 380 }}>
        <div className="box p-4 paper">
          <div className="lbl">cap du mois</div>
          <div className="row between mt-2" style={{ alignItems:"flex-end" }}>
            <div className="mono" style={{ fontSize: 30 }}>1 786 €</div>
            <div className="hand" style={{ fontSize: 16, color:"var(--moss)" }}>+38€ vs mars</div>
          </div>
          <div className="mt-3 squig"></div>
          <div className="mt-3 col gap-2 small">
            <div className="row between"><span>Brut</span><span className="mono">2 426,72 €</span></div>
            <div className="row between"><span>Cotisations</span><span className="mono">−533,88 €</span></div>
            <div className="row between"><span>Mutuelle</span><span className="mono">−30,00 €</span></div>
            <div className="row between"><span>PAS</span><span className="mono">−76,38 €</span></div>
          </div>
        </div>

        <div className="box p-4">
          <div className="row between mb-2">
            <h3 style={{ fontSize: 22 }}>Compteur</h3>
            <Pill variant="dark">déficit doux</Pill>
          </div>
          <div className="row gap-3" style={{ alignItems:"center" }}>
            <div className="arc amber" />
            <div className="col">
              <div className="mono" style={{ fontSize: 28 }}>−7h55</div>
              <div className="small">tu peux rattraper en posant 1 récup courte</div>
            </div>
          </div>
        </div>

        <div className="box p-4 amber-soft">
          <div className="row gap-3" style={{ alignItems:"center" }}>
            <div className="ph" style={{ width:60, height:60 }}>illu</div>
            <div>
              <div className="hand" style={{ fontSize: 16 }}>« petit conseil »</div>
              <div className="small" style={{ color:"var(--ink)"}}>Plus que <b>2 postes du soir</b> avant le retour à l'équilibre.</div>
            </div>
          </div>
        </div>
      </div>

      {/* right : timeline */}
      <div className="box p-4 grow" >
        <div className="row between mb-3">
          <h2 style={{ fontSize: 26 }}>Tes journées</h2>
          <div className="tabs">
            <div className="tab on">Liste</div>
            <div className="tab">Calendrier</div>
            <div className="tab">Heatmap</div>
          </div>
        </div>
        <div className="col gap-2">
          {[
            ["lun 6 avr",  "matin",  "06:30 → 16:50",  "10h20",  ""],
            ["mar 7 avr",  "aprem",  "11:10 → 21:30",  "10h20",  "+25%"],
            ["mer 8 avr",  "récup",  "—",              "—",      "récup posée"],
            ["sam 26 avr", "congé",  "—",              "—",      "congé sans solde"],
            ["dim 27 avr", "matin",  "06:30 → 16:50",  "10h20",  "dimanche +25%"],
            ["lun 28 avr", "aprem",  "11:10 → 21:30",  "10h20",  ""],
            ["mar 29 avr", "récup",  "—",              "—",      ""],
          ].map((r,i)=> (
            <div key={i} className="row gap-3 p-3" style={{
              border:"1px solid rgba(29,26,23,.18)",
              borderRadius: 12, alignItems:"center"
            }}>
              <div className="lbl" style={{ width: 90 }}>{r[0]}</div>
              <Pill variant={r[1]==="matin"?"":r[1]==="aprem"?"dark":r[1]==="récup"?"moss":"amber"}>{r[1]}</Pill>
              <div className="mono small" style={{ width: 130 }}>{r[2]}</div>
              <div className="mono small grow">{r[3]}</div>
              <div className="hand small" style={{ color:"var(--amber)"}}>{r[4]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </FrameShell>
);

const AccueilC = () => (
  <FrameShell
    title={
      <div className="row between">
        <div>
          <h1 style={{ fontSize: 40 }}>Tableau de bord — mois doux</h1>
          <div className="small">Variante « cosy minimal » : tout sur une seule ligne d'horizon.</div>
        </div>
      </div>
    }
  >
    {/* horizon strip */}
    <div className="box p-5 night-fill">
      <div className="row between" style={{ alignItems:"flex-end" }}>
        <div>
          <div className="lbl" style={{ color:"var(--amber-soft)" }}>net après prélèvement</div>
          <div style={{ fontFamily:"Caveat", fontSize: 64, lineHeight:1 }}>1 786,00 €</div>
          <div className="small" style={{ color:"#cfc6b3" }}>« il reste 2 jours pour finir avril »</div>
        </div>
        <div className="ph" style={{ width:200, height:80, borderColor:"var(--amber-soft)", color:"var(--amber-soft)" }}>
          courbe paie 12 mois
        </div>
        <div className="col gap-2">
          <Pill variant="amber">+25% dim</Pill>
          <Pill variant="moss">+2h25</Pill>
          <Pill variant="dark">−10h20</Pill>
        </div>
      </div>
    </div>

    {/* 4 mini cards */}
    <div className="row gap-3">
      {[
        ["Postes ce mois", "18", "matin · aprem · récup", ""],
        ["Heures sup.", "6h15", "majoration moyenne 25%", "var(--amber-soft)"],
        ["Primes", "3", "1er mai à venir", ""],
        ["Récup à poser", "2j", "avant fin juin", "var(--moss)"],
      ].map(([t,v,s,bg],i)=>(
        <div key={i} className="box p-4 grow" style={{ background: bg || "var(--paper)" }}>
          <div className="lbl">{t}</div>
          <div className="mono" style={{ fontSize: 28 }}>{v}</div>
          <div className="xs">{s}</div>
        </div>
      ))}
    </div>

    {/* mini cal + journal */}
    <div className="row gap-4 grow" style={{ overflow:"hidden" }}>
      <div className="box p-4 grow">
        <div className="row between mb-2">
          <h3 style={{ fontSize: 22 }}>Mini-calendrier</h3>
          <div className="xs hand">tape un jour pour saisir →</div>
        </div>
        <div className="cal" style={{ gridTemplateColumns:"repeat(7, 1fr)" }}>
          {["L","M","M","J","V","S","D"].map((d,i)=><div key={i} className="h">{d}</div>)}
          {Array.from({ length: 35 }).map((_,i)=>{
            const day = i - 1;
            const inMonth = day>=1 && day<=30;
            const tag = day===27?"matin":day===28?"aprem":day===29?"recup":day===26?"conge":"";
            return (
              <div key={i} className={`cell ${tag} ${!inMonth?"dim":""}`} style={{ aspectRatio:"unset", height: 46 }}>
                <span style={{ fontSize: 12 }}>{inMonth?day:""}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="box p-4" style={{ width: 360 }}>
        <h3 style={{ fontSize: 22 }} className="mb-2">À venir</h3>
        <div className="col gap-2 small">
          <div className="row between"><span>📅 27 avr · matin</span><span className="mono">10h20</span></div>
          <div className="row between"><span>📅 28 avr · aprem</span><span className="mono">10h20</span></div>
          <div className="row between"><span>🌿 29 avr · récup</span><span>—</span></div>
          <div className="row between"><span>🎉 1er mai · férié</span><span className="mono">+100%</span></div>
        </div>
        <div className="squig mt-3"></div>
        <div className="hand mt-2" style={{ fontSize: 15 }}>« joli mois en perspective »</div>
      </div>
    </div>
  </FrameShell>
);

// =========================================================
// 4) SYNTHÈSE — 2 variantes
// =========================================================

const SyntheseA = () => (
  <FrameShell active="Synthèse mensuelle"
    title={
      <div className="row between">
        <div>
          <div className="lbl">synthèse</div>
          <h1 style={{ fontSize: 36 }}>Avril 2026</h1>
        </div>
        <div className="row gap-2"><div className="icn">‹</div><div className="pill">avril 2026</div><div className="icn">›</div></div>
      </div>
    }
  >
    <div className="row gap-4 grow" style={{ overflow:"hidden" }}>
      {/* receipt */}
      <div className="box p-5" style={{ width: 520, background:"#fbf7ec",
        clipPath:"polygon(0 0,100% 0,100% calc(100% - 14px),95% 100%,90% calc(100% - 6px),85% 100%,80% calc(100% - 6px),75% 100%,70% calc(100% - 6px),65% 100%,60% calc(100% - 6px),55% 100%,50% calc(100% - 6px),45% 100%,40% calc(100% - 6px),35% 100%,30% calc(100% - 6px),25% 100%,20% calc(100% - 6px),15% 100%,10% calc(100% - 6px),5% 100%,0 calc(100% - 14px))" }}>
        <div className="center col gap-1 mb-3">
          <div className="hand" style={{ fontSize: 18 }}>· salairio ·</div>
          <div className="lbl">reçu mensuel · avril 2026</div>
        </div>
        <div className="squig mb-3"></div>
        <div className="col gap-2 mono" style={{ fontSize: 14 }}>
          <div className="row between"><span>salaire de base</span><span>2 426,72 €</span></div>
          <div className="row between"><span>brut total</span><span>2 426,72 €</span></div>
          <div className="row between" style={{ color:"var(--rose)" }}><span>cotisations</span><span>− 533,88 €</span></div>
          <div className="row between" style={{ color:"var(--rose)" }}><span>mutuelle</span><span>− 30,00 €</span></div>
          <div className="row between"><span>net imposable</span><span>1 862,84 €</span></div>
          <div className="row between" style={{ color:"var(--rose)" }}><span>PAS (4,1 %)</span><span>− 76,38 €</span></div>
          <div className="squig my-2"></div>
          <div className="row between" style={{ fontSize: 22 }}><span style={{ fontFamily:"Caveat" }}>net après prélèvement</span><b>1 786,47 €</b></div>
        </div>
        <div className="mt-4 center"><div className="btn primary">💾 Sauvegarder l'estimation</div></div>
      </div>

      {/* breakdown */}
      <div className="col gap-3 grow">
        <div className="box p-4">
          <h3 style={{ fontSize: 22 }} className="mb-3">D'où vient ton net ?</h3>
          {/* stacked bar */}
          <div style={{ display:"flex", height: 32, borderRadius: 999, overflow:"hidden", border:"1.5px solid var(--ink)" }}>
            <div style={{ width:"73%", background:"var(--moss)" }} className="center mono" >net 73%</div>
            <div style={{ width:"22%", background:"var(--rose)" }} className="center mono" >cot. 22%</div>
            <div style={{ width:"5%",  background:"var(--ink)", color:"var(--paper)" }} className="center mono" >pas</div>
          </div>
          <div className="legend mt-3">
            <span><span className="d" style={{ background:"var(--moss)" }} />Net qui arrive sur ton compte</span>
            <span><span className="d" style={{ background:"var(--rose)" }} />Cotisations & mutuelle</span>
            <span><span className="d" style={{ background:"var(--ink)" }} />Prélèvement à la source</span>
          </div>
        </div>

        <div className="box p-4">
          <div className="row between mb-2">
            <h3 style={{ fontSize: 22 }}>Compteur du mois</h3>
            <Pill>≈ équilibré</Pill>
          </div>
          <div className="row gap-3">
            <div className="box p-3 grow moss-fill">
              <div className="lbl" style={{ color:"var(--paper)" }}>crédit</div>
              <div className="mono" style={{ fontSize: 28 }}>+2h25</div>
            </div>
            <div className="box p-3 grow ink-fill">
              <div className="lbl" style={{ color:"var(--amber-soft)" }}>débit</div>
              <div className="mono" style={{ fontSize: 28 }}>−10h20</div>
            </div>
            <div className="box p-3 grow amber-soft">
              <div className="lbl">solde</div>
              <div className="mono" style={{ fontSize: 28 }}>−7h55</div>
            </div>
          </div>
        </div>

        <div className="box p-4 grow">
          <h3 style={{ fontSize: 22 }} className="mb-2">12 derniers mois</h3>
          <div className="bars" style={{ height: 110, alignItems:"flex-end" }}>
            {[68,72,80,76,84,90,88,82,79,86,92,88].map((h,i)=>(
              <div key={i} className="col gap-1 center">
                <div className="b" style={{ height:h, background: i===11?"var(--amber)":"var(--ink)" }} />
                <div className="xs">{["m","a","m","j","j","a","s","o","n","d","j","f"][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </FrameShell>
);

const SyntheseB = () => (
  <FrameShell active="Synthèse mensuelle"
    title={
      <div className="row between">
        <div>
          <h1 style={{ fontSize: 36 }}>Synthèse · variante « tuiles »</h1>
          <div className="small">Plus visuelle, moins « bulletin de paie ».</div>
        </div>
      </div>
    }
  >
    <div className="row gap-4 grow" style={{ overflow:"hidden" }}>
      <div className="col gap-3 grow">
        <div className="row gap-3">
          <div className="box p-4 grow night-fill">
            <div className="lbl" style={{ color:"var(--amber-soft)" }}>net du mois</div>
            <div style={{ fontFamily:"Caveat", fontSize: 56, lineHeight:1 }}>1 786,47 €</div>
            <div className="small" style={{ color:"#cfc6b3" }}>déposé entre le 28 et le 30 avr.</div>
          </div>
          <div className="box p-4 amber-soft" style={{ width: 220 }}>
            <div className="lbl">brut</div>
            <div className="mono" style={{ fontSize: 28 }}>2 426,72 €</div>
            <Squig/>
            <div className="hand small mt-1">+0,8% vs mars</div>
          </div>
        </div>

        <div className="row gap-3">
          {[
            ["Cotisations", "533,88 €", "22%", "var(--rose)"],
            ["Mutuelle",    " 30,00 €", "1.2%", ""],
            ["PAS",         " 76,38 €", "4,1%", "var(--ink)"],
          ].map(([t,v,p,bg],i)=>(
            <div key={i} className="box p-4 grow" style={{ background: bg, color: bg ? "var(--paper)" : "var(--ink)" }}>
              <div className="lbl" style={{ color: bg ? "var(--amber-soft)" : "var(--ink-3)" }}>{t}</div>
              <div className="mono" style={{ fontSize: 24 }}>{v}</div>
              <div className="small">{p}</div>
            </div>
          ))}
        </div>

        <div className="box p-4 grow">
          <h3 style={{ fontSize: 22 }} className="mb-2">Comment ce mois s'assemble</h3>
          <div className="ph grow" style={{ height: 220 }}>
            waterfall — brut → cotis → net imp. → PAS → net après PAS
          </div>
        </div>
      </div>

      {/* right rail */}
      <div className="col gap-3" style={{ width: 360 }}>
        <div className="box p-4 amber-fill">
          <div className="row gap-3" style={{ alignItems:"center" }}>
            <div className="ph" style={{ width:80, height:80, borderColor:"var(--ink)" }}>tasse</div>
            <div>
              <div className="hand" style={{ fontSize: 18 }}>« beau mois, Lou »</div>
              <div className="small">tu es à <b>+38€</b> vs mars, malgré un déficit horaire.</div>
            </div>
          </div>
        </div>
        <div className="box p-4">
          <h3 style={{ fontSize: 22 }} className="mb-2">Cap pour mai</h3>
          <ul className="small" style={{ margin:0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>1er mai férié → +100% sur 1 poste</li>
            <li>2 récups à poser avant fin juin</li>
            <li>Prime exceptionnelle attendue</li>
          </ul>
        </div>
        <div className="btn primary center">💾 Sauvegarder l'estimation</div>
      </div>
    </div>
  </FrameShell>
);

// =========================================================
// 5) RÉGLAGES — 2 variantes
// =========================================================

const ReglagesA = () => (
  <FrameShell active="Réglages"
    title={
      <div className="row between">
        <div>
          <h1 style={{ fontSize: 36 }}>Réglages</h1>
          <div className="small">Paramètres de paie et règles métier · v1</div>
        </div>
        <div className="row gap-2">
          <div className="btn">Annuler</div>
          <div className="btn dark">Enregistrer</div>
        </div>
      </div>
    }
  >
    <div className="row gap-4 grow" style={{ overflow:"hidden" }}>
      {/* sub-nav */}
      <div className="col gap-2" style={{ width: 200 }}>
        <div className="lbl">sections</div>
        {[
          ["💶","Paramètres de paie", false],
          ["⏰","Horaires des postes", true],
          ["⚡","Majorations", false],
          ["🌿","Congés & récup", false],
          ["🎁","Primes", false],
          ["🔔","Alertes", false],
        ].map(([e,n,on],i)=>(
          <div key={i} className="row gap-2 p-3" style={{
            border:"1.25px solid var(--ink)",
            borderRadius:12, background: on?"var(--ink)":"var(--paper)",
            color: on?"var(--paper)":"var(--ink)"
          }}>
            <span>{e}</span><span>{n}</span>
          </div>
        ))}
      </div>

      <div className="col gap-3 grow" style={{ overflow:"hidden" }}>
        {/* horaires */}
        <div className="box p-4">
          <div className="row between mb-3">
            <h3 style={{ fontSize: 24 }}>⏰ Horaires des postes</h3>
            <div className="hand small">deux postes par défaut, modifiable</div>
          </div>
          <div className="row gap-3">
            <div className="box p-3 grow amber-soft">
              <div className="lbl mb-2">poste matin</div>
              <div className="row gap-2" style={{ flexWrap:"wrap" }}>
                <div className="col gap-1"><span className="xs">DÉBUT</span><span className="input">06 : 30</span></div>
                <div className="col gap-1"><span className="xs">FIN</span><span className="input">16 : 50</span></div>
                <div className="col gap-1"><span className="xs">PAUSE</span><span className="input">0 min</span></div>
              </div>
              <div className="hand small mt-2">≈ 10h20 effectif</div>
            </div>
            <div className="box p-3 grow" style={{ background:"#d6d2ea" }}>
              <div className="lbl mb-2">poste après-midi</div>
              <div className="row gap-2" style={{ flexWrap:"wrap" }}>
                <div className="col gap-1"><span className="xs">DÉBUT</span><span className="input">11 : 10</span></div>
                <div className="col gap-1"><span className="xs">FIN</span><span className="input">21 : 30</span></div>
                <div className="col gap-1"><span className="xs">PAUSE</span><span className="input">0 min</span></div>
              </div>
              <div className="hand small mt-2">≈ 10h20 effectif</div>
            </div>
          </div>
        </div>

        {/* majorations */}
        <div className="box p-4 grow" style={{ overflow:"auto" }}>
          <div className="row between mb-3">
            <h3 style={{ fontSize: 24 }}>⚡ Majorations</h3>
            <div className="seg amber"><div className="on">priorité (max)</div><div>cumul</div></div>
          </div>
          <div className="small mb-3">Seule la majoration la plus haute s'applique quand plusieurs se cumulent.</div>

          <div className="lbl mb-2">taux par type</div>
          <div className="col gap-2">
            {[
              ["Heures supp. 25%", true,  "25 %"],
              ["Heures supp. 50%", false, "50 %"],
              ["Dimanche",         true,  "25 %"],
              ["Jour férié",       true,  "100 %"],
              ["1er mai",          true,  "100 %"],
              ["Jour supplémentaire", false, "0 %"],
            ].map(([n,on,v],i)=>(
              <div key={i} className="row gap-3 p-3" style={{
                border:"1.25px solid rgba(29,26,23,.25)",
                borderRadius: 12, alignItems:"center"
              }}>
                <div className={`toggle ${on?"on":""}`} />
                <div className="grow" style={{ opacity: on?1:.5, fontStyle: on?"normal":"italic" }}>{n}</div>
                <span className="input" style={{ minWidth: 60, textAlign:"right" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </FrameShell>
);

const ReglagesB = () => (
  <FrameShell active="Réglages"
    title={
      <div className="row between">
        <div>
          <h1 style={{ fontSize: 36 }}>Réglages · variante « onboarding »</h1>
          <div className="small">Format conversationnel pour les premières fois.</div>
        </div>
      </div>
    }
  >
    <div className="row gap-4 grow" style={{ overflow:"hidden" }}>
      <div className="col gap-3 grow">
        <div className="box p-5">
          <div className="row gap-3" style={{ alignItems:"center" }}>
            <div className="ph" style={{ width:80, height:80 }}>sablier</div>
            <div className="grow">
              <div className="hand" style={{ fontSize: 22 }}>« à quoi ressemblent tes journées ? »</div>
              <div className="small">tu peux toujours changer ça plus tard.</div>
            </div>
            <Pill>étape 2 / 5</Pill>
          </div>

          <div className="squig my-3"></div>

          <div className="row gap-3" style={{ flexWrap:"wrap" }}>
            <div className="box p-3 amber-soft" style={{ width: 240 }}>
              <div className="lbl">matin</div>
              <div className="mono mt-2" style={{ fontSize: 18 }}>06:30 — 16:50</div>
              <div className="xs">10h20 · pause 0 min</div>
            </div>
            <div className="box p-3" style={{ background:"#d6d2ea", width: 240 }}>
              <div className="lbl">après-midi</div>
              <div className="mono mt-2" style={{ fontSize: 18 }}>11:10 — 21:30</div>
              <div className="xs">10h20 · pause 0 min</div>
            </div>
            <div className="box dashed p-3 center" style={{ width: 240, color:"var(--ink-3)" }}>
              + ajouter un poste
            </div>
          </div>
        </div>

        <div className="box p-4 grow">
          <h3 style={{ fontSize: 22 }} className="mb-3">Majorations actives</h3>
          <div className="row gap-2" style={{ flexWrap:"wrap" }}>
            {["Heures supp. 25%","Dimanche +25%","Férié +100%","1er mai +100%"].map((m,i)=>(
              <Pill key={i} variant="amber">✓ {m}</Pill>
            ))}
            <Pill>＋ heures supp. 50%</Pill>
            <Pill>＋ jour suppl.</Pill>
          </div>
          <div className="small mt-3">Tape sur une pastille pour activer / régler le taux.</div>
        </div>

        <div className="row gap-3">
          <div className="btn">← retour</div>
          <div className="grow"></div>
          <div className="btn dark">passer</div>
          <div className="btn primary">continuer →</div>
        </div>
      </div>

      <div className="col gap-3" style={{ width: 320 }}>
        <Note style={{ transform:"rotate(1.5deg)" }}>
          Pourquoi ces réglages ?<br/>Salairio s'en sert pour estimer ton net dès que tu pointes un poste.
        </Note>
        <div className="box p-4">
          <div className="lbl mb-2">aperçu</div>
          <div className="mono" style={{ fontSize: 22 }}>≈ 1 786 €</div>
          <div className="xs">avec ces réglages, ton net moyen tournerait autour de ça.</div>
        </div>
      </div>
    </div>
  </FrameShell>
);

// =========================================================
// CANVAS ROOT
// =========================================================

const App = () => (
  <DesignCanvas
    title="Salairio · refonte cosy"
    subtitle="Wireframes b&w sketchy · 3 directions par écran · mini design system"
  >
    <DCSection id="ds" title="0 · système">
      <DCArtboard id="ds-1" label="Mini design system" width={1480} height={1180}>
        <DesignSystem/>
      </DCArtboard>
      <DCArtboard id="analyse" label="Analyse existant → cap visé" width={1180} height={500}>
        <AnalyseCard/>
      </DCArtboard>
    </DCSection>

    <DCSection id="accueil" title="1 · accueil">
      <DCArtboard id="acc-a" label="A · Calendrier généreux" width={1320} height={860}>
        <AccueilA/>
      </DCArtboard>
      <DCArtboard id="acc-b" label="B · Journal & timeline" width={1320} height={860}>
        <AccueilB/>
      </DCArtboard>
      <DCArtboard id="acc-c" label="C · Horizon minimal" width={1320} height={860}>
        <AccueilC/>
      </DCArtboard>
    </DCSection>

    <DCSection id="syn" title="2 · synthèse mensuelle">
      <DCArtboard id="syn-a" label="A · Reçu papier" width={1320} height={860}>
        <SyntheseA/>
      </DCArtboard>
      <DCArtboard id="syn-b" label="B · Tuiles + waterfall" width={1320} height={860}>
        <SyntheseB/>
      </DCArtboard>
    </DCSection>

    <DCSection id="reg" title="3 · réglages">
      <DCArtboard id="reg-a" label="A · Sub-nav + sections" width={1320} height={860}>
        <ReglagesA/>
      </DCArtboard>
      <DCArtboard id="reg-b" label="B · Onboarding cosy" width={1320} height={860}>
        <ReglagesB/>
      </DCArtboard>
    </DCSection>

    <DCSection id="mobile" title="4 · mobile">
      <DCArtboard id="mob-guide" label="Règles responsive" width={1140} height={620}>
        <window.ResponsiveGuide/>
      </DCArtboard>
      <DCArtboard id="mob-acc" label="Accueil · iPhone" width={440} height={900}>
        <window.IOSDevice width={402} height={874} title="Salairio">
          <window.MAccueil/>
        </window.IOSDevice>
      </DCArtboard>
      <DCArtboard id="mob-syn" label="Synthèse · iPhone" width={440} height={900}>
        <window.IOSDevice width={402} height={874} title="Salairio">
          <window.MSynthese/>
        </window.IOSDevice>
      </DCArtboard>
      <DCArtboard id="mob-reg" label="Réglages · iPhone" width={440} height={900}>
        <window.IOSDevice width={402} height={874} title="Salairio">
          <window.MReglages/>
        </window.IOSDevice>
      </DCArtboard>
    </DCSection>

  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
