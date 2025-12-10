# 🔔 Guide: Comment Savoir Si Les Webhooks Passent Toujours

## ✅ MÉTHODE 1: Vérifier `/webhookLogs` dans Firebase

### Actions:
1. Aller sur https://console.firebase.google.com/
2. Sélectionner votre projet
3. Realtime Database → `/webhookLogs`

### ✅ Bon Signe (Webhook OK):
```json
{
  "webhook_xxx": {
    "processed": true,
    "result": "SUCCESS - Votes applied",
    "transactionId": "tx_123"
  }
}
```

### ❌ Problème:
```json
{
  "webhook_xxx": {
    "processed": false,
    "error": "Transaction not found"
  }
}
```

---

## ✅ MÉTHODE 2: Vérifier Les Transactions

Dans `/transactions/{id}`:

**Webhook Reçu** ✓:
```json
{
  "status": "completed",
  "webhookReceived": true,
  "webhookReceivedAt": 1702234567890
}
```

**Webhook Manquant** ❌:
```json
{
  "status": "pending",  // Depuis > 10 min!
  "webhookReceived": false
}
```

---

## ✅ MÉTHODE 3: Console Logs

Quand serveur tourne, cherchez:

```
[Webhook] ✓ SUCCESS: Transaction tx_123 completed, votes added
```

---

## 🚨 SIGNES D'ALERTE

⚠️ Webhooks NE passent PAS si:
1. Transactions restent "pending" > 10 minutes
2. Aucun `/webhookLogs` depuis 1h
3. Console errors: "Transaction NOT FOUND"

---

## 📊 STATS À VÉRIFIER

Chaque jour:
- [ ] Aucune transaction pending > 10 min
- [ ] Webhooks = Transactions (100%)
- [ ] Console sans erreurs
- [ ] Votes appliqués correctement

**Si TOUS OK → Webhooks fonctionnent! ✓**
