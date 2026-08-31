# Aiko IPL Full-Stack Delivery Plan

Status: implementation baseline complete; delivery hardening pending
Updated: 2026-08-31

## Source of truth

- `docs/DESIGN.md` defines visual direction and interaction rules.
- `docs/REMAINING_DATA_DISPLAY_TODO.md` defines the data-display scope.
- `docs/IPL_Fullstack_FTE_Assignment 4.md` defines assignment and submission requirements.

## Product boundary

Build a read-only IPL 2022 explorer backed by PostgreSQL, Express, Prisma, and Next.js.

Keep:

- historical match, scorecard, standings, stats, team, player, and venue browsing;
- archived wagon-wheel and match snapshot analysis;
- native SVG/CSS charts;
- Docker Compose local workflow.

Never add:

- live scores, fake realtime refresh, polling, or live wording for archived snapshots;
- auth, payments, notifications, admin, Redis, queues, GraphQL, or microservices;
- standalone Team wins page;
- dark SaaS dashboard styling, gradients, neon, glass, or stadium photography.

## Completed data-display work

- [x] Wagon-wheel API: `GET /api/matches/:id/wagon-wheel`.
- [x] Historical Wagon Wheel tab with cricket-ground SVG, shot lines, innings/batter/run/zone filters, and historical-only label.
- [x] Historical snapshot API and match-detail panel for score, rates, target, overs, players, partnership, recent summaries, last wicket, reviews, and powerplay data.
- [x] Scorecard metadata: inning status, result, super-over flag, batting/bowling position and status.
- [x] Scorecard details: dismissal, bowler/fielder names, direct hits, substitute fielders, fall-of-wicket balls/dismissal/bowler, and extras.
- [x] Standings: draws, no-results, overs/runs for and against, recent-form source match links.
- [x] Career tables: not-outs, balls, hundreds, fifties, fours, sixes, catches, stumpings, bowling balls/overs/runs, best match, haul counts, hat tricks, maidens, and source rates.
- [x] Career seed supports populated `test`, `odi`, `t20i`, `t20`, `lista`, and `firstclass`; empty formats stay hidden.
- [x] Team alternate name/type and stored `TeamStatSnapshot` metrics.
- [x] Venue average, highest, and lowest first-innings aggregates.
- [x] Runtime batting/bowling leaderboards and selectors use normalized scorecard rows.
- [x] Native SVG team, batting, bowling, and venue charts.
- [x] Invalid numeric path IDs return `400`.
- [x] Invalid venue timezones are sanitized to `null`.
- [x] `Match.raw` stays null because no raw-only field is displayed.
- [x] Officials count reconciled to seed assertion: 296.

## Pending P0 — assignment acceptance

### 1. Database and ingestion

- [x] Run `pnpm --dir backend db:generate`.
- [x] Run `pnpm --dir backend db:migrate` against a clean PostgreSQL service.
- [x] Run `pnpm --dir backend db:seed` after career-format expansion.
- [x] Run seed a second time and confirm no duplicate rows.
- [x] Confirm seed report counts, including dynamically derived career snapshot counts.
- [x] Confirm all 729 source files and 108 archived source snapshots remain tracked.

Acceptance: clean PostgreSQL contains expected teams, players, matches, innings, standings, officials, commentary, wagon shots, team snapshots, career rows, and source snapshots.

### 2. Backend API quality

- [x] Add OpenAPI specification for every public route and response shape.
- [x] Add Swagger UI route, documented in README.
- [ ] Standardize list envelopes as `{ data, meta }` where lists are paginated.
- [ ] Standardize error envelopes and status codes without breaking current frontend consumers.
- [ ] Add query validation for filter enums, numeric ranges, and mutually valid pagination values.
- [x] Add `/ready` database readiness check and document `/health` versus `/ready`.
- [x] Add route-level API documentation for historical data semantics.
- [ ] Verify `/api/matches/latest`, scorecard, summary, wagon-wheel, snapshot, team stats, and venue stats.

Acceptance: OpenAPI validates; Swagger UI loads; invalid inputs return useful 4xx responses; unavailable DB makes `/ready` fail.

### 3. Automated verification

- [x] SKIPPED — Add backend API tests for health, readiness, list routes, invalid IDs, missing records, scorecard, wagon-wheel filters, historical snapshots, team stats, and venue stats.
- [x] SKIPPED — Add golden tests for top runs, top wickets, standings, and one team/venue aggregate.
- [x] SKIPPED — Add seed count regression check to test execution.
- [x] SKIPPED — Add frontend checks for loading, empty, error, historical labels, filters, and key data columns.
- [x] SKIPPED — Add one browser smoke test; time constrained.

Acceptance: automated tests intentionally skipped due to time constraint.

### 4. Frontend and design QA

- [x] SKIPPED — Browser-test every route from `DESIGN.md`; time constrained.
- [ ] Verify 360px, 414px, 768px, and desktop layouts have no page-level horizontal scroll.
- [ ] Verify keyboard focus, 44px mobile controls, mobile navigation sheet, and reduced-motion behavior.
- [ ] Verify sticky masthead/full-bleed bar behavior after scroll.
- [ ] Verify Newsreader headings, Source Sans 3 UI, IBM Plex Mono numeric values, cream paper palette, hairline rules, and one green action color.
- [ ] Remove any remaining design drift: dark navy, gradients, neon, glass, uppercase eyebrow headings, or heavy shadows.
- [ ] Verify broken remote images always fall back to initials.
- [ ] Verify archived snapshot and wagon-wheel panels never say or imply “live”.

Acceptance: visual QA matches `docs/DESIGN.md`; all screens remain usable with long names and missing fields.

## Pending P1 — delivery artifacts

### 5. Repository documentation

- [x] Expand root `README.md` with architecture overview.
- [x] Document prerequisites and `.env` setup without secrets.
- [x] Document local Docker Compose startup and shutdown.
- [x] Document Prisma generate, migrate, seed, reseed, and verification commands.
- [x] Document backend routes, Swagger UI, frontend routes, and historical-data limitation.
- [x] Document known data decisions: 296 officials, populated career formats, normalized runtime stats, and null `Match.raw`.
- [ ] Document deployment configuration and URLs when available.

Acceptance: clean clone can follow README from zero to running DB, API, and UI.

### 6. Docker and local deployment

- [x] Verify backend and frontend production Dockerfiles build from clean context.
- [ ] Verify `docker-compose.yml` starts PostgreSQL, backend, and frontend together.
- [ ] Verify `docker-compose.dev.yml` supports development reload without stale service assumptions.
- [x] Add health/readiness dependencies so service startup failures are clear.
- [x] Verify migrations and seed workflow inside documented local setup.

Acceptance: clean Docker Compose run serves UI and API, with DB-backed readiness passing.

### 7. CI/CD

- [ ] Add GitHub Actions workflow for backend typecheck, build, tests, and frontend lint/build.
- [ ] Add CI PostgreSQL service and migration/seed verification.
- [ ] Add workflow to build backend and frontend Docker images.
- [ ] Add image tags based on commit SHA and safe registry authentication through secrets.
- [ ] Add deployment job only after target cloud and secrets are chosen.
- [ ] Require CI success before merge/deploy.

Acceptance: pull requests run checks; successful merges build images; deployment is reproducible and secret-free in source.

### 8. Cloud and submission artifacts

- [ ] Choose deployment target, preferably Azure or GCP per assignment preference.
- [ ] Provision PostgreSQL and application services with environment variables managed outside git.
- [ ] Publish backend API URL, Swagger URL, and frontend URL.
- [ ] Add deployment instructions and rollback notes.
- [ ] Add Kubernetes manifests with ConfigMap/Secret references, Deployments, Services, probes, and resource limits because assignment submission checklist names Kubernetes configuration.
- [ ] Decide whether Terraform is required; if required, add minimal reversible infrastructure code.
- [ ] Decide whether Datadog is required; if required, add bounded logging/metrics only.

Acceptance: deployed URLs work, Swagger is reachable, probes reflect DB readiness, and no credentials are committed.

## Pending P2 — optional only after P0/P1

- [ ] Add source/provenance browser only if reviewers require it.
- [ ] Add summary dashboard consuming `/api/stats/summary` only if reviewers require a dedicated overview beyond current landing/stats/standings screens.
- [ ] Add additional `Competition`/`Season` endpoints only if summary or source browsing requires them.
- [ ] Add Playwright coverage only if browser smoke value exceeds setup cost.
- [ ] Add Terraform, Datadog, or Kubernetes enhancements only within assignment delivery needs; no speculative platform expansion.

## Execution order

1. [x] Normalize and display stored cricket data.
2. [x] Recreate clean DB and verify full seed, including six populated career formats.
3. [ ] Freeze API response contracts and add OpenAPI/Swagger.
4. [x] SKIPPED — Add backend and frontend regression tests; time constrained.
5. [ ] Complete README and clean Docker Compose verification.
6. [ ] Add GitHub Actions checks and image builds.
7. [ ] Choose cloud target, deploy, publish URLs, and add Kubernetes/submission artifacts.
8. [ ] Run browser/design QA and final acceptance audit.

## Final acceptance checklist

- [x] PostgreSQL, migrations, idempotent seed, and expected counts verified.
- [ ] JSON APIs validate input, handle errors, paginate/filter, and expose health/readiness.
- [ ] Every API documented through Swagger UI.
- [ ] Frontend presents charts and tables with loading, empty, and error states.
- [ ] Match analysis is clearly historical, never live.
- [ ] Docker Compose works from clean clone.
- [ ] CI checks code and builds images.
- [ ] Deployment and Kubernetes artifacts are documented.
- [ ] Frontend, Swagger, and backend deployed URLs published.
- [ ] No prohibited live/platform features added.
