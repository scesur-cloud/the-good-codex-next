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

## Getting Started
1. **Start Server**: `npm run dev`
2. **Start Worker**: `npm run worker`
3. **New Project**: Go to `http://localhost:3000/planner`

## CI/CD Pipeline
- **Local Verification**: Run `pnpm -s ci` to execute linting, type-checking, production build, and smoke tests locally.
- **Continuous Integration**: GitHub Actions will automatically run the same checks on every push or pull request to `main` or `master`.
- **Smoke Tests**: Smoke tests require a `GEMINI_API_KEY`. If the key is missing in CI secrets, the smoke step will be skipped to keep the build green.

## Architecture
- **Next.js 15**: App Router, Server Components
- **Prisma + SQLite**: Robust state management (CI uses `ci.db`)
- **Gemini 1.5**: Agent intelligence
- **Worker**: Independent process for job execution
