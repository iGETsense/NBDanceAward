#!/bin/bash

# Script pour configurer les variables d'environnement Vercel
# Usage: ./setup-vercel-env.sh

echo "🚀 Configuration des variables d'environnement Vercel..."
echo ""

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé."
    echo "Installez-le avec: npm i -g vercel"
    exit 1
fi

echo "📝 Ajout des variables d'environnement..."

# Lire les valeurs depuis .env.local
if [ -f .env.local ]; then
    echo "✓ Fichier .env.local trouvé"
    
    # Extraire les valeurs
    MESOMB_APP_KEY=$(grep MESOMB_APPLICATION_KEY .env.local | cut -d '=' -f2)
    MESOMB_ACC_KEY=$(grep MESOMB_ACCESS_KEY .env.local | cut -d '=' -f2)
    MESOMB_SEC_KEY=$(grep MESOMB_SECRET_KEY .env.local | cut -d '=' -f2)
    VOTE_PRICE=$(grep NEXT_PUBLIC_VOTE_PRICE .env.local | cut -d '=' -f2)
    
    # Ajouter les variables à Vercel
    echo "$MESOMB_APP_KEY" | vercel env add MESOMB_APPLICATION_KEY production
    echo "$MESOMB_ACC_KEY" | vercel env add MESOMB_ACCESS_KEY production
    echo "$MESOMB_SEC_KEY" | vercel env add MESOMB_SECRET_KEY production
    echo "${VOTE_PRICE:-105}" | vercel env add NEXT_PUBLIC_VOTE_PRICE production
    
    # Demander le mot de passe admin
    echo ""
    read -sp "Entrez le mot de passe admin pour les retraits: " ADMIN_PWD
    echo ""
    echo "$ADMIN_PWD" | vercel env add ADMIN_WITHDRAWAL_PASSWORD production
    
    echo ""
    echo "✅ Variables d'environnement configurées!"
    echo ""
    echo "🚀 Déploiement en cours..."
    vercel --prod
    
else
    echo "❌ Fichier .env.local non trouvé"
    echo "Veuillez créer un fichier .env.local avec vos credentials Mesomb"
    exit 1
fi
