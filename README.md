# Todolist Backend

Une API REST pour planifier ses journées intelligemment — avec des blocs de temps, des priorités, et un système de gamification qui rend la productivité addictive.

---

## Ce que fait cette API

- **Planification** — crée des tâches, assigne-les à des blocs de temps fixes dans ton calendrier
- **Organisation** — catégories, tags, priorités personnalisées
- **Gamification** — XP, niveaux, streaks quotidiens et achievements débloqués automatiquement
- **Sécurité** — auth JWT avec access token (15min) + refresh token httpOnly

---

## Stack

| Couche | Technologie |
|---|---|
| Framework | NestJS 11 + TypeScript strict |
| Base de données | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7 |
| Auth | Passport JWT (access + refresh) |
| Validation | Zod |
| Sécurité | Helmet, Throttler, bcrypt |
| Tests | Jest (unitaires + E2E) |

---

## Structure du projet

```
src/
├── config/               # Validation des variables d'env (fail fast)
├── common/
│   ├── decorators/       # @CurrentUser, @Public
│   ├── filters/          # Gestion globale des erreurs
│   ├── guards/           # JWT access + refresh
│   ├── interceptors/     # Suppression des champs sensibles (passwordHash)
│   └── pipes/            # Validation Zod sur chaque requête
├── database/             # PrismaService injectable
└── modules/
    ├── auth/             # Register, login, refresh, logout
    ├── users/            # Profil utilisateur
    ├── tasks/            # CRUD tâches + déclenchement XP
    ├── time-blocks/      # Blocs de temps + assignation de tâches
    ├── categories/       # Catégories personnalisées
    ├── tags/             # Tags libres sur les tâches
    └── gamification/     # XP, niveaux, streaks, achievements
```

---

## Démarrage rapide

### Prérequis

- Node.js 18+
- Un compte [Neon](https://neon.tech) (base PostgreSQL serverless gratuite)

### 1. Cloner et installer

```bash
git clone <repo>
cd back
npm install
```

### 2. Configurer l'environnement

Copie le fichier exemple et remplis les valeurs :

```bash
cp .env.example .env
```

```env
# Connexion Neon (poolée pour l'app)
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=verify-full&connect_timeout=15"

# Base de test séparée (pour npm run test:e2e)
DATABASE_URL_TEST="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname-test?sslmode=verify-full&connect_timeout=15"

# Secrets JWT — génère-les avec :
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET="ton-secret-min-32-chars"
JWT_REFRESH_SECRET="ton-autre-secret-min-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

NODE_ENV="development"
PORT=3000
```

### 3. Initialiser la base de données

```bash
# Applique les migrations
npx prisma migrate deploy

# Génère le client TypeScript
npx prisma generate

# Insère les données de base (priorités + achievements)
npm run seed
```

### 4. Lancer le serveur

```bash
npm run start:dev
```

L'API est disponible sur `http://localhost:3000/api`.

---

## Routes disponibles

### Auth — public
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| POST | `/api/auth/refresh` | Renouveler l'access token |
| POST | `/api/auth/logout` | Se déconnecter |

### Protégées — Bearer token requis
| Méthode | Route | Description |
|---|---|---|
| GET/POST/PATCH/DELETE | `/api/tasks` | Gestion des tâches |
| PATCH | `/api/tasks/:id/status` | Changer le statut (déclenche XP si DONE) |
| GET/POST/PATCH/DELETE | `/api/time-blocks` | Blocs de temps |
| POST/DELETE | `/api/time-blocks/:id/tasks/:taskId` | Assigner une tâche à un bloc |
| GET/POST/PATCH/DELETE | `/api/categories` | Catégories |
| GET/POST/DELETE | `/api/tags` | Tags |
| GET | `/api/gamification/stats` | XP, niveau, streak |
| GET | `/api/gamification/stats/next-level` | XP nécessaire pour le prochain niveau |
| GET | `/api/gamification/achievements` | Achievements débloqués |

---

## Système de gamification

Chaque tâche complétée (`status: DONE`) déclenche automatiquement :

1. Attribution d'XP — `xpReward × priority.xpMultiplier`
2. Mise à jour du niveau selon les paliers
3. Mise à jour du streak (flame quotidienne comme Duolingo)
4. Évaluation et déblocage des achievements

### Paliers de niveau

| Niveau | XP requis |
|---|---|
| 1 | 0 |
| 2 | 50 |
| 3 | 120 |
| 4 | 220 |
| 5 | 370 |
| 6 | 570 |
| 7 | 820 |
| 8 | 1 150 |
| 9 | 1 600 |
| 10 | 2 200 |

---

## Tests

```bash
# Tests unitaires (logique gamification, streak, level)
npm test

# Tests E2E (endpoints HTTP sur base de test)
npm run test:e2e

# Tous les tests
npm run test:all
```

---

## Variables d'environnement requises

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion Neon (poolée) |
| `DATABASE_URL_TEST` | URL de la base de test (pour E2E) |
| `JWT_ACCESS_SECRET` | Secret access token (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret refresh token (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | Durée access token (ex: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Durée refresh token (ex: `7d`) |
| `NODE_ENV` | `development` ou `production` |
| `PORT` | Port du serveur (défaut: `3000`) |
