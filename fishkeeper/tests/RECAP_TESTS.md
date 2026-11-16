# Récapitulatif des tests

Dernier passage : 16/11/2026, **155 tests sur 158 passent** (Vitest 148/151, Playwright 7/7).

## Lancer les tests

Depuis le dossier `fishkeeper` :

```bash
npm test                 # unitaires + modèles + intégration (Vitest)
npm run test:unit        # unitaires + modèles
npm run test:models      # modèles seulement
npm run test:integration # intégration seulement
npm run test:e2e         # navigateur (Playwright)
```

Avant le premier `test:e2e` sur un PC de l'IUT (une fois par machine) :

```bash
PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=debian13-x64 npx playwright install chromium
```

## Ce que testent les fichiers

| Fichier | Ce qu'il teste | Résultat |
| --- | --- | --- |
| `unit/authorization.test.ts` | Qui peut gérer quel rôle (USER / ADMIN / SUDO), boutons modifier/supprimer, rôles proposés dans le formulaire, accès à `/data` | ✅ 32/32 |
| `models/user.dto.test.ts` | Validation du DTO utilisateur : rôle, e-mail, nom de 2 caractères minimum | ✅ 5/5 |
| `models/user.model.test.ts` | Table User : rôle USER par défaut, e-mail unique, suppression en cascade | ✅ 3/3 |
| `models/aquarium.model.test.ts` | Volumes > 0, volume net ≤ volume brut, propriétaire obligatoire, suppression en cascade | ✅ 8/8 |
| `models/water.model.test.ts` | Plages des mesures (température 0–50, pH 0–14, valeurs ≥ 0), règles des TargetRange, alertes conservées | ✅ 17/17 |
| `models/species.model.test.ts` | Plages et ordre min ≤ max des espèces, noms uniques, suppression interdite si utilisée | ✅ 20/20 |
| `models/maintenance.model.test.ts` | Intervalle ≥ 1, pourcentage d'eau 0–100, historique conservé, équipement et consommables | ✅ 12/12 |
| `models/migrations.test.ts` | `schema.prisma` correspond aux migrations SQL | ✅ 1/1 |
| `integration/auth.test.ts` | Inscription, connexion, contenu du jeton et de la session, rafraîchissement du profil | ✅ 14/14 |
| `integration/user.controller.test.ts` | Actions serveur sur une vraie base SQLite : droits USER / ADMIN / SUDO, pas d'auto-suppression, pas de hash renvoyé | ⚠️ 36/39 |
| `e2e/role-login.spec.ts` | Dans Chromium : connexion des 3 rôles, mauvais mot de passe, redirections, inscription, boutons et rôles selon le rôle | ✅ 7/7 |

Les tests de modèles et d'intégration utilisent une base SQLite temporaire construite à partir de `prisma/migrations`. `dev.db` n'est jamais touchée. Les tests E2E recréent `e2e.db` à chaque lancement.

## Échecs restants (normaux : fonctionnalités pas encore faites)

| Test | Pourquoi il échoue |
| --- | --- |
| `rejects a login token whose account was deleted` | `requireRole()` ne lit que le jeton de connexion : un compte supprimé peut encore agir jusqu'à l'expiration du jeton (30 jours par défaut). |
| `uses the role stored in the database, not the role in the login token` | Même cause : un ADMIN rétrogradé en USER garde ses droits tant que son jeton est valide. |
| `ADMIN > edits their own profile` | `assertCanManageTarget()` traite le compte de l'ADMIN connecté comme celui de n'importe quel autre ADMIN : il ne peut pas modifier son propre nom. |

Le comportement voulu pour ces 3 cas reste à décider par l'équipe. Pour les deux premiers, `requireRole()` pourrait par exemple lire le rôle en base, comme le fait `lib/auth/session.ts` (qui n'est plus utilisé).

## À noter

- Un SUDO peut se passer lui-même ADMIN : si c'est le dernier SUDO, plus personne ne peut gérer les comptes ADMIN.
