# Salairio - Architecture & Déploiement

## 📋 Stack Technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19.2.5 | UI Framework |
| TypeScript | 6.0.2 | Typage statique |
| Vite | 8.0.10 | Bundler |
| Firebase | 12.12.1 | Backend (Auth, Firestore) |
| Tailwind CSS | 4.2.4 | Styling |
| Zustand | 5.0.12 | State management |
| React Router | 7.14.2 | Routing |
| TanStack Query | 5.100.5 | Data fetching |
| vite-plugin-pwa | 1.2.0 | PWA support |

## 🏗️ Architecture du Projet

### Structure des dossiers `src/`

```
src/
├── components/      # Composants UI
│   ├── annual/      # Résumé annuel
│   ├── auth/        # Authentification
│   ├── bonuses/     # Bonus gestion
│   ├── day/         # Jour calendrier
│   ├── home/        # Page d'accueil
│   ├── layout/      # Layout principal
│   ├── settings/    # Paramètres
│   ├── shared/      # Composants partagés
│   └── summary/     # Résumé
├── engine/          # Logique métier
│   ├── calendar.ts  # Calculs calendaires
│   ├── salary.ts    # Calculs salariaux
│   ├── overtime.ts  # Heures suppl.
├── hooks/           # Custom hooks
│   ├── useCalendar*
│   ├── useSalaryEngine*
│   ├── useSettings*
│   └── ...
├── lib/             # Utilitaires Firebase
│   ├── firebase.ts  # Config Firebase
│   ├── queryClient.ts
│   └── router.tsx   # Routes React
├── services/        # Services API
│   └── firestore/   # Services Firestore
├── store/           # Zustand stores
│   ├── authStore.ts
│   ├── counterStore.ts
│   └── uiStore.ts
├── types/           # TypeScript types
│   ├── domain.ts
│   ├── firestore.ts
│   └── ui.ts
├── utils/           # Utilitaires
│   ├── colorUtils.ts
│   ├── dateUtils.ts
│   └── formatters.ts
├── App.tsx          # Application principale
├── main.tsx         # Point d'entrée
├── App.css          # Styles CSS
└── index.css        # Global styles
```

### Flux de données

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   UI Layer  │───▶│  Business     │───▶│   Firebase    │
│   (Hooks)   │◀───│  (Engine)     │◀───│   (Firestore) │
└─────────────┘     └──────────────┘     └─────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    Zustand Store      Calculs Salariaux      Données Stockées
```

## 🔐 Règles de sécurité Firebase

- Accès Firestore: lectures/écritures autorisées uniquement pour l'utilisateur authentifié
- Règles par UID dans `firestore.rules`

## 🚀 Déploiement

### 1. Développement (Dev)

```bash
# Installation
npm install

# Lancement serveur dev (HMR activé)
npm run dev

# URL: http://localhost:5173 (modifiable dans vite.config.ts)
```

**Variables d'environnement (`.env.local`):**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... autres variables Firebase
```

### 2. Production (Prod)

#### Build production

```bash
# Build optimisé pour production
npm run build

# Contenu généré dans ./dist/
# Structure:
#   dist/
#   ├── index.html
#   ├── assets/
#   │   ├── [vendedores-chachacha-remplacer]/
#   │   ├── favicon.svg
#   │   └── index-[hash].js
#   └── favicon.svg
```

#### Hébergement GitHub Pages

```bash
# Déploiement sur GitHub Pages
npm run deploy

# Configure .gitignore pour ignorer: node_modules, dist, .env*
```

**Configuration `vite.config.ts`:**
- Mode dev: `base: '/'`
- Mode prod: `base: '/salairio/'` (pour sous-dossier GitHub)

#### Hébergement Firebase Hosting (optionnel)

```bash
# Installation Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Déploiement
firebase deploy --only hosting

# Ou Firestore uniquement
firebase deploy --only firestore:rules
```

### 3. PWA / Mobile

- Manifest PWA configuré dans `vite.config.ts`
- Register auto-update via `workbox`
- Compatible iOS/Android standalone mode

## 📦 Scripts npm

| Script | Commande | Description |
|--------|----------|-------------|
| dev | `vite` | Serveur de développement |
| build | `tsc -b && vite build` | Build TypeScript + Vite |
| preview | `vite preview` | Preview build |
| test | `vitest run` | Exécution tests |
| lint | `eslint .` | Linting ESint |
| deploy | `npm run build && gh-pages -d dist` | Déploiement GitHub Pages |

## 🔧 Configuration TypeScript

- `tsconfig.json` - Configuration principale
- `tsconfig.app.json` - App TypeScript
- `tsconfig.node.json` - Node TypeScript
- ESLint: `eslint.config.js`

## 🎨 Thèmes

Fichier compressé `Salairio theme.zip` contient les thèmes personnalisables.

## 📊 Stats

- **Lignes de code:** ~500-1000
- **Deps:** 24 dépendances
- **Taille build:** ~50-100 KB (gzipped)