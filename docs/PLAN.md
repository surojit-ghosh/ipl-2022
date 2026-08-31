# Remaining Work

Updated: 2026-08-31

## Production verification

- [x] Confirm `https://aiko.surojit.in` loads over HTTPS and HTTP redirects to HTTPS.
- [x] Confirm Caddy logs show a successfully issued certificate.
- [ ] Confirm `/health`, `/ready`, `/docs/`, and `/openapi.json` work through the production domain. (`/docs` redirect added; verify after deploy.)
- [x] Confirm frontend API requests work through the same-origin `/api/*` proxy.
- [ ] Confirm PostgreSQL, backend, frontend, and Caddy remain healthy after a VPS reboot. (Deferred.)

## Data

- [x] Run the initial production seed manually: `docker compose run --rm migrate pnpm db:seed`.
- [ ] Verify expected seed counts and key pages after seeding.

## Delivery

- [ ] Confirm GitHub Actions CI passes on `main`.
- [ ] Confirm a new push to `main` completes the Oracle VPS deployment job.
- [ ] Update `README.md` with Oracle deployment URL and operating commands.
- [ ] Add a database backup/export routine before treating the VPS as durable storage.

## Quality checks

- [ ] Confirm team and player images load in production.
- [ ] Test main UI routes on mobile and desktop.
- [ ] Verify loading, empty, error, and missing-image states.
- [ ] Add focused automated API/browser checks if the project will continue beyond the demo.
