# 🛠️ Commandes Utiles

## Démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Accéder à l'application
# http://localhost:3000
```

## Vérification des Données

### Vérifier le nombre de candidats dans le JSON
```bash
cat EXAMPLE_CANDIDATES.json | jq '.candidates | length'
# Devrait afficher: 22
```

### Vérifier que tous les candidats ont categoryId
```bash
cat EXAMPLE_CANDIDATES.json | jq '.candidates[] | select(.categoryId == null)'
# Ne devrait rien afficher
```

### Vérifier les categoryId uniques
```bash
cat EXAMPLE_CANDIDATES.json | jq '.candidates[].categoryId' | sort | uniq
```

### Vérifier les catégories uniques
```bash
cat EXAMPLE_CANDIDATES.json | jq '.candidates[].category' | sort | uniq
```

### Compter les candidats par categoryId
```bash
cat EXAMPLE_CANDIDATES.json | jq 'group_by(.categoryId) | map({categoryId: .[0].categoryId, count: length})'
```

## Validation JSON

### Vérifier que le JSON est valide
```bash
cat EXAMPLE_CANDIDATES.json | jq empty && echo "✅ JSON valide" || echo "❌ JSON invalide"
```

### Afficher le JSON formaté
```bash
cat EXAMPLE_CANDIDATES.json | jq .
```

## Dépannage

### Voir les logs de Firebase
```javascript
// Dans la console du navigateur
firebase.database().ref('candidates').once('value', (snapshot) => {
  console.log(snapshot.val())
})
```

### Vérifier les candidats depuis la console
```javascript
// Dans la console du navigateur
fetch('/EXAMPLE_CANDIDATES.json')
  .then(r => r.json())
  .then(d => console.log(d.candidates.length + ' candidats'))
```

### Vérifier la connexion Firebase
```javascript
// Dans la console du navigateur
console.log('Firebase initialized:', !!firebase.database())
```

## Nettoyage

### Supprimer le cache du navigateur
```bash
# Ouvrir DevTools (F12)
# Application → Storage → Clear site data
```

### Supprimer les données de session
```javascript
// Dans la console du navigateur
sessionStorage.clear()
localStorage.clear()
```

## Build et Déploiement

### Construire pour la production
```bash
npm run build
```

### Démarrer en mode production
```bash
npm run start
```

### Vérifier les erreurs de build
```bash
npm run build 2>&1 | grep -i error
```

## Debugging

### Activer les logs détaillés
```javascript
// Dans app/page.tsx ou n'importe quel composant
useEffect(() => {
  console.log('Candidates:', candidates)
  console.log('Loading:', loading)
  console.log('Error:', error)
}, [candidates, loading, error])
```

### Vérifier les appels Firebase
```javascript
// Dans la console du navigateur
firebase.database().enableLogging(true)
```

### Voir les données en temps réel
```javascript
// Dans la console du navigateur
firebase.database().ref('candidates').on('value', (snapshot) => {
  console.log('Candidates updated:', snapshot.val())
})
```

## Réinitialisation

### Réinitialiser Firebase depuis l'interface
1. Allez à `http://localhost:3000/admin`
2. Connectez-vous avec `NB2024Admin`
3. Cliquez sur "Réinitialiser Firebase"

### Réinitialiser Firebase depuis la console
```javascript
// Dans la console du navigateur
import { initializeFirebaseWithCandidates } from '@/lib/initFirebaseData'
await initializeFirebaseWithCandidates(true)
```

### Réinitialiser Firebase depuis Firebase Console
1. Allez à https://console.firebase.google.com
2. Sélectionnez le projet
3. Realtime Database → candidates → Delete
4. Rechargez l'application

## Performance

### Vérifier les performances
```bash
# Ouvrir DevTools (F12)
# Performance → Record → Reload → Stop
```

### Vérifier les images
```bash
# Ouvrir DevTools (F12)
# Network → Filter: img
# Vérifier que les images se chargent rapidement
```

### Vérifier les requêtes Firebase
```bash
# Ouvrir DevTools (F12)
# Network → Filter: firebase
# Vérifier que les requêtes sont rapides
```

## Fichiers Importants

| Fichier | Description |
|---------|-------------|
| `EXAMPLE_CANDIDATES.json` | Données des candidats |
| `lib/firebase.ts` | Configuration Firebase |
| `lib/database.ts` | Fonctions Firebase |
| `lib/percentageCalculator.ts` | Calcul des pourcentages |
| `hooks/useFirebaseData.ts` | Hooks React Firebase |
| `app/page.tsx` | Page d'accueil |
| `app/candidats/page.tsx` | Page des candidats |
| `app/classement/page.tsx` | Page du classement |
| `app/admin/page.tsx` | Page admin |

## Documentation

| Fichier | Description |
|---------|-------------|
| `FIX_SUMMARY.md` | Résumé du fix |
| `FIREBASE_FIX.md` | Documentation technique |
| `TECHNICAL_EXPLANATION.md` | Explication détaillée |
| `VERIFICATION_CHECKLIST.md` | Checklist de vérification |
| `RESET_INSTRUCTIONS.md` | Instructions de réinitialisation |
| `USEFUL_COMMANDS.md` | Ce fichier |

## Besoin d'Aide?

1. Consultez la documentation
2. Vérifiez la console du navigateur (F12)
3. Vérifiez les logs Firebase
4. Réinitialisez les données
5. Rechargez l'application
