# 🚀 Configuration DB Optimisée - Sans Doublons

## 📊 Nouvelle Structure

**Avant:** 107 candidats (avec doublons)  
**Après:** 55 candidats uniques + 13 catégories

### Avantages
✅ Pas de redondance
✅ Images chargées une seule fois
✅ Votes plus précis
✅ DB plus légère
✅ Facile à maintenir

---

## 📁 Fichier: `FIREBASE_OPTIMIZED.json`

Ce fichier contient:
- **55 candidats uniques** avec vraies images
- **13 catégories** avec références aux candidats
- Structure normalisée

---

## 🔧 Étapes d'Installation

### Étape 1: Importer dans Firebase

1. Allez à https://console.firebase.google.com
2. Sélectionnez votre projet
3. Realtime Database → Cliquez sur les 3 points → **Import JSON**
4. Sélectionnez `FIREBASE_OPTIMIZED.json`
5. Cliquez **Import**

### Étape 2: Vérifier l'Import

Vous devriez voir:
```
├── candidates/
│   ├── candidate-1
│   ├── candidate-2
│   └── ... (55 candidats)
└── categories/
    ├── female-dancer
    ├── male-dancer
    └── ... (13 catégories)
```

### Étape 3: Mettre à Jour le Code Frontend

Modifiez `lib/database.ts`:

```typescript
// Récupérer les candidats d'une catégorie
export async function getCandidatesByCategory(categoryId: string) {
  try {
    const categoryRef = ref(database, `categories/${categoryId}`)
    const snapshot = await get(categoryRef)
    
    if (snapshot.exists()) {
      const category = snapshot.val()
      const candidateIds = category.candidates || []
      
      // Récupérer les données complètes de chaque candidat
      const candidates = await Promise.all(
        candidateIds.map(async (id: string) => {
          const candRef = ref(database, `candidates/${id}`)
          const candSnapshot = await get(candRef)
          return candSnapshot.val()
        })
      )
      
      return candidates
    }
    return []
  } catch (error) {
    console.error('Error fetching candidates by category:', error)
    return []
  }
}
```

### Étape 4: Tester

1. Allez à `http://localhost:3000`
2. Vérifiez que les candidats s'affichent
3. Les images doivent charger depuis `/dancers/`
4. Testez un vote

---

## 📋 Structure des Données

### Candidat
```json
{
  "candidate-1": {
    "id": "candidate-1",
    "name": "Maguy merine",
    "image": "/dancers/MAGUY MERINE.jpeg",
    "votes": 0,
    "categories": [
      "female-dancer",
      "mbole-female-dancer",
      "web-performance",
      "female-dancer-year",
      "duo-collaboration"
    ]
  }
}
```

### Catégorie
```json
{
  "female-dancer": {
    "id": "female-dancer",
    "name": "Meilleure artiste danseuse féminine",
    "order": 1,
    "candidates": [
      "candidate-1",
      "candidate-2",
      "candidate-3",
      ...
    ]
  }
}
```

---

## 🎯 Résultat Attendu

✅ 55 candidats uniques  
✅ Images chargées depuis `/dancers/`  
✅ Pas de doublons  
✅ Votes par candidat ET catégorie  
✅ DB optimisée et légère  

---

## 📊 Statistiques

| Métrique | Avant | Après |
|----------|-------|-------|
| Candidats | 107 | 55 |
| Doublons | Oui | Non |
| Catégories | 13 | 13 |
| Taille DB | Grosse | Petite |

---

## 🚀 Prochaines Étapes

1. Importer `FIREBASE_OPTIMIZED.json` dans Firebase
2. Mettre à jour le code frontend
3. Tester les candidats et votes
4. Vérifier les images

**Prêt? Commencez maintenant! 🎉**
