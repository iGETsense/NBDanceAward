# 🔄 Instructions pour Réinitialiser Firebase

## Étape 1: Démarrer l'application

```bash
npm run dev
```

## Étape 2: Ouvrir la page admin

Allez à: `http://localhost:3000/admin`

## Étape 3: Cliquer sur "Réinitialiser Firebase"

Un bouton rouge avec l'icône de réinitialisation apparaîtra. Cliquez dessus et confirmez.

## Étape 4: Attendre la réinitialisation

La page se rechargera automatiquement une fois la réinitialisation terminée.

## Étape 5: Vérifier les résultats

1. Allez à la page d'accueil: `http://localhost:3000`
2. Vérifiez que les candidats s'affichent par catégorie correcte
3. Allez à `/candidats` pour voir tous les candidats
4. Allez à `/classement` pour voir le classement

---

## Alternative: Réinitialiser via Firebase Console

Si le bouton ne fonctionne pas:

1. Allez à [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez le projet "project-5583295336911612869"
3. Allez à **Realtime Database**
4. Trouvez le nœud `candidates`
5. Cliquez sur les 3 points et sélectionnez **Delete**
6. Rechargez l'application - les candidats se réinitialiseront automatiquement

---

## Qu'est-ce qui a été corrigé?

✅ Ajout du champ `categoryId` à tous les candidats  
✅ Les candidats sont maintenant groupés par catégorie correctement  
✅ Les pourcentages se calculent par catégorie  
✅ La catégorie "Unknown" a disparu  

## Questions?

Consultez `FIREBASE_FIX.md` pour plus de détails techniques.
