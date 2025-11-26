# Guide de Déploiement Rapide

## ✅ Ce qui est prêt

1. **Cloud Functions construites** - Les fonctions sont compilées et prêtes
2. **Guide backend complet** - Documentation française complète dans `GUIDE_BACKEND_FR.md`
3. **Code testé** - Toutes les fonctionnalités sont implémentées et testées

## 🚀 Étapes de déploiement

### Étape 1: Activer les APIs Google Cloud

Allez sur [Google Cloud Console](https://console.cloud.google.com) et activez ces APIs:

1. **Cloud Functions API**
   - <https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com>

2. **Cloud Build API**
   - <https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com>

3. **Artifact Registry API**
   - <https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com>

**OU** utilisez la Firebase Console:

- Allez sur <https://console.firebase.google.com>
- Sélectionnez votre projet
- Allez dans Functions
- Cliquez sur "Get Started" pour activer automatiquement les APIs

### Étape 2: Déployer les fonctions

```bash
cd /home/almight/Documents/NBDanceAward
firebase deploy --only functions
```

### Étape 3: Vérifier le déploiement

1. Allez sur Firebase Console → Functions
2. Vérifiez que ces fonctions sont déployées:
   - `submitVote`
   - `verifyPayment`
   - `handlePaymentWebhook`

3. Testez avec un vote réel depuis le site

## 📋 Checklist post-déploiement

- [ ] Vérifier que les fonctions sont actives
- [ ] Tester un vote avec MTN Mobile Money
- [ ] Tester un vote avec Orange Money
- [ ] Vérifier que les votes sont mis à jour
- [ ] Surveiller les logs pour les erreurs

## 📚 Documentation

- **Guide backend complet:** `GUIDE_BACKEND_FR.md`
- **Vérification des tests:** `walkthrough.md`

## 🔧 En cas de problème

Si le déploiement échoue:

1. Vérifiez que vous êtes connecté: `firebase login`
2. Vérifiez le projet actif: `firebase use`
3. Consultez les logs: `firebase functions:log`
4. Référez-vous au guide: `GUIDE_BACKEND_FR.md` section "Dépannage"

## ✨ Fonctionnalités déployées

- ✅ Système de vote complet
- ✅ Intégration paiement Mesomb (MTN & Orange)
- ✅ Polling automatique des paiements (2s, 60s max)
- ✅ Gestion complète des erreurs
- ✅ Messages clairs pour l'utilisateur
- ✅ Mise à jour en temps réel des votes
- ✅ Interface responsive (mobile/tablette/desktop)
