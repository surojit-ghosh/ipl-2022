# Aiko IPL Data Platform

Read-only IPL 2022 explorer built with Next.js, Express, Prisma, and PostgreSQL.

## Live URLs

- Application: https://aiko.surojit.in
- Swagger UI: https://aiko.surojit.in/docs/
- OpenAPI JSON: https://aiko.surojit.in/openapi.json
- Health: https://aiko.surojit.in/health
- Database readiness: https://aiko.surojit.in/ready

## Architecture

```text
Browser
  -> Caddy (HTTPS, automatic Let's Encrypt certificates)
  -> Next.js frontend
  -> Express API
  -> PostgreSQL
```

Production runs on an Oracle Cloud Ubuntu VM with Docker Compose. Only Caddy publishes ports `80` and `443`; PostgreSQL, frontend, and backend remain on the internal Compose network.

## Stack

- Frontend: Next.js, React, TypeScript
- Backend: Express, TypeScript, Prisma
- Database: PostgreSQL 16
- Containers: Docker Compose
- Proxy and TLS: Caddy
- CI/CD: GitHub Actions and GitHub Container Registry (GHCR)

## Local development

Prerequisites: Docker Desktop and Docker Compose.

```powershell
Copy-Item backend/.env.example backend/.env
docker compose -f docker-compose.dev.yml up -d db
docker compose -f docker-compose.dev.yml run --rm backend pnpm db:migrate
docker compose -f docker-compose.dev.yml run --rm backend sh -lc 'pnpm db:generate && pnpm db:seed'
docker compose -f docker-compose.dev.yml up -d backend frontend
```

Open:

- UI: http://localhost:3000
- API: http://localhost:3001
- Swagger UI: http://localhost:3001/docs/
- OpenAPI JSON: http://localhost:3001/openapi.json
- Health: http://localhost:3001/health
- Database readiness: http://localhost:3001/ready

Stop local services:

```powershell
docker compose -f docker-compose.dev.yml down
```

Add `-v` only when intentionally deleting the local PostgreSQL volume.

## Database

The backend environment requires:

```env
DATABASE_URL=postgresql://aiko:aiko@db:5432/aiko
PORT=3001
```

Run migrations against the active Compose database:

```bash
docker compose run --rm migrate
```

Seed data manually when required:

```bash
docker compose run --rm migrate pnpm db:seed
```

The seed is idempotent. It validates 729 source files, 108 archived snapshots, 74 matches, 247 players, 148 innings, 296 officials, 20,749 commentary events, and 17,912 wagon-wheel shots.

## Production deployment

Production Compose pulls prebuilt images from GHCR:

- `ghcr.io/surojit-ghosh/ipl-2022-backend:latest`
- `ghcr.io/surojit-ghosh/ipl-2022-migrate:latest`
- `ghcr.io/surojit-ghosh/ipl-2022-frontend:latest`

This keeps expensive image builds off the 1 GB Oracle VM.

Required VPS files:

```text
backend/.env
Caddyfile
docker-compose.yml
```

Start or update manually on the VPS:

```bash
cd ~/projects/aiko
git pull --ff-only origin main
docker compose pull
docker compose up -d db
docker compose run --rm migrate
docker compose up -d --remove-orphans
```

Caddy issues and renews TLS certificates automatically when DNS for `aiko.surojit.in` points to the VM public IP.

## CI/CD

Pull requests run backend and frontend checks. Pushes to `main`:

1. Run backend migration, seed, typecheck, and build checks.
2. Run frontend lint and production build.
3. Build and publish backend, migration, and frontend images to GHCR.
4. SSH to the Oracle VM.
5. Pull images, apply migrations, and restart changed services.

The deploy workflow uses repository secrets:

```text
DEPLOY_HOST
DEPLOY_USER
DEPLOY_SSH_KEY
```

Production environment files and database credentials remain on the VPS and are not committed.

## API areas

- `/api/matches`: match cards, scorecards, commentary, wagon-wheel shots, and historical snapshots
- `/api/teams`, `/api/players`, `/api/venues`: browsing and detail data
- `/api/standings`: season table
- `/api/stats`: batting, bowling, team, venue, and summary statistics

Paginated match and player lists return `{ data, meta }`. Invalid IDs and query values return `400`; missing records return `404`.

## Data scope

All data is historical IPL 2022 archive data. This application has no live scores, polling, accounts, payments, or user-generated content.
