# Backend Developer Update - 29/11/2025

Ce fichier résume les modifications récentes apportées au projet pour assurer la synchronisation avec le développement backend.

## 1. Problème de Chargement Firebase (Réseau Orange)

- **Problème :** Les utilisateurs sur le réseau mobile Orange rencontraient des blocages lors du chargement des données depuis Firebase.
- **Solution :**
  - Implémentation d'une logique de **retry** (tentatives multiples) pour la connexion Firebase.
  - Ajout d'un **fallback statique** : si Firebase échoue après plusieurs tentatives, l'application charge une copie locale des données des candidats (`lib/candidatesData.ts`) pour assurer que le site reste fonctionnel.
  - **Fichiers impactés :** `lib/database.ts`, `app/candidats/page.tsx`, `app/page.tsx`.

## 2. Dashboard Admin

- **Frais de Plateforme :** Le revenu total affiché sur le dashboard inclut désormais une déduction automatique de **5%** pour les frais de plateforme.
- **UX :** Suppression des animations de chargement sur les cartes de statistiques pour un affichage immédiat des valeurs.
- **Fichiers impactés :** `app/admin-[hash]/page.tsx`.

## 3. Sécurité

- **Mise à jour Next.js :** Passage à la version **v15.4.7** pour corriger une vulnérabilité SSRF critique.

## 4. Base de Données & Candidats

- Ajout des candidats manquants : "Nounours" et "Lysiane".
- Correction de fautes d'orthographe dans les noms et catégories.
- Ajustement du positionnement des images.

## 5. Instructions pour le déploiement

- Assurez-vous que les variables d'environnement pour Firebase et Mesomb sont correctement configurées en production.
- Le build utilise maintenant la dernière version de Next.js, vérifiez la compatibilité des plugins si nécessaire.
