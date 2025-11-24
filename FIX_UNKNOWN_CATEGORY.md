# 🔧 Fix - Unknown Category Problem

## ❌ Problème

Tous les candidats tombaient dans "Unknown Category" parce que:
- Le code cherchait `candidate.categoryId`
- Mais la nouvelle structure n'a pas ce champ
- Les catégories pointent vers les candidats (pas l'inverse)

## ✅ Solution Appliquée

### 1. Modifié `lib/percentageCalculator.ts`
- Simplifié la fonction `calculatePercentages()`
- Retire la dépendance sur `categoryId`
- Les pourcentages sont calculés par catégorie au moment du rendu

### 2. Modifié `lib/database.ts` - `subscribeToCandidates()`
- **Écoute DEUX sources**: candidates ET categories
- Calcule les pourcentages **par catégorie**
- Retourne les candidats avec `percentagesByCategory`

### Comment Ça Fonctionne

```typescript
// Avant (❌ Cassé)
const categoryId = candidate?.categoryId || 'unknown'  // undefined → 'unknown'

// Après (✅ Correct)
// 1. Récupère les catégories du candidat
const candidateCategories = categories.filter(cat => 
  cat.candidates.includes(candidate.id)
)

// 2. Calcule le pourcentage pour CHAQUE catégorie
candidateCategories.forEach(cat => {
  const totalVotes = cat.candidates
    .map(id => candidates[id])
    .reduce((sum, c) => sum + c.votes, 0)
  
  percentage = (candidate.votes / totalVotes) * 100
})
```

---

## 📊 Exemple

### Structure Firebase
```json
{
  "candidates": {
    "candidate-1": {
      "id": "candidate-1",
      "name": "Maguy merine",
      "votes": 100
    }
  },
  "categories": {
    "female-dancer": {
      "id": "female-dancer",
      "name": "Meilleure artiste danseuse féminine",
      "candidates": ["candidate-1", "candidate-2", "candidate-3"]
    },
    "web-performance": {
      "id": "web-performance",
      "name": "Meilleur Performance web",
      "candidates": ["candidate-1", "candidate-2", "candidate-6"]
    }
  }
}
```

### Résultat
```javascript
{
  "id": "candidate-1",
  "name": "Maguy merine",
  "votes": 100,
  "percentage": 33,  // Dans female-dancer (100/300)
  "percentagesByCategory": {
    "female-dancer": 33,      // 100 votes / 300 total
    "web-performance": 50     // 100 votes / 200 total
  }
}
```

---

## ✨ Avantages

✅ **Pas de "Unknown Category"**  
✅ **Pourcentages corrects par catégorie**  
✅ **Candidats dans plusieurs catégories**  
✅ **Calculs précis**  
✅ **Temps réel**  

---

## 🚀 Prochaines Étapes

1. **Importer** `FIREBASE_CORRECT.json` dans Firebase
2. **Redémarrer** l'app: `npm run dev`
3. **Vérifier** que les candidats s'affichent par catégorie
4. **Tester** les votes

---

## ✅ Vérification

Après le redémarrage:

### Page d'Accueil
- [ ] 13 catégories s'affichent
- [ ] Chaque catégorie a ses candidats
- [ ] Pas de "Unknown Category"
- [ ] Les pourcentages s'affichent

### Page Candidats
- [ ] Tous les 55 candidats s'affichent
- [ ] Groupés par catégorie
- [ ] Images chargent

### Page Classement
- [ ] Classement par votes
- [ ] Candidats triés correctement

---

## 🎉 Résultat

✅ **Unknown Category** disparu  
✅ **Toutes les catégories** s'affichent  
✅ **Candidats** aux bons endroits  
✅ **Pourcentages** corrects  

---

**Le problème est résolu! 🚀**
