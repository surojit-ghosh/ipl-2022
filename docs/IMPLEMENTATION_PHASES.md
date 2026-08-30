# IPL 2022 Data Platform - Phase-by-Phase Implementation Plan

Status: execution-ready draft  
Architecture source: `PLAN.md`  
Assignment source: `IPL_Fullstack_FTE_Assignment 4.pdf`  
Dataset source: `Indian_Premier_League_2022-03-26/`  
Stack: Express 5, Next.js App Router, Prisma, PostgreSQL, TypeScript  
Data entrypoint: one idempotent `pnpm db:seed` command

---

## 1. Purpose and operating model

`PLAN.md` is the product, architecture, schema, route, caching, testing, and deployment contract. This document is the ordered build plan. It answers five execution questions for every phase:

1. What must already be true?
2. What is built in this phase?
3. What evidence proves it works?
4. What is intentionally deferred?
5. Where is the clean commit or pull-request boundary?

The implementation should advance through thin, working vertical slices. A phase is complete only when its exit gate passes; files existing in the repository is not evidence of completion.

### Planning rules

- Build dependency order first: repository -> database -> seed -> API contract -> screens -> deployment.
- Keep `main` runnable. Each phase should end in one reviewable pull request, or two only where explicitly noted.
- Pair behavior with its smallest meaningful automated check in the same change.
- Use real PostgreSQL for database integration tests. Do not substitute SQLite or mocked Prisma for relational behavior.
- Generate the web API client from OpenAPI. Do not maintain duplicate handwritten request/response types.
- Normalize source facts and derive season aggregates. Do not ingest precomputed batting, bowling, or team leaderboards as product truth.
- Keep one seed entrypoint: `apps/api/prisma/seed.ts`, invoked through `pnpm db:seed`.
- Add in-process caching only to calculated endpoints. Use HTTP and client caching for ordinary resource responses.
- Stop after Phase 12 if the required product is polished. Phase 13 is bonus work.

### Standard phase gate

Every phase closes with all applicable checks green:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Database, contract, E2E, image, and deployment checks are added when their phases introduce them. Commands in this document are target commands; add them as the repository gains the relevant packages.

---

## 2. How to execute this plan

This file is the implementation playbook. It does not require a separate specification framework or planning tool.

### Sources of truth

| Decision type | Authority |
| --- | --- |
| Product scope, architecture, routes, schemas, data ownership | `PLAN.md` |
| Build order, phase gates, commands, PR boundaries, stop conditions | `IMPLEMENTATION_PHASES.md` |
| Implemented database shape | Committed Prisma migrations |
| Implemented HTTP contract | Generated `/openapi.json` |
| Dependency versions | `pnpm-lock.yaml` |
| Completion evidence | Tests, import reports, CI results, browser checks, deployed URLs |

### Per-phase working loop

1. Read the phase goal, prerequisites, tasks, exit gate, and deferred work.
2. Resolve any blocking decision before editing code.
3. Create one small branch or worktree for the phase or stated PR slice.
4. Implement tasks in dependency order and add focused tests with the behavior.
5. Run the phase commands and inspect the actual output.
6. For UI work, verify desktop and mobile behavior in a real browser.
7. Compare the result with the exact schema, API, and frontend coverage lists in Section 3.
8. Record evidence in the verification ledger in Section 18.
9. Close the phase only when every exit-gate statement is proven.

If implementation reveals a wrong architectural assumption, update `PLAN.md` first and explain the decision in an ADR when it affects data ownership, contracts, security, caching, or deployment. Do not silently make the code and plan disagree.

---

## 3. Requirement coverage map

This matrix prevents a route, table, or screen from being lost between phases.

| Surface | Owner phase | Completion evidence |
| --- | ---: | --- |
| Assignment decisions, design contract, ADRs | 0 | Approved decisions and ADRs |
| Workspace, PostgreSQL, Express, Next.js, Compose | 1 | Clean-start smoke test |
| 25 relational tables, constraints, indexes | 2 | Empty-to-head migration test |
| All 729 JSON files and one seed command | 3 | Full import report and idempotency test |
| Health, readiness, metadata, seasons, teams, players, venues | 4 | OpenAPI plus integration tests |
| Matches, scorecards, innings, commentary/wagon contract stubs | 5 | Contract and real-DB tests |
| Standings and calculated statistics | 6 | Golden values, query plans, cache tests |
| Web shell, tokens, generated client, shared states | 7 | Story/component/browser checks |
| Overview, matches, scorecard screens | 8 | Desktop/mobile E2E |
| Standings and statistics screens | 9 | Filter/share/reload E2E |
| Team, player, and venue screens | 10 | Entity navigation E2E |
| Commentary, wagon wheel, provenance | 11 | Pagination, SVG/table, accessibility checks |
| Cross-cutting quality, images, CI/CD, Azure, evaluator docs | 12 | Production smoke and acceptance report |
| Bonus infrastructure and comparison features | 13 | Separate optional gates |

### Database ownership checklist

Phase 2 owns all schema definitions. Phase 3 proves they are populated correctly.

| Group | Tables |
| --- | --- |
| Provenance/season | `dataset_imports`, `source_files`, `source_snapshots`, `competitions`, `seasons` |
| Teams/players/venues | `teams`, `season_teams`, `players`, `season_squad_members`, `venues` |
| Matches | `matches`, `match_officials`, `match_awards`, `match_playing_xi` |
| Innings facts | `innings`, `innings_batting`, `innings_bowling`, `innings_fielding`, `innings_fall_of_wickets`, `innings_extras` |
| Rich match facts | `commentary_events`, `wagon_shots` |
| Official/career snapshots | `standings_official`, `player_career_batting`, `player_career_bowling` |

The count is 25 named tables, not 28. Treat this list as authoritative unless the Prisma implementation introduces an explicitly justified join table. Do not add tables merely to match an earlier estimate.

### Required API ownership checklist

The contract contains 35 required `GET` endpoints, including health/readiness but excluding `/docs` and `/openapi.json`.

| Phase | Exact route |
| ---: | --- |
| 1 | `GET /health` |
| 4 | `GET /ready` |
| 4 | `GET /api/v1/meta` |
| 4 | `GET /api/v1/seasons` |
| 4 | `GET /api/v1/seasons/{slug}` |
| 4 | `GET /api/v1/teams` |
| 4 | `GET /api/v1/teams/{team_id}` |
| 4 | `GET /api/v1/teams/{team_id}/squad` |
| 4 | `GET /api/v1/teams/{team_id}/matches` |
| 4 | `GET /api/v1/players` |
| 4 | `GET /api/v1/players/{player_id}` |
| 4 | `GET /api/v1/players/{player_id}/matches` |
| 4 | `GET /api/v1/players/{player_id}/career` |
| 4 | `GET /api/v1/venues` |
| 4 | `GET /api/v1/venues/{venue_id}` |
| 4 | `GET /api/v1/venues/{venue_id}/matches` |
| 5 | `GET /api/v1/matches` |
| 5 | `GET /api/v1/matches/{match_id}` |
| 5 | `GET /api/v1/matches/{match_id}/scorecard` |
| 5 | `GET /api/v1/matches/{match_id}/innings` |
| 5 | `GET /api/v1/matches/{match_id}/innings/{innings_id}` |
| 5 | `GET /api/v1/matches/{match_id}/innings/{innings_id}/batting` |
| 5 | `GET /api/v1/matches/{match_id}/innings/{innings_id}/bowling` |
| 5 | `GET /api/v1/matches/{match_id}/innings/{innings_id}/fielding` |
| 5 | `GET /api/v1/matches/{match_id}/innings/{innings_id}/fall-of-wickets` |
| 5 | `GET /api/v1/matches/{match_id}/commentary` |
| 5 | `GET /api/v1/matches/{match_id}/wagon` |
| 6 | `GET /api/v1/teams/{team_id}/stats` |
| 6 | `GET /api/v1/players/{player_id}/season-stats` |
| 6 | `GET /api/v1/venues/{venue_id}/stats` |
| 6 | `GET /api/v1/standings` |
| 6 | `GET /api/v1/stats/batting` |
| 6 | `GET /api/v1/stats/bowling` |
| 6 | `GET /api/v1/stats/teams` |
| 6 | `GET /api/v1/stats/summary` |

All are `GET` routes. `/docs` and `/openapi.json` are contract surfaces and must exist by Phase 4. Optional search, comparison, and archived-live routes belong only to Phase 13.

### Required frontend ownership checklist

The product contains 12 required frontend routes. Commentary and wagon wheel are tabs on match detail, not separate pages.

| Phase | Routes |
| ---: | --- |
| 8 | `/`, `/matches`, `/matches/[matchId]` |
| 9 | `/standings`, `/stats` |
| 10 | `/teams`, `/teams/[teamId]`, `/players`, `/players/[playerId]`, `/venues`, `/venues/[venueId]` |
| 11 | `/about/data`; commentary and wagon tabs within `/matches/[matchId]` |

Each screen includes loading, empty, error, not-found where applicable, responsive behavior, keyboard access, stable layout, and URL-backed filter/tab state.

---

## 4. Phase 0 - Decisions, Git, and specification foundation

### Goal

Make the project governable before code appears. Resolve decisions that would otherwise force rework.

### Prerequisites

- Read `PLAN.md` and the assignment PDF.
- Confirm the dataset can remain in the repository or document how evaluators obtain it.
- Know the delivery deadline, cloud budget, and whether deployed Kubernetes is mandatory.

### Tasks

- Initialize Git in the workspace and create the protected-main workflow plan.
- Confirm the non-negotiable principles already recorded in `PLAN.md`: correctness, provenance, accessibility, API-contract ownership, one seed command, and minimal infrastructure.
- Answer the blocking decision grill in `PLAN.md` Section 22.
- Confirm the release boundary: Release 1 required, commentary/wagon in 1.1, optional platform work last.
- Write `docs/DESIGN.md` with tokens, responsive rules, table behavior, chart behavior, and async states.
- Add low-fidelity wireframes for overview, match detail, and statistics.
- Add ADR-001 through ADR-005 described in `PLAN.md`.
- Add a short repository `AGENTS.md` only after real commands exist; do not copy the whole plan into it.

### Deliverables

- Git repository with an intentional default branch.
- Approved decision record, phase evidence ledger, and repository working agreement.
- `docs/DESIGN.md`, three wireframes, and initial ADRs.
- Explicit written answers for deadline, cloud, Kubernetes, release scope, and branding.

### Verification and exit gate

- A reviewer can state what is required, optional, and explicitly out of scope.
- No unresolved decision can change the stack, public scope, or deployment target.
- The plan, ADRs, and repository working agreement do not contradict each other.
- `git status` contains only understood project files.

### PR boundary

`chore: establish project decisions and specifications`

### Do not build yet

No application scaffold, database schema, Terraform, Helm, Datadog, authentication, or UI component library customization.

---

## 5. Phase 1 - Runnable walking skeleton

### Goal

Prove that PostgreSQL, Express, Next.js, Compose, and the workspace toolchain connect before domain complexity is introduced.

### Inputs

- Approved Phase 0 decisions.
- Node.js current LTS, Corepack/pnpm, Docker Desktop with Compose v2.

### Tasks

- Create a pnpm workspace with `apps/api` and `apps/web`.
- Add shared root scripts for format, lint, typecheck, test, and build.
- Scaffold strict TypeScript for both apps.
- Add PostgreSQL 16 to `compose.yaml` with a named volume and health check.
- Initialize Prisma in `apps/api`; create an empty baseline migration only if Prisma requires it.
- Add Express 5 with `GET /health`; liveness must not depend on PostgreSQL.
- Add the Next.js App Router shell with one server-rendered status page.
- Add production-oriented multi-stage Dockerfiles only to the point needed for a smoke build.
- Add `.env.example`, environment validation, `.editorconfig`, `.gitignore`, and `.dockerignore`.
- Add a CI skeleton that installs with the frozen lockfile and runs lint, typecheck, tests, and builds.
- Add one Playwright smoke test that reaches the web app and one Supertest health test.

### Commands

```bash
corepack enable
pnpm install
docker compose up --build db api web
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Exit gate

- A clean checkout starts PostgreSQL, API, and web through one documented Compose path.
- `/health` returns 200 while `/ready` is not falsely claimed yet.
- The browser reaches the Next.js shell and its smoke test passes.
- CI runs the same commands developers run locally.

### PR boundary

`chore: add runnable full-stack skeleton`

### Do not build yet

No cricket tables, full importer, design-heavy dashboard, OpenAPI route catalog, or Azure resources.

---

## 6. Phase 2 - Relational model and import contracts

### Goal

Create the complete relational shape and source-validation layer before loading all data.

### Planning checkpoint

Before implementation, review every table in Section 3 against representative source JSON and freeze ID normalization, source precedence, nullability, key, constraint, and rollback decisions. Errors here propagate to every endpoint.

### Tasks

- Translate the 25-table checklist into `schema.prisma` with explicit mapped SQL names.
- Use PostgreSQL-appropriate types: `BIGINT`, `INTEGER`, `NUMERIC`, `TIMESTAMPTZ`, `DATE`, arrays, and JSONB.
- Add all foreign keys, uniqueness rules, checks Prisma can express, and SQL migration checks Prisma cannot express.
- Add the indexes listed in `PLAN.md`, excluding speculative trigram indexes.
- Define folder-specific Zod source schemas for all dataset families.
- Implement pure normalization helpers for mixed IDs, booleans, timestamps, nullable strings, and cricket overs-to-legal-balls.
- Define deterministic source precedence and conflict-record types.
- Define source-to-target ownership in `docs/data-dictionary.md`.
- Build a tiny representative fixture crossing team, player, venue, match, innings, batting, bowling, commentary, and wagon data.
- Test migrating an empty PostgreSQL database to head.
- Test normalization edge cases, especially `17.4` overs and invalid final digits above 5.

### Migration safety

- The initial migration must work from an empty PostgreSQL 16 database.
- Keep raw SQL additions in the migration and explain them in the data dictionary.
- Do not manually edit an already-applied migration after it is shared; add a new migration.
- Backward compatibility becomes mandatory after the first deployed version.

### Exit gate

- Empty-to-head migration passes on real PostgreSQL.
- The mini fixture can be represented without nullable-field abuse or unresolved relations.
- Every table has a documented source and purpose.
- Constraints reject negative counts, invalid team relationships, duplicate natural keys, and invalid XI cardinality at the appropriate validation layer.

### Suggested PRs

1. `feat(db): define IPL relational model`
2. `feat(seed): add source validation contracts`

Two PRs are allowed because schema review and source-parser review require different evidence.

### Do not build yet

Do not populate the database fully, calculate leaderboards, add materialized views, or create duplicate tables for source leaderboard snapshots.

---

## 7. Phase 3 - One full, idempotent seed script

### Goal

Make `pnpm db:seed` the only command needed to discover, validate, normalize, load, reconcile, and report the supplied dataset.

### Tasks

- Implement `apps/api/prisma/seed.ts` as the canonical entrypoint.
- Allow imported helper modules for readability, but expose no separate ingest, verify, or report commands.
- Read `IPL_DATASET_PATH`, defaulting to the repository dataset directory.
- Discover every JSON file recursively and require exactly 729 files for this dataset version.
- Hash each file with SHA-256 and populate `dataset_imports` and `source_files`.
- Load entities in dependency order: season -> teams/venues/players -> squads -> matches -> scorecards/XIs -> standings -> careers -> commentary/wagon -> archives.
- Resolve commentary and wagon identity through innings IDs rather than filenames.
- Archive live-state and precomputed leaderboard JSON in `source_snapshots`; do not normalize them into public aggregate tables.
- Implement deterministic upserts and unchanged-file handling.
- Record source conflicts without silently replacing stronger-source values.
- Run all cardinality, referential, and golden-stat assertions inside the seed lifecycle.
- Activate the import atomically only after every assertion passes.
- Mark failed imports as failed and ensure they never replace the active version.
- Emit a concise human-readable summary and structured JSON report.
- Add a full rerun test proving stable row counts.

### Required acceptance values

| Assertion | Expected |
| --- | ---: |
| JSON source files | 729 |
| Teams | 10 |
| Matches | 74 |
| Venues | 6 |
| Innings | 148 |
| Players/career documents | 247 |
| Commentary events | 20,749 |
| Wagon rows | 17,912 |
| XI members per team per match | 11 |
| Jos Buttler season runs | 863 |
| Yuzvendra Chahal season wickets | 27 |
| Gujarat Titans league/all-match wins | 10 / 12 |

Also require zero unresolved team, player, match, and innings foreign keys; two commentary documents per match; and agreement between official standings and the 70 league matches for wins, losses, and points.

### Commands

```bash
pnpm prisma:migrate
pnpm db:seed
pnpm db:seed
pnpm test:integration
```

The second seed is a deliberate idempotency proof.

### Exit gate

- One command accounts for all 729 source files.
- Re-running it does not increase normalized row counts.
- Invalid data exits non-zero and does not change the active dataset.
- The report names warnings and conflicts precisely.
- Database inspection matches the acceptance values.

### PR boundary

`feat(seed): import and reconcile complete IPL dataset`

### Do not build yet

No HTTP import endpoint, queue, worker, Redis, cron job, or separate seed commands.

---

## 8. Phase 4 - API contract, metadata, and catalog resources

### Goal

Establish one reusable HTTP contract and deliver the low-risk resource routes first.

### Planning checkpoint

Freeze consumer-visible pagination, filtering, sorting, error, cache-header, and response-envelope behavior before adding route handlers. Do not let Express folder structure define the public contract.

### Tasks

- Add the `/api/v1` router, request IDs, Pino HTTP logs, Helmet, explicit CORS, payload limits, and centralized errors.
- Implement RFC 9457 problem details.
- Build shared Zod schemas for pagination, allowlisted sort/order, IDs, search, dates, and response metadata.
- Add stable-sort tiebreakers and maximum `page_size=100`.
- Generate OpenAPI from route schemas and expose `/openapi.json` and `/docs`.
- Generate the TypeScript web client with `openapi-typescript` and `openapi-fetch`.
- Implement `/ready`, metadata, seasons, team catalog/detail/squad/matches, player catalog/detail/matches/career, and venue catalog/detail/matches.
- Label current/career/squad snapshot dates honestly in DTOs.
- Add `Cache-Control` and ETags by route class.
- Test 404, invalid ID, invalid filters/sorts, empty results, maximum page size, and 304 responses.
- Add an OpenAPI snapshot and generated-client drift check.

### Exit gate

- Every route assigned to Phase 4 appears in Swagger with examples, query parameters, errors, and cache headers.
- Integration tests run against seeded PostgreSQL.
- The generated web client is reproducible and CI fails on drift.
- `/ready` fails when PostgreSQL is unavailable or no dataset is active.

### PR boundary

`feat(api): add versioned catalog API and OpenAPI contract`

### Do not build yet

No calculated team/player/venue statistics, process LRU, GraphQL, raw snapshot endpoints, or federated search.

---

## 9. Phase 5 - Match and scorecard API

### Goal

Deliver the core evaluator journey from a filtered match list to a complete scorecard.

### Planning checkpoint

Resolve nested innings identity, score formatting, substitute participation, stable sort semantics, commentary ordering, and pagination limits before adding the match handlers.

### Tasks

- Implement match collection filters for season, team, venue, stage, winner, date range, and text query.
- Implement match detail with result, toss, venue, officials, awards, and innings summaries.
- Implement the composite scorecard response to prevent many frontend round trips.
- Implement granular innings, batting, bowling, fielding, and fall-of-wickets routes.
- Validate that an `innings_id` belongs to the requested `match_id`; return 404 for mismatched nesting.
- Format cricket overs from legal balls at the DTO boundary.
- Preserve scorecard position ordering while supporting only documented alternate sorts.
- Implement commentary and wagon endpoints now at the API layer, with maximum page sizes of 200 and 500 respectively.
- Keep commentary event ordering stable even when source event IDs are null.
- Add database indexes only when query evidence shows a missing listed index.
- Add contract tests for all route/filter/sort combinations and response examples.

### Exit gate

- All Phase 5 routes are documented and tested.
- A match list can open all 74 match details and scorecards without unresolved references.
- Score totals reconcile with innings facts and overs render correctly.
- Commentary and wagon endpoints paginate deterministically and do not load entire datasets into memory.

### PR boundary

`feat(api): expose matches scorecards and innings facts`

### Do not build yet

No UI wagon plot, live polling, websocket, or archived-live endpoint.

---

## 10. Phase 6 - Calculated analytics and cache behavior

### Goal

Calculate season statistics from normalized scorecard facts, prove correctness, and cache only repeated expensive results.

### Planning checkpoint

Write and review the formula, denominator, scope, qualification threshold, tie-breaker, and golden value for every statistic before writing SQL. A plausible but wrong cricket statistic is worse than a missing chart.

### Tasks

- Implement parameterized PostgreSQL queries for batting, bowling, team, venue, player-season, and summary statistics.
- Define `league`, `playoffs`, and `all` scope consistently across all endpoints.
- Calculate batting average by dismissals, strike rate by balls, economy by legal balls, and rates as `null` for a zero denominator.
- Reconcile calculated NRR with official standings while keeping official NRR canonical in the standings response.
- Implement deterministic ranking and tie-break rules.
- Add the five stats routes plus team, player-season, and venue stats routes.
- Record `EXPLAIN (ANALYZE, BUFFERS)` for the three heaviest queries.
- Add `lru-cache` only around calculated service results.
- Configure maximum 500 entries and five-minute TTL.
- Key by active dataset version, route, and normalized sorted query parameters.
- Coalesce identical concurrent cold requests.
- Never cache errors, health/readiness, ordinary collections, scorecards, commentary, or wagon responses.
- Add HTTP cache headers and ETags independent of the process cache.
- Test cache hit, miss, expiry, parameter separation, concurrency, dataset-version invalidation, and failure behavior.

### Performance decision

Target p95 under 250 ms for aggregate requests on the full local dataset. Do not add a materialized view unless correct SQL and indexes still miss that target under repeatable measurement. Do not add Redis unless the trigger conditions in `PLAN.md` Section 12 are met.

### Exit gate

- Buttler 863, Chahal 27, and Gujarat Titans 10/12 win assertions pass.
- No response contains `NaN`, `Infinity`, or an invented zero rate.
- Official/calculated NRR differences are visible in reconciliation evidence.
- Cache tests prove dataset-version isolation and no caching on failure.
- Query plans and benchmark conditions are recorded.

### PR boundary

`feat(api): add calculated season analytics and bounded cache`

### Do not build yet

No Redis, materialized views without evidence, hand-maintained aggregate tables, or analytics microservice.

---

## 11. Phase 7 - Frontend foundation and design system

### Goal

Create the shared frontend contract, layout, primitives, and state behavior once before page delivery.

### Planning checkpoint

Freeze navigation, breakpoints, tokens, URL-state rules, API-client ownership, query-key structure, async states, and accessibility acceptance before page-specific components multiply.

### Tasks

- Implement product tokens from `docs/DESIGN.md`: color, type, spacing, borders, focus, charts, table density, and responsive widths.
- Build the working analytics shell with navigation for Overview, Matches, Standings, Stats, Teams, Players, and Venues.
- Use shadcn/Radix primitives selectively and Lucide icons for familiar icon actions.
- Wire the generated OpenAPI client; no duplicated endpoint DTOs.
- Add TanStack Query for interactive pagination/filters and hydrate server-fetched initial data where useful.
- Centralize query keys with active dataset version and all URL parameters.
- Make URL search parameters the source of truth for filters, sort, page, and tabs.
- Build shared loading, empty, problem-error, retry, not-found, and stale-data states.
- Build stable logo/image fallbacks with explicit dimensions.
- Add accessible table primitives and a deliberate stacked mobile alternative.
- Add formatter tests for dates, nulls, rates, overs, and not-out scores.

### Client-cache policy

- Collections and leaderboards: five-minute `staleTime`.
- Match details: one-hour `staleTime`.
- Commentary, wagon, and reference data: 24-hour `staleTime` with shorter garbage collection for large pages.
- Keep previous data during pagination.
- Prefetch match detail on hover/focus intent, not commentary or wagon datasets.
- Retry GET requests at most twice; never retry 4xx responses.

### Exit gate

- Shell and shared states work at 360px and desktop widths.
- Keyboard navigation and visible focus work throughout the shell.
- Generated DTOs are the only API data contract in the web app.
- Refresh and Back/Forward preserve URL state.
- Missing logos and long names do not shift or overlap the layout.

### PR boundary

`feat(web): establish analytics shell and data foundations`

### Do not build yet

No page-specific chart library wrappers, global Redux store, decorative landing page, or copied dashboard template.

---

## 12. Phase 8 - Overview, matches, and scorecard experience

### Goal

Ship the first complete vertical user journey using real API data.

### Planning checkpoint

Approve the overview, match-list, and scorecard information hierarchy at desktop and 360px widths. Confirm the exact three E2E journeys and API calls before page implementation.

### Tasks

- Build `/` as the working IPL 2022 overview, not a marketing hero.
- Show season outcome, total matches/runs/wickets/sixes, leading batter/bowler, final result, recent/key matches, and standings preview.
- Build `/matches` with team, venue, stage, and date filters; sortable/paginated results; and shareable URL state.
- Build `/matches/[matchId]` with result header, teams, venue, toss, officials, awards, innings tabs, batting, bowling, fielding, extras, and fall of wickets.
- Use one composite scorecard request for the core page.
- Add loading skeletons with stable dimensions, empty results, retryable errors, and route-level not found.
- Add metadata/title behavior for match detail.
- Test the journey overview -> matches -> filtered result -> scorecard.
- Verify desktop and mobile screenshots manually in the browser.

### Exit gate

- The critical match journey passes Playwright on desktop and mobile.
- No screen requires horizontal page scrolling at 360px.
- Tables retain headers/meaning in their mobile form.
- Browser console has no uncaught errors or hydration warnings.
- Lighthouse accessibility on the three pages is at least 90 in a production-like run.

### PR boundary

`feat(web): add season overview and match scorecards`

### Do not build yet

No commentary/wagon UI, comparison tools, fake live states, or autoplay animation.

---

## 13. Phase 9 - Standings and statistics experience

### Goal

Make calculated data understandable, filterable, and traceable rather than merely displaying leaderboards.

### Planning checkpoint

Confirm the default tab, scope, filters, qualification thresholds, table columns, chart purpose, URL parameters, and accessible chart alternative before implementation.

### Tasks

- Build `/standings` from the official snapshot with position, played, won, lost, points, NRR, and recent form.
- Link each team row to its detail page.
- Build `/stats` with batting, bowling, and team tabs.
- Expose scope, team, qualification thresholds, sort, and pagination in the URL.
- Use tables as the primary precise representation and charts only where comparison is clearer.
- Add accessible text/table equivalents for charts.
- Explain metric scope and null values without pretending later career snapshots are 2022 facts.
- Add the E2E journey stats -> change scope/filter -> copy URL -> reload -> identical view.
- Check golden leaders visibly against API evidence.

### Exit gate

- Standings show exactly 10 teams and official league values.
- Stats filters and sorting are stable after reload and Back/Forward.
- Charts do not rely on color alone and have accessible alternatives.
- Golden values match the seed and API tests.

### PR boundary

`feat(web): add standings and season statistics`

### Do not build yet

No speculative prediction, player comparison, or duplicated official/precomputed leaderboard screens.

---

## 14. Phase 10 - Team, player, and venue exploration

### Goal

Complete all required catalog and detail routes while preserving historical/source-snapshot distinctions.

### Planning checkpoint

Confirm which fields are 2022 facts and which are later source snapshots. Freeze the labeling and empty-state behavior before implementing team, player, and venue pages.

### Tasks

- Build `/teams` and `/teams/[teamId]` with 2022 display identity, season summary, match history, source squad snapshot, and calculated stats.
- Build `/players` and `/players/[playerId]` with search/filter, 2022 season performance, match history, and separately labeled career snapshot.
- Build `/venues` and `/venues/[venueId]` with city, season matches, average first-innings score, and chase/defend outcomes.
- Handle profiles with missing images, dates, roles, or career formats.
- Prevent current 2024 profile/squad data from being labeled as historical 2022 truth.
- Add entity-list and detail component tests.
- Add E2E links standings -> team -> match and overview leader -> player.

### Exit gate

- Every required frontend route is linked from navigation or contextual links.
- Source snapshot dates are visible where required.
- Entity pages use generated API types and URL-backed filters.
- Long player/team/venue names remain readable at mobile widths.

### PR boundary

`feat(web): add team player and venue explorers`

### Do not build yet

No social-feed integration, profile editing, authentication, or multi-season switcher.

---

## 15. Phase 11 - Commentary, wagon wheel, and provenance

### Goal

Use the dataset's differentiating rich sources without making the match page slow or inaccessible.

### Planning checkpoint

Resolve event ordering, source-versus-display over numbering, wagon coordinate transforms, filter URL state, pagination, and the accessible table fallback before implementation.

### Tasks

- Add a commentary tab to match detail with innings, over, batter, bowler, and event filters.
- Fetch commentary by page; never render all 20,749 events at once.
- Distinguish source over/ball fields from display numbering.
- Preserve stable ordering for over-end records without source event IDs.
- Add a responsive wagon-wheel SVG using supplied x/y coordinates.
- Add batter, bowler, zone, and run filters; keep selections in the URL.
- Use stable SVG dimensions/viewBox so controls and data do not shift layout.
- Add keyboard-accessible controls, tooltip/focus behavior, and a tabular shot-data alternative.
- Build `/about/data` with source inventory, precedence, snapshot dates, derivation formulas, import version, and known limitations.
- Lazy-load wagon rendering and non-critical chart code.
- Test commentary pagination and wagon filter/plot/table synchronization.

### Exit gate

- Commentary and wagon E2E journeys pass at desktop and mobile viewports.
- Large-source tabs do not delay initial scorecard rendering.
- Every plotted shot has an equivalent inspectable table row.
- The provenance page clearly separates normalized facts, runtime calculations, official snapshots, and archives.

### PR boundary

`feat(web): add commentary wagon wheel and data provenance`

### Do not build yet

No canvas/Three.js, simulated live playback, guessed event joins, or animation that ignores reduced motion.

---

## 16. Phase 12 - Production hardening, delivery, and evaluator polish

### Goal

Turn the feature-complete product into a reproducible, secure, observable, deployable submission.

### Planning checkpoint

Freeze the environment matrix, secret ownership, database roles, migration/import order, immutable image flow, health gates, smoke tests, rollback, backup, and evaluator evidence before changing deployment infrastructure.

### Quality tasks

- Complete import, domain, database, API, component, E2E, and axe suites from `PLAN.md` Section 15.
- Run Playwright at desktop and mobile sizes and screenshot only the three stable reference pages.
- Verify 200% zoom, keyboard operation, reduced motion, contrast, and 44px mobile targets.
- Meet Lighthouse 90+ targets and LCP/CLS budgets on production-like builds.
- Record representative query plans and fix measured bottlenecks.
- Run dependency, filesystem/image, and secret scans.
- Confirm logs contain request IDs and useful failure context without raw payloads or secrets.

### Packaging and CI tasks

- Harden API and web multi-stage images with non-root users and minimal runtime contents.
- Complete Compose services: `db`, `migrate`, `seed`, `api`, and `web`.
- Mount the dataset read-only only into the seed service.
- Make service readiness respect migration and active-dataset state.
- Complete parallel CI jobs for backend, frontend, database, contract drift, images, security, and E2E.
- Build images once, tag by commit SHA, and deploy those exact images.

### Azure deployment tasks

- Provision ACR, Container Apps environment, API/web apps, PostgreSQL Flexible Server, import/migration job, Key Vault, and monitoring.
- Configure GitHub OIDC; do not store long-lived Azure credentials.
- Use separate database roles for migration/owner, importer, and read-only API access.
- Run migration then the same `pnpm db:seed` entrypoint as controlled jobs.
- Deploy API, wait for `/ready`, deploy web, and run public smoke tests.
- Retain the previous app revision and document rollback.
- Enable appropriate backups, TLS, budget alerts, and log retention.

### Documentation and evaluator tasks

- Complete `README.md`, architecture diagram, local/deployed commands, environment table, URLs, limitations, and screenshots.
- Complete `docs/architecture.md`, `docs/data-dictionary.md`, API conventions, design contract, and ADRs.
- Add valid thin Kubernetes artifacts because the assignment checklist mentions them, but state honestly whether they are deployed.
- Validate Kustomize/manifests client-side and with schema linting.
- Produce a final acceptance report mapping every assignment requirement to evidence.
- Test from a genuinely clean checkout using only README instructions.

### Commands

```bash
docker compose up --build db migrate seed api web
pnpm verify
pnpm test:e2e
pnpm openapi:check
docker build -f apps/api/Dockerfile .
docker build -f apps/web/Dockerfile .
```

Add exact cloud and Kubernetes commands to the README only after they are real and tested.

### Exit gate

- A clean clone starts through the documented canonical path.
- `pnpm db:seed` succeeds twice and all import assertions pass.
- Every required route is in Swagger and every required screen is reachable.
- Desktop/mobile critical paths and accessibility checks pass.
- CI gates merges; a main merge deploys tested immutable images.
- Public web, API, Swagger, health, and readiness URLs work.
- A reviewer can understand source truth, calculations, cache behavior, limitations, and rollback without oral explanation.

### Suggested PRs

1. `test: complete release quality gates`
2. `ci: add reproducible container delivery`
3. `docs: prepare evaluator-ready submission`

### Stop condition

Stop here when every exit gate passes. A polished required product is the goal; more platform tools are not automatically more complete.

---

## 17. Phase 13 - Optional stretch work

Start only after Phase 12 is demonstrably complete. Each item is independent and must have its own acceptance gate.

### 13A - Terraform

- Provision the existing Azure topology.
- Keep application image revisions in GitHub Actions, not Terraform state.
- Add format, validate, plan, state-backend, and destroy/rollback documentation.
- Gate: a fresh non-production environment can be planned reproducibly without secrets in Git.

### 13B - Datadog or additional observability

- First confirm evaluator value beyond Azure/Application Insights.
- Instrument request latency, error rate, database pressure, cache hit rate, and import results.
- Gate: one documented dashboard and one tested alert answer real operational questions.

### 13C - Helm and optional Kubernetes deployment

- Package already validated Kubernetes resources only if a real cluster is required.
- Include ConfigMaps, secret references, probes, resources, migration/import job, ingress, and rollback notes.
- Gate: lint/template/schema validation passes, and deployment claims match reality.

### 13D - Product extensions

- Federated search.
- Two-player comparison.
- Two-team comparison.
- Archived final live snapshot diagnostic, clearly labeled.

Gate each extension with a real user journey and remove it if it weakens the core release.

---

## 18. Cross-phase verification ledger

Update this table as work proceeds. Link to a test run, CI job, screenshot, report, or deployed URL rather than writing only "done."

| Phase | Evidence owner | Required artifact | Status |
| ---: | --- | --- | --- |
| 0 | Product/architecture | Decisions, design, ADRs | Not started |
| 1 | Platform | Clean-start and browser smoke evidence | Not started |
| 2 | Data model | Empty-to-head migration and parser tests | Not started |
| 3 | Data import | Full import report and rerun counts | Not started |
| 4 | API catalog | Swagger, contract tests, generated-client check | Not started |
| 5 | Match API | Scorecard reconciliation and endpoint suite | Not started |
| 6 | Analytics | Golden stats, NRR report, query plans, cache suite | Not started |
| 7 | Web foundation | Responsive shell and shared-state checks | Not started |
| 8 | Match web | Desktop/mobile journey evidence | Not started |
| 9 | Stats web | URL persistence and accessibility evidence | Not started |
| 10 | Entity web | Cross-entity navigation evidence | Not started |
| 11 | Rich data | Commentary/wagon performance and a11y evidence | Not started |
| 12 | Release | Clean clone, CI, deploy, smoke, acceptance report | Not started |
| 13 | Optional | Separate evidence per chosen extension | Deferred |

---

## 19. Recommended implementation cadence

For an 8-12 focused-day assignment, use this as a sequencing guide, not a promise:

| Timebox | Target |
| --- | --- |
| Day 1 | Phases 0-1 |
| Days 2-3 | Phases 2-3 |
| Days 4-5 | Phases 4-6 |
| Day 6 | Phase 7 |
| Days 7-8 | Phases 8-10 |
| Day 9 | Phase 11 or cut it explicitly if the deadline requires |
| Days 10-11 | Phase 12 quality, packaging, and deployment |
| Day 12 | Clean-room run, evaluator polish, contingency |

If time compresses, cut in this order: Datadog -> Helm -> Terraform -> comparisons -> venue analytics depth -> wagon visualization. Do not cut migrations, seed validation/idempotency, OpenAPI, core async states, Docker, critical tests, or README reproducibility.

---

## 20. Final launch checklist

- [ ] All Phase 0 blocking decisions are answered.
- [ ] All 25 planned tables exist with migrations, constraints, indexes, and documentation.
- [ ] All 729 JSON files are accounted for by one idempotent `pnpm db:seed` command.
- [ ] No precomputed leaderboard family is treated as public aggregate truth.
- [ ] Every required API route is implemented, documented, validated, and tested.
- [ ] Every required frontend route is linked, responsive, accessible, and handles async states.
- [ ] Calculated stats, NRR reconciliation, LRU behavior, ETags, server cache headers, and client caching are tested.
- [ ] Compose starts `db`, `migrate`, `seed`, `api`, and `web` from a clean clone.
- [ ] CI uses the frozen lockfile, real PostgreSQL, contract drift checks, image builds, security scans, and E2E.
- [ ] Deployment uses OIDC, controlled database jobs, immutable images, readiness checks, smoke tests, and rollback.
- [ ] README includes working local and public URLs plus honest limitations.
- [ ] Kubernetes/Terraform/Datadog claims match what is actually implemented.
- [ ] Final acceptance evidence maps back to the assignment PDF.

This is the implementation stop line. Anything beyond it is a separate product decision, not unfinished assignment work.
