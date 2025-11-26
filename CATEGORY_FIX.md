# 🔧 Fix pour le problème "Unknown Category"

## 📋 Problème identifié

Tous les candidats apparaissent dans une catégorie "Unknown" parce que la table de liaison `candidateCategories` est manquante ou mal configurée dans Firebase.

## ✅ Solution

J'ai créé un nouveau fichier `firebase_db.json` qui contient:

- **13 catégories** (categories)
- **89 candidats** (candidates)
- **89 liens** candidat-catégorie (candidateCategories)

## 🚀 Comment importer dans Firebase

### Option 1: Via la console Firebase (Recommandé)

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **NBDanceAward**
3. Allez dans **Realtime Database**
4. Cliquez sur les **3 points** ⋮ en haut à droite
5. Sélectionnez **"Import JSON"**
6. Choisissez le fichier `firebase_db.json`
7. **IMPORTANT**: Cochez l'option **"Overwrite"** pour remplacer les données existantes
8. Cliquez sur **"Import"**

### Option 2: Via le bouton Reset dans l'admin

1. Allez sur votre page admin: `/admin`
2. Utilisez le bouton **"Reset Firebase Database"**
3. Le fichier `firebase_db.json` sera automatiquement importé

## 📊 Structure de la base de données

```json
{
  "categories": {
    "female-dancer": {
      "id": "female-dancer",
      "name": "Meilleure artiste danseuse féminine"
    },
    ...
  },
  "candidates": {
    "maguy-merine-female-dancer": {
      "id": "maguy-merine-female-dancer",
      "baseId": "maguy-merine",
      "name": "Maguy merine",
      "categoryId": "female-dancer",
      ...
    },
    ...
  },
  "candidateCategories": [
    {
      "candidateId": "maguy-merine-female-dancer",
      "categoryId": "female-dancer"
    },
    ...
  ]
}
```

## 🔍 Vérification

Après l'import, vérifiez que:

1. ✅ Les candidats apparaissent dans leurs bonnes catégories
2. ✅ La page `/candidats` affiche les catégories correctement
3. ✅ Le classement `/classement` montre les bonnes catégories
4. ✅ Plus de "Unknown Category"

## 📝 Notes techniques

Le code dans `lib/database.ts` utilise la table `candidateCategories` pour mapper les candidats aux catégories:

```typescript
// Ligne 105-110 dans lib/database.ts
const candidateCategoryMap = new Map<string, string>()
const linksArray = Array.isArray(links) ? links : Object.values(links)
linksArray.forEach((link: any) => {
  candidateCategoryMap.set(link.candidateId, link.categoryId)
})
```

Cette table de liaison est **essentielle** pour que le système fonctionne correctement.
