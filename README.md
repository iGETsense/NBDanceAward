<div align="center">

# 🎭 NB Dance Award

### *Célébrez l'Excellence de la Danse Africaine*

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[🌐 Demo Live](#) • [📖 Documentation](#features) • [🚀 Getting Started](#getting-started) • [🤝 Contribute](#contributing)

</div>

---

## ✨ À Propos

**NB Dance Award** est une plateforme de vote moderne et interactive dédiée à la célébration des talents de danse en Afrique. Notre mission est de mettre en lumière les danseurs exceptionnels à travers différentes catégories et styles de danse.

### 🎯 Catégories de Prix

- 🕺 **Meilleur Danseur Masculin**
- 💃 **Meilleure Danseuse Féminine**
- 👥 **Meilleur Groupe de Danse**
- 🎵 **Meilleur Danseur Coupé Décalé**
- 🎶 **Meilleur Danseur Mbolé**
- 🌟 **Meilleure Collaboration Duo/Trio**
- 🏆 **Danseur/Danseuse de l'Année**
- 🌱 **Meilleur Jeune Danseur/Danseuse**
- 🎖️ **Prix Honorifiques** (Inspiration, Soutien, Encouragement)

---

## 🚀 Features

### 🎨 Interface Moderne
- Design responsive et élégant avec Tailwind CSS 4.1
- Animations fluides et transitions soignées
- Mode sombre/clair avec `next-themes`
- Interface optimisée mobile-first

### 🗳️ Système de Vote
- Vote sécurisé et transparent
- Comptage en temps réel
- Système de paiement intégré (Mobile Money, Orange Money, Carte bancaire)
- Authentification utilisateur

### 📊 Classements Dynamiques
- Affichage en temps réel des résultats
- Filtrage par catégorie
- Statistiques détaillées
- Badges et récompenses visuelles

### 🎭 Galerie de Candidats
- Profils détaillés des danseurs
- Photos haute qualité
- Biographies et réalisations
- Système de recherche et filtrage

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.2 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4.1
- **Components:** shadcn/ui + Radix UI
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Mono

### Backend & Services
- **Analytics:** Vercel Analytics
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Notifications:** Sonner

### Development
- **Language:** TypeScript 5
- **Package Manager:** pnpm
- **Linting:** ESLint
- **Code Quality:** Prettier (recommended)

---

## 🏁 Getting Started

### Prerequisites

```bash
node >= 18.0.0
pnpm >= 8.0.0
```

### Installation

1. **Clone le repository**
```bash
git clone git@github.com:iGETsense/NBDanceAward.git
cd NBDanceAward
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Lancer le serveur de développement**
```bash
pnpm dev
```

4. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

### Build pour Production

```bash
# Build l'application
pnpm build

# Démarrer le serveur de production
pnpm start
```

---

## 📁 Structure du Projet

```
NBDanceAward/
├── app/                      # Next.js App Router
│   ├── candidats/           # Page des candidats
│   ├── classement/          # Page de classement
│   ├── regles/              # Règles du concours
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Page d'accueil
│   └── globals.css          # Styles globaux
├── components/              # Composants React
│   ├── ui/                  # shadcn/ui components
│   └── theme-provider.tsx   # Provider de thème
├── hooks/                   # Custom React hooks
├── lib/                     # Utilitaires
├── public/                  # Assets statiques
│   ├── images/             # Images
│   └── logo.png            # Logo
├── styles/                  # Styles additionnels
└── package.json            # Dépendances
```

---

## 🎨 Customization

### Modifier les Couleurs

Éditer `app/globals.css` pour personnaliser le thème:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  /* ... autres variables */
}
```

### Ajouter des Composants

Utiliser shadcn/ui CLI:

```bash
pnpm dlx shadcn@latest add [component-name]
```

---

## 🤝 Contributing

Les contributions sont les bienvenues ! Voici comment participer:

1. **Fork** le projet
2. **Créer** une branche (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Guidelines

- Suivre les conventions de code TypeScript
- Écrire des commits descriptifs
- Tester vos changements
- Mettre à jour la documentation si nécessaire

---

## 📝 License

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Team

Développé avec ❤️ par l'équipe **iGETsense**

- 🌐 Website: [iGETsense](#)
- 📧 Email: contact@igetsense.com
- 🐦 Twitter: [@iGETsense](#)

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Le framework React pour la production
- [shadcn/ui](https://ui.shadcn.com/) - Composants UI réutilisables
- [Vercel](https://vercel.com/) - Plateforme de déploiement
- [Lucide](https://lucide.dev/) - Icônes modernes
- Tous les danseurs et artistes qui font vivre la culture africaine 🎭

---

<div align="center">

### ⭐ Star ce projet si vous l'aimez !

**NB Dance Award** © 2024 - Célébrons la Danse Ensemble

[⬆ Retour en haut](#-nb-dance-award)

</div>
