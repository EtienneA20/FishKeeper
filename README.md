# Fishkeeper

Outil libre de gestion d'aquariums[cite: 1].

## Membres de l'équipe

1. Audor Etienne ( project leader )
2. Vachey Joris
3. Morrain Nolan
4. Moisan Clement
5. Moreau Quentin

## Stack Technique

* **Frontend** : Next.js (App Router), Material UI (MUI), Lucide React
* **Backend** : Next.js API Routes, Prisma ORM
* **Base de données** : PostgreSQL

## Extensions VS Code Recommandées

Pour garantir un environnement de développement homogène, installez les extensions suivantes :
* ESLint
* Prettier - Code formatter
* GitLens
* Error lens
* Conventional commit
* Pretty TypeScript Errors

## Démarrage Rapide

Copiez le fichier `.env.example` vers `.env` et configurez l'accès à PostgreSQL.

Installer les dépendances :
\`npm i\`

Générer la base de données :
\`npx prisma migrate dev\`

Lancer le projet :
\`npm run dev\`