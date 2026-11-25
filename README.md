<p align="center">
  <img src="./doc/img/Bannière_Fishkeeper.svg" alt="Fishkeeper - Gestion d'aquariums" width="100%" />
</p>

---

### Outil open source de gestion d'aquariums pour aquariophiles.

![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-149ECA?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-9.4-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.10-5A67D8?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

## Membres de l'équipe

1. Audor Etienne ( project leader )
2. Vachey Joris
3. Morrain Nolan
4. Moisan Clement
5. Moreau Quentin

## Stack Technique

- **Frontend** : Next.js 16 (App Router), React 19, TypeScript, Material UI (`@mui/material`, `@mui/x-data-grid`), `react-hook-form` + `yup`
- **Backend** : Next.js API Routes, NextAuth, Prisma ORM (`@prisma/adapter-better-sqlite3`, `@prisma/adapter-pg`)
- **Base de données** : SQLite en local (`better-sqlite3`) et support PostgreSQL (`pg`) via Prisma
- **Qualité & Tests** : ESLint, Prettier, Husky, Commitlint, Vitest, Playwright

## Extensions VS Code Recommandées

Pour garantir un environnement de développement homogène, installez les extensions suivantes :

* ESLint
* Prettier - Code formatter
* GitLens
* Error lens
* Conventional commit
* Pretty TypeScript Errors
* Auto Rename Tag
* Import Cost
* MUI Snippets
* SQLite Viewer

## Démarrage Rapide

Depuis le dossier `fishkeeper` :

1. Copier le fichier d'environnement :

	```powershell
	Copy-Item .env.example .env
	```
	La variable `NEXTAUTH_SECRET` contient un token personnel propre a chaque machine, on peut en obtenir un grace a la commande:   
	```powershell
	openssl rand -base64 32
	```
	Il faut cependant avoir installé au préalable cette methode.

2. Installer les dépendances :

	```powershell
	npm install
	```

3. Générer le client Prisma :

	```powershell
	npm run db:generate
	```

4. Créer la base SQLite et appliquer les migrations :

	```powershell
	npm run db:migrate
	```

	Cette commande crée le fichier `dev.db` à partir des migrations présentes dans `prisma/migrations`.

5. Peupler la base de données :

	- **Peuplement global des espèces** (catalogue complet des espèces) :
		```powershell
		npm run db:seed
		```
	- **Peuplement de développement / test** (données fictives et jeux de test locaux) :
		```powershell
		npm run db:seed:dev
		```

		Comptes locaux créés pour les tests :
		- **USER** : `demo@fishkeeper.fr` / `Test1234!`
		- **ADMIN** : `admin@fishkeeper.fr` / `Test1234!`

6. Lancer le projet :

	```powershell
	npm run dev
	```

L'application est ensuite accessible à l'adresse http://localhost:3000.

## Gestion de la base de données

Supprimer puis recréer la base locale en réappliquant toutes les migrations :

```powershell
npm run db:reset