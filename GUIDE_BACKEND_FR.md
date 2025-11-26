# Guide Backend - Système de Vote NB Dance Awards

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du système](#architecture-du-système)
3. [Flux de vote complet](#flux-de-vote-complet)
4. [Fonctions Cloud Firebase](#fonctions-cloud-firebase)
5. [Intégration des paiements Mesomb](#intégration-des-paiements-mesomb)
6. [Gestion des erreurs](#gestion-des-erreurs)
7. [Base de données](#base-de-données)
8. [Configuration](#configuration)
9. [Surveillance et monitoring](#surveillance-et-monitoring)
10. [Dépannage](#dépannage)

---

## Vue d'ensemble

Le système de vote NB Dance Awards est une application web sécurisée qui permet aux utilisateurs de voter pour leurs danseurs préférés via des paiements mobiles (MTN Mobile Money et Orange Money).

### Caractéristiques principales

- ✅ **Paiements sécurisés** via Mesomb (MTN et Orange Money)
- ✅ **Vérification automatique** des paiements avec polling
- ✅ **Mise à jour en temps réel** des votes et classements
- ✅ **Gestion complète des erreurs** avec messages clairs
- ✅ **Transactions traçables** avec IDs uniques
- ✅ **Interface responsive** (mobile, tablette, desktop)

---

## Architecture du système

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│                 │
│  - useVoting    │
│  - UI Modal     │
└────────┬────────┘
         │
         │ HTTPS Callable
         │
┌────────▼────────────────────────────────┐
│   Firebase Cloud Functions              │
│                                          │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ submitVote   │  │ verifyPayment   │ │
│  └──────┬───────┘  └────────┬────────┘ │
│         │                   │          │
│         │                   │          │
└─────────┼───────────────────┼──────────┘
          │                   │
          │                   │
    ┌─────▼─────┐      ┌──────▼──────┐
    │  Mesomb   │      │  Firebase   │
    │  Payment  │      │  Realtime   │
    │  API      │      │  Database   │
    └───────────┘      └─────────────┘
```

---

## Flux de vote complet

### Étape par étape

#### 1️⃣ **Sélection du candidat**

```
Utilisateur → Clique sur un candidat
           → Modal de vote s'ouvre
           → Sélectionne le nombre de votes
           → Choisit le mode de paiement (MTN/Orange)
           → Entre son numéro de téléphone
```

#### 2️⃣ **Soumission du vote**

```javascript
// Frontend appelle submitVote
const result = await submitVote({
  candidateId: "candidate_123",
  voteCount: 5,
  phoneNumber: "677123456",
  paymentMethod: "mtn-momo-cameroon"
});
```

#### 3️⃣ **Traitement backend**

```
Cloud Function submitVote:
  1. Valide le numéro de téléphone
  2. Valide le nombre de votes
  3. Valide la méthode de paiement
  4. Vérifie l'existence du candidat
  5. Calcule le montant total (votes × 105 XAF)
  6. Génère un ID de transaction unique
  7. Initie le paiement avec Mesomb
  8. Crée un enregistrement de transaction
  9. Retourne le transactionId au frontend
```

#### 4️⃣ **Vérification du paiement (Polling)**

```javascript
// Frontend démarre le polling automatique
const paymentResult = await pollPaymentStatus(transactionId);

// Polling toutes les 2 secondes pendant 60 secondes max
for (let i = 0; i < 30; i++) {
  const status = await verifyPayment(transactionId);
  if (status === 'completed') break;
  await sleep(2000);
}
```

#### 5️⃣ **Confirmation et mise à jour**

```
Cloud Function verifyPayment:
  1. Récupère la transaction depuis la base de données
  2. Vérifie le statut avec Mesomb
  3. Si paiement confirmé:
     - Incrémente les votes du candidat
     - Recalcule les pourcentages de la catégorie
     - Crée un enregistrement de vote
     - Met à jour le statut de la transaction
  4. Retourne le résultat au frontend
```

#### 6️⃣ **Affichage du résultat**

```
Frontend:
  - Affiche "Payment Confirmed!" (vert)
  - Ferme automatiquement le modal après 2s
  - Met à jour l'affichage des votes en temps réel
```

---

## Fonctions Cloud Firebase

### 📌 submitVote

**Type:** HTTPS Callable Function  
**Fichier:** `functions/src/index.ts` (lignes 24-106)

#### Paramètres d'entrée

```typescript
{
  candidateId: string;    // ID du candidat
  voteCount: number;      // Nombre de votes (min: 1)
  phoneNumber: string;    // Numéro CM (ex: "677123456")
  paymentMethod: string;  // "mtn-momo-cameroon" ou "orange-money-cameroon"
}
```

#### Validations effectuées

1. **Numéro de téléphone:**
   - Format camerounais (9 chiffres)
   - Commence par 6
   - Préfixe opérateur valide (MTN: 67/65/68, Orange: 69/65)

2. **Nombre de votes:**
   - Doit être ≥ 1
   - Doit être un nombre entier

3. **Méthode de paiement:**
   - Doit correspondre à l'opérateur du numéro
   - MTN ou Orange uniquement

4. **Candidat:**
   - Doit exister dans la base de données

#### Réponse en cas de succès

```typescript
{
  success: true,
  transactionId: "vote_1732637159000_abc123def",
  reference: "mesomb_ref_xyz789",
  amount: 525,  // 5 votes × 105 XAF
  message: "Payment initiated. Please complete payment on your phone."
}
```

#### Réponse en cas d'erreur

```typescript
{
  success: false,
  error: "Message d'erreur descriptif"
}
```

---

### 📌 verifyPayment

**Type:** HTTPS Callable Function  
**Fichier:** `functions/src/index.ts` (lignes 112-170)

#### Paramètres d'entrée

```typescript
{
  transactionId: string;  // ID de transaction retourné par submitVote
}
```

#### Processus de vérification

1. **Récupération de la transaction**

   ```typescript
   const transaction = await admin.database()
     .ref(`transactions/${transactionId}`)
     .once('value');
   ```

2. **Vérification avec Mesomb**

   ```typescript
   const paymentStatus = await checkPaymentStatus(
     transaction.mesombReference
   );
   ```

3. **Mise à jour si confirmé**
   - Incrémente les votes du candidat (atomique)
   - Recalcule les pourcentages de la catégorie
   - Crée un enregistrement de vote
   - Met à jour le statut de la transaction

#### Réponse

```typescript
// Paiement confirmé
{
  success: true,
  status: 'completed',
  message: "Payment confirmed! Votes have been added."
}

// Paiement en attente
{
  success: false,
  status: 'pending',
  message: "Payment is still pending. Please complete payment on your phone."
}

// Erreur
{
  success: false,
  error: "Message d'erreur"
}
```

---

### 📌 handlePaymentWebhook

**Type:** HTTP Function  
**Fichier:** `functions/src/index.ts` (lignes 176-225)

#### Description

Reçoit les notifications de paiement de Mesomb pour confirmer automatiquement les transactions.

#### Endpoint

```
POST https://us-central1-[PROJECT_ID].cloudfunctions.net/handlePaymentWebhook
```

#### Corps de la requête (de Mesomb)

```json
{
  "reference": "mesomb_ref_xyz789",
  "status": "SUCCESS"
}
```

#### Processus

1. Trouve la transaction par référence Mesomb
2. Vérifie que le statut est "SUCCESS"
3. Met à jour les votes si la transaction est en attente
4. Retourne 200 OK

---

## Intégration des paiements Mesomb

### Configuration

Les identifiants Mesomb sont stockés dans Firebase Config:

```bash
# Définir la configuration
firebase functions:config:set \
  mesomb.application_key="VOTRE_CLE_APPLICATION" \
  mesomb.access_key="VOTRE_CLE_ACCES" \
  mesomb.secret_key="VOTRE_CLE_SECRETE"

# Définir le prix du vote
firebase functions:config:set vote.price="105"
```

### Service Mesomb

**Fichier:** `functions/src/mesombService.ts`

#### collectPayment

```typescript
async function collectPayment({
  amount: number,
  service: 'MTN' | 'ORANGE',
  payer: string,  // Numéro sans +237
  nonce: string   // Transaction ID unique
}): Promise<{
  success: boolean,
  reference?: string,
  error?: string
}>
```

#### checkPaymentStatus

```typescript
async function checkPaymentStatus(
  reference: string
): Promise<{
  success: boolean,
  status?: 'pending' | 'completed' | 'failed',
  error?: string
}>
```

### Codes d'erreur Mesomb

| Code | Signification | Action |
|------|---------------|--------|
| `INSUFFICIENT_BALANCE` | Solde insuffisant | Demander à l'utilisateur de recharger |
| `INVALID_PHONE` | Numéro invalide | Vérifier le format du numéro |
| `TRANSACTION_FAILED` | Échec de transaction | Réessayer |
| `TIMEOUT` | Délai dépassé | Vérifier manuellement |

---

## Gestion des erreurs

### Niveaux de gestion

#### 1. **Frontend (useVoting hook)**

```typescript
// Validation basique
if (!phoneNumber || phoneNumber.length < 9) {
  // Bouton désactivé
}

// Gestion des erreurs réseau
try {
  const result = await submitVote(params);
} catch (error) {
  setError(error.message);
  setPaymentStatus('failed');
}
```

#### 2. **Backend (Cloud Functions)**

```typescript
// Validation approfondie
const phoneValidation = validatePhoneNumber(phoneNumber);
if (!phoneValidation.valid) {
  return { success: false, error: phoneValidation.error };
}

// Try-catch global
try {
  // Logique de traitement
} catch (error) {
  console.error('Submit vote error:', error);
  return {
    success: false,
    error: error.message || 'An error occurred'
  };
}
```

#### 3. **Mesomb (Service externe)**

```typescript
// Gestion des erreurs API
if (!paymentResult.success) {
  return {
    success: false,
    error: paymentResult.error || 'Payment initiation failed'
  };
}
```

### Messages d'erreur utilisateur

| Erreur | Message FR | Message EN |
|--------|-----------|-----------|
| Numéro invalide | "Numéro de téléphone invalide" | "Invalid phone number" |
| Solde insuffisant | "Solde insuffisant. Veuillez recharger." | "Insufficient balance" |
| Paiement échoué | "Le paiement a échoué. Réessayez." | "Payment failed" |
| Timeout | "Délai dépassé. Vérifiez plus tard." | "Payment verification timed out" |
| Candidat introuvable | "Candidat non trouvé" | "Candidate not found" |

---

## Base de données

### Structure Firebase Realtime Database

```json
{
  "candidates": {
    "candidate_123": {
      "id": "candidate_123",
      "name": "Nom du danseur",
      "image": "/dancers/photo.jpg",
      "votes": 1250,
      "percentage": 45,
      "badge": 1
    }
  },
  
  "categories": {
    "category_456": {
      "id": "category_456",
      "name": "Meilleur artiste danseur",
      "description": "..."
    }
  },
  
  "candidateCategories": {
    "link_789": {
      "candidateId": "candidate_123",
      "categoryId": "category_456"
    }
  },
  
  "transactions": {
    "vote_1732637159000_abc123def": {
      "id": "vote_1732637159000_abc123def",
      "candidateId": "candidate_123",
      "voteCount": 5,
      "phoneNumber": "677123456",
      "paymentMethod": "mtn-momo-cameroon",
      "operator": "MTN",
      "amount": 525,
      "mesombReference": "mesomb_ref_xyz789",
      "status": "completed",
      "createdAt": 1732637159000,
      "completedAt": 1732637165000
    }
  },
  
  "votes": {
    "vote_1732637165000_def456ghi": {
      "id": "vote_1732637165000_def456ghi",
      "candidateId": "candidate_123",
      "voteCount": 5,
      "transactionId": "vote_1732637159000_abc123def",
      "createdAt": 1732637165000
    }
  }
}
```

### Règles de sécurité

```json
{
  "rules": {
    "candidates": {
      ".read": true,
      ".write": false
    },
    "categories": {
      ".read": true,
      ".write": false
    },
    "transactions": {
      ".read": false,
      ".write": false
    },
    "votes": {
      ".read": false,
      ".write": false
    }
  }
}
```

---

## Configuration

### Variables d'environnement

#### Firebase Functions Config

```bash
# Mesomb
firebase functions:config:set \
  mesomb.application_key="VOTRE_CLE" \
  mesomb.access_key="VOTRE_CLE" \
  mesomb.secret_key="VOTRE_CLE"

# Prix du vote
firebase functions:config:set vote.price="105"

# Voir la configuration
firebase functions:config:get
```

#### Fichier .runtimeconfig.json (local)

```json
{
  "mesomb": {
    "application_key": "VOTRE_CLE_APPLICATION",
    "access_key": "VOTRE_CLE_ACCES",
    "secret_key": "VOTRE_CLE_SECRETE"
  },
  "vote": {
    "price": "105"
  }
}
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=votre_database_url
```

---

## Surveillance et monitoring

### Logs Firebase

#### Voir les logs en temps réel

```bash
firebase functions:log --only submitVote,verifyPayment
```

#### Filtrer par erreurs

```bash
firebase functions:log --only submitVote --severity ERROR
```

### Métriques importantes

#### 1. **Taux de succès des paiements**

```
Paiements réussis / Total paiements initiés × 100
```

#### 2. **Temps moyen de confirmation**

```
Temps entre submitVote et verifyPayment (succès)
```

#### 3. **Taux de timeout**

```
Paiements timeout / Total paiements × 100
```

### Dashboard Firebase Console

1. **Functions → Logs**
   - Voir tous les appels de fonctions
   - Filtrer par erreurs
   - Analyser les performances

2. **Database → Data**
   - Surveiller les transactions
   - Vérifier les votes
   - Contrôler les candidats

3. **Functions → Usage**
   - Invocations par fonction
   - Temps d'exécution
   - Erreurs

---

## Dépannage

### Problèmes courants

#### ❌ "Payment initiation failed"

**Causes possibles:**

- Clés Mesomb invalides
- Problème de connexion à l'API Mesomb
- Numéro de téléphone invalide

**Solution:**

```bash
# Vérifier la configuration
firebase functions:config:get mesomb

# Tester la connexion Mesomb
# Vérifier les logs
firebase functions:log --only submitVote
```

#### ❌ "Payment verification timed out"

**Causes possibles:**

- Utilisateur n'a pas complété le paiement
- Problème réseau
- Mesomb ne répond pas

**Solution:**

1. Vérifier manuellement le statut dans Mesomb
2. Utiliser le transactionId pour retrouver la transaction
3. Vérifier le statut avec `verifyPayment`

#### ❌ "Candidate not found"

**Causes possibles:**

- ID de candidat incorrect
- Candidat supprimé de la base de données

**Solution:**

```bash
# Vérifier dans Firebase Console
# Database → candidates → [candidateId]
```

#### ❌ Votes non mis à jour

**Causes possibles:**

- Transaction bloquée en "pending"
- Erreur dans `updateVotesAfterPayment`

**Solution:**

```bash
# Vérifier les logs
firebase functions:log --only verifyPayment

# Vérifier la transaction
# Database → transactions → [transactionId]
```

### Commandes utiles

```bash
# Déployer uniquement les fonctions
firebase deploy --only functions

# Déployer une fonction spécifique
firebase deploy --only functions:submitVote

# Voir les logs en direct
firebase functions:log --follow

# Tester localement avec émulateurs
firebase emulators:start

# Vérifier la configuration
firebase functions:config:get
```

---

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais exposer les clés Mesomb** dans le frontend
2. **Valider toutes les entrées** côté backend
3. **Utiliser des transactions atomiques** pour les votes
4. **Logger toutes les transactions** pour audit
5. **Limiter les tentatives** de paiement par IP/utilisateur

### Règles de sécurité Firebase

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "candidates": {
      ".read": true
    },
    "categories": {
      ".read": true
    }
  }
}
```

---

## 📞 Support

### Contacts

- **Support technique:** <support@nbdanceawards.com>
- **Mesomb support:** <support@mesomb.com>
- **Firebase support:** <https://firebase.google.com/support>

### Ressources

- [Documentation Mesomb](https://mesomb.hachther.com/docs)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)

---

**Version:** 1.0  
**Dernière mise à jour:** 26 novembre 2025  
**Auteur:** NB Dance Awards Team
