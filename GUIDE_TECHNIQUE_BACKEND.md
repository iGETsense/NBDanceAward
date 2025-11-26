# NB Dance Awards - Guide Technique Complet pour l'Équipe de Développement

## 📋 Table des Matières

1. [Vue d'ensemble du système](#vue-densemble-du-système)
2. [Architecture Backend de Vote](#architecture-backend-de-vote)
3. [Structure détaillée des fichiers](#structure-détaillée-des-fichiers)
4. [Variables d'environnement](#variables-denvironnement)
5. [Intégration Mesomb](#intégration-mesomb)
6. [Flux de paiement complet](#flux-de-paiement-complet)
7. [Tests et débogage](#tests-et-débogage)
8. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble du système

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Pages:                                                     │ │
│  │  - / (Accueil + Candidats)                                 │ │
│  │  - /candidats (Liste complète)                             │ │
│  │  - /classement (Leaderboard)                               │ │
│  │  - /admin (Dashboard administrateur)                       │ │
│  │  - /regles (Règles du concours)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Hooks personnalisés:                                       │ │
│  │  - useVoting() → Soumet votes et vérifie paiements        │ │
│  │  - useBackendCandidates() → Charge candidats depuis API   │ │
│  │  - useTransactions() → Monitore transactions en temps réel │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│              FIREBASE CLOUD FUNCTIONS (Backend)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Fonctions:                                                 │ │
│  │  - submitVote() → Initie paiement Mesomb                   │ │
│  │  - verifyPayment() → Vérifie statut paiement               │ │
│  │  - handlePaymentWebhook() → Reçoit confirmations Mesomb    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Services:                                                  │ │
│  │  - mesombService.ts → Communication avec API Mesomb        │ │
│  │  - voteValidation.ts → Validation des données de vote      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   MESOMB API (Paiements)                         │
│  - Initiation paiement MTN/Orange                                │
│  - Vérification statut transaction                               │
│  - Webhooks de confirmation                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│            FIREBASE REALTIME DATABASE (Données)                  │
│  /candidates → Données des candidats + votes                     │
│  /transactions → Historique des paiements                        │
│  /votes → Enregistrements des votes                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Backend de Vote

### Composants Principaux

#### 1. **Firebase Cloud Functions** (`functions/`)

Les Cloud Functions gèrent toute la logique backend sécurisée:

**Pourquoi Cloud Functions?**

- ✅ Protège les clés API Mesomb (jamais exposées au frontend)
- ✅ Validation côté serveur des votes
- ✅ Gestion sécurisée des paiements
- ✅ Mise à jour atomique de la base de données
- ✅ Scalabilité automatique

**Structure:**

```
functions/
├── src/
│   ├── index.ts              # Fonctions principales
│   ├── mesombService.ts      # Intégration Mesomb
│   └── voteValidation.ts     # Validation des données
├── package.json              # Dépendances Cloud Functions
└── tsconfig.json             # Configuration TypeScript
```

#### 2. **Frontend Hooks** (`hooks/`)

Les hooks React gèrent la communication avec le backend:

```
hooks/
├── useVoting.ts              # Soumission de votes et vérification paiements
├── useTransactions.ts        # Monitoring temps réel des transactions
├── useBackendCandidates.ts   # Chargement des candidats
└── useFirebaseData.ts        # Accès direct Firebase (legacy)
```

#### 3. **Composants Admin** (`components/`)

Interface d'administration pour monitorer l'activité:

```
components/
└── AdminDashboard.tsx        # Stats et liste des transactions
```

---

## 📁 Structure détaillée des fichiers

### Fichiers Backend (Cloud Functions)

#### `functions/src/index.ts`

**Rôle:** Définit les 3 fonctions Cloud principales

**Fonctions exportées:**

1. **`submitVote`** (Callable Function)
   - **Entrée:** `{ candidateId, voteCount, phoneNumber, paymentMethod }`
   - **Sortie:** `{ success, transactionId, reference, amount, message }`
   - **Processus:**
     1. Valide le numéro de téléphone
     2. Valide le nombre de votes (1-100)
     3. Vérifie que le candidat existe
     4. Calcule le montant total (votes × prix)
     5. Détecte l'opérateur (MTN/Orange)
     6. Initie le paiement avec Mesomb
     7. Crée un enregistrement de transaction
     8. Retourne l'ID de transaction pour suivi

2. **`verifyPayment`** (Callable Function)
   - **Entrée:** `{ transactionId }`
   - **Sortie:** `{ success, status, message }`
   - **Processus:**
     1. Récupère la transaction depuis Firebase
     2. Vérifie le statut avec Mesomb
     3. Si confirmé: met à jour les votes
     4. Marque la transaction comme complétée
     5. Recalcule les pourcentages de la catégorie

3. **`handlePaymentWebhook`** (HTTP Function)
   - **Entrée:** POST avec `{ reference, status }`
   - **Sortie:** HTTP 200/404/500
   - **Processus:**
     1. Reçoit la confirmation de Mesomb
     2. Trouve la transaction par référence
     3. Met à jour les votes automatiquement
     4. Marque la transaction comme complétée

**Variables utilisées:**

```typescript
config.vote.price        // Prix par vote (défaut: 100 XAF)
config.mesomb.application_key
config.mesomb.access_key
config.mesomb.secret_key
```

#### `functions/src/mesombService.ts`

**Rôle:** Gère toute la communication avec l'API Mesomb

**Fonctions:**

1. **`getMesombClient()`**
   - Initialise le client Mesomb avec les credentials
   - Utilise les variables d'environnement Firebase

2. **`collectPayment(params)`**
   - **Entrée:** `{ amount, service, payer, nonce }`
   - **Processus:**
     - Appelle `payment.makeCollect()` de Mesomb
     - Service: 'MTN' ou 'ORANGE'
     - Pays: 'CM' (Cameroun)
     - Devise: 'XAF' (Franc CFA)
   - **Sortie:** `{ success, reference, message }`

3. **`checkPaymentStatus(reference)`**
   - **Entrée:** Référence Mesomb
   - **Processus:**
     - Appelle `payment.getTransactions([reference], 'MESOMB')`
     - Vérifie si status === 'SUCCESS' ou 'COMPLETED'
   - **Sortie:** `{ success, reference, message }`

**Pourquoi Mesomb?**

- ✅ Supporte MTN Mobile Money et Orange Money
- ✅ API simple et fiable
- ✅ Webhooks pour confirmations automatiques
- ✅ Utilisé au Cameroun

#### `functions/src/voteValidation.ts`

**Rôle:** Valide toutes les données avant traitement

**Fonctions de validation:**

1. **`validatePhoneNumber(phoneNumber)`**
   - Format: +237XXXXXXXXX
   - Longueur: 13 caractères
   - Préfixe: +237 (Cameroun)
   - Retourne: `{ valid, error, formatted }`

2. **`validateVoteCount(voteCount)`**
   - Minimum: 1 vote
   - Maximum: 100 votes
   - Type: nombre entier
   - Retourne: `{ valid, error }`

3. **`validatePaymentMethod(phoneNumber, method)`**
   - Détecte l'opérateur depuis le numéro
   - Vérifie la cohérence avec la méthode choisie
   - Retourne: `{ valid, error }`

4. **`validateCandidateExists(candidateId, admin)`**
   - Vérifie que le candidat existe dans Firebase
   - Retourne: `{ valid, error }`

5. **`detectOperator(phoneNumber)`**
   - Préfixes MTN: 67, 650-654, 680-683
   - Préfixes Orange: 69, 655-659
   - Retourne: 'MTN' | 'ORANGE' | 'UNKNOWN'

### Fichiers Frontend

#### `hooks/useVoting.ts`

**Rôle:** Hook React pour soumettre des votes depuis le frontend

**Fonctions exportées:**

1. **`submitVote(params)`**
   - Appelle la Cloud Function `submitVote`
   - Gère les états de chargement
   - Retourne le résultat avec transactionId

2. **`verifyPayment(transactionId)`**
   - Appelle la Cloud Function `verifyPayment`
   - Vérifie une seule fois le statut

3. **`pollPaymentStatus(transactionId, maxAttempts, intervalMs)`**
   - Vérifie le statut en boucle
   - Défaut: 30 tentatives × 2 secondes = 60 secondes
   - S'arrête dès confirmation ou timeout

**États retournés:**

```typescript
{
  submitVote,           // Fonction pour soumettre
  verifyPayment,        // Fonction pour vérifier
  pollPaymentStatus,    // Fonction pour polling
  isSubmitting,         // Boolean: en cours de soumission
  isVerifying,          // Boolean: en cours de vérification
  error                 // String: dernier message d'erreur
}
```

**Exemple d'utilisation:**

```typescript
const { submitVote, pollPaymentStatus, isSubmitting } = useVoting();

const handleVote = async () => {
  const result = await submitVote({
    candidateId: 'candidate-123',
    voteCount: 5,
    phoneNumber: '+237670000000',
    paymentMethod: 'mtn'
  });

  if (result.success) {
    const payment = await pollPaymentStatus(result.transactionId);
    if (payment.success) {
      alert('Vote confirmé!');
    }
  }
};
```

#### `hooks/useTransactions.ts`

**Rôle:** Monitore les transactions en temps réel pour l'admin

**Fonctions:**

1. **`useTransactions(limit)`**
   - Écoute Firebase `/transactions`
   - Limite: nombre de transactions à charger
   - Tri: par date décroissante
   - Calcule des statistiques automatiquement

**Statistiques calculées:**

```typescript
{
  totalTransactions,      // Nombre total
  completedTransactions,  // Transactions complétées
  pendingTransactions,    // En attente
  failedTransactions,     // Échouées
  totalRevenue,          // Revenu total (XAF)
  totalVotes,            // Votes totaux payés
  averageTransactionValue // Montant moyen
}
```

2. **`useRecentTransactions()`**
   - Filtre: dernières 24 heures
   - Utile pour monitoring en direct

3. **`useTransactionsByStatus(status)`**
   - Filtre par: 'pending' | 'completed' | 'failed'

#### `components/AdminDashboard.tsx`

**Rôle:** Interface d'administration

**Composants:**

1. **`AdminStats`**
   - 4 cartes de statistiques:
     - Revenu total (vert)
     - Total votes (jaune)
     - Transactions actives (bleu)
     - Montant moyen (violet)
   - Mise à jour en temps réel

2. **`TransactionsList`**
   - Tableau des transactions récentes
   - Colonnes: Date, Candidat, Opérateur, Votes, Montant, Statut
   - Filtres: Toutes / Complétées / En attente
   - Codes couleur par statut

---

## 🔧 Variables d'environnement

### Frontend (`.env.local`)

```env
# Firebase Configuration (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://projet.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=projet-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

**Pourquoi NEXT_PUBLIC_?**

- Ces variables sont accessibles côté client
- Firebase nécessite ces clés publiques
- Pas de secrets sensibles (protégés par Firebase Rules)

### Backend (Firebase Functions)

**Configuration via Firebase CLI:**

```bash
# Prix par vote (en XAF)
firebase functions:config:set vote.price="100"

# Credentials Mesomb
firebase functions:config:set mesomb.application_key="VOTRE_CLE_APPLICATION"
firebase functions:config:set mesomb.access_key="VOTRE_CLE_ACCES"
firebase functions:config:set mesomb.secret_key="VOTRE_CLE_SECRETE"
```

**Pour développement local:**

Créer `functions/.runtimeconfig.json`:

```json
{
  "mesomb": {
    "application_key": "VOTRE_CLE_APPLICATION",
    "access_key": "VOTRE_CLE_ACCES",
    "secret_key": "VOTRE_CLE_SECRETE"
  },
  "vote": {
    "price": "100"
  }
}
```

⚠️ **IMPORTANT:** Ne jamais commiter `.runtimeconfig.json` (déjà dans `.gitignore`)

**Vérifier la configuration:**

```bash
firebase functions:config:get
```

---

## 💳 Intégration Mesomb

### Étape 1: Obtenir les credentials Mesomb

1. Créer un compte sur <https://mesomb.hachther.com/>
2. Créer une application
3. Noter les 3 clés:
   - Application Key
   - Access Key
   - Secret Key

### Étape 2: Configurer Firebase Functions

```bash
cd functions
npm install  # Installe @hachther/mesomb@^2.0.1

# Configurer les clés
firebase functions:config:set \
  mesomb.application_key="VOTRE_CLE" \
  mesomb.access_key="VOTRE_CLE" \
  mesomb.secret_key="VOTRE_CLE"
```

### Étape 3: Tester localement

```bash
# Démarrer l'émulateur Firebase
cd functions
npm run serve
```

L'émulateur démarre sur `http://localhost:5001`

### Étape 4: Tester une transaction

```javascript
// Dans la console du navigateur ou Postman
const result = await fetch('http://localhost:5001/PROJET_ID/us-central1/submitVote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      candidateId: 'test-candidate',
      voteCount: 1,
      phoneNumber: '+237670000000',  // Votre numéro de test
      paymentMethod: 'mtn'
    }
  })
});

const data = await result.json();
console.log(data);
```

### Étape 5: Configurer le Webhook Mesomb

1. Aller sur le dashboard Mesomb
2. Configurer l'URL du webhook:

   ```
   https://us-central1-VOTRE_PROJET.cloudfunctions.net/handlePaymentWebhook
   ```

3. Sauvegarder

**Le webhook permet:**

- ✅ Confirmation automatique des paiements
- ✅ Pas besoin de polling constant
- ✅ Mise à jour instantanée des votes

---

## 🔄 Flux de paiement complet

### Scénario: Un utilisateur vote pour un candidat

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND: Utilisateur clique "Voter"                         │
│    - Ouvre le modal de vote                                     │
│    - Sélectionne nombre de votes: 5                             │
│    - Entre son numéro: +237670123456                            │
│    - Choisit: MTN Mobile Money                                  │
│    - Clique "Confirmer"                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. HOOK useVoting: Appelle submitVote()                         │
│    const result = await submitVote({                            │
│      candidateId: 'etienne-kampos',                             │
│      voteCount: 5,                                              │
│      phoneNumber: '+237670123456',                              │
│      paymentMethod: 'mtn'                                       │
│    })                                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CLOUD FUNCTION submitVote: Traite la requête                 │
│    ✓ Valide le numéro: +237670123456 → MTN                     │
│    ✓ Valide voteCount: 5 → OK                                  │
│    ✓ Vérifie candidat existe: etienne-kampos → OK              │
│    ✓ Calcule montant: 5 × 100 XAF = 500 XAF                    │
│    ✓ Génère transaction ID: vote_1732622400_abc123             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. MESOMB SERVICE: Initie le paiement                           │
│    await collectPayment({                                       │
│      amount: 500,                                               │
│      service: 'MTN',                                            │
│      payer: '670123456',                                        │
│      nonce: 'vote_1732622400_abc123',                          │
│      country: 'CM',                                             │
│      currency: 'XAF'                                            │
│    })                                                           │
│    → Mesomb envoie prompt de paiement au téléphone              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. FIREBASE: Crée enregistrement transaction                    │
│    /transactions/vote_1732622400_abc123: {                      │
│      id: 'vote_1732622400_abc123',                             │
│      candidateId: 'etienne-kampos',                            │
│      voteCount: 5,                                              │
│      phoneNumber: '+237670123456',                              │
│      operator: 'MTN',                                           │
│      amount: 500,                                               │
│      mesombReference: 'MESOMB_REF_XYZ',                        │
│      status: 'pending',                                         │
│      createdAt: 1732622400000                                   │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND: Reçoit la réponse                                  │
│    result = {                                                   │
│      success: true,                                             │
│      transactionId: 'vote_1732622400_abc123',                  │
│      reference: 'MESOMB_REF_XYZ',                              │
│      amount: 500,                                               │
│      message: 'Complétez le paiement sur votre téléphone'      │
│    }                                                            │
│    → Affiche message à l'utilisateur                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. UTILISATEUR: Reçoit prompt MTN sur son téléphone             │
│    "Confirmez paiement de 500 XAF pour NB Dance Awards"        │
│    → Utilisateur entre son code PIN                            │
│    → Confirme le paiement                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. FRONTEND: Démarre le polling                                 │
│    const payment = await pollPaymentStatus(                     │
│      'vote_1732622400_abc123',                                 │
│      30,    // max 30 tentatives                                │
│      2000   // toutes les 2 secondes                            │
│    )                                                            │
│    → Vérifie le statut toutes les 2 secondes                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. MESOMB: Confirme le paiement                                 │
│    → Envoie webhook à Firebase:                                 │
│    POST /handlePaymentWebhook                                   │
│    {                                                            │
│      reference: 'MESOMB_REF_XYZ',                              │
│      status: 'SUCCESS'                                          │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. CLOUD FUNCTION handlePaymentWebhook: Traite la confirmation │
│     ✓ Trouve transaction par référence Mesomb                  │
│     ✓ Vérifie status === 'SUCCESS'                             │
│     ✓ Appelle updateVotesAfterPayment()                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. FIREBASE: Met à jour les données                            │
│     A. Incrémente votes du candidat:                            │
│        /candidates/etienne-kampos/votes: 1847 → 1852           │
│                                                                 │
│     B. Recalcule les pourcentages de la catégorie              │
│                                                                 │
│     C. Crée enregistrement de vote:                             │
│        /votes/vote_1732622400_xyz789: {                        │
│          candidateId: 'etienne-kampos',                        │
│          voteCount: 5,                                          │
│          transactionId: 'vote_1732622400_abc123'               │
│        }                                                        │
│                                                                 │
│     D. Marque transaction comme complétée:                      │
│        /transactions/vote_1732622400_abc123/status: 'completed'│
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 12. FRONTEND: Polling détecte le changement                     │
│     payment = {                                                 │
│       success: true,                                            │
│       status: 'completed',                                      │
│       message: 'Paiement confirmé! Votes ajoutés.'             │
│     }                                                           │
│     → Affiche message de succès                                 │
│     → Arrête le polling                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 13. FIREBASE LISTENERS: Notifient tous les clients              │
│     → useBackendCandidates() détecte le changement              │
│     → Leaderboard se met à jour automatiquement                 │
│     → Admin dashboard affiche la nouvelle transaction           │
│     → Tous les utilisateurs voient les nouveaux votes           │
└─────────────────────────────────────────────────────────────────┘
```

**Temps total:** ~5-10 secondes du clic au vote confirmé

---

## 🧪 Tests et débogage

### 1. Tester localement avec l'émulateur Firebase

```bash
# Terminal 1: Démarrer l'émulateur Functions
cd functions
npm run serve

# Terminal 2: Démarrer Next.js
cd ..
npm run dev
```

**Vérifier:**

- ✅ Émulateur Functions: <http://localhost:5001>
- ✅ Application Next.js: <http://localhost:3000>
- ✅ Firebase Emulator UI: <http://localhost:4000>

### 2. Tester la soumission de vote

**Dans le navigateur:**

1. Ouvrir <http://localhost:3000>
2. Cliquer sur un candidat
3. Remplir le formulaire de vote
4. Soumettre

**Vérifier dans la console:**

```javascript
// Devrait afficher:
submitVote called with: {...}
Payment initiated: {...}
Transaction created: {...}
```

### 3. Tester avec un vrai numéro Mesomb

**⚠️ ATTENTION:** Ceci débitera de l'argent réel!

```javascript
const { submitVote, pollPaymentStatus } = useVoting();

const result = await submitVote({
  candidateId: 'test-candidate',
  voteCount: 1,
  phoneNumber: '+237670000000',  // VOTRE numéro
  paymentMethod: 'mtn'
});

console.log('Transaction ID:', result.transactionId);

// Attendre la confirmation
const payment = await pollPaymentStatus(result.transactionId);
console.log('Payment status:', payment);
```

### 4. Vérifier les logs Firebase

```bash
# Logs en temps réel
firebase functions:log --follow

# Logs d'une fonction spécifique
firebase functions:log --only submitVote

# Derniers logs
firebase functions:log --limit 50
```

### 5. Déboguer les erreurs courantes

#### Erreur: "Invalid phone number"

```
Cause: Format du numéro incorrect
Solution: Vérifier le format +237XXXXXXXXX
```

#### Erreur: "Payment initiation failed"

```
Cause: Credentials Mesomb invalides
Solution: 
1. Vérifier les clés: firebase functions:config:get
2. Vérifier le compte Mesomb
3. Vérifier le solde Mesomb
```

#### Erreur: "Candidate not found"

```
Cause: Le candidat n'existe pas dans Firebase
Solution: Vérifier /candidates dans Firebase Console
```

#### Erreur: "Payment verification timed out"

```
Cause: L'utilisateur n'a pas confirmé le paiement
Solution: 
1. Vérifier que l'utilisateur a reçu le prompt
2. Augmenter le timeout de polling
3. Vérifier le webhook Mesomb
```

### 6. Tester le dashboard admin

1. Ouvrir <http://localhost:3000/admin>
2. Se connecter (mot de passe admin)
3. Vérifier:
   - ✅ Statistiques affichées
   - ✅ Transactions listées
   - ✅ Mise à jour en temps réel

### 7. Tester les webhooks Mesomb

**Simuler un webhook:**

```bash
curl -X POST http://localhost:5001/PROJET_ID/us-central1/handlePaymentWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "MESOMB_REF_XYZ",
    "status": "SUCCESS"
  }'
```

### 8. Vérifier la base de données

**Firebase Console:**

1. Aller sur <https://console.firebase.google.com/>
2. Sélectionner votre projet
3. Realtime Database
4. Vérifier:
   - `/candidates` → votes mis à jour
   - `/transactions` → status = 'completed'
   - `/votes` → nouveaux enregistrements

---

## 🚀 Déploiement

### Prérequis

- [ ] Compte Firebase configuré
- [ ] Credentials Mesomb obtenus
- [ ] Variables d'environnement configurées
- [ ] Tests locaux réussis

### Étape 1: Déployer les Cloud Functions

```bash
cd functions

# Build
npm run build

# Déployer
firebase deploy --only functions

# Ou déployer une fonction spécifique
firebase deploy --only functions:submitVote
```

**Vérifier le déploiement:**

```bash
firebase functions:list
```

Vous devriez voir:

```
submitVote (https://...)
verifyPayment (https://...)
handlePaymentWebhook (https://...)
```

### Étape 2: Configurer le webhook Mesomb

1. Copier l'URL de `handlePaymentWebhook`
2. Aller sur <https://mesomb.hachther.com/>
3. Dashboard → Webhooks
4. Ajouter l'URL:

   ```
   https://us-central1-VOTRE_PROJET.cloudfunctions.net/handlePaymentWebhook
   ```

5. Sauvegarder

### Étape 3: Déployer le frontend sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel deploy --prod
```

**Configurer les variables d'environnement sur Vercel:**

1. Aller sur vercel.com
2. Projet → Settings → Environment Variables
3. Ajouter toutes les variables `NEXT_PUBLIC_FIREBASE_*`

### Étape 4: Tester en production

1. Ouvrir votre site déployé
2. Faire un vote de test (petit montant!)
3. Vérifier:
   - ✅ Paiement initié
   - ✅ Prompt reçu sur téléphone
   - ✅ Paiement confirmé
   - ✅ Votes mis à jour
   - ✅ Dashboard admin actualisé

### Étape 5: Monitoring

**Firebase Console:**

- Functions → Logs
- Realtime Database → Usage
- Analytics → Events

**Vercel:**

- Analytics → Performance
- Logs → Function logs

---

## 📞 Support et ressources

### Documentation

- **Firebase Functions:** <https://firebase.google.com/docs/functions>
- **Mesomb API:** <https://mesomb.hachther.com/en/api/schema/>
- **Next.js:** <https://nextjs.org/docs>

### Fichiers de documentation du projet

- `FIREBASE_DEPLOYMENT_GUIDE.md` - Guide de déploiement détaillé
- `FIREBASE_FUNCTIONS_CONFIG.md` - Configuration des variables
- `VOTING_INTEGRATION_GUIDE.md` - Intégration frontend
- `README_BACKEND.md` - Documentation backend complète

### En cas de problème

1. Vérifier les logs: `firebase functions:log`
2. Vérifier la configuration: `firebase functions:config:get`
3. Tester localement avec l'émulateur
4. Vérifier le dashboard Mesomb
5. Consulter la documentation

---

**Dernière mise à jour:** 26 novembre 2025  
**Version:** 1.0.0  
**Statut:** ✅ Prêt pour production
