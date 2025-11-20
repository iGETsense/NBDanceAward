# NB Dance Awards - Documentation Complète

## 📋 Table des Matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Architecture générale](#architecture-générale)
3. [Structure du projet](#structure-du-projet)
4. [Stack technologique](#stack-technologique)
5. [Configuration et installation](#configuration-et-installation)
6. [Intégration Backend-Frontend](#intégration-backend-frontend)
7. [Fonctionnalités principales](#fonctionnalités-principales)
8. [Base de données Firebase](#base-de-données-firebase)
9. [Flux de données](#flux-de-données)
10. [Sécurité](#sécurité)
11. [Déploiement](#déploiement)
12. [Guide de continuation du projet](#guide-de-continuation-du-projet)

---

## 🎯 Vue d'ensemble du projet

**NB Dance Awards** est une plateforme de vote en ligne pour élire les meilleures talents de danse africaine. C'est une application web moderne construite avec **Next.js 15** et **Firebase Realtime Database**.

### Objectifs principaux

- Permettre aux utilisateurs de voter pour leurs danseurs préférés
- Afficher un classement en temps réel des candidats
- Gérer plusieurs catégories de danse (Coupé Décalé, Mbolé, Chorégraphie, etc.)
- Supporter les paiements mobiles (MTN Mobile Money, Orange Money)
- Fournir une interface responsive et moderne

### Caractéristiques clés

- ✅ **67 candidats** répartis en 11 catégories
- ✅ **Classement en temps réel** avec synchronisation Firebase
- ✅ **Système de vote** avec paiement mobile
- ✅ **Interface responsive** (mobile, tablet, desktop)
- ✅ **SEO optimisé** pour les moteurs de recherche
- ✅ **Sécurité renforcée** avec Content Security Policy
- ✅ **Analytics** intégré (Vercel Analytics)

---

## 🏗️ Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js Frontend)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages (Home, Candidats, Classement, Règles)        │   │
│  │  Components (UI, Carousels, Modals)                 │   │
│  │  Hooks (useFirebaseData, useCandidates)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
                    (REST API / WebSocket)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE REALTIME DATABASE (Backend)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /candidates     → Données des candidats            │   │
│  │  /votes          → Historique des votes             │   │
│  │  /users          → Profils utilisateurs             │   │
│  │  /leaderboard    → Classements en temps réel        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure du projet

```
NBDanceAward/
├── app/                          # Pages Next.js (App Router)
│   ├── page.tsx                 # Page d'accueil (Accueil + Candidats)
│   ├── candidats/
│   │   ├── page.tsx             # Page liste complète des candidats
│   │   └── loading.tsx          # Skeleton loading
│   ├── classement/
│   │   └── page.tsx             # Page classement/leaderboard
│   ├── regles/
│   │   └── page.tsx             # Page règles du concours
│   ├── admin/
│   │   └── page.tsx             # Panel admin (gestion données)
│   ├── layout.tsx               # Layout racine avec métadonnées SEO
│   ├── manifest.json            # PWA manifest
│   ├── robots.ts                # Robots.txt généré
│   └── sitemap.ts               # Sitemap généré
│
├── components/                   # Composants React réutilisables
│   ├── ui/                      # Composants shadcn/ui
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── carousel.tsx
│   │   └── ... (50+ composants)
│   ├── ImageWithFallback.tsx    # Composant image avec fallback
│   ├── PartnerLogos.tsx         # Affichage logos partenaires
│   ├── PartnersCarousel.tsx     # Carousel des partenaires
│   └── ScrollAnimatedElement.tsx # Animations au scroll
│
├── lib/                          # Logique métier et utilitaires
│   ├── firebase.ts              # Configuration Firebase
│   ├── database.ts              # Fonctions CRUD Firebase
│   ├── percentageCalculator.ts  # Calcul des pourcentages de votes
│   ├── security.ts              # Fonctions de sécurité
│   ├── env.ts                   # Validation variables d'environnement
│   ├── utils.ts                 # Utilitaires généraux
│   └── candidatesData.ts        # Données statiques candidats
│
├── hooks/                        # Custom React Hooks
│   ├── useFirebaseData.ts       # Hooks pour récupérer données Firebase
│   ├── use-mobile.ts            # Détection mobile
│   ├── use-toast.ts             # Gestion notifications
│   └── useScrollAnimation.ts    # Animations au scroll
│
├── styles/                       # Styles globaux
│   └── globals.css              # Tailwind + styles personnalisés
│
├── public/                       # Fichiers statiques
│   ├── dancers/                 # Photos des danseurs
│   ├── logo.png                 # Logo principal
│   ├── favicon.ico              # Favicon
│   └── ... (images, icônes)
│
├── scripts/                      # Scripts utilitaires
│   └── ... (scripts de maintenance)
│
├── middleware.ts                # Middleware Next.js (sécurité)
├── next.config.mjs              # Configuration Next.js
├── tsconfig.json                # Configuration TypeScript
├── tailwind.config.ts           # Configuration Tailwind CSS
├── package.json                 # Dépendances du projet
├── .env.local.example           # Exemple variables d'environnement
├── .env.local                   # Variables d'environnement (non commité)
├── vercel.json                  # Configuration Vercel
├── FIREBASE_SETUP.md            # Guide setup Firebase
├── SEO_SETUP.md                 # Guide SEO
├── SECURITY.md                  # Documentation sécurité
├── CAROUSEL_GUIDE.md            # Guide carousel
├── IMAGE_OPTIMIZATION_GUIDE.md  # Guide optimisation images
└── PARTNER_LOGOS_GUIDE.md       # Guide logos partenaires
```

---

## 🛠️ Stack technologique

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **Langage**: TypeScript 5
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4.1.9
- **Composants**: shadcn/ui (Radix UI)
- **Icônes**: Lucide React 0.454.0
- **Carousel**: Embla Carousel
- **Formulaires**: React Hook Form + Zod validation
- **Notifications**: Sonner

### Backend
- **Base de données**: Firebase Realtime Database
- **Authentification**: Firebase Auth
- **Analytics**: Firebase Analytics + Vercel Analytics
- **Hébergement**: Vercel

### Outils de développement
- **Package Manager**: npm / pnpm
- **Linter**: ESLint
- **Formatage**: Prettier (via Next.js)
- **Versioning**: Git

---

## ⚙️ Configuration et installation

### Prérequis
- Node.js 18+ 
- npm ou pnpm
- Compte Firebase
- Compte Vercel (pour déploiement)

### Installation locale

1. **Cloner le repository**
```bash
git clone <repository-url>
cd NBDanceAward
```

2. **Installer les dépendances**
```bash
npm install
# ou
pnpm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.local.example .env.local
```

Remplir `.env.local` avec vos clés Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible à `http://localhost:3000`

### Scripts disponibles
```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Construire pour la production
npm start        # Démarrer le serveur de production
npm run lint     # Lancer ESLint
```

---

## 🔌 Intégration Backend-Frontend

### 1. Configuration Firebase

**Fichier**: `lib/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const database = getDatabase(app)
```

### 2. Fonctions CRUD Firebase

**Fichier**: `lib/database.ts`

Les principales fonctions pour interagir avec Firebase:

#### Candidats
```typescript
// Récupérer tous les candidats
export async function getCandidates()

// S'abonner aux changements en temps réel
export function subscribeToCandidates(callback)

// Ajouter un candidat
export async function addCandidate(candidateId, candidateData)
```

#### Votes
```typescript
// Soumettre un vote
export async function submitVote(userId, candidateId, voteCount, paymentMethod, provider, transactionId)

// Récupérer les votes d'un utilisateur
export async function getUserVotes(userId)

// S'abonner aux changements de votes
export function subscribeToVotes(callback)
```

#### Utilisateurs
```typescript
// Créer un utilisateur
export async function createUser(userId, userData)

// Récupérer un utilisateur
export async function getUser(userId)

// Mettre à jour un utilisateur
export async function updateUser(userId, userData)
```

#### Leaderboard
```typescript
// Récupérer le classement
export async function getLeaderboard(limit)

// S'abonner au classement en temps réel
export function subscribeToLeaderboard(callback, limit)
```

### 3. Hooks personnalisés

**Fichier**: `hooks/useFirebaseData.ts`

```typescript
// Hook pour récupérer les candidats
export function useCandidates() {
  // Retourne: { candidates, loading, error }
}

// Hook pour récupérer le leaderboard
export function useLeaderboard(limit) {
  // Retourne: { leaderboard, loading, error }
}

// Hook pour récupérer les votes d'un utilisateur
export function useUserVotes(userId) {
  // Retourne: { votes, loading, error }
}
```

### 4. Utilisation dans les composants

**Exemple**: `app/page.tsx`

```typescript
import { useCandidates, useLeaderboard } from '@/hooks/useFirebaseData'

export default function NBDanceAwardPage() {
  const { candidates, loading } = useCandidates()
  const { leaderboard } = useLeaderboard(10)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {/* Afficher les candidats */}
      {candidates.map(candidate => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  )
}
```

### 5. Flux de données en temps réel

```
Firebase Database
       ↓ (onValue listener)
subscribeToCandidates()
       ↓
useCandidates() hook
       ↓
Component state
       ↓
UI mise à jour automatiquement
```

---

## ✨ Fonctionnalités principales

### 1. Affichage des candidats

**Pages**: `app/page.tsx`, `app/candidats/page.tsx`

- Affichage en grille responsive
- Filtrage par catégorie
- Images optimisées avec fallback
- Badges pour les top 3 (🥇🥈🥉)
- Pourcentage de votes calculé en temps réel

### 2. Système de vote

**Composant**: Dialog modal dans `app/page.tsx`

Flux de vote:
1. Utilisateur clique sur un candidat
2. Modal s'ouvre avec options de vote
3. Sélection du nombre de votes (1-10)
4. Choix du mode de paiement (MTN Mobile Money / Orange Money)
5. Validation et soumission
6. Mise à jour en temps réel du classement

### 3. Classement en temps réel

**Page**: `app/classement/page.tsx`

- Affichage du top 10 des candidats
- Mise à jour automatique via Firebase listeners
- Tri par nombre de votes
- Calcul des pourcentages par catégorie

### 4. Catégories de danse

11 catégories principales:
- Meilleur artiste danseur - masculin
- Meilleure artiste danseuse féminine
- Meilleur groupe de danse
- Meilleur collaboration duo
- Meilleur artiste Chorégraphe
- Meilleur Performance web
- Meilleur artiste danseur au rythme folklorique
- Meilleur artiste danseur afro coupé décalé
- Meilleur artiste danseur mbolé
- Meilleure artiste danseuse mbolé
- Meilleur artiste danseur de l'année

### 5. Règles du concours

**Page**: `app/regles/page.tsx`

- Explications des catégories
- Conditions de participation
- Modalités de vote
- Conditions de paiement

### 6. Responsive Design

- **Mobile** (< 640px): Layout adapté, menu hamburger
- **Tablet** (640px - 1024px): Layout intermédiaire
- **Desktop** (> 1024px): Layout complet avec navigation

---

## 🗄️ Base de données Firebase

### Structure des données

```json
{
  "candidates": {
    "candidate_id_1": {
      "name": "Étienne kampos",
      "title": "Male Dance King",
      "image": "/dancers/Etienne kampos.jpg",
      "votes": 1847,
      "badge": 1,
      "percentage": 45,
      "category": "Meilleur artiste danseur - masculin"
    }
  },
  "votes": {
    "user_id_timestamp": {
      "userId": "user_123",
      "candidateId": "candidate_1",
      "voteCount": 5,
      "paymentMethod": "mobile",
      "provider": "mtn-momo-cameroon",
      "transactionId": "MTN_TXN_12345",
      "status": "completed",
      "createdAt": "2024-11-20T10:30:00Z"
    }
  },
  "users": {
    "user_id_1": {
      "email": "user@example.com",
      "totalVotes": 15,
      "createdAt": "2024-11-20T09:00:00Z"
    }
  }
}
```

### Règles de sécurité Firebase

À configurer dans Firebase Console:

```json
{
  "rules": {
    "candidates": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "votes": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$voteId": {
        ".validate": "newData.hasChildren(['userId', 'candidateId', 'voteCount'])"
      }
    },
    "users": {
      ".read": "auth != null && root.child('users').child(auth.uid).exists()",
      ".write": "auth != null && auth.uid === $userId"
    }
  }
}
```

---

## 📊 Flux de données

### Flux de vote complet

```
1. Utilisateur clique sur candidat
   ↓
2. Modal s'ouvre avec formulaire
   ↓
3. Utilisateur sélectionne nombre de votes
   ↓
4. Utilisateur choisit mode de paiement
   ↓
5. Validation du formulaire (Zod)
   ↓
6. Appel submitVote() → Firebase
   ↓
7. Firebase crée enregistrement vote
   ↓
8. Firebase incrémente votes du candidat
   ↓
9. Firebase incrémente totalVotes de l'utilisateur
   ↓
10. Listeners Firebase détectent changement
   ↓
11. useCandidates() met à jour state
   ↓
12. Composants se re-rendent avec nouvelles données
   ↓
13. Classement se met à jour en temps réel
```

### Flux de récupération des candidats

```
Component monte
   ↓
useEffect() appelle useCandidates()
   ↓
useCandidates() appelle subscribeToCandidates()
   ↓
subscribeToCandidates() crée listener Firebase
   ↓
Firebase envoie snapshot initial
   ↓
calculatePercentages() traite les données
   ↓
State se met à jour
   ↓
Component se re-rend
   ↓
Listener reste actif pour changements futurs
```

---

## 🔒 Sécurité

### 1. Content Security Policy (CSP)

**Fichier**: `middleware.ts`, `next.config.mjs`

- Restriction des sources de scripts
- Autorisation Firebase et Google Analytics
- Protection contre XSS
- Protection contre clickjacking

### 2. Headers de sécurité

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000
```

### 3. Variables d'environnement

- Clés Firebase publiques uniquement (NEXT_PUBLIC_*)
- Pas de secrets dans le code
- Utiliser `.env.local` en développement

### 4. Validation des données

- Zod pour validation des formulaires
- Validation côté client et serveur
- Sanitization des entrées utilisateur

### 5. Firebase Security Rules

- Authentification requise pour votes
- Lecture restreinte des données utilisateur
- Écriture restreinte aux administrateurs

---

## 🚀 Déploiement

### Déploiement sur Vercel

1. **Connecter le repository**
```bash
vercel link
```

2. **Configurer les variables d'environnement**
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... ajouter toutes les variables
```

3. **Déployer**
```bash
vercel deploy --prod
```

### Configuration Vercel

**Fichier**: `vercel.json`

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next"
}
```

### Optimisations de production

- ✅ Image optimization (WebP, AVIF)
- ✅ Code splitting automatique
- ✅ Compression gzip
- ✅ Caching des assets statiques (1 an)
- ✅ Analytics intégré

---

## 📖 Guide de continuation du projet

### Pour les développeurs Backend

#### 1. Ajouter une nouvelle catégorie

**Fichier**: `app/page.tsx`

```typescript
const staticCandidates = [
  // Ajouter dans le tableau:
  {
    name: "Nouveau Danseur",
    title: "Title",
    image: "/dancers/image.jpg",
    votes: 0,
    badge: null,
    percentage: 0,
    category: "Nouvelle Catégorie",
  }
]
```

#### 2. Ajouter un nouveau candidat via Firebase

```typescript
import { addCandidate } from '@/lib/database'

await addCandidate('candidate_id', {
  name: "Nom du candidat",
  title: "Titre",
  image: "/dancers/image.jpg",
  votes: 0,
  category: "Catégorie"
})
```

#### 3. Créer un endpoint API (si nécessaire)

Créer un fichier `app/api/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // Traiter les données
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

#### 4. Ajouter une nouvelle page

Créer `app/nouvelle-page/page.tsx`:

```typescript
export default function NouvellePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Contenu */}
    </div>
  )
}
```

#### 5. Modifier les règles Firebase

1. Aller sur Firebase Console
2. Realtime Database → Rules
3. Modifier les règles de sécurité
4. Publier les changements

#### 6. Ajouter des données en masse

```typescript
import { addCandidate } from '@/lib/database'

const candidatesData = [
  // Array de candidats
]

for (const candidate of candidatesData) {
  await addCandidate(candidate.id, candidate)
}
```

#### 7. Monitorer les performances

- Vercel Analytics: https://vercel.com/analytics
- Firebase Console: Realtime Database → Usage
- Google Search Console: SEO monitoring

#### 8. Gérer les votes frauduleux

```typescript
// Récupérer les votes suspects
const votes = await getUserVotes(userId)
const suspiciousVotes = votes.filter(v => v.createdAt > recentTime)

// Supprimer les votes frauduleux
// Implémenter une fonction deleteVote()
```

#### 9. Générer des rapports

```typescript
// Exemple: Rapport de votes par catégorie
export async function getVotesByCategory() {
  const candidates = await getCandidates()
  const report = {}
  
  candidates.forEach(c => {
    if (!report[c.category]) {
      report[c.category] = 0
    }
    report[c.category] += c.votes
  })
  
  return report
}
```

#### 10. Mettre à jour les métadonnées SEO

**Fichier**: `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: "Nouveau titre",
  description: "Nouvelle description",
  // ... autres métadonnées
}
```

### Checklist pour la continuation

- [ ] Vérifier la configuration Firebase
- [ ] Tester les fonctions CRUD
- [ ] Vérifier les règles de sécurité Firebase
- [ ] Tester le système de vote
- [ ] Vérifier la synchronisation en temps réel
- [ ] Tester sur mobile/tablet/desktop
- [ ] Vérifier les performances (Lighthouse)
- [ ] Vérifier le SEO
- [ ] Tester les paiements mobiles
- [ ] Configurer les analytics

### Ressources utiles

- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **TypeScript**: https://www.typescriptlang.org/docs

### Contacts et support

Pour toute question sur le projet, consultez:
- Documentation Firebase: `FIREBASE_SETUP.md`
- Guide SEO: `SEO_SETUP.md`
- Guide Sécurité: `SECURITY.md`

---

## 📝 Notes importantes

1. **Variables d'environnement**: Ne jamais commiter `.env.local`
2. **Images**: Placer les images dans `/public/dancers/`
3. **Composants**: Utiliser les composants shadcn/ui existants
4. **Styles**: Utiliser Tailwind CSS pour le styling
5. **TypeScript**: Toujours typer les variables et fonctions
6. **Firebase**: Tester les règles de sécurité avant production

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Dernière mise à jour**: 20 novembre 2024  
**Version**: 1.0.0  
**Statut**: Production
