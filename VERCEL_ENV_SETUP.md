# URGENT: Ajouter cette variable d'environnement sur Vercel

## Variable manquante

La variable suivante **DOIT** être ajoutée sur Vercel pour que le tableau de bord fonctionne:

```
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app
```

## Comment l'ajouter sur Vercel

1. Allez sur <https://vercel.com/iGETsense/nb-dance-award/settings/environment-variables>
2. Cliquez sur "Add New"
3. Name: `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
4. Value: `https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app`
5. Environment: Cochez **Production**, **Preview**, et **Development**
6. Cliquez "Save"
7. **Redéployez** le site (Deployments → ... → Redeploy)

## Pourquoi c'est important

Sans cette variable:

- ❌ Le solde actuel affiche 0
- ❌ Les transactions affichent 0
- ❌ L'historique des retraits est vide
- ❌ Les APIs serveur ne peuvent pas lire Firebase

Avec cette variable:

- ✅ Tout fonctionne correctement
- ✅ Le solde s'affiche
- ✅ Les transactions sont visibles
- ✅ L'historique des retraits fonctionne

## État actuel de la base de données

D'après le diagnostic:

- **Revenu net**: 7,681 XAF
- **Retraits**: 10,818 XAF
- **Solde**: -3,137 XAF (négatif!)
- **Total votes**: 77

⚠️ **Attention**: Vous avez retiré plus que ce que vous avez gagné. Le solde est négatif.
