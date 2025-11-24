# Firebase Candidates Loading Fix

## Problème Identifié

Les candidats ne chargeaient pas correctement depuis Firebase et affichaient une catégorie "Unknown" car:

1. **Mismatch de champs**: Le fichier `EXAMPLE_CANDIDATES.json` utilisait `category` mais le code Firebase (`percentageCalculator.ts`) cherchait `categoryId`
2. **Résultat**: Tous les candidats se retrouvaient avec `categoryId: 'unknown'` au lieu de leur vraie catégorie

## Solution Appliquée

### 1. Mise à jour du fichier JSON
**Fichier**: `/EXAMPLE_CANDIDATES.json`

Ajout du champ `categoryId` à tous les candidats:
- `categoryId: "male-dancer"` pour les danseurs masculins
- `categoryId: "female-dancer"` pour les danseuses féminines
- `categoryId: "dance-group"` pour les groupes de danse
- etc.

Le champ `category` (avec le nom complet) a été conservé pour l'affichage frontend.

### 2. Amélioration de la fonction d'initialisation
**Fichier**: `/lib/initFirebaseData.ts`

Ajout du paramètre `forceReset` pour permettre la réinitialisation:
```typescript
initializeFirebaseWithCandidates(forceReset: boolean = false)
```

### 3. Création d'un bouton de réinitialisation
**Fichier**: `/components/ResetFirebaseButton.tsx`

Composant React pour réinitialiser Firebase depuis l'interface admin.

## Comment Utiliser

### Option 1: Réinitialiser via l'interface (Recommandé)

1. Allez à la page admin: `/admin`
2. Cliquez sur le bouton "Réinitialiser Firebase"
3. Confirmez l'action
4. La page se rechargera automatiquement avec les nouveaux candidats

### Option 2: Réinitialiser via le code

Dans n'importe quel composant client:
```typescript
import { initializeFirebaseWithCandidates } from "@/lib/initFirebaseData"

// Force reset
await initializeFirebaseWithCandidates(true)
```

### Option 3: Réinitialiser via Firebase Console

1. Allez à [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet
3. Allez à Realtime Database
4. Supprimez le nœud `candidates`
5. Rechargez l'application - les candidats se réinitialiseront automatiquement

## Vérification

Après la réinitialisation, vérifiez que:

1. ✅ Les candidats s'affichent par catégorie correcte (pas de "Unknown")
2. ✅ Les pourcentages se calculent correctement par catégorie
3. ✅ Les images des candidats se chargent
4. ✅ Le classement fonctionne correctement

## Structure des Données

Chaque candidat doit avoir:
```json
{
  "id": "unique-id",
  "name": "Nom du candidat",
  "category": "Nom complet de la catégorie",
  "categoryId": "category-id-slug",
  "image": "/path/to/image.jpg",
  "votes": 0,
  "badge": null,
  "percentage": 0
}
```

Les `categoryId` doivent être uniques et cohérents pour que le calcul des pourcentages fonctionne correctement.
