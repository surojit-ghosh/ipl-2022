# IPL 2022 Data Platform - Product and Engineering Plan

Status: implementation-ready; PDF and dataset revalidated 2026-08-30  
Assignment source: `IPL_Fullstack_FTE_Assignment 4.pdf`  
Dataset source: `Indian_Premier_League_2022-03-26/`  
Target product: a polished, read-only IPL 2022 results and analytics application

---

## 1. Executive decision

Build a production-shaped historical IPL analytics product, not a generic CRUD demo and not a fake live-score service.

The application will:

- load the supplied dataset into PostgreSQL through a repeatable, validated import;
- expose a versioned read-only JSON API with OpenAPI documentation;
- calculate season aggregates from scorecard facts instead of serving duplicated leaderboard files;
- preserve non-derivable source data such as commentary, wagon-wheel coordinates, official standings, and career snapshots;
- provide a responsive Next.js interface for matches, scorecards, commentary, wagon wheels, standings, teams, players, venues, and leaderboards;
- run locally with Docker Compose and deploy to Azure with GitHub Actions;
- include tests, source reconciliation, observability, security controls, and honest data-provenance notes.

### Deliberate non-goals

- No authentication or admin dashboard. The assignment describes a public, read-only data product.
- No fake real-time updates. Every match in the dataset is completed.
- No Redis initially. The dataset is small and immutable; HTTP/CDN and client caches are sufficient.
- No GraphQL. REST maps cleanly to the resources and gives Swagger/OpenAPI with less work.
- No microservices. One API, one frontend, one PostgreSQL database, and one import job are enough.
- No event bus, background worker, Elasticsearch, data warehouse, or Kubernetes runtime for the first release.
- No hand-maintained aggregate tables. Add materialized views only after measured query evidence.

The main quality signal should be correctness, traceability, a coherent product, and a clean deployment. Feature count is secondary, as the PDF explicitly states.

---

## 2. What the PDF actually requires

### Core requirements

| Area | Required result |
| --- | --- |
| Database | PostgreSQL relational schema, migrations, and loaded dataset |
| Backend | Node.js or Python APIs returning JSON |
| API behavior | Pagination and filtering where applicable, validation, error handling, and health check |
| API documentation | OpenAPI plus Swagger UI |
| Frontend | React/Next.js or equivalent, multiple screens, charts, tables, and loading/empty/error states |
| Containers | Backend and frontend Dockerfiles plus Docker Compose for local development |
| CI/CD | GitHub Actions for lint, tests, Docker builds, and deployment after successful merges |
| Cloud | Any major provider; Azure or GCP preferred; deployment is described as a far-fetched goal |

### Stretch requirements

- Terraform for infrastructure provisioning.
- Datadog monitoring, logging, and dashboards.
- Kubernetes deployment using ConfigMaps and Helm.

### Submission checklist

- Clear architecture README.
- Local and deployed setup instructions.
- Database schema and migrations.
- Dockerfiles and `docker-compose.yml`.
- GitHub Actions workflows.
- Kubernetes configuration files.
- OpenAPI documentation access.
- Deployed application URLs.

Kubernetes is called a stretch goal but also appears in the submission checklist. Resolve that contradiction by supplying valid, thin manifests after the real container deployment works. Do not make Kubernetes the primary deployment unless the evaluator explicitly requires a running cluster.

---

## 3. Dataset audit

### Observed inventory

| Source folder | Files | Approx. size | Observed grain | Product treatment |
| --- | ---: | ---: | --- | --- |
| `teams/` | 1 | 3 KB | 10 team profiles | Normalize |
| `squads/` | 1 | 171 KB | 10 team squads, 247 unique players | Normalize players and season squad membership |
| `matches/` | 1 | 168 KB | 74 match summaries | Normalize as base match facts |
| `match_info/` | 74 | 167 KB | one detailed document per match | Merge into the same match facts; do not make a duplicate table |
| `scorecards/` | 74 | 3.9 MB | 148 innings and scorecard facts | Normalize; primary source for season statistics |
| `standings/` | 1 | 7 KB | official league table for 10 teams | Normalize as official snapshot |
| `player_career_stats/` | 247 | 951 KB | one current career snapshot per player | Normalize by player and format |
| `match_innings_commentary/` | 148 | 19.3 MB | one document per innings; 20,749 events | Normalize ball/event facts |
| `match_wagon_wheel/` | 74 | 1.66 MB | shot/event rows; 17,912 rows | Normalize coordinates and event fields |
| `match_live_details/` | 74 | 3.73 MB | final live-state snapshot per completed match | Archive only; optional diagnostic endpoint |
| `batting_stats/` | 11 | 1.04 MB | precomputed leaderboard snapshots | Archive and reconcile; derive product values |
| `bowling_stats/` | 11 | 1.02 MB | precomputed leaderboard snapshots | Archive and reconcile; derive product values |
| `team_stats/` | 12 | 181 KB | precomputed team-stat snapshots | Archive and reconcile; derive product values |

Expected import manifest: 729 JSON files.

### Verified cardinalities

- 10 teams.
- 74 completed matches: 70 league matches plus Qualifier 1, Eliminator, Qualifier 2, and Final.
- 6 venues.
- 148 innings; every match has exactly 2 innings.
- 247 player profiles and 247 career-stat documents.
- 20,749 commentary events.
- 17,912 wagon-wheel rows.
- All 148 innings yield exactly 11 members from `batsmen + did_not_bat`.
- No DLS-affected matches in this dataset.
- Every supplied squad member appears in scorecard metadata, but only 191 unique players appear in the inferred playing XIs.

### Data traps that the implementation must handle

1. IDs alternate between JSON strings and numbers. Convert valid IDs to PostgreSQL `BIGINT`; convert empty strings to `NULL`.
2. Booleans occur as booleans, `"true"`, `"false"`, `0`, and `1`. Parse them explicitly.
3. Cricket overs are base-six notation. `17.4` means 17 overs and 4 legal balls, not 17.4 overs. Persist legal balls as an integer and format overs at the API edge.
4. Commentary uses zero-based over values in some payloads. Preserve source values and expose an explicit display-over field.
5. Source commentary event IDs are unique when present, but all 2,837 `overend` records omit them. Use an internal key plus a nullable source event ID. Do not identify a delivery only by `over.ball`, because wides/no-balls can repeat a ball number.
6. Wagon rows are positional arrays described by `wagon_fields`; map by the header, never hard-code an undocumented index order without validation.
7. Wagon rows do not have reliable commentary event foreign keys. Keep a generated row key and treat any event join as best effort.
8. `matches.json`, `match_info/*`, scorecards, and final live payloads repeat match state. A source-precedence policy is required.
9. A scorecard `players` array contains 22-52 metadata records. It is not the playing XI. Infer each batting team's XI from `innings.batsmen + innings.did_not_bat`, which is exactly 11 in all 148 innings.
10. A match can show 23 participants when substitute fielders are included. Store XI membership separately from fielding participation.
11. The squad `gmdate` is `2024-05-23`, leaderboard metadata is modified in July 2024, and current team branding says "Royal Challengers Bengaluru." Match facts are from 2022. Treat profiles and career numbers as later snapshots, not historical 2022 truth.
12. For the 2022 UI, use season-specific team names from match data, including "Royal Challengers Bangalore," while retaining the current profile name separately.
13. Venue `timezone` values are unreliable. Use Unix timestamps as canonical UTC and render in `Asia/Kolkata`; retain source timezone only for audit.
14. Remote logo URLs can break or change. Provide an initials fallback, dimensions, and allowlisted remote image host. Do not make a successful page dependent on every remote image.
15. Official standings cover only the 70 league matches, while team-win leaderboards include playoffs. Every aggregate must declare its scope: `league`, `playoffs`, or `all`.
16. Official net run rate has cricket-specific all-out rules. Calculate it for reconciliation, but present the official snapshot as canonical if a rounding/rules discrepancy remains.
17. Rate fields may have zero denominators. APIs return `null`, never `Infinity`, `NaN`, or a fabricated zero.

---

## 4. Product scope and information architecture

### Primary user jobs

1. Understand the 2022 season outcome and leaders quickly.
2. Find a match by team, venue, stage, or date and inspect its result.
3. Read a complete scorecard without losing match context.
4. Explore ball commentary and wagon-wheel data.
5. Compare teams and player season performance.
6. Distinguish 2022 season statistics from source-provided career snapshots.
7. Understand where a value came from and how it was calculated.

### Top-level navigation

- Overview
- Matches
- Standings
- Stats
- Teams
- Players
- Venues

This is an analytics application, so the first screen is the working season dashboard, not a marketing landing page.

### Release tiers

**Release 1, required:** dashboard, matches, scorecard, standings, batting/bowling/team statistics, teams, players, venues, OpenAPI, Docker, CI, deployment.

**Release 1.1, differentiating:** commentary, wagon-wheel visualization, data provenance page, calculated-versus-official reconciliation.

**Release 2, only if time remains:** Terraform, Datadog, Helm chart, advanced comparisons, global search, and saved/shareable comparisons.

---

## 5. Chosen technology stack

### Application stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Database | PostgreSQL 16+ | Assignment requirement, relational analytics, mature indexing |
| Runtime | Node.js current LTS, TypeScript | One language and toolchain across API, importer, and frontend |
| Backend | Express 5 | Requested, mature, small, and sufficient for a read-only REST API |
| ORM/query | Prisma ORM plus typed raw SQL for aggregates | Productive relational access without forcing analytics into ORM abstractions |
| PostgreSQL driver | Prisma PostgreSQL adapter plus `pg` | Explicit PostgreSQL connectivity and pooling |
| Validation/settings | Zod plus a small typed environment module | Reuse request/response schemas for validation and OpenAPI |
| API documentation | Zod-to-OpenAPI plus Swagger UI | Express has no native OpenAPI generation |
| Migrations | Prisma Migrate | Schema and migration history stay in the TypeScript toolchain |
| API tests | Vitest, Supertest, Testcontainers for Node | HTTP and real-PostgreSQL integration coverage |
| Frontend | Next.js App Router, React, TypeScript | Routing, server rendering, metadata, strong ecosystem |
| Styling/components | Tailwind CSS, shadcn/ui, Radix primitives, Lucide icons | Accessible primitives without a proprietary component system |
| Server state | TanStack Query | Cache lifecycle, retries, pagination, and request deduplication |
| Tables | TanStack Table | Sortable, responsive, accessible data tables |
| URL state | `nuqs` or a tiny typed search-param layer | Shareable filters and correct Back/Forward behavior |
| Charts | Recharts | Sufficient for leaderboard and comparison charts |
| Wagon view | Purpose-built responsive SVG | The source data is already x/y coordinates; a large chart dependency is unnecessary |
| API client | `openapi-typescript` plus `openapi-fetch` | Backend contract generates frontend types |
| Frontend tests | Vitest, Testing Library, Playwright, axe | Unit, interaction, E2E, and accessibility coverage |
| Containers | Multi-stage Dockerfiles and Docker Compose | Required and reproducible |
| CI/CD | GitHub Actions with OIDC | Required; avoids long-lived Azure credentials |
| Cloud | Azure Container Apps, Azure Database for PostgreSQL, ACR | Low-ops container deployment and preferred provider |

### Dependencies intentionally not selected

- No Axios; the platform `fetch` API and generated OpenAPI client are enough.
- No Redux; there is no complex client-owned global state.
- No React Hook Form; filters can use URL state and controlled inputs.
- No queue/worker framework; ingestion is a one-shot Node.js command/job.
- No Redis until an explicit cache threshold is breached.
- No Prisma-only query rule. Complex aggregates should use readable parameterized PostgreSQL SQL with tests.
- No Turborepo; pnpm workspaces and root scripts are sufficient.

Pin exact versions in lockfiles at implementation time rather than copying transient version numbers into this plan.

### API package baseline

Runtime packages:

- `express`, `helmet`, and `cors`;
- `@prisma/client`, the Prisma PostgreSQL adapter, and `pg`;
- `zod`, a maintained Zod-to-OpenAPI generator, and `swagger-ui-express`;
- `pino` and `pino-http`;
- `lru-cache` for calculated response caching.

Development packages:

- `prisma`, `typescript`, and `tsx`;
- `vitest`, `supertest`, and Testcontainers for Node;
- TypeScript type packages required by Express, PostgreSQL, and Supertest.

Use pnpm's exact lockfile as the version authority. Do not add a repository abstraction package, DI container, cache framework, or response-mapping library until ordinary TypeScript functions are demonstrably insufficient.

---

## 6. Repository structure

```text
/
|-- apps/
|   |-- api/
|   |   |-- prisma/                 # schema, migrations, seed only
|   |   |-- src/
|   |   |   |-- server.ts
|   |   |   |-- app.ts              # mount modules
|   |   |   |-- env.ts
|   |   |   |-- db/                 # Prisma client
|   |   |   |-- shared/             # pagination, errors, overs math
|   |   |   `-- modules/            # one folder per domain
|   |   |       |-- health/
|   |   |       |-- meta/
|   |   |       |-- seasons/
|   |   |       |-- teams/
|   |   |       |-- players/
|   |   |       |-- venues/
|   |   |       |-- matches/
|   |   |       |-- standings/
|   |   |       `-- stats/
|   |   |-- tests/
|   |   |-- package.json
|   |   `-- Dockerfile
|   `-- web/
|       |-- app/                    # routes only: page, layout, loading, error
|       |-- features/               # one folder per screen job
|       |   |-- overview/
|       |   |-- matches/
|       |   |-- standings/
|       |   |-- stats/
|       |   |-- teams/
|       |   |-- players/
|       |   |-- venues/
|       |   `-- about-data/
|       |-- components/ui/          # shadcn primitives only
|       |-- lib/api/                # generated OpenAPI client
|       |-- tests/
|       |-- package.json
|       `-- Dockerfile
|-- docs/
|-- data/                           # IPL 2022 JSON
|-- deploy/
|-- compose.yaml
|-- package.json
`-- pnpm-workspace.yaml
```

### Backend is module-wise

Each `apps/api/src/modules/<name>/` owns that HTTP surface:

```text
routes.ts       Express router, /api/v1/...
schemas.ts      Zod request + response
service.ts      rules and calculations
repository.ts   Prisma / SQL
```

`app.ts` only mounts modules. No global `routes/`, `services/`, or `repositories/` piles. Shared pagination, problem-details, and cricket math stay in `shared/`. Seed stays `prisma/seed.ts`.

### Frontend is feature-wise

Each `apps/web/features/<name>/` owns that product job (components, hooks, table/chart views).  
`app/` files stay thin: import the feature, set metadata. No page-sized logic in `app/`.  
`components/ui/` is shadcn only — no match-scorecard there.

Generated OpenAPI client: `apps/web/lib/api/generated/`. CI fails if regeneration diffs.

---

## 7. Source ownership and seed policy

### Source precedence

When fields disagree, apply this explicit order:

1. Scorecard for final match result, innings, awards, and player performance.
2. `match_info/*` for detailed match metadata.
3. `matches/matches.json` for collection completeness and base metadata.
4. `teams/` and `squads/` for current profile metadata, labeled with their later snapshot date.
5. Official `standings/` for displayed league table and NRR.
6. Precomputed stat folders only as reconciliation references.
7. Final `match_live_details/` only as an archived terminal snapshot.

Never silently overwrite a conflicting non-empty value. Record conflicts in the import report with source, entity, field, old value, and new value.

### Normalize, archive, or derive

| Family | Normalize into queryable tables | Archive source payload | Derive at request time |
| --- | --- | --- | --- |
| Teams | Yes | Manifest only | No |
| Squads/player profiles | Yes | Manifest only | Age may be derived from birthdate |
| Matches + match info | Merge into one model | Manifest for both | Display score from innings |
| Scorecards | Yes | Manifest only | All season aggregates |
| Standings | Yes, official snapshot | Manifest only | W/L/points and NRR audit |
| Career stats | Yes by format | Manifest only | No; 2022 data cannot reproduce careers |
| Commentary | Yes | Manifest only | Over summaries may be derived |
| Wagon wheel | Yes | Manifest only | Zone/player summaries may be derived |
| Live detail | No dedicated normalized schema | Yes, JSONB | Do not present as real live data |
| Batting/bowling/team stats | No dedicated leaderboard tables | Yes, JSONB | Yes, from scorecards |

"Archive" means one `source_snapshots` row per non-normalized JSON document plus a `source_files` manifest row. It does not mean adding a product table that can drift from scorecard facts.

### Seed lifecycle

1. Discover every `*.json` beneath the dataset root.
2. Create a `dataset_imports` row with dataset version, source path, start time, and status.
3. Hash every source file with SHA-256 and insert/update the `source_files` manifest.
4. Validate JSON through folder-specific Zod source schemas.
5. Load stable reference entities: competition, season, teams, season teams, venues, players.
6. Load squad memberships.
7. Load `matches.json`; merge each `match_info` document using the precedence rules.
8. Load scorecards, innings, XIs, batting, bowling, fielding, extras, and wickets.
9. Load official standings.
10. Load career snapshots.
11. Resolve commentary and wagon documents through `inning_id -> match_id`; do not parse identity from filenames.
12. Archive live and precomputed snapshot documents.
13. Run reconciliation and acceptance assertions.
14. Mark the import `ready` only in the same transaction/version switch used to expose it.

### Idempotency

- Use source IDs and natural composite keys with `INSERT ... ON CONFLICT DO UPDATE`.
- If a file hash has not changed for the same dataset version, skip its transform.
- A rerun must not increase row counts.
- Failed imports remain recorded as `failed` with an error summary, but are never exposed as the current dataset.
- A changed dataset creates a new import version; activation is atomic after all checks pass.

### Seed command

```bash
pnpm db:seed
```

That is the only data-loading command. It is not exposed as an HTTP endpoint.

### Prisma seed script

- `apps/api/prisma/seed.ts` is the canonical local/evaluator seed entrypoint.
- It discovers, validates, transforms, upserts, reconciles, and reports in one execution.
- Keep one entrypoint and one command. Small imported helper functions are acceptable when they keep the seed readable, but there must not be separate ingest/verify/report executables.
- Read the dataset path from `IPL_DATASET_PATH`, defaulting to the repository dataset directory in local development.
- Run `prisma migrate deploy` before seeding; the seed script never creates or mutates schema.
- The seed is idempotent: repeated runs verify hashes and leave normalized row counts unchanged.
- It runs the full reconciliation suite and exits non-zero on invalid JSON, unresolved foreign keys, count mismatches, or golden-stat failures.
- Configure Prisma's seed command to execute the compiled/`tsx` TypeScript entrypoint, and expose a root `pnpm db:seed` script.
- Production uses the same seed entrypoint inside the one-shot Container Apps import job.

---

## 8. Relational schema

Use `BIGINT` for source entity IDs, `INTEGER` for counts/balls, `NUMERIC` for rate snapshots, `TIMESTAMPTZ` for instants, `DATE` for season dates, PostgreSQL enums or checked text for small stable domains, and JSONB only for irregular archived payloads.

Every normalized table gets `created_at`, `updated_at`, and where relevant `dataset_import_id`. Do not expose those internal fields by default.

Prisma owns the model and migration history, but PostgreSQL remains authoritative. Add reviewed SQL to generated Prisma migrations for CHECK constraints, partial indexes, and other PostgreSQL features that Prisma Schema Language cannot express directly. Never remove those clauses by blindly regenerating a migration.

### Provenance and season tables

#### `dataset_imports`

- `id UUID PK`
- `dataset_key TEXT` such as `ipl-2022`
- `version TEXT UNIQUE`
- `source_sha256 TEXT`
- `status TEXT CHECK (loading, ready, failed, superseded)`
- `started_at`, `completed_at TIMESTAMPTZ`
- `file_count`, `error_count`, `warning_count INTEGER`
- `report JSONB`

#### `source_files`

- `id BIGSERIAL PK`
- `dataset_import_id UUID FK`
- `relative_path TEXT`
- `source_family TEXT`
- `sha256 TEXT`
- `byte_size BIGINT`
- `record_count INTEGER NULL`
- `status TEXT`
- unique `(dataset_import_id, relative_path)`

#### `source_snapshots`

- `id BIGSERIAL PK`
- `dataset_import_id UUID FK`
- `source_file_id BIGINT FK`
- `snapshot_type TEXT` such as `live`, `batting_most_runs`, or `team_highest_score`
- `match_id BIGINT NULL`
- `payload JSONB`
- unique `(dataset_import_id, source_file_id)`

#### `competitions`

- `id BIGINT PK` from `competition.cid`
- `name`, `abbreviation`, `category`, `country_code`

#### `seasons`

- `id BIGSERIAL PK`
- `competition_id BIGINT FK`
- `slug TEXT UNIQUE` such as `ipl-2022`
- `label TEXT`
- `year SMALLINT`
- `starts_on`, `ends_on DATE`
- `total_matches`, `total_teams INTEGER`
- `active_dataset_import_id UUID FK`

### Team, player, and venue tables

#### `teams`

- `id BIGINT PK` from `tid`
- `current_name`, `current_short_name`, `alternate_name`
- `country_code`, `team_type`, `sex`
- `logo_url`, `thumbnail_url`
- `profile_as_of DATE NULL`

#### `season_teams`

- `season_id BIGINT FK`
- `team_id BIGINT FK`
- `display_name`, `short_name`, `logo_url`
- `source_name`
- PK `(season_id, team_id)`

This table protects historical naming from later profile updates.

#### `players`

- `id BIGINT PK` from `pid`
- `display_name`, `short_name`, `first_name`, `middle_name`, `last_name`
- `birth_date`, `birth_place`
- `country_code`, `nationality`
- `playing_role`, `batting_style`, `bowling_style`, `fielding_position`
- `profile_image_url`, `thumbnail_url`
- social URLs retained only if the player page actually uses them; otherwise omit them from the public response
- `profile_as_of DATE NULL`

#### `season_squad_members`

- `season_id BIGINT FK`
- `team_id BIGINT FK`
- `player_id BIGINT FK`
- `source_snapshot_date DATE`
- PK `(season_id, team_id, player_id)`

Name this a source squad snapshot in the UI because its `gmdate` is in 2024.

#### `venues`

- `id BIGINT PK`
- `name`, `city`, `country`
- `source_timezone TEXT NULL` for audit only

### Match tables

#### `matches`

- `id BIGINT PK` from `match_id`
- `season_id BIGINT FK`
- `title`, `short_title`, `subtitle`, `match_number`
- `stage TEXT CHECK (league, qualifier_1, eliminator, qualifier_2, final)`
- `format_code SMALLINT`, `format_name`
- `status_code SMALLINT`, `status_name`, `status_note`
- `starts_at`, `ends_at TIMESTAMPTZ`
- `venue_id BIGINT FK`
- `team_a_id`, `team_b_id BIGINT FK`
- `toss_winner_team_id BIGINT NULL`, `toss_decision TEXT NULL`
- `winning_team_id BIGINT NULL`
- `result_text`, `result_type`, `win_margin INTEGER NULL`
- `dls_affected BOOLEAN`
- `verified BOOLEAN`
- `has_commentary`, `has_wagon BOOLEAN`

Do not persist team score strings as the canonical score. Return formatted innings values.

#### `match_officials`

- `match_id BIGINT FK`
- `role TEXT CHECK (umpire, referee)`
- `source_person_id BIGINT NULL`
- `name TEXT`
- `position SMALLINT`
- PK `(match_id, role, position)`

#### `match_awards`

- `match_id BIGINT FK`
- `award_type TEXT CHECK (player_of_match, player_of_series)`
- `player_id BIGINT NULL FK`
- `source_name TEXT`
- PK `(match_id, award_type)`

#### `match_playing_xi`

- `match_id BIGINT FK`
- `team_id BIGINT FK`
- `player_id BIGINT FK`
- `batting_order SMALLINT NULL`
- `is_did_not_bat BOOLEAN`
- PK `(match_id, team_id, player_id)`

Construct this only from the batting innings `batsmen + did_not_bat`, not the scorecard `players` metadata list.

### Innings fact tables

#### `innings`

- `id BIGINT PK` from `iid`
- `match_id BIGINT FK`
- `number SMALLINT`
- `name`, `short_name`
- `batting_team_id`, `fielding_team_id BIGINT FK`
- `status_code`, `result_code SMALLINT`
- `runs`, `wickets`, `legal_balls INTEGER`
- `declared_overs_text TEXT` for source audit
- `max_overs SMALLINT`
- `target_runs INTEGER NULL`
- `is_super_over BOOLEAN`
- `run_rate NUMERIC(8,3) NULL`
- unique `(match_id, number)`

#### `innings_batting`

- `innings_id BIGINT FK`
- `player_id BIGINT FK`
- `position SMALLINT`
- `role TEXT`
- `runs`, `balls`, `fours`, `sixes`, `dot_balls INTEGER`
- `dismissal_kind`, `dismissal_text`
- `is_out BOOLEAN`
- `bowler_id`, `fielder_1_id`, `fielder_2_id`, `fielder_3_id BIGINT NULL`
- source `strike_rate NUMERIC` only for reconciliation; API calculates it
- PK `(innings_id, player_id)`

#### `innings_bowling`

- `innings_id BIGINT FK`
- `player_id BIGINT FK`
- `position SMALLINT`
- `legal_balls`, `maidens`, `runs_conceded`, `wickets`, `no_balls`, `wides`, `dot_balls INTEGER`
- `bowled_count`, `lbw_count INTEGER`
- source `economy NUMERIC` only for reconciliation; API calculates it
- PK `(innings_id, player_id)`

#### `innings_fielding`

- `innings_id BIGINT FK`
- `player_id BIGINT FK`
- `catches`, `runout_thrower`, `runout_catcher`, `runout_direct_hit`, `stumpings INTEGER`
- `is_substitute BOOLEAN`
- PK `(innings_id, player_id)`

#### `innings_fall_of_wickets`

- `innings_id BIGINT FK`
- `wicket_number SMALLINT`
- `player_id BIGINT FK`
- `bowler_id BIGINT NULL FK`
- `batter_runs`, `batter_balls`, `team_score`, `legal_ball_number INTEGER`
- `dismissal_kind`, `dismissal_text`
- PK `(innings_id, wicket_number)`

#### `innings_extras`

- `innings_id BIGINT PK/FK`
- `byes`, `leg_byes`, `wides`, `no_balls`, `penalty`, `total INTEGER`

Do not normalize empty review, transient partnership, previous-over, or last-five-over objects for a completed historical product. Preserve them only if needed in a source archive/report.

### Commentary and wagon tables

#### `commentary_events`

- `id BIGSERIAL PK`
- `source_event_id BIGINT NULL`
- `match_id`, `innings_id BIGINT FK`
- `event_type TEXT`
- `source_over`, `source_ball SMALLINT`
- `sequence_no INTEGER` stable within innings
- `occurred_at TIMESTAMPTZ NULL`
- `batter_id`, `bowler_id BIGINT NULL FK`
- `total_runs`, `bat_runs`, `no_ball_runs`, `wide_runs`, `bye_runs`, `leg_bye_runs INTEGER`
- `is_no_ball`, `is_wide`, `is_four`, `is_six`, `is_wicket BOOLEAN`
- `commentary`, `detail_text TEXT`
- optional striker/non-striker and bowler snapshot JSONB only if the UI uses it
- unique `(innings_id, sequence_no)`
- partial unique index on `source_event_id` where it is not null

#### `wagon_shots`

- `id BIGSERIAL PK`
- `match_id`, `innings_id BIGINT FK`
- `sequence_no INTEGER`
- `batter_id`, `bowler_id BIGINT FK`
- `source_over NUMERIC`, `bat_runs`, `team_runs INTEGER`
- `x`, `y NUMERIC`
- `zone_id SMALLINT`, `zone_name TEXT`
- `event_name TEXT`
- `unique_over NUMERIC`
- unique `(innings_id, sequence_no)`

### Official and career snapshot tables

#### `standings_official`

- `season_id`, `team_id BIGINT FK`
- `position SMALLINT`
- `played`, `won`, `lost`, `drawn`, `no_result`, `points INTEGER`
- `runs_for`, `balls_for`, `runs_against`, `balls_against INTEGER`
- `net_run_rate NUMERIC(8,3)`
- `last_five_match_ids BIGINT[]`
- `last_five_results TEXT[]`
- PK `(season_id, team_id)`

#### `player_career_batting`

- `player_id BIGINT FK`
- `format TEXT CHECK (test, odi, t20i, t20)`
- matches, innings, not-outs, runs, balls, highest, hundreds, fifties, fours, sixes, catches, stumpings
- source average and strike rate for reconciliation
- `snapshot_as_of DATE NULL`
- PK `(player_id, format)`

#### `player_career_bowling`

- `player_id BIGINT FK`
- `format TEXT`
- matches, innings, balls, runs, wickets, four/five/ten-wicket hauls, hat-tricks
- best innings and match text
- source economy, average, and strike rate
- `snapshot_as_of DATE NULL`
- PK `(player_id, format)`

### Indexes

- `matches (season_id, starts_at DESC, id DESC)`
- `matches (season_id, stage, starts_at)`
- `matches (team_a_id, starts_at)` and `(team_b_id, starts_at)` or a queryable match-team view
- `matches (venue_id, starts_at)`
- `season_squad_members (team_id, player_id)`
- `match_playing_xi (player_id, match_id)`
- `innings (match_id, number)`
- `innings_batting (player_id, innings_id)`
- `innings_bowling (player_id, innings_id)`
- `commentary_events (match_id, innings_id, sequence_no)`
- `commentary_events (innings_id, source_over, source_ball)`
- `commentary_events (source_event_id) WHERE source_event_id IS NOT NULL`
- `wagon_shots (match_id, innings_id, batter_id)`
- `standings_official (season_id, position)`
- trigram indexes on player/team/venue names only if `ILIKE` search is measurably slow; 247 players do not justify them initially

### Constraints

- Runs, wickets, balls, and counts are non-negative.
- Wickets are 0-10 for a normal innings.
- `team_a_id <> team_b_id`.
- Batting and fielding team differ.
- Team/player foreign keys must resolve before activation.
- `innings_extras.total` must equal component sum when the source is internally consistent.
- XI validation expects exactly 11 per team per match for this dataset.

---

## 9. Runtime calculations

All season metrics accept `season=ipl-2022` internally even when the default route omits it. Every result declares a `scope` (`league`, `playoffs`, or `all`).

### Batting

- `matches`: distinct `match_playing_xi.match_id` for the player.
- `innings`: count of batting rows.
- `runs`, `balls`, `fours`, `sixes`: sums of batting facts.
- `not_outs`: batting rows where `is_out = false`.
- `average`: `runs / dismissals`, null when dismissals are zero.
- `strike_rate`: `100 * runs / balls`, null when balls are zero.
- `highest`: max innings runs, with not-out flag retained for display such as `88*`.
- `50s`: innings runs between 50 and 99.
- `100s`: innings runs at least 100.

### Bowling

- `matches`: distinct XI match count.
- `innings`: count of bowling rows.
- `balls`, `maidens`, `runs_conceded`, `wickets`: sums.
- `average`: runs conceded / wickets, null for zero wickets.
- `economy`: `6 * runs_conceded / legal_balls`, null for zero balls.
- `strike_rate`: legal balls / wickets, null for zero wickets.
- `best`: order individual innings by wickets descending, runs ascending.
- `4w`, `5w`: counts of innings meeting the threshold; define whether a 5w also counts as 4w to match source semantics and test it.

### Teams

- matches played/won/lost by scope;
- total runs for and against;
- wickets taken and lost;
- highest/lowest innings score;
- biggest/smallest win by runs or wickets;
- extras conceded from opponent innings extras;
- team fifties/hundreds from batting facts;
- standings W/L/points from league matches only.

### Net run rate

Implement and test IPL NRR rules:

- use league matches only;
- use legal balls, not decimal overs;
- when a team is all out, use its full allotted overs for NRR where rules require it;
- exclude abandoned/no-result innings correctly;
- round only at the presentation boundary.

Because this dataset contains no DLS matches, DLS adjustments are not required for the supplied season. Keep `standings_official.net_run_rate` canonical and expose a reconciliation status internally.

### Known golden values

- Jos Buttler: 863 season runs.
- Yuzvendra Chahal: 27 season wickets.
- Gujarat Titans: 20 league points and 10 league wins.
- Gujarat Titans: 12 wins across league plus playoffs.
- Gujarat Titans: season champion.

These are test fixtures, not hard-coded API responses.

---

## 10. API contract

Base path: `/api/v1`.  
Swagger UI: `/docs`.  
OpenAPI JSON: `/openapi.json`.

### Conventions

All collection endpoints accept:

```text
page=1
page_size=20             # max 100
sort=<allowlisted field>
order=asc|desc
q=<trimmed search text>  # where meaningful
```

Collection response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0,
    "sort": "starts_at",
    "order": "desc",
    "dataset_version": "ipl-2022-v1"
  }
}
```

Error response uses RFC 9457 problem details:

```json
{
  "type": "https://example.com/problems/invalid-sort",
  "title": "Invalid sort field",
  "status": 400,
  "detail": "Allowed values are: starts_at, match_number",
  "instance": "/api/v1/matches"
}
```

Rules:

- Unknown IDs return 404.
- Invalid filters/sorts return 422 or 400 consistently and are documented.
- Empty collections return 200 with an empty `data` array.
- Dates are ISO 8601; instants include a timezone.
- Rates are JSON numbers or `null`.
- Stable IDs remain source numeric IDs.
- Sorts always add a stable ID tiebreaker.
- Detail endpoints are not wrapped in pagination metadata.
- OpenAPI documents examples, enums, errors, cache headers, and every query parameter.

### System and metadata routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Required liveness response; no database dependency |
| GET | `/ready` | Checks database and active dataset |
| GET | `/api/v1/meta` | Dataset version, source counts, season dates, generated timestamp |
| GET | `/api/v1/seasons` | Available seasons; one now, future-safe |
| GET | `/api/v1/seasons/{slug}` | Season summary and champion |

### Team routes

| Method | Route | Filters/sort |
| --- | --- | --- |
| GET | `/api/v1/teams` | `season`, `q`; sort `name`, `short_name` |
| GET | `/api/v1/teams/{team_id}` | Team identity and season summary |
| GET | `/api/v1/teams/{team_id}/squad` | `season`, `role`, `country`, `q`; sort `name`, `role`, `country` |
| GET | `/api/v1/teams/{team_id}/matches` | `season`, `stage`, `result`, dates; sort `starts_at`, `match_number` |
| GET | `/api/v1/teams/{team_id}/stats` | `season`, `scope`; calculated team metrics |

### Player routes

| Method | Route | Filters/sort |
| --- | --- | --- |
| GET | `/api/v1/players` | `season`, `team_id`, `role`, `country`, `q`; sort `name`, `role`, `country` |
| GET | `/api/v1/players/{player_id}` | Profile plus 2022 summary |
| GET | `/api/v1/players/{player_id}/season-stats` | `season`, `scope`; calculated batting/bowling |
| GET | `/api/v1/players/{player_id}/matches` | `season`, `team_id`; sort `starts_at`, `runs`, `wickets` |
| GET | `/api/v1/players/{player_id}/career` | optional `format`; stored snapshot, no pagination needed for four formats |

### Venue routes

| Method | Route | Filters/sort |
| --- | --- | --- |
| GET | `/api/v1/venues` | `season`, `q`, `city`; sort `name`, `city`, `match_count` |
| GET | `/api/v1/venues/{venue_id}` | Venue summary |
| GET | `/api/v1/venues/{venue_id}/matches` | `season`, `team_id`, `stage`; sort `starts_at`, `match_number` |
| GET | `/api/v1/venues/{venue_id}/stats` | Average first-innings score, chase/defend results, match count |

### Match routes

| Method | Route | Filters/sort |
| --- | --- | --- |
| GET | `/api/v1/matches` | `season`, `team_id`, `venue_id`, `stage`, `winner_id`, `date_from`, `date_to`, `q`; sort `starts_at`, `match_number`, `win_margin` |
| GET | `/api/v1/matches/{match_id}` | Header, result, toss, venue, officials, awards, innings summaries |
| GET | `/api/v1/matches/{match_id}/scorecard` | Complete nested scorecard for both innings |
| GET | `/api/v1/matches/{match_id}/innings` | Small ordered innings collection; no pagination needed |
| GET | `/api/v1/matches/{match_id}/innings/{innings_id}` | Innings header and score |
| GET | `/api/v1/matches/{match_id}/innings/{innings_id}/batting` | sort `position`, `runs`, `strike_rate` |
| GET | `/api/v1/matches/{match_id}/innings/{innings_id}/bowling` | sort `position`, `wickets`, `economy` |
| GET | `/api/v1/matches/{match_id}/innings/{innings_id}/fielding` | sort `catches`, `stumpings` |
| GET | `/api/v1/matches/{match_id}/innings/{innings_id}/fall-of-wickets` | ordered by wicket number |
| GET | `/api/v1/matches/{match_id}/commentary` | `innings_id`, `over`, `batter_id`, `bowler_id`, `event`; sort `sequence`; page size max 200 |
| GET | `/api/v1/matches/{match_id}/wagon` | `innings_id`, `batter_id`, `bowler_id`, `zone_id`, `min_runs`; sort `sequence`, `bat_runs`; page size max 500 |

The scorecard detail endpoint prevents the frontend from issuing ten small requests. The granular innings endpoints still exist for direct API use and independently sorted tables.

### Standings and statistic routes

| Method | Route | Filters/sort |
| --- | --- | --- |
| GET | `/api/v1/standings` | `season`; sort `position`, `points`, `net_run_rate`, `wins` |
| GET | `/api/v1/stats/batting` | `season`, `scope`, `team_id`, `min_matches`, `min_innings`; sort all batting metrics |
| GET | `/api/v1/stats/bowling` | `season`, `scope`, `team_id`, `min_matches`, `min_innings`, `min_balls`; sort all bowling metrics |
| GET | `/api/v1/stats/teams` | `season`, `scope`; sort wins, runs, wickets, high/low scores, margin metrics |
| GET | `/api/v1/stats/summary` | dashboard leaders and season totals in one response |

Do not expose raw archived snapshot payloads publicly in Release 1. They are implementation evidence, not a coherent product API. If an evaluator specifically asks to inspect them, add an authenticated/internal diagnostic route or provide the generated import report.

### Optional post-release routes

- `/api/v1/search?q=` for federated player/team/match lookup.
- `/api/v1/compare/players?ids=...` for two-player charts.
- `/api/v1/compare/teams?ids=...` for team comparison.
- `/api/v1/matches/{id}/live-snapshot` clearly labeled as archived final state.

These must not delay the required routes.

---

## 11. Backend requirements

### Layering

```text
module/routes.ts -> module/schemas.ts -> module/service.ts -> module/repository.ts -> PostgreSQL
```

Same four layers, colocated in the module. Do not split one resource across global folders.

- Routers own HTTP semantics only.
- Services own scope and calculation rules.
- Repositories own SQL and pagination.
- Source import schemas live with the seed, not inside API modules.
- Pass Prisma, cache, and settings through a small application context; do not add a dependency-injection framework.

### Query rules

- Select only columns required by the response.
- Avoid N+1 queries; use explicit joins or select-in loading.
- Count queries are acceptable at this scale; optimize only after measurement.
- Whitelist sort columns through a mapping; never interpolate untrusted SQL identifiers.
- Use Prisma query methods for ordinary CRUD reads and parameterized `$queryRaw`/TypedSQL for leaderboard aggregates.
- Always add a deterministic secondary sort.
- Convert balls/overs in shared, unit-tested domain helpers.
- Keep leaderboard SQL in named query modules with formula comments.

### Security and reliability

- Read-only database role for the running API; migration/import roles are separate.
- Exact CORS origins, or same-origin frontend proxy; never `*` in production.
- Trusted-host and forwarded-header configuration for Azure.
- `helmet` for baseline HTTP security headers and Express production proxy configuration.
- Request ID in logs and response headers.
- Body and query-size limits at the ingress.
- No secrets in images, repository, logs, or client bundles.
- Return generic production errors; log the internal exception with request ID.
- Rate limiting belongs at Azure ingress/Front Door if public abuse appears; do not add application middleware preemptively.
- `/health` stays fast and independent; `/ready` checks database connectivity and an active dataset.

### Observability

- Pino structured JSON logs with timestamp, level, service, environment, request ID, route template, status, duration, and dataset version.
- Prometheus/OpenTelemetry-compatible metrics: request count, latency, error count, DB pool state, import duration, and import failures.
- Azure Application Insights or OpenTelemetry is the core option.
- Datadog is a stretch integration, not a prerequisite.
- Never log full source payloads or query strings containing unexpected data.

---

## 12. Cache plan

### Decision

Use a bounded API cache for calculated responses, plus HTTP/CDN and client query caching. Do not deploy Redis for this release.

The database is roughly tens of megabytes, contains one completed season, and changes only when a new import is activated. A per-process `lru-cache` is enough to avoid repeating calculation queries on a warm API instance. Redis would add deployment, invalidation, test, and failure-mode complexity without solving a measured problem.

### Calculated-response cache

- Cache only `/stats/summary`, batting, bowling, team, venue-stat, and team/player season-stat responses.
- Use the maintained `lru-cache` package rather than a hand-written `Map` cache.
- Bound the cache to 500 entries and use a five-minute TTL.
- Key by `dataset_version + route + normalized/sorted query parameters`.
- Store the resolved JSON DTO, not Prisma models or an open database promise.
- Coalesce concurrent identical calculations so a cold key executes once.
- Do not cache validation errors, 4xx/5xx responses, health checks, or database failures.
- A new dataset version makes old keys unreachable; clear the process cache after a successful local import activation as cleanup.
- Each API replica has its own LRU. That is acceptable because the data is immutable and the CDN handles cross-replica public reuse.
- Test hit, miss, TTL expiry, parameter separation, dataset-version invalidation, and failure behavior.

### Server/API caching

| Data class | Example | `Cache-Control` |
| --- | --- | --- |
| Health/readiness | `/health`, `/ready` | `no-store` |
| Metadata | `/meta`, seasons | `public, max-age=300, s-maxage=3600` |
| Reference/detail | teams, players, venues, match details | `public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800` |
| Collections | matches, players, teams | `public, max-age=300, s-maxage=3600, stale-while-revalidate=86400` |
| Heavy immutable facts | commentary, wagon, scorecard | `public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800` |
| Calculated stats | leaderboards, summary | `public, max-age=300, s-maxage=3600, stale-while-revalidate=86400` |

- Emit an ETag derived from `dataset_version + route + normalized query + response representation`.
- Honor `If-None-Match` with 304.
- Include the active dataset version in every cache key.
- Activating a new dataset version invalidates naturally because the key changes.
- Let Azure ingress/CDN cache only public GET/HEAD responses.
- Do not put large commentary, wagon, scorecard, or general collection responses in the process LRU; HTTP caching already covers them.

### Database strategy

- Start with normalized facts plus the listed indexes.
- Record `EXPLAIN (ANALYZE, BUFFERS)` for the three heaviest leaderboard queries in the implementation notes.
- Add a materialized view only if a cold production-like calculation exceeds p95 250 ms after indexing and the bounded response cache cannot hide the cost safely.
- If materialized views are added, refresh them in the import job before activating the dataset.

### Frontend/client caching

- Use Server Components for initial dashboard/detail data where it improves first paint and metadata.
- Hydrate TanStack Query for interactive filters and pagination.
- Use stable OpenAPI-generated query keys containing all filters, sort, page, and dataset version.
- `staleTime`: 5 minutes for collection and leaderboard queries; 1 hour for match details; 24 hours for commentary/wagon/reference data.
- `gcTime`: 30 minutes for normal lists; shorter for large wagon/commentary pages.
- Keep previous page data during pagination.
- Prefetch a match detail when a match link receives intent (hover/focus), but do not prefetch entire commentary or wagon datasets.
- Retry GETs at most twice with bounded exponential backoff; do not retry 4xx responses.
- URL query parameters are the source of truth for filters, tabs, sorts, and page.
- Do not duplicate full API data into a separate global store.

### When Redis becomes justified

Introduce Redis only when at least one is true:

- multiple active seasons make aggregates expensive;
- live data introduces sub-minute invalidation or pub/sub;
- API p95 remains above 250 ms after correct SQL/indexing;
- database CPU is driven by repeated identical public queries;
- more than one service needs shared ephemeral state.

Document the measurement that triggered it and the invalidation contract before adding it.

---

## 13. Frontend route and screen specification

### `/` - season overview

- Compact season masthead: IPL 2022, dates, champion, 74 matches, 10 teams.
- Top batting and bowling leaders with real team marks.
- Standings preview with link to full table.
- Stage/result strip for playoffs and Final.
- Two useful charts: top run scorers and wicket takers.
- Recent/decisive match list; because the season is historical, do not label it "Live."
- Source freshness/provenance link in the footer, not tutorial copy in the main UI.

### `/matches`

- Search by team/title.
- Team, venue, stage, and date filters.
- Result/winner filter.
- Sort by chronological order or match number.
- URL-persisted filters and page.
- Rows show stage/match number, teams/logos, scores, result, date, and venue.
- Desktop table and mobile stacked rows using the same semantic data, not horizontal overflow as the only mobile solution.

### `/matches/[matchId]`

- Match scoreboard header with teams, innings scores, result, venue, date, toss, and player of the match.
- Tabs in the URL: `scorecard`, `commentary`, `wagon`.
- Scorecard has innings selector and semantic batting/bowling tables, extras, and fall of wickets.
- Commentary supports innings and over filters, newest/oldest ordering, event badges, and incremental pages.
- Wagon view supports innings, batter, bowler, zone, and run filters; shows a cricket-field plot plus a textual/table alternative.
- Preserve filters when switching tabs.
- Invalid match ID renders a real 404 state.

### `/standings`

- Official 2022 league table with position, P/W/L/NR, NRR, points, and last five.
- Qualification separator after the top four.
- Tooltips define NRR and clarify that playoffs are excluded.
- If calculated W/L/points disagree with official data, fail CI/import rather than displaying an unexplained discrepancy.

### `/stats`

- URL tabs: batting, bowling, teams.
- Filters for team, scope, minimum matches/innings/balls.
- Sortable paginated table is canonical; the chart visualizes the current top N.
- Batting columns: matches, innings, runs, high score, average, strike rate, 50, 100, 4, 6.
- Bowling columns: matches, innings, wickets, best, average, economy, strike rate, 4w, 5w, maidens.
- Team columns: played, wins, runs, wickets, high/low, margin records, extras.
- Explicit `league/all` scope label prevents GT's 10 league wins and 12 overall wins from appearing contradictory.

### `/teams`

- Searchable team list with season display names, abbreviations, logos, record, and final standing.
- Do not use ten oversized decorative cards; use a compact scan-friendly grid/list.

### `/teams/[teamId]`

- Team identity and 2022 record.
- Official standing and all-match record shown with their scopes.
- Squad snapshot with role/country/search filters and a visible snapshot-date note.
- Top batters/bowlers and match results.

### `/players`

- Search, team, role, and country filters.
- Sort by name or selected season metric.
- Clear distinction between squad member and playing-XI appearances.
- Image/initial fallback that never shifts layout.

### `/players/[playerId]`

- Profile and season team.
- IPL 2022 batting and bowling summaries calculated from scorecards.
- Match-by-match performance table.
- Career snapshot tabs for Test/ODI/T20I/T20, explicitly labeled as source-provided and not "as of IPL 2022."
- Hide meaningless empty rate blocks instead of showing a wall of zeros.

### `/venues`

- Searchable list with city, match count, average first-innings score, and chase/defend split.

### `/venues/[venueId]`

- Venue summary, match list, team records, and score distribution.
- Display dates in `Asia/Kolkata`; never use the source timezone field for conversion.

### `/about/data`

- Dataset contents and source timestamps.
- Which values are facts, calculated metrics, official snapshots, or later career/profile snapshots.
- Formula definitions and known limitations.
- Import version and reconciliation status.

### Global states

Every data surface includes:

- a layout-stable skeleton after a short delay;
- an empty state that preserves filters and offers a clear filter reset;
- a retryable error with request ID where available;
- 404 handling for missing detail entities;
- offline/network-aware language;
- keyboard focus management after pagination/filter changes;
- no-data placeholders that do not imply zero.

---

## 14. Visual and interaction design

### Design direction

Build a quiet, high-density sports data product. Avoid a marketing hero, glassmorphism, giant cards, dark navy everywhere, purple gradients, decorative blobs, and fake stadium imagery.

Recommended palette:

- warm-white or very light neutral canvas;
- near-black text;
- cricket-field green for primary actions and positive data;
- saffron/gold for highlights;
- restrained red for losses/errors;
- team colors only as local accents, never as the entire page background.

Use an 8px maximum radius, crisp dividers, tabular numerals, and strong hierarchy. Charts and tables should look like one system.

### Design token file

`docs/DESIGN.md` must define:

- audience and product personality;
- color tokens and contrast pairs;
- typography scale and tabular-number usage;
- 4/8px spacing scale;
- radii, shadows, borders, and focus rings;
- responsive breakpoints and content widths;
- table density and mobile transformation;
- chart palette, axes, legends, tooltips, and no-data treatment;
- loading, empty, error, disabled, hover, active, and selected states;
- icon-button sizes and tooltip rules;
- team-logo sizing and fallback;
- reduced-motion behavior;
- example wireframes for overview, match detail, and stats.

### Existing DESIGN.md to paste (catalog)

Closest **free, already-written** DESIGN.md that still looks like a product, not a SaaS admin:

**Mercury — Banking Editorial Warmth**  
https://raw.githubusercontent.com/rohitg00/awesome-claude-design/main/design-md/warm/mercury.md  
Pretty: https://github.com/rohitg00/awesome-claude-design/blob/main/design-md/warm/mercury.md  

Cream paper (`#f6f5f2`), warm ink, hairline tables, tabular numbers, stacked mobile rows, no card shadows. Already has field green (`--success #2f7d57`) and saffron (`--warning #c98a42`). After paste, change `--accent` from indigo `#5266eb` to `#1B5E3B` so CTAs match cricket, not a bank.

Rejected: PostHog (cobalt admin), Datadog / ClickHouse (dark navy), Granola (glass + blur, PLAN forbids), Vercel grayscale (severe, no sport color), Claude warm (too much magazine air).

Optional behavior file (not tokens): Vercel Labs  
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/AGENTS.md  
→ `docs/WEB_INTERFACE_GUIDELINES.md`

shadcn/ui is the component source, not the look.

### Accessibility acceptance

- WCAG 2.2 AA contrast.
- Entire workflow keyboard-operable with visible `:focus-visible` rings.
- Minimum 44px mobile touch targets.
- Semantic headings, navigation, buttons, and tables.
- Charts have a text summary and accessible table representation.
- Color is never the only win/loss or series indicator.
- Motion honors `prefers-reduced-motion`.
- Zoom to 200% without lost content or horizontal page overflow.
- Mobile inputs use at least 16px text.

### Performance budgets

- Lighthouse performance/accessibility/best-practices/SEO target: 90+ on key public pages in production-like runs.
- LCP target below 2.5 seconds and CLS below 0.1 on a mid-tier mobile profile.
- Lazy-load chart code and wagon SVG logic outside the initial dashboard path.
- Paginate commentary; never render 20,000 events into the DOM.
- Set stable logo/image dimensions.

---

## 15. Testing and verification

### Import tests

- Each folder has a source-schema fixture and a malformed fixture.
- String/number IDs and booleans normalize correctly.
- Empty IDs become null, not zero.
- Overs-to-balls conversion covers `0`, `4`, `17.4`, and `20` and rejects a final digit above 5.
- Wagon headers map to the correct columns.
- Commentary resolves through innings IDs.
- Commentary accepts nullable event IDs for `overend` events and rejects duplicate non-null source event IDs.
- Source precedence and conflict reports are deterministic.
- Running the same import twice preserves row counts.
- A failed import never replaces the active version.

### Domain/stat tests

- Batting average uses dismissals, not innings.
- Strike rate and economy use the correct denominators.
- Run outs do not become bowler wickets when deriving from dismissals; prefer the scorecard bowling wicket total.
- Best bowling ordering uses wickets descending then runs ascending.
- NRR uses legal balls and all-out rules.
- League and all-match scopes produce GT 10 and 12 wins respectively.
- Golden leaders: Buttler 863 runs and Chahal 27 wickets.

### Database integration tests

- Run against real PostgreSQL with Testcontainers for Node, not an in-memory database substitute.
- Migrate from empty database to head.
- Import a representative mini dataset.
- Verify foreign keys, uniqueness, indexes, and query output.
- Run representative `EXPLAIN ANALYZE` reporting for leaderboard queries.

### API tests

- Every collection: default page, custom page, maximum page size, invalid page, empty page.
- Every filter and sort allowlist.
- Stable sort tie breakers.
- Unknown ID, malformed ID, wrong nested match/innings relation.
- JSON problem details.
- ETag and 304 behavior.
- Cache-Control by route class.
- Calculated-response LRU hit/miss, TTL, versioned keys, and no-cache-on-error behavior.
- OpenAPI schema snapshot and generated client freshness.
- `/health` and `/ready` failure modes.

### Frontend tests

- Component tests for match row, scorecard, standings, stat table, all async states.
- URL state survives refresh and Back/Forward.
- Formatting tests for dates, rates, nulls, overs, and high-score not-outs.
- Error boundary and not-found route.
- No broken layout when a logo is missing or a player name is long.

### E2E critical paths

1. Overview -> batting leader -> player page.
2. Matches -> filter by team -> open match -> switch innings.
3. Match -> commentary -> filter over -> paginate.
4. Match -> wagon -> select batter -> verify plot and table update.
5. Standings -> team -> team match history.
6. Stats -> change scope -> share URL -> same result after reload.
7. Mobile navigation and table alternatives.

Run Playwright at desktop and mobile viewports and add axe checks on every top-level route. Add screenshot comparisons only for three stable reference pages; indiscriminate snapshots become maintenance noise.

### Import acceptance assertions

- source files: 729;
- teams: 10;
- matches: 74;
- venues: 6;
- innings: 148;
- each team/innings XI: 11;
- commentary events: 20,749;
- wagon rows: 17,912;
- player profiles: 247;
- career documents represented: 247;
- no unresolved team, player, match, or innings foreign keys;
- all 74 match IDs appear in matches, match info, scorecard, live, and wagon families;
- two commentary documents per match;
- golden stat values match;
- official standings W/L/points reconcile with the 70 league matches.

---

## 16. Docker and local development

### Compose services

- `db`: PostgreSQL with health check and named volume.
- `migrate`: one-shot `prisma migrate deploy` service.
- `seed`: one-shot `prisma db seed` service mounting the dataset read-only and invoking the shared importer.
- `api`: non-root production-like Express image with health check.
- `web`: non-root Next.js standalone image with health check.

Use Compose dependency conditions so migrations complete before import and the API starts only against a ready database/dataset. For quick frontend work, allow API start after migration with an explicit empty-dataset state.

### Images

- Multi-stage builds.
- Lockfile-enforced dependency install.
- No compilers or package managers in final images unless required at runtime.
- Non-root user and read-only filesystem where practical.
- `.dockerignore` excludes `.git`, caches, tests from runtime image, and the raw dataset from API/web images.
- OCI labels include repository, revision, and build time.
- Pin base-image major/minor and let Dependabot/Renovate propose updates.

### Developer commands

```bash
docker compose up --build db migrate seed api web
docker compose run --rm api pnpm test
docker compose run --rm web pnpm test
docker compose run --rm web pnpm exec playwright test
```

The README should also document native hot-reload commands, but Docker Compose is the canonical evaluator path.

---

## 17. CI/CD and cloud deployment

### Pull-request workflow

Parallel jobs:

1. Backend: ESLint, Prettier check, TypeScript check, Vitest/Supertest.
2. Frontend: install with frozen lockfile, lint, TypeScript check, unit tests, production build.
3. Database: start PostgreSQL, migrate from empty, import fixture, integration tests.
4. Contract: export OpenAPI, regenerate TypeScript client, fail on diff.
5. Containers: build API and web images.
6. Security: dependency audit, Trivy image/filesystem scan, secret scan.
7. E2E: Compose stack plus Playwright critical paths.

Use path filters only after the pipeline is stable; skipped integration jobs can hide cross-layer breakage.

### Main-branch deployment workflow

1. Require all PR checks and protected-branch merge.
2. Build once and tag images with commit SHA; never rebuild different bits for deploy.
3. Push to Azure Container Registry.
4. Authenticate with GitHub OIDC.
5. Run `prisma migrate deploy` as a controlled job.
6. Run the idempotent Prisma seed/import verification job.
7. Deploy backend revision, wait for `/ready`.
8. Deploy frontend revision.
9. Run smoke tests against public URLs and `/docs`.
10. Mark deployment successful; retain the previous Container Apps revision for rollback.

Production deployment must be serial through a GitHub Environment and use concurrency cancellation carefully: cancel queued superseded runs, not an in-progress migration.

### Azure resources

- Resource Group.
- Azure Container Registry.
- Azure Container Apps Environment.
- API Container App.
- Web Container App.
- Container Apps Job for migration/import.
- Azure Database for PostgreSQL Flexible Server.
- Log Analytics/Application Insights.
- Key Vault for database URL and app secrets.

Use a private/internal backend URL from the frontend where feasible. Public Swagger and API can remain available for evaluation through an ingress with explicit CORS.

### Database operations

- Automated PostgreSQL backups and point-in-time restore appropriate to the chosen tier.
- TLS required.
- Separate owner/migration, importer, and read-only API roles.
- Connection pool sized for the small Container Apps replica count.
- Migration policy: expand/migrate/contract for future breaking changes; Release 1 starts from empty so the first migration is straightforward.

### Kubernetes checklist artifact

After Azure deployment, include under `deploy/k8s/`:

- namespace;
- API and web Deployments;
- Services;
- ConfigMap;
- Secret example or ExternalSecret reference, never a real secret;
- Ingress;
- migration/import Job;
- health probes and resource requests/limits;
- Kustomize base and production overlay.

Do not claim Kubernetes is deployed if it is not. Helm is stretch after these manifests validate with `kubectl apply --dry-run=client` and schema linting.

### Terraform stretch

Provision Azure resource group, ACR, Container Apps, PostgreSQL, Key Vault, identities, and monitoring. Keep application deployment in GitHub Actions; Terraform owns infrastructure, not every image revision.

---

## 18. Documentation deliverables

### `README.md`

- product screenshot and live URLs;
- architecture diagram;
- stack and key decisions;
- prerequisites;
- one canonical local start path;
- native development commands;
- test/lint commands;
- migration and import commands;
- Swagger/OpenAPI links;
- environment variable table without secrets;
- deployment overview;
- known data limitations;
- repository structure.

### `docs/architecture.md`

- context/container diagram;
- request flow;
- import flow;
- cache flow and invalidation;
- deployment topology;
- source-of-truth boundaries.

### `docs/data-dictionary.md`

- every table, column meaning, source family, nullability, unit, and derivation;
- source-to-target map;
- rate formulas;
- name/timestamp caveats;
- reconciliation results.

### Architecture decision records

At minimum:

- ADR-001: Express plus Next.js and Prisma/PostgreSQL.
- ADR-002: normalize facts, derive season aggregates.
- ADR-003: no Redis for immutable single-season data.
- ADR-004: official NRR and calculated reconciliation.
- ADR-005: Azure Container Apps instead of Kubernetes runtime.

### `AGENTS.md`

Keep it short and repository-specific:

- commands that are actually valid;
- architectural boundaries;
- source precedence;
- generated-file rules;
- test expectations;
- definition of done.

Do not paste this entire plan into `AGENTS.md`; excessive permanent context makes coding agents worse, not better.

---

## 19. Skills and "vibe coding" setup

### Codex skills already present and useful

No new skill is required to start. Use these installed skills deliberately:

| Skill | Use it for |
| --- | --- |
| `investigate-first` | Dataset/schema anomalies before changing the model |
| `lean-build` | Each vertical product slice; prevents speculative scope |
| `migration` | Prisma schema/migration changes and rollback proof |
| `surgical-patch` | Narrow bug fixes with regression tests |
| `safe-refactor` | Structural cleanup after behavior is covered |
| `verify-and-stop` | Acceptance checks without adding features |
| `browser:control-in-app-browser` | Visual and functional browser verification |
| `imagegen` | Only if a real bitmap asset is missing; do not replace team data with invented imagery |
| `ponytail` | Keep dependencies and abstractions minimal during coding |

### One optional skill to install

Install the official curated `gh-fix-ci` skill only when the GitHub Actions workflows exist and need diagnosis:

```text
$skill-installer gh-fix-ci
```

It is not needed during schema/product design. Do not install a large overlapping collection of generic full-stack skills. Official Codex guidance recommends focused skills and notes that large skill lists consume the initial skill-description budget.

The official Codex skill documentation is:

`https://developers.openai.com/codex/skills/`

### Project tools to install on the machine

Required:

- Git.
- Docker Desktop with Compose v2.
- Node.js current LTS and Corepack/pnpm.
- VS Code or equivalent editor.

Useful but not required on day one:

- GitHub CLI for PR/check inspection.
- Azure CLI for deployment and log inspection.
- `psql`/DBeaver for database inspection.
- Terraform only when the core deployment works.
- `kubectl`, Helm, and `kubeconform` only for the Kubernetes stretch phase.

Do not install PostgreSQL locally if Docker is the canonical environment.

### Repository automation to add

- `.editorconfig`.
- Shared TypeScript, ESLint, and Prettier configuration for both applications.
- Dependabot or Renovate, one only.
- Conventional commit guidance, PR template, and issue templates.
- Pre-commit hooks only after the underlying commands are stable; hooks must mirror CI, not invent different checks.
- Secret scanning and `.env.example`.
- Generated OpenAPI-client drift check.
- CODEOWNERS only if more than one maintainer exists.

### A disciplined AI-assisted workflow

For every slice:

1. Give the agent one bounded acceptance criterion and relevant files.
2. Require it to inspect source/schema before editing.
3. Ask for the smallest implementation consistent with this plan.
4. Require focused tests in the same change.
5. Run the real checks and inspect the diff.
6. Use browser verification for user-visible work.
7. Commit only after the slice works end to end.

Do not ask an agent to "build the whole app" from this plan in one prompt. Build walking skeletons and vertical slices so errors surface while they are cheap.

---

## 20. Implementation roadmap authority

`IMPLEMENTATION_PHASES.md` is the authoritative execution plan. It owns phase numbers, prerequisites, commands, deliverables, evidence gates, pull-request boundaries, and stop conditions. This document owns the product and architecture decisions those phases must implement.

| Delivery stage | Detailed phases | Master gate |
| --- | --- | --- |
| Decisions and foundation | 0-1 | Scope is explicit and a clean checkout starts PostgreSQL, API, and web |
| Data model and ingestion | 2-3 | All 729 files load through one idempotent `pnpm db:seed` command and reconciliation passes |
| Backend contract and analytics | 4-6 | All 35 required GET endpoints are documented and tested; golden statistics and cache behavior pass |
| Frontend product | 7-11 | All 12 frontend routes and rich match views are responsive, accessible, linked, and covered by critical E2E tests |
| Production release | 12 | Containers, CI/CD, Azure deployment, evaluator documentation, and rollback evidence are complete |
| Optional stretch | 13 | Each chosen bonus item has an independent gate and does not weaken the required release |

Do not invent parallel phase numbering in issues or pull requests. Update `IMPLEMENTATION_PHASES.md` first when sequencing changes, then update this mapping only if a stage boundary changes.

Stop after Phase 12 when its exit gate passes. Do not trade a reliable deployed product for half-finished stretch infrastructure.

---

## 21. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Treating profile snapshots as 2022 facts | Misleading UI | Separate season display names and label profile/career snapshot dates |
| Incorrect overs arithmetic | Wrong NRR/economy/strike rates | Persist legal balls and unit-test conversions |
| Duplicate source families drift | Conflicting responses | Explicit source precedence and reconciliation report |
| Using metadata players as XI | Inflated appearances | Build XI from batsmen plus did-not-bat |
| Public image URLs break | Layout/content degradation | Fixed dimensions, fallback initials, error handling |
| Overbuilding infrastructure | Core remains unfinished | Phase gates and explicit stop condition |
| Excessive frontend requests | Slow detail pages | Composite scorecard and dashboard-summary endpoints |
| Cache staleness after import | Old/new mixed responses | Dataset-versioned keys and atomic activation |
| NRR mismatch | Credibility loss | Official snapshot canonical, calculated audit with documented rules |
| CI deploy modifies DB unsafely | Production outage | Serial environment, migration job, backup, retained revision |
| Mobile tables unusable | Poor evaluator experience | Purpose-built stacked mobile representation and viewport E2E |
| "Live" source misrepresented | Product dishonesty | Archive and label as final snapshot only |

---

## 22. Decision grill - answer before Phase 1

Defaults below are safe enough to proceed if no answer is supplied. Questions marked **blocking** materially change the implementation.

1. **Blocking: What is the deadline and expected effort window?**  
   Default: optimize for a polished core in 8-12 focused engineering days, then stretch work.

2. **Blocking: Must the deployed app be on Azure/GCP, or is a local submission acceptable?**  
   Default: deploy on Azure Container Apps with managed PostgreSQL.

3. **Blocking: What cloud account and spending limit are available?**  
   Default: smallest practical paid/dev tiers, budget alerts, and no always-on Kubernetes cluster.

4. **Blocking: Is Kubernetes expected to run, or are valid manifests enough?**  
   Default: Azure Container Apps is the real runtime; validated Kustomize manifests satisfy the checklist.

5. **Is the selected stack final?**  
   Current decision: Express 5, TypeScript, Prisma/PostgreSQL, and Next.js. Reopen this only if an evaluator mandates a different runtime.

6. **Should commentary and wagon-wheel views be in the evaluated release?**  
   Default: yes; they make meaningful use of the richest supplied data and distinguish the project.

7. **Should official snapshot leaderboards be visible alongside calculated values?**  
   Default: no duplicate public tables; show calculated results and publish reconciliation/provenance.

8. **Can current remote team logos be used under the dataset's terms?**  
   Default: use the supplied URLs with fallbacks and attribution/provenance; do not redistribute downloaded assets until licensing is confirmed.

9. **What brand name should appear in the UI and deployed URL?**  
   Default: "IPL 2022 Explorer," clearly marked as an independent data project.

10. **Do you have a custom domain?**  
    Default: use Azure-generated HTTPS URLs for submission.

11. **How much mobile support is expected?**  
    Default: full responsive support down to 360px, not a desktop-only assignment demo.

12. **Is accessibility part of evaluation?**  
    Default: WCAG 2.2 AA because it is also a strong general quality signal.

13. **Should squad pages describe the supplied list as a 2022 squad?**  
    Default: no. Label it "source squad snapshot" with the observed 2024 date, while match XIs remain true 2022 facts.

14. **Do you want a single-season product or a multi-season framework?**  
    Default: one polished 2022 product with a season table and season foreign keys, but no visible season switcher until another season exists.

15. **Are Terraform, Datadog, and Helm evaluator requirements or bonus points?**  
    Default: bonus only; implement in that order after deployment, with Helm last.

16. **Will the repository be public?**  
    Default: yes; no raw credentials, use OIDC and environment secrets, confirm dataset redistribution terms.

17. **What review workflow will be used?**  
    Default: protected `main`, small PRs by vertical slice, required CI, squash merge.

18. **Do you want visual comparison features?**  
    Default: defer player/team comparison until all required pages, deployment, and documentation are complete.

19. **Which three evaluator journeys matter most?**  
    Recommended: filter/open a match scorecard; inspect season leaders; inspect commentary/wagon for a memorable match.

20. **What will you cut first if time runs short?**  
    Recommended cut order: Datadog -> Helm -> Terraform -> comparisons -> venue analytics. Never cut migrations, importer validation, OpenAPI, async states, tests, Docker, or README clarity.

---

## 23. Final definition of done

The assignment is complete only when all of the following are true:

- A clean checkout has one documented Docker Compose start path.
- Migrations start from an empty PostgreSQL database.
- `pnpm db:seed` loads the full dataset and is safe to run twice.
- The importer accounts for all 729 files and is idempotent.
- Source anomalies and snapshot dates are documented honestly.
- The database contains normalized facts and does not maintain duplicate live aggregate truth.
- Runtime season calculations pass golden and reconciliation tests.
- Every Release 1 API route is in Swagger with examples and errors.
- Every collection supports its documented filters, stable sorting, and pagination.
- Overview, matches, match details, standings, stats, teams, players, and venues are complete.
- Commentary and wagon views work or are explicitly removed from Release 1 before implementation begins.
- Every screen has loading, empty, error, and not-found behavior where applicable.
- Desktop and mobile critical paths pass Playwright and axe checks.
- Images have stable dimensions and fallbacks.
- Cache headers, ETags, and client cache behavior are tested.
- CI runs lint, type checks, tests, contract generation, image builds, scans, and E2E.
- The deployed app, API, Swagger, and health URLs are in the README.
- Database backups, secret handling, deployment rollback, and smoke tests are documented.
- Kubernetes artifacts are valid and the README accurately says whether they are deployed.
- The final README explains architecture, data ownership, local use, deployment, and limitations without relying on oral explanation.

The strongest final submission is not the one with the most infrastructure logos. It is the one where every displayed number has a defensible source, every route exists for a real screen or reviewer need, and a new engineer can run and understand the system without guessing.
