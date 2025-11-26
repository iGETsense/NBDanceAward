# 📱 Validation Téléphone - MTN & Orange Uniquement

## 🎯 Contrainte Technique

**Important:** L'agrégateur de paiement ne supporte que:

- ✅ MTN MoMo
- ✅ Orange Money
- ❌ Autres opérateurs (Camtel, etc.)

## 💡 Solution Implémentée

### 1. Détection Automatique

```
Utilisateur tape: 675 123 456
→ Détecté: MTN
→ Auto-suggestion: "Cliquez sur MTN MoMo"
```

### 2. Validation Stricte

```
✅ Numéro MTN → Accepté
✅ Numéro Orange → Accepté
❌ Numéro Camtel → Bloqué avec message clair
❌ Numéro inconnu → Bloqué avec liste des préfixes valides
```

### 3. Messages d'Erreur Clairs

**Camtel ou autre opérateur:**

```
❌ Seuls les numéros MTN et Orange Money sont acceptés pour le moment
```

**Préfixe inconnu:**

```
❌ Numéro non reconnu. Veuillez utiliser:
   • MTN: 67, 650-654, 680-683
   • Orange: 69, 655-659
```

**Mismatch détecté:**

```
💡 Ce numéro est MTN. Cliquez sur MTN MoMo pour continuer.
```

## 🔧 Logique de Validation

```typescript
if (numéro MTN détecté) {
  if (Orange Money sélectionné) {
    → Suggestion: "Cliquez sur MTN MoMo"
  }
  → ✅ ACCEPTÉ
}

if (numéro Orange détecté) {
  if (MTN MoMo sélectionné) {
    → Suggestion: "Cliquez sur Orange Money"
  }
  → ✅ ACCEPTÉ
}

if (numéro Camtel/autre) {
  → ❌ BLOQUÉ: "Seuls MTN et Orange acceptés"
}

if (numéro inconnu) {
  → ❌ BLOQUÉ: "Préfixes valides: MTN (67...) Orange (69...)"
}
```

## ✅ Avantages

1. **Évite les échecs de paiement** - Bloque avant l'agrégateur
2. **Messages clairs** - L'utilisateur sait pourquoi
3. **Auto-suggestion** - Guide vers le bon bouton
4. **Expérience fluide** - Pas de confusion

## 🎨 Expérience Utilisateur

### Scénario 1: Utilisateur MTN

```
1. Tape: 675 123 456
2. Badge: 🟡 MTN détecté
3. Si Orange sélectionné → Suggestion apparaît
4. Clic sur MTN MoMo → ✅ Paiement possible
```

### Scénario 2: Utilisateur Orange

```
1. Tape: 69 555 1234
2. Badge: 🟠 Orange détecté
3. Si MTN sélectionné → Suggestion apparaît
4. Clic sur Orange Money → ✅ Paiement possible
```

### Scénario 3: Utilisateur Camtel

```
1. Tape: 62 123 4567
2. ❌ Message: "Seuls MTN et Orange acceptés"
3. Bouton paiement désactivé
4. Utilisateur doit utiliser un autre numéro
```

## 🚀 Prochaines Étapes

1. Intégrer dans `app/candidats/page.tsx`
2. Intégrer dans `app/page.tsx`
3. Ajouter auto-sélection du bouton basée sur détection
4. Tester avec tous les préfixes
5. Déployer

**Résultat:** Zéro échec de paiement dû à un mauvais opérateur! 🎉
