# 🏗️ Structure Firebase Optimisée - Sans Doublons

## Problème Actuel
Les candidats sont répétés dans plusieurs catégories → **Redondance**

## Solution: Structure Normalisée

```
firebase/
├── candidates/
│   ├── candidate-1/
│   │   ├── id: "candidate-1"
│   │   ├── name: "Maguy merine"
│   │   ├── image: "/dancers/MAGUY MERINE.jpeg"
│   │   ├── votes: 0
│   │   └── categories: ["female-dancer", "mbole-female-dancer", "web-performance", ...]
│   │
│   ├── candidate-2/
│   │   ├── id: "candidate-2"
│   │   ├── name: "Kendi"
│   │   ├── image: "/dancers/KENDI.jpeg"
│   │   ├── votes: 0
│   │   └── categories: ["female-dancer", "mbole-female-dancer", "web-performance", ...]
│   │
│   └── ... (autres candidats uniques)
│
├── categories/
│   ├── female-dancer/
│   │   ├── name: "Meilleure artiste danseuse féminine"
│   │   ├── order: 1
│   │   └── candidates: ["candidate-1", "candidate-2", "candidate-3", ...]
│   │
│   ├── mbole-female-dancer/
│   │   ├── name: "Meilleure artiste danseuse mbolé"
│   │   ├── order: 2
│   │   └── candidates: ["candidate-1", "candidate-2", "candidate-4", ...]
│   │
│   └── ... (autres catégories)
│
└── votes/
    ├── vote-1/
    │   ├── candidateId: "candidate-1"
    │   ├── categoryId: "female-dancer"
    │   ├── voteCount: 5
    │   ├── userId: "user-123"
    │   └── timestamp: 1700000000
    │
    └── ... (autres votes)
```

## Avantages

✅ **Pas de doublons** - Chaque candidat une seule fois
✅ **Flexible** - Un candidat peut être dans plusieurs catégories
✅ **Efficace** - Moins de données stockées
✅ **Facile à mettre à jour** - Modifier une fois = partout
✅ **Votes précis** - Votes par candidat ET catégorie

## Exemple de Données

### Candidat Unique
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

### Catégorie avec Références
```json
{
  "female-dancer": {
    "name": "Meilleure artiste danseuse féminine",
    "order": 1,
    "candidates": [
      "candidate-1",
      "candidate-2",
      "candidate-3",
      "candidate-4",
      "candidate-5",
      "candidate-6",
      "candidate-7"
    ]
  }
}
```

### Vote
```json
{
  "vote-1": {
    "candidateId": "candidate-1",
    "categoryId": "female-dancer",
    "voteCount": 5,
    "userId": "user-123",
    "timestamp": 1700000000
  }
}
```

## Nombre Total de Candidats Uniques

Au lieu de 107 entrées → **~50 candidats uniques**

Exemple:
- Maguy merine: 5 catégories
- Kendi: 5 catégories
- El Fally du 237: 4 catégories
- etc.

## Migration

1. Créer la structure optimisée
2. Importer dans Firebase
3. Mettre à jour le code frontend
4. Tester les votes

