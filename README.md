# Autolink CRM Monorepo

This repo hosts the Autolink multi-tenant CRM platform. Multiple branded front-ends share a common data and component layer orchestrated with Turborepo, Prisma, Clerk, Resend, and pnpm.

## Highlights

- **Multi-brand apps** - `apps/aztec` and `apps/odetail` are independent Next.js 14 front-ends that talk to the same database layer and UI kit.
- **Auth & org management** - Clerk powers tenant-aware auth flows (SSO, user invitations, org switching).
- **CRM tooling** - Scheduling, invoicing, statements, service catalogs, payments, and analytics backed by PostgreSQL + Prisma (`packages/database`).
- **Transactional comms** - Resend with `react-email` drives PDF invoices, appointment reminders, and other notifications.
- **Shared packages** - Reusable UI, schema/types, lint, and TS configs live under `packages/*` so changes propagate everywhere through pnpm workspaces.

## Directory Layout

```
apps/
  aztec/      # Aztec Auto Glass CRM front-end
  odetail/    # ODetail CRM front-end
packages/
  database/   # Prisma schema, client, and seeds
  ui/         # Shared React components
  types/      # Zod schemas + TS types
  eslint-config/, typescript-config/
```

## Tech Stack

- Next.js 14 + React 18
- pnpm workspaces + Turborepo
- Prisma ORM targeting PostgreSQL
- Clerk (auth, organizations, user management)
- Resend + `react-email` (transactional emails + PDF generation)
- Redux Toolkit, React Hook Form, Zod, Tailwind, Cloudinary, React PDF, Recharts

## Requirements

- Node.js ≥ 18
- pnpm ≥ 8 (`packageManager: pnpm@8.9.0`)
- Docker Desktop (for local PostgreSQL)
- Clerk instance (publishable + secret keys)
- Resend API key
- Cloudinary account

## Getting Started

### 1. Start the database

Make sure Docker Desktop is running, then:

```bash
docker compose up -d
```

This spins up a PostgreSQL 16 container (`autolinkpro-db`) on port `5432`. Data is persisted in a named Docker volume.

> To stop the database: `docker compose down`
> To reset the database (wipe all data): `docker compose down -v && docker compose up -d`

### 2. Configure environment variables

Each app and the database package has a `.env.example` file. Copy each one to `.env` and contact admin for passwords/secrets:

```bash
cp packages/database/.env.example packages/database/.env
cp apps/aztec/.env.example         apps/aztec/.env
cp apps/odetail/.env.example       apps/odetail/.env
```

Then create a root `.env` for Docker Compose:

```bash
# .env  (repo root — gitignored)
POSTGRES_USER=aztec
POSTGRES_PASSWORD=your_password # this needs to be changed
POSTGRES_DATABASE=autolinkpro
```

The DB credentials in `packages/database/.env` must match these values.

Secrets to fill in per app:

| Variable | Where to get it |
|---|---|
| `CLOUDINARY_*` | [cloudinary.com/console](https://cloudinary.com/console) |
| `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |
| `NEXT_PUBLIC_KNOCK_API_KEY` / `KNOCK_API_SECRET` | [knock.app/dashboard](https://knock.app/dashboard) (aztec only) |

### 3. Install, migrate, and seed

```bash
pnpm setup:dev
```

This runs in sequence:
1. `pnpm install` - installs all workspace dependencies
2. `pnpm generate` - generates the Prisma client
3. `pnpm db:migrate:deploy` - applies all migrations to the local database
4. `pnpm db:seed` - seeds sample data for development

### 4. Run the apps

```bash
pnpm dev
```

| App | URL |
|---|---|
| aztec | http://localhost:3000 |
| odetail | http://localhost:3001 |

To run a single app: `pnpm dev --filter=aztec`

---

## Common Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Runs all apps through Turbo |
| `pnpm build` | Full workspace build pipeline |
| `pnpm lint` | Workspace-wide linting |
| `pnpm format` | Formats TS/TSX/MD with Prettier |
| `pnpm generate` | Regenerates Prisma client |
| `pnpm db:migrate:dev` | Create a new migration during development |
| `pnpm db:migrate:deploy` | Apply migrations (production/staging) |
| `pnpm db:seed` | Seed the local database with sample data |
| `pnpm db:push` | Push schema without a migration (prototyping only) |
| `pnpm --filter @repo/database studio` | Open Prisma Studio |
| `pnpm setup:dev` | Full first-time local setup (install → generate → migrate → seed) |

---

## Emails & Resend

- Transactional templates live under `apps/*/src/emails` and are built with `react-email`.
- Preview locally with `pnpm --filter aztec run email` (or `odetail`).
- Production deploys require `RESEND_API_KEY` and verified sender domains configured in the Resend dashboard.

---

## Deployment Notes

- Each app deploys independently (Vercel, Docker, etc.) as long as it receives the correct environment variables and can reach the shared Postgres instance.
- The `build` pipeline depends on `generate`, ensuring the Prisma client is up to date before shipping.
- Run `pnpm db:migrate:deploy` against your production database before or during deploy — **never run `db:seed` against production**.
- Keep migrations in `packages/database/prisma/migrations` and commit them alongside related feature work.

---

## Troubleshooting

- **Auth failed connecting to DB** — Make sure the Docker container is running (`docker compose up -d`) and that the credentials in `packages/database/.env` and root `.env` match.
- **Stale Docker volume** — If you changed DB credentials and migrations fail, reset with `docker compose down -v && docker compose up -d`, then re-run `pnpm setup:dev`.
- **Prisma client not found** — Run `pnpm generate`.
- **Email previews failing** — Ensure dependencies are installed (`pnpm install`) and run the `email` script inside the correct app.
