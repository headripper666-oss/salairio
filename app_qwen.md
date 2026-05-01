# Architecture Technique de l'Application Salairio

## 1. Structure du Projet
Le projet est organisé en plusieurs dossiers clés :
- `public/` : Contient les assets statiques (favicon, icônes)
- `src/` : Répertoire principal du code source
  - `App.tsx` : Composant principal de l'application
  - `main.tsx` : Point d'entrée de l'application
  - `components/` : Composants réutilisables
  - `services/` : Services backend/Firebase
  - `store/` : Gestion de l'état global
  - `types/` : Définitions de types TypeScript

## 2. Stack Technologique
### Frontend
- **Framework** : React (TypeScript)
- **Build Tool** : Vite (configuration dans `vite.config.ts`)
- **CSS** : Utilisation de `src/index.css` et `src/App.css`
- **Dépendances** : Gérées via `package.json` (npm)

### Backend
- **Base de données** : Firebase (configuration dans `firebase.json` et `firestore.rules`)
- **Authentification** : Gérée via Firebase Authentication
- **Hébergement** : Déployable via Firebase Hosting

## 3. Fonctionnalités Clés
- Interface utilisateur moderne avec un design responsive
- Gestion de l'état via un store centralisé
- Intégration avec Firebase pour la persistance des données
- Configuration de l'environnement via `.env.example`

## 4. Déploiement
- Utilisation de Vite pour le développement local
- Déploiement possible sur Firebase Hosting
- Configuration de l'environnement via les fichiers `.env`

## 5. Outils de Développement
- ESLint pour le linting (configuration dans `eslint.config.js`)
- TypeScript pour la vérification de type (configuration dans `tsconfig.json`)
- Gestion des dépendances via npm