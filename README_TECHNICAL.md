# NB Dance Award - Documentation Technique Complète

## Table des Matières

1. [Vue d'ensemble du projet](#vue-densemble)
2. [Architecture Backend](#architecture-backend)
3. [Intégration Mesomb - Analyse Détaillée](#intégration-mesomb)
4. [Analyse de l'Erreur Persistante](#analyse-erreur)
5. [Recommandations d'Expert](#recommandations)

---

### Description

Application de vote en ligne pour le NB Dance Award permettant aux utilisateurs de voter pour leurs candidats préférés via paiement mobile (MTN Mobile Money et Orange Money Cameroun).

### Stack Technique

- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **Backend**: Next.js API Routes (Serverless)
- **Base de données**: Firebase Realtime Database
- **Paiement**: Mesomb API (MTN & Orange Money)
- **Déploiement**: Vercel
- **Runtime**: Node.js (pour les API routes)

### Structure du Projet

```
NBDanceAward/
├── app/
│   ├── api/
│   │   ├── vote/
│   │   │   ├── submit/route.ts    # Soumission de vote
│   │   │   └── verify/route.ts    # Vérification paiement
│   │   ├── admin/
│   │   │   └── withdraw/route.ts  # Retrait admin
│   │   └── lib/
│   │       ├── mesomb.ts          # Service Mesomb
│   │       └── validation.ts      # Validations
│   ├── page.tsx                   # Page d'accueil
│   ├── candidats/page.tsx         # Page candidats
│   └── admin/page.tsx             # Dashboard admin
├── components/
│   ├── AdminDashboard.tsx         # Composants admin
│   └── AdminWithdrawal.tsx        # Formulaire retrait
├── hooks/
│   ├── useVoting.ts               # Hook de vote
│   └── useTransactions.ts         # Hook transactions
├── lib/
│   ├── firebase.ts                # Configuration Firebase
│   └── security.ts                # Sécurité
└── .env.local                     # Variables d'environnement
```

---

## 2. Architecture Backend {#architecture-backend}

### 2.1 Firebase Realtime Database

#### Structure de Données

```json
{
  "candidates": {
    "candidate_id_1": {
      "id": "candidate_id_1",
      "name": "Nom du Candidat",
      "category": "Catégorie",
      "image": "/images/candidate.jpg",
      "votes": 0,
      "percentage": 0
    }
  },
  "categories": {
    "category_id_1": {
      "id": "category_id_1",
      "name": "Nom de la Catégorie",
      "description": "Description"
    }
  },
  "candidateCategories": {
    "link_id_1": {
      "candidateId": "candidate_id_1",
      "categoryId": "category_id_1"
    }
  },
  "transactions": {
    "vote_timestamp_random": {
      "id": "vote_timestamp_random",
      "candidateId": "candidate_id_1",
      "voteCount": 5,
      "phoneNumber": "650123456",
      "paymentMethod": "mobile",
      "operator": "MTN",
      "amount": 525,
      "mesombReference": "ref_from_mesomb",
      "status": "pending|completed|failed",
      "createdAt": "timestamp",
      "completedAt": "timestamp"
    }
  },
  "votes": {
    "vote_id_1": {
      "id": "vote_id_1",
      "candidateId": "candidate_id_1",
      "voteCount": 5,
      "transactionId": "vote_timestamp_random",
      "createdAt": "timestamp"
    }
  },
  "withdrawals": {
    "withdrawal_id_1": {
      "id": "withdrawal_id_1",
      "phoneNumber": "650123456",
      "operator": "MTN",
      "amount": 10000,
      "mesombReference": "ref_from_mesomb",
      "status": "completed",
      "createdAt": "timestamp"
    }
  }
}
```

#### Règles de Sécurité Firebase

```json
{
  "rules": {
    "candidates": {
      ".read": true,
      ".write": false
    },
    "transactions": {
      ".read": false,
      ".write": true
    },
    "votes": {
      ".read": false,
      ".write": true
    }
  }
}
```

### 2.2 API Routes (Next.js)

#### `/api/vote/submit` - Soumission de Vote

**Méthode**: POST  
**Runtime**: Node.js  
**Fonction**: Initier un paiement et créer une transaction

**Flux d'exécution**:

```
1. Réception de la requête
   ├─ candidateId: string
   ├─ voteCount: number (1-100)
   ├─ phoneNumber: string (format: 6XXXXXXXX)
   └─ paymentMethod: string ('mobile')

2. Validations
   ├─ validatePhoneNumber()
   │  └─ Vérifie format camerounais (6XX XXX XXX)
   ├─ validateVoteCount()
   │  └─ Vérifie 1 ≤ voteCount ≤ 100
   ├─ validatePaymentMethod()
   │  └─ Vérifie MTN ou Orange
   └─ validateCandidateExists()
      └─ Vérifie existence dans Firebase

3. Calcul du montant
   ├─ votePrice = 105 XAF (NEXT_PUBLIC_VOTE_PRICE)
   └─ totalAmount = voteCount × 105

4. Détection de l'opérateur
   ├─ detectOperator(phoneNumber)
   │  ├─ MTN: 650-659, 670-679, 680-689
   │  └─ Orange: 690-699, 655-656
   └─ mesombService = 'MTN' | 'ORANGE'

5. Génération transaction ID
   └─ `vote_${timestamp}_${random}`

6. Appel Mesomb API
   ├─ collectPayment({
   │    amount: totalAmount,
   │    service: mesombService,
   │    payer: phoneNumber,
   │    nonce: transactionId
   │  })
   └─ Retourne: { success, reference, message, error }

7. Enregistrement dans Firebase
   └─ transactions/${transactionId}
      ├─ status: 'pending'
      ├─ mesombReference
      └─ createdAt: serverTimestamp()

8. Réponse au client
   └─ { success, transactionId, reference, amount, message }
```

**Variables d'environnement utilisées**:

- `NEXT_PUBLIC_VOTE_PRICE`: Prix par vote (105)
- `MESOMB_APPLICATION_KEY`: Clé application Mesomb
- `MESOMB_ACCESS_KEY`: Clé d'accès Mesomb
- `MESOMB_SECRET_KEY`: Clé secrète Mesomb

#### `/api/vote/verify` - Vérification du Paiement

**Méthode**: POST  
**Runtime**: Node.js  
**Fonction**: Vérifier le statut du paiement et ajouter les votes

**Flux d'exécution**:

```
1. Réception transactionId

2. Récupération transaction Firebase
   └─ transactions/${transactionId}

3. Vérification statut
   ├─ Si 'completed' → Retour immédiat
   └─ Sinon → Vérifier avec Mesomb

4. Appel Mesomb API
   ├─ checkPaymentStatus(mesombReference)
   └─ Vérifie transaction.status === 'SUCCESS'

5. Si paiement confirmé
   ├─ updateVotesAfterPayment()
   │  ├─ Incrémenter votes candidat (runTransaction)
   │  ├─ Recalculer pourcentages catégorie
   │  └─ Créer enregistrement vote
   └─ Mettre à jour transaction
      ├─ status: 'completed'
      └─ completedAt: serverTimestamp()

6. Réponse
   └─ { success, status, message }
```

**Fonction `updateVotesAfterPayment()`**:

```typescript
async function updateVotesAfterPayment(transaction: any) {
    // 1. Incrémenter votes atomiquement
    const candidateVotesRef = ref(database, `candidates/${candidateId}/votes`);
    await runTransaction(candidateVotesRef, (currentVotes) => {
        return (currentVotes || 0) + voteCount;
    });

    // 2. Recalculer pourcentages
    await recalculateCategoryPercentages(candidateId);

    // 3. Enregistrer vote
    const voteRef = ref(database, `votes/${voteId}`);
    await set(voteRef, { ... });
}
```

**Fonction `recalculateCategoryPercentages()`**:

```typescript
async function recalculateCategoryPercentages(candidateId: string) {
    // 1. Trouver catégorie du candidat
    // 2. Récupérer tous candidats de la catégorie
    // 3. Calculer total votes
    // 4. Mettre à jour pourcentage de chaque candidat
    //    percentage = (votes / totalVotes) × 100
}
```

#### `/api/admin/withdraw` - Retrait Admin

**Méthode**: POST  
**Runtime**: Node.js  
**Fonction**: Transférer des fonds vers Mobile Money

**Flux d'exécution**:

```
1. Authentification
   └─ Vérifier adminPassword === ADMIN_WITHDRAWAL_PASSWORD

2. Validations
   ├─ validatePhoneNumber()
   └─ 100 ≤ amount ≤ 1,000,000

3. Détection opérateur
   └─ detectOperator(phoneNumber)

4. Appel Mesomb API
   └─ makeWithdrawal({
        amount,
        service,
        receiver: phoneNumber,
        nonce: transactionId
      })

5. Enregistrement Firebase
   └─ withdrawals/${transactionId}

6. Réponse
   └─ { success, reference, amount, message }
```

---

## 3. Intégration Mesomb - Analyse Détaillée {#intégration-mesomb}

### 3.1 SDK Mesomb (@hachther/mesomb v2.0.1)

#### Installation

```bash
npm install @hachther/mesomb@^2.0.1
```

#### Configuration Initiale

```typescript
import { PaymentOperation } from '@hachther/mesomb';

const payment = new PaymentOperation({
    applicationKey: process.env.MESOMB_APPLICATION_KEY,
    accessKey: process.env.MESOMB_ACCESS_KEY,
    secretKey: process.env.MESOMB_SECRET_KEY,
});
```

### 3.2 Méthodes Utilisées

#### `makeCollect()` - Collecte de Paiement

```typescript
const response = await payment.makeCollect({
    amount: 525,              // Montant en XAF
    service: 'MTN',           // 'MTN' ou 'ORANGE'
    payer: '650123456',       // Numéro sans +237
    nonce: 'unique_id',       // ID unique transaction
    country: 'CM',            // Cameroun
    currency: 'XAF',          // Franc CFA
    customer: {
        email: 'vote@nbdanceaward.com',
        firstName: 'Voter',
        lastName: 'NBDance',
        town: 'Douala',
        region: 'Littoral',
        country: 'CM',
        address: 'Cameroon'
    },
    location: {
        town: 'Douala',
        region: 'Littoral',
        country: 'CM'
    },
    products: [{
        name: 'Vote NBDance Award',
        category: 'Voting',
        quantity: 5,
        amount: 525
    }]
});
```

**Réponse attendue**:

```typescript
{
    success: boolean,
    status: string,
    message: string,
    reference: string,
    transaction: {
        pk: string,
        status: 'SUCCESS' | 'PENDING' | 'FAILED',
        amount: number,
        fees: number,
        ...
    }
}
```

**Méthodes de validation**:

- `response.isOperationSuccess()`: Vérifie si l'opération API a réussi
- `response.isTransactionSuccess()`: Vérifie si la transaction de paiement a réussi

#### `getTransactions()` - Vérification Statut

```typescript
const transactions = await payment.getTransactions(
    ['reference_id'],  // Array de références
    'MESOMB'          // Source type
);

const transaction = transactions[0];
const isSuccess = transaction.status === 'SUCCESS';
```

#### `makeDeposit()` - Retrait/Dépôt

```typescript
const response = await payment.makeDeposit({
    amount: 10000,
    service: 'MTN',
    receiver: '650123456',
    nonce: 'unique_id',
    country: 'CM',
    currency: 'XAF',
    customer: { ... },
    location: { ... },
    products: [ ... ]
});
```

### 3.3 Tentatives d'Implémentation

#### Tentative 1: SDK Standard

**Code**:

```typescript
import { PaymentOperation } from '@hachther/mesomb';

export function getMesombClient() {
    return new PaymentOperation({
        applicationKey: process.env.MESOMB_APPLICATION_KEY,
        accessKey: process.env.MESOMB_ACCESS_KEY,
        secretKey: process.env.MESOMB_SECRET_KEY,
    });
}
```

**Résultat**: ❌ Erreur header invalide

#### Tentative 2: Patch Headers.append

**Code**:

```typescript
const originalAppend = Headers.prototype.append;
Headers.prototype.append = function(name: string, value: string) {
    if (name.toLowerCase() === 'authorization' && value.includes('HMAC-SHA1')) {
        value = value.replace(/\s+/g, ' ').trim();
    }
    return originalAppend.call(this, name, value);
};
```

**Résultat**: ❌ Patch côté client uniquement, erreur persiste côté serveur

#### Tentative 3: Node.js Runtime

**Code**:

```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

**Résultat**: ❌ Erreur persiste même avec Node.js runtime

#### Tentative 4: API Directe

**Code**:

```typescript
const signature = crypto
    .createHmac('sha1', secretKey)
    .update(canonicalRequest)
    .digest('hex');

const headers = {
    'X-MeSomb-Application': applicationKey,
    'X-MeSomb-Signature': signature,
    ...
};
```

**Résultat**: ❌ "No signature provided" - Format de signature incorrect

#### Tentative 5: Wrapper Fetch Global

**Code**:

```typescript
const originalFetch = global.fetch;
global.fetch = function(input, init) {
    if (init?.headers) {
        // Modifier headers avant envoi
        const headers = new Headers(init.headers);
        headers.delete('authorization');
        headers.set('X-MeSomb-Credential', credMatch[1]);
        headers.set('X-MeSomb-Signature', sigMatch[2]);
        init.headers = headers;
    }
    return originalFetch(input, init);
};
```

**Résultat**: ❌ Erreur header invalide persiste

---

## 4. Analyse de l'Erreur Persistante {#analyse-erreur}

### 4.1 Message d'Erreur Exact

```
Headers.append: "HMAC-SHA1 Credential=f6c26b42-24de-4ec6-8b1b-7a808052e335 /20251028/payment/mesomb_request, SignedHeaders=content-type;host;x-mesomb-date;x-mesomb-nonce, Signature=88b8904e1c84e34ccafce0f1ba773fd1bf265a8f" is an invalid header value
```

### 4.2 Analyse Technique Approfondie

#### Origine de l'Erreur

L'erreur provient de la **validation stricte des headers HTTP** dans l'environnement serverless de Vercel.

**Spécification HTTP/1.1 (RFC 7230)**:

```
header-field   = field-name ":" OWS field-value OWS
field-value    = *( field-content / obs-fold )
field-content  = field-vchar [ 1*( SP / HTAB ) field-vchar ]
field-vchar    = VCHAR / obs-text
```

**Caractères invalides détectés**:

1. **Espace après "HMAC-SHA1"**: `"HMAC-SHA1 Credential=..."`
2. **Slash dans la valeur**: `/20251028/payment/mesomb_request`
3. **Virgules sans quotes**: `SignedHeaders=..., Signature=...`

#### Pourquoi le SDK Génère ce Header

Le SDK Mesomb utilise un format d'authentification **AWS Signature Version 4-like**:

```
Authorization: HMAC-SHA1 Credential=ACCESS_KEY /DATE/SERVICE/REQUEST_TYPE, 
               SignedHeaders=HEADERS, 
               Signature=SIGNATURE_HEX
```

Ce format est **valide pour AWS** mais **invalide pour les standards HTTP stricts** appliqués par Vercel.

#### Validation Vercel vs AWS

**Vercel (strict)**:

- Utilise Node.js `http` module avec validation stricte
- Rejette les headers avec espaces/slashes non-encodés
- Applique RFC 7230 à la lettre

**AWS (permissif)**:

- Accepte ce format car c'est leur propre standard
- Parsing personnalisé des headers
- Pas de validation stricte RFC

### 4.3 Pourquoi Toutes les Tentatives Ont Échoué

#### Tentative 1-2: Patches côté client

**Problème**: L'erreur se produit côté serveur (API route), pas côté client

#### Tentative 3: Node.js runtime

**Problème**: Node.js applique aussi la validation stricte des headers

#### Tentative 4: API directe

**Problème**: Format de signature Mesomb non documenté publiquement, impossible à reproduire exactement

#### Tentative 5: Wrapper fetch

**Problème**: Le SDK génère le header avant que le wrapper puisse l'intercepter

### 4.4 Cause Racine

**Le SDK @hachther/mesomb v2.0.1 est incompatible avec les environnements serverless stricts (Vercel, Cloudflare Workers, etc.)**

Raisons:

1. Utilise un format d'authentification non-standard
2. Génère des headers HTTP invalides selon RFC 7230
3. Conçu pour des environnements Node.js traditionnels (Express, etc.)
4. Pas testé/optimisé pour serverless

---

## 5. Recommandations d'Expert {#recommandations}

### 5.1 Solutions Possibles

#### Option A: Utiliser un Proxy Backend ⭐ RECOMMANDÉ

**Architecture**:

```
Frontend (Vercel)
    ↓
Backend Proxy (VPS/Heroku/Railway)
    ↓
Mesomb API
```

**Avantages**:

- SDK Mesomb fonctionne dans environnement Node.js standard
- Contrôle total sur les headers
- Sécurité accrue (credentials côté serveur)

**Implémentation**:

```typescript
// Backend Proxy (Express.js sur VPS)
app.post('/api/mesomb/collect', async (req, res) => {
    const payment = new PaymentOperation({ ... });
    const result = await payment.makeCollect(req.body);
    res.json(result);
});

// Frontend Vercel
const response = await fetch('https://your-proxy.com/api/mesomb/collect', {
    method: 'POST',
    body: JSON.stringify(paymentData)
});
```

**Coût**: ~$5-10/mois (VPS basique)

#### Option B: Firebase Cloud Functions ⭐⭐ RECOMMANDÉ

**Architecture**:

```
Frontend (Vercel)
    ↓
Firebase Cloud Functions
    ↓
Mesomb API
```

**Avantages**:

- Environnement Node.js standard
- Intégration native avec Firebase
- Gratuit jusqu'à 2M invocations/mois

**Implémentation**:

```typescript
// functions/src/index.ts
export const collectPayment = functions.https.onCall(async (data, context) => {
    const payment = new PaymentOperation({ ... });
    return await payment.makeCollect(data);
});

// Frontend
const collectPayment = httpsCallable(functions, 'collectPayment');
const result = await collectPayment(paymentData);
```

#### Option C: Contacter Support Mesomb

**Demander**:

1. Version SDK compatible serverless
2. Documentation API REST complète
3. Format d'authentification alternatif

**Contact**: <support@mesomb.com>

#### Option D: Alternative de Paiement

**Providers compatibles Cameroun**:

1. **CinetPay**: API REST moderne, compatible serverless
2. **PayDunya**: Support MTN/Orange Cameroun
3. **Flutterwave**: Large couverture Afrique

### 5.2 Solution Immédiate Recommandée

**Utiliser Firebase Cloud Functions** (déjà configuré dans le projet)

**Étapes**:

1. **Déplacer logique Mesomb vers Cloud Functions**

```bash
cd functions
npm install @hachther/mesomb
```

2. **Créer fonctions**

```typescript
// functions/src/index.ts
import { PaymentOperation } from '@hachther/mesomb';

export const mesombCollect = functions.https.onCall(async (data) => {
    const payment = new PaymentOperation({
        applicationKey: functions.config().mesomb.app_key,
        accessKey: functions.config().mesomb.access_key,
        secretKey: functions.config().mesomb.secret_key,
    });
    
    return await payment.makeCollect(data);
});

export const mesombVerify = functions.https.onCall(async (data) => {
    const payment = new PaymentOperation({ ... });
    return await payment.getTransactions([data.reference], 'MESOMB');
});
```

3. **Configurer secrets**

```bash
firebase functions:config:set \
  mesomb.app_key="a4120748a7093365013b04a8f42bdd24f299936b" \
  mesomb.access_key="f6c26b42-24de-4ec6-8b1b-7a808052e335" \
  mesomb.secret_key="e45b1545-1b5a-49c4-aadf-ba4cf700a8dc"
```

4. **Déployer**

```bash
firebase deploy --only functions
```

5. **Modifier API routes Vercel**

```typescript
// app/api/vote/submit/route.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const mesombCollect = httpsCallable(functions, 'mesombCollect');

const result = await mesombCollect({
    amount: totalAmount,
    service: mesombService,
    payer: phoneNumber,
    nonce: transactionId,
    ...
});
```

### 5.3 Checklist de Migration

- [ ] Installer @hachther/mesomb dans functions/
- [ ] Créer mesombCollect cloud function
- [ ] Créer mesombVerify cloud function
- [ ] Créer mesombWithdraw cloud function
- [ ] Configurer secrets Firebase
- [ ] Déployer functions
- [ ] Modifier /api/vote/submit pour appeler function
- [ ] Modifier /api/vote/verify pour appeler function
- [ ] Modifier /api/admin/withdraw pour appeler function
- [ ] Tester avec numéro réel
- [ ] Supprimer app/api/lib/mesomb.ts
- [ ] Mettre à jour documentation

### 5.4 Estimation Temps

- Migration vers Cloud Functions: **2-3 heures**
- Tests et debugging: **1-2 heures**
- **Total: 3-5 heures**

---

## Conclusion

Le problème n'est **pas dans votre code** mais dans l'**incompatibilité fondamentale** entre:

- Le SDK Mesomb (format headers AWS-like)
- L'environnement Vercel (validation HTTP stricte)

La solution recommandée est d'utiliser **Firebase Cloud Functions** qui est déjà configuré dans votre projet et permettra au SDK Mesomb de fonctionner correctement.

**Prochaines étapes**:

1. Implémenter les Cloud Functions
2. Tester avec un numéro réel
3. Déployer en production

---

*Documentation générée le 28 novembre 2024*  
*Projet: NB Dance Award*  
*Version: 1.0*
