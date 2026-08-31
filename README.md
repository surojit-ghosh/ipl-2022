# Aiko IPL Data Platform

Read-only IPL 2022 explorer backed by PostgreSQL, Express, Prisma, and Next.js.

## Architecture

- `backend/`: Express API, Prisma schema/migrations, and idempotent seed.
- `frontend/`: Next.js web application.
- `db`: PostgreSQL 16.
- `docker-compose.dev.yml`: local development with reload.

All match analysis is historical archive data. The application has no live scores,
polling, authentication, or user-generated data.

## Local setup

Prerequisites: Docker Desktop and Docker Compose.

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
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

Stop services:

```powershell
docker compose -f docker-compose.dev.yml down
```

Add `-v` only when deleting the local PostgreSQL volume.

## Production images

Build both production images from the repository root:

```powershell
docker compose build
```

Apply migrations before starting a new database:

```powershell
docker compose -f docker-compose.dev.yml run --rm backend pnpm db:migrate
docker compose -f docker-compose.dev.yml run --rm backend sh -lc 'pnpm db:generate && pnpm db:seed'
docker compose up -d
```

The development backend runs migrations and seed against the shared database
before production services start. The production backend image includes the
generated Prisma client. Database credentials come from `backend/.env`; do not
commit environment files.

## CI

GitHub Actions runs backend typecheck/build, frontend lint/build, PostgreSQL
migration and seed verification, and production Docker image builds. It does
not push images or deploy infrastructure.

## Deployment boundary

Azure VM deployment is intentionally pending. No cloud credentials, registry
publishing, or deployment job is included in this repository.

## API areas

- `/api/matches`: match cards, scorecards, commentary, wagon-wheel shots, and archived snapshots.
- `/api/teams`, `/api/players`, `/api/venues`: browsing and detail pages.
- `/api/standings`: season table.
- `/api/stats`: batting, bowling, team, venue, and summary statistics.

Paginated match and player lists return `{ data, meta }`, where `meta` contains
`page`, `page_size`, `total_items`, and `total_pages`. Non-paginated collections
return `{ data }`. Invalid IDs and query values return `400 { error }`; missing
records return `404 { error }`.

## Data notes

The seed verifies 729 source files, 108 archived snapshots, 74 matches,
247 players, 148 innings, 296 officials, 20,749 commentary events, and
17,912 wagon-wheel shots. Career statistics contain six populated formats:
`test`, `odi`, `t20i`, `t20`, `lista`, and `firstclass`.

`/health` checks only that the process responds. `/ready` runs a database query
and returns `503` when PostgreSQL is unavailable.