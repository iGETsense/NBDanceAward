# Guide: Optimiser les images pour un chargement ultra-rapide

## 🚀 Solutions d'optimisation

### Option 1: Convertir en WebP (RECOMMANDÉ)

**Gain: 30-80% de réduction de taille**

#### Étapes

```bash
# 1. Installer l'outil de conversion
# Ubuntu/Debian:
sudo apt-get install webp

# macOS:
brew install webp

# 2. Convertir toutes les images
./scripts/convert-to-webp.sh

# 3. Mettre à jour les références dans le code
node scripts/update-image-refs.js

# 4. Tester le site
npm run dev

# 5. Si tout fonctionne, supprimer les backups
rm -rf public/dancers_backup_*
```

### Option 2: Utiliser Next.js Image Optimization

Next.js optimise automatiquement les images avec le composant `<Image>`.

**Déjà implémenté dans:**

- `app/PageContent.tsx`
- `app/candidats/page.tsx`

### Option 3: Lazy Loading (Déjà actif)

Les images se chargent uniquement quand elles sont visibles à l'écran.

## 📊 Comparaison des formats

| Format | Taille moyenne | Qualité | Support navigateur |
|--------|---------------|---------|-------------------|
| JPEG   | 100%          | Bonne   | 100%              |
| PNG    | 150%          | Excellente | 100%           |
| **WebP** | **30-50%**  | **Excellente** | **97%**      |

## ✅ Avantages WebP

1. **30-80% plus léger** que JPEG/PNG
2. **Même qualité visuelle**
3. **Support: 97% des navigateurs** (Chrome, Firefox, Safari, Edge)
4. **Fallback automatique** avec Next.js Image

## 🔧 Configuration actuelle

Next.js est déjà configuré pour:

- ✅ Optimisation automatique des images
- ✅ Lazy loading
- ✅ Responsive images
- ✅ Format WebP automatique (si navigateur compatible)

## 📝 Prochaines étapes

1. **Convertir les images** avec le script fourni
2. **Tester** que tout fonctionne
3. **Déployer** sur Vercel
4. **Mesurer** l'amélioration avec Lighthouse

## 🎯 Résultat attendu

**Avant:** ~2-3 MB de photos par page
**Après:** ~500-800 KB par page

**Temps de chargement:**

- Avant: 3-5 secondes
- Après: 0.5-1 seconde

## 🆘 En cas de problème

Si certaines images ne s'affichent pas après conversion:

1. Vérifier que le fichier WebP existe dans `public/dancers/`
2. Vérifier la console du navigateur pour les erreurs
3. Restaurer depuis le backup si nécessaire
