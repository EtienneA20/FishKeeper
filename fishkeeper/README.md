# Fishkeeper

Outil open source de gestion d'aquariums.

## Membres de l'équipe

1. Audor Etienne ( project leader )
2. Vachey Joris
3. Morrain Nolan
4. Moisan Clement
5. Moreau Quentin

## Stack Technique

- **Frontend** : Next.js (App Router), Material UI (MUI)
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : SQLite avec Prisma

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

5. Lancer le projet :

	```powershell
	npm run dev
	```

L'application est ensuite accessible à l'adresse http://localhost:3000.

## Rôles

| Rôle    | Gestion des utilisateurs                                                        |
| ------- | ------------------------------------------------------------------------------- |
| `USER`  | Aucune (redirigé vers `/aquariums`)                                             |
| `ADMIN` | Voit tous les comptes ; crée, modifie et supprime uniquement les comptes `USER` |
| `SUDO`  | Gère tous les comptes, y compris `ADMIN` et `SUDO`                              |

Personne ne peut supprimer son propre compte ni changer son propre rôle. Les règles sont dans `lib/auth/authorization.ts` et sont vérifiées par les actions serveur avec le rôle **stocké en base** (pas celui du jeton de connexion) : un compte rétrogradé perd ses droits immédiatement.

## Tests

Les commandes suivantes sont exécutées depuis le dossier `fishkeeper`, après `npm run db:generate` :

```bash
npm test                 # Tous les tests unitaires, modèles et d'intégration
npm run test:models      # Contraintes de la base (migrations SQL) et DTO
npm run test:unit        # Tests unitaires et modèles
npm run test:integration # Actions serveur, connexion et contrôle des rôles
npm run test:e2e         # Parcours navigateur avec une base SQLite dédiée
```

- **Unitaires** (`tests/unit`) : règles des rôles, sans base de données.
- **Modèles** (`tests/models`) : contraintes `CHECK`, `UNIQUE`, clés étrangères et valeurs par défaut des migrations, et vérification que `schema.prisma` correspond aux migrations.
- **Intégration** (`tests/integration`) : actions serveur et connexion sur une vraie base SQLite. Seule la session Next.js est simulée.
- **E2E** (`tests/e2e`) : connexion et gestion des utilisateurs dans Chromium.

Chaque lancement de Vitest crée une base temporaire en appliquant `prisma/migrations` (et non `prisma db push`, qui ignore les contraintes `CHECK` écrites à la main), puis donne une copie à chaque fichier de test. `dev.db` n'est jamais utilisée.

Les tests E2E recréent `e2e.db` à partir des migrations à chaque lancement. Ils utilisent les comptes `user@example.test`, `admin@example.test` et `sudo@example.test` avec le mot de passe `Fishkeeper-test-123!`. Installer le navigateur Playwright une seule fois avant le premier lancement :

```bash
npx playwright install chromium
```

Sur les machines de l'IUT (LMDE 7), Playwright ne reconnaît pas le système : il faut préciser la plateforme pour l'installation (les tests se lancent ensuite normalement) :

```bash
PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=debian13-x64 npx playwright install chromium
```

## Gestion de la base de données

Supprimer puis recréer la base locale en réappliquant toutes les migrations :

```powershell
npm run db:reset
```

Attention : cette commande supprime toutes les données locales.

Synchroniser directement le schéma avec la base, sans créer de migration :

```powershell
npm run db:push
```
