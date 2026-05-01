# Salairio — Instructions projet

## Contexte
PWA RH personnelle (1 seul utilisateur : headripper666@gmail.com) pour suivi planning, estimation salaire net mensuel et compteur heures supplémentaires — France 2026.
Ce n'est PAS un moteur officiel de fiche de paie. Toujours présenter les calculs comme des estimations.

## Stack
- React 19 + TypeScript + Vite 8 + **npm** (pas pnpm)
- Tailwind CSS v4 (config CSS-first `@theme`, plugin `@tailwindcss/vite`)
- Framer Motion + Lucide React
- Zustand (état global) + React Query v5
- Firebase Auth (email/password) + Firestore (`europe-west1`)
- vite-plugin-pwa (Workbox, offline read-only)
- React Router v7 **Hash routing** (GitHub Pages)
- Vitest pour les tests (`npm test`)

## Règle critique — calcul brut
`hourlyRateGross × 151.67` = brut mensuel (lecture seule, jamais demander à l'utilisateur)

## Déploiement
- Front : GitHub Pages, base URL `/salairio/`
- `npm run deploy` → build + gh-pages
- Pas de backend custom

## Commandes utiles
```bash
npm run dev       # serveur local
npm run build     # build prod (tsc -b && vite build)
npm test          # vitest run
npm run lint      # eslint
npm run deploy    # build + déploiement GitHub Pages
```

## Conventions code
- Composants dans `src/components/<feature>/`
- Hooks dans `src/hooks/`
- Services Firestore dans `src/services/firestore/`
- Moteur de calcul dans `src/engine/`
- Types Firestore dans `src/types/firestore.ts`
- Versionnage : suffixe lettre (V1.3A, V1.3B…) à chaque déploiement pour que Renaud sache quand tester

## Firebase
- Project ID : `salairio`
- Firestore rules : `allow read, write: if request.auth != null && request.auth.uid == uid`
- `VITE_USE_FIREBASE_EMULATOR=false` (utilise Firebase réel, pas l'émulateur)

## Contraintes importantes
- Hash routing obligatoire (GitHub Pages ne supporte pas le routing HTML5)
- Pas de dépendance serveur custom — tout est Firebase
- Mobile-first : tester les vues mobile avant desktop
