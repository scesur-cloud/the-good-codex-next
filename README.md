# The Good Codex - Agent Squad (v0.9.4)

Otonom içerik üretim ve yönetim sistemi.

## v0.9.4 Release Notes (Quality & Scaling)
- **Export Polish**: Run exports (`.zip`) now include a `README_RUN.md` with operational details (Status, Winner, Manifest) and use human-readable filenames.
- **Rubric Visibility**: Added "Active Rubric" card to Run Detail page, showing the criteria used for QA (e.g. EDU_V1).
- **Rate Limiting**: Added 10s cooldown to "Reproduce" and "Re-QA" actions to prevent job duplication.
- **Template Config**: Planner templates now explicitly state their target Rubric and Format.

## v0.9.3 Release Notes (Operational Recovery)
- **Export Feature**: Download full run data (Artifacts + Evaluations + Summary) as ZIP.
- **Recovery Actions**:
  - `Reproduce`: Re-runs Producer agents for the current plan.
  - `Re-QA`: Re-runs QA agents for existing outputs.
- **Full Loop**: Complete flow from Planner -> Run -> Evaluate -> Recover -> Export.

## v0.9.2 Release Notes (Product Polish)
- **Planner**: New project intake wizard with "Quick Fill" templates.
- **Run Detail**: Centralized operational hub with verbose status messages.
- **Safety Nets**: Worker downtime warnings and "No Winner" alerts.
- **Derived Views**: Robust `/raci`, `/todo`, `/timeline` pages.

## Quick Start (Docker - Recommended)
The fastest way to run the entire stack (Web + Worker + DB) on Mac, Windows, or Linux:
1. Ensure Docker Desktop is running.
2. In the repo directory, run: `make up`
3. Access: `http://localhost:3000`

## Solo Ops (Makefile)
- `make up`: Start everything.
- `make logs`: View logs (add `-web` or `-worker` for specific logs).
- `make backup`: Save a snapshot of the database to `backups/`.
- `make restore FILE=...`: Restore from a snapshot.
- `make ps`: Check service status & health.

## Security
- **Admin Actions**: Protected by `ADMIN_TOKEN`. Define this in your `.env` to enable self-heal buttons in the UI.
- **Mock Mode**: Smoke tests and worker will automatically fallback to a deterministic "Mock Provider" if `GEMINI_API_KEY` is missing.

## CI/CD Pipeline
- **Local Verification**: Run `pnpm -s ci`.
- **Smoke Tests**: Guaranteed to run in CI. Uses mock provider if `GEMINI_API_KEY` is not present in secrets.

## Architecture
- **Next.js 15**: App Router, Server Components
- **Prisma + SQLite**: Robust state management (CI uses `ci.db`)
- **Gemini 1.5**: Agent intelligence
- **Worker**: Independent process for job execution
