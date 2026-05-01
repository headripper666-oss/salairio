# Mémoire projet — Salairio

## Identité
PWA RH personnelle, 1 utilisateur (headripper666@gmail.com). Estimation salaire net + compteur heures supp France 2026. Pas un moteur de paie officiel.

## Stack
- React 19 + TypeScript + Vite 8 + npm
- Tailwind v4 (CSS-first) + Framer Motion + Lucide React
- Zustand + React Query v5
- Firebase Auth + Firestore (europe-west1)
- React Router v7 hash routing (GitHub Pages)
- Vitest (`npm test`)

## Règle calcul brut
`hourlyRateGross × 151.67` = brut mensuel — lecture seule, ne jamais demander à l'utilisateur.

## Déploiement
GitHub Pages, base `/salairio/`. Commande : `npm run deploy`.

## Versionnage
Incrémenter le suffixe lettre à chaque déploiement : V1.3A → V1.3B → V1.3C…
Permet à Renaud de savoir quand tester la nouvelle version.

## État d'avancement (mai 2026)
- ✅ Étapes 1–6 validées : auth, Firestore, calendrier, moteur salaire, synthèse, annuel, PWA offline
- ✅ V1.1 : repas, RDV, rappels pilule, notifications
- ✅ V1.3A : analyse fiche de paie Mistral (appel direct front, PDF.js multi-pages, chat, comparaison)
- 🔲 Étape 7 : polish + déploiement GitHub Pages final

## Collections Firestore
`users/{uid}/` : settings, calendarDays, counterMovements, monthlySummaries, yearlySummaries, fixedExtras, oneOffBonuses, taxRates, holidayOverrides, appointments

## Modèle Mistral
Toujours `mistral-small-latest` (Small 4, unifié vision+texte). Appel direct depuis le front.
