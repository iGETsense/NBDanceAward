#!/bin/bash

# Script automatique pour déployer sur Vercel avec les variables d'environnement

echo "🚀 Configuration et déploiement Vercel..."
echo ""

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    exit 1
fi

echo "✅ Vercel CLI installé"
echo ""

# Se connecter à Vercel (si pas déjà connecté)
echo "🔐 Connexion à Vercel..."
vercel login

echo ""
echo "📝 Configuration des variables d'environnement..."
echo ""

# Ajouter les variables d'environnement
echo "a4120748a7093365013b04a8f42bdd24f299936b" | vercel env add MESOMB_APPLICATION_KEY production
echo "a4120748a7093365013b04a8f42bdd24f299936b" | vercel env add MESOMB_APPLICATION_KEY preview
echo "a4120748a7093365013b04a8f42bdd24f299936b" | vercel env add MESOMB_APPLICATION_KEY development

echo "f6c26b42-24de-4ec6-8b1b-7a808052e335" | vercel env add MESOMB_ACCESS_KEY production
echo "f6c26b42-24de-4ec6-8b1b-7a808052e335" | vercel env add MESOMB_ACCESS_KEY preview
echo "f6c26b42-24de-4ec6-8b1b-7a808052e335" | vercel env add MESOMB_ACCESS_KEY development

echo "e45b1545-1b5a-49c4-aadf-ba4cf700a8dc" | vercel env add MESOMB_SECRET_KEY production
echo "e45b1545-1b5a-49c4-aadf-ba4cf700a8dc" | vercel env add MESOMB_SECRET_KEY preview
echo "e45b1545-1b5a-49c4-aadf-ba4cf700a8dc" | vercel env add MESOMB_SECRET_KEY development

echo "105" | vercel env add NEXT_PUBLIC_VOTE_PRICE production
echo "105" | vercel env add NEXT_PUBLIC_VOTE_PRICE preview
echo "105" | vercel env add NEXT_PUBLIC_VOTE_PRICE development

echo "NBDance2024Admin!" | vercel env add ADMIN_WITHDRAWAL_PASSWORD production
echo "NBDance2024Admin!" | vercel env add ADMIN_WITHDRAWAL_PASSWORD preview
echo "NBDance2024Admin!" | vercel env add ADMIN_WITHDRAWAL_PASSWORD development

echo ""
echo "✅ Variables d'environnement configurées!"
echo ""
echo "🚀 Déploiement en production..."
vercel --prod

echo ""
echo "✅ Déploiement terminé!"
