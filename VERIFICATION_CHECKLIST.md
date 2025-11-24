# ✅ Checklist de Vérification

Après avoir réinitialisé Firebase, vérifiez que tout fonctionne correctement:

## 1️⃣ Vérification des Candidats

### Page d'accueil (`/`)
- [ ] Les candidats s'affichent par catégorie
- [ ] Pas de catégorie "Unknown"
- [ ] Les images se chargent correctement
- [ ] Les barres de progression s'affichent
- [ ] Les pourcentages sont visibles

### Page Candidats (`/candidats`)
- [ ] Tous les 22 candidats s'affichent
- [ ] Les candidats sont groupés par catégorie
- [ ] Les images se chargent
- [ ] Les badges s'affichent correctement
- [ ] Les pourcentages sont corrects

### Page Classement (`/classement`)
- [ ] Le classement s'affiche correctement
- [ ] Les candidats sont triés par nombre de votes
- [ ] Les pourcentages sont corrects
- [ ] Les images se chargent

## 2️⃣ Vérification des Catégories

Vérifiez que toutes les catégories s'affichent:

- [ ] Meilleur artiste danseur - masculin (3 candidats)
- [ ] Meilleure artiste danseuse féminine (3 candidats)
- [ ] Meilleur groupe de danse (3 candidats)
- [ ] Meilleur collaboration duo (1 candidat)
- [ ] Meilleur artiste Chorégraphe (2 candidats)
- [ ] Meilleur Performance web (2 candidats)
- [ ] Meilleur artiste danseur au rythme folklorique (1 candidat)
- [ ] Meilleur artiste danseur afro coupé décalé (2 candidats)
- [ ] Meilleur artiste danseur mbolé (1 candidat)
- [ ] Meilleure artiste danseuse mbolé (1 candidat)
- [ ] Meilleur artiste danseur de l'année (1 candidat)
- [ ] Meilleure artiste danseuse de l'année (1 candidat)
- [ ] Meilleur artiste jeune danseur/danseuse (1 candidat)

**Total: 22 candidats**

## 3️⃣ Vérification des Votes

- [ ] Cliquer sur un candidat ouvre le modal de vote
- [ ] Le modal affiche le nom et l'image du candidat
- [ ] Les options de paiement s'affichent
- [ ] Le bouton "Voter" fonctionne
- [ ] Les votes s'enregistrent dans Firebase

## 4️⃣ Vérification de la Console Firebase

1. Allez à [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez le projet `project-5583295336911612869`
3. Allez à **Realtime Database**
4. Vérifiez:
   - [ ] Le nœud `candidates` existe
   - [ ] Il contient 22 candidats
   - [ ] Chaque candidat a les champs: `id`, `name`, `category`, `categoryId`, `image`, `votes`, `badge`, `percentage`
   - [ ] Les `categoryId` sont corrects

## 5️⃣ Vérification des Performances

- [ ] Les images se chargent rapidement
- [ ] Les pages ne scintillent pas
- [ ] Les pourcentages se mettent à jour en temps réel
- [ ] Pas d'erreurs dans la console du navigateur

## 6️⃣ Vérification de l'Admin

1. Allez à `/admin`
2. Connectez-vous avec le mot de passe: `NB2024Admin`
3. Vérifiez:
   - [ ] Le tableau des candidats s'affiche
   - [ ] Le bouton "Réinitialiser Firebase" est visible
   - [ ] Les statistiques (votes, revenu) s'affichent correctement
   - [ ] Le bouton de retrait fonctionne

## 🔧 Dépannage

### Les candidats ne s'affichent toujours pas?

1. Vérifiez que Firebase est connecté:
   ```javascript
   // Dans la console du navigateur
   console.log(firebase.database().ref('candidates').once('value'))
   ```

2. Vérifiez que le fichier JSON est correct:
   ```bash
   cat EXAMPLE_CANDIDATES.json | jq '.candidates | length'
   # Devrait afficher: 22
   ```

3. Réessayez la réinitialisation:
   - Allez à `/admin`
   - Cliquez sur "Réinitialiser Firebase"
   - Confirmez

### Les catégories sont toujours "Unknown"?

1. Vérifiez que tous les candidats ont le champ `categoryId`:
   ```bash
   cat EXAMPLE_CANDIDATES.json | jq '.candidates[] | select(.categoryId == null)'
   # Ne devrait rien afficher
   ```

2. Réinitialisez Firebase depuis la console:
   - Allez à Firebase Console
   - Supprimez le nœud `candidates`
   - Rechargez l'application

### Les images ne se chargent pas?

1. Vérifiez que les fichiers d'images existent dans `/public/dancers/`
2. Vérifiez les chemins dans `EXAMPLE_CANDIDATES.json`
3. Vérifiez la console du navigateur pour les erreurs 404

## ✨ Tout Fonctionne?

Si tout est coché, bravo! 🎉 Le fix est complet et fonctionnel.

Si vous rencontrez des problèmes, consultez:
- `FIREBASE_FIX.md` pour les détails techniques
- `FIX_SUMMARY.md` pour un résumé complet
