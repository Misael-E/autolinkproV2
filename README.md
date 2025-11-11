# Autolink CRM Monorepo

This repo hosts the Autolink multi-tenant CRM platform. Multiple branded front-ends share a common data and component layer orchestrated with Turborepo, Prisma, Clerk, Resend, and pnpm.

## Highlights

- **Multi-brand apps** – `apps/aztec` and `apps/odetail` are independent Next.js 14 front-ends that talk to the same database layer and UI kit.
- **Auth & org management** – Clerk powers tenant-aware auth flows (SSO, user invitations, org switching).
- **CRM tooling** – Scheduling, invoicing, statements, service catalogs, payments, and analytics backed by PostgreSQL + Prisma (`packages/database`).
- **Transactional comms** – Resend with `react-email` drives PDF invoices, appointment reminders, and other notifications.
- **Shared packages** – Reusable UI, schema/types, lint, and TS configs live under `packages/*` so changes propagate everywhere through pnpm workspaces.

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

- Node.js ≥ 18 (align with `.nvmrc` if present)
- pnpm ≥ 8 (repo is configured with `packageManager: pnpm@8.9.0`)
- Access to a PostgreSQL database
- Clerk instance (publishable + secret keys)
- Resend API key
- Git

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment variables**

   - Copy the provided `.env` files in each app/package or create new ones.
   - Ask administration/IT for the .env file
   - At minimum your .env should have:

     ```
      POSTGRES_DATABASE=
      POSTGRES_HOST=
      POSTGRES_USER=
      POSTGRES_PASSWORD=
      POSTGRES_URL=
      NEXT_PUBLIC_COMPANY_ID=odetail

      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
      CLOUDINARY_API_KEY=
      CLOUDINARY_API_SECRET=

      RESEND_API_KEY=
      CLERK_SECRET_KEY=
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

      POSTGRES_URL_NO_SSL=
      POSTGRES_PRISMA_URL=
      POSTGRES_URL_NON_POOLING=
     ```

   - Next.js apps also reference additional `NEXT_PUBLIC_*` flags for analytics, feature toggles, etc. Keep per-app `.env.local` files in sync.

## Local Postgres (Docker)

Use Docker to run a local PostgreSQL instance for development. Make sure Docker Desktop is running.

1. Create a persistent volume (first time only):

   ```bash
   docker volume create autolinkpro_pgdata
   ```

2. Start Postgres with the required environment variables:

   ```bash
   docker run -d \
     --name autolink-postgres \
     -p 5432:5432 \
     -e POSTGRES_USER=aztec \
     -e POSTGRES_PASSWORD=Aztec403! \
     -e POSTGRES_DB=autolinkpro \
     -e PGDATA=/var/lib/postgresql/data \
     -v autolinkpro_pgdata:/var/lib/postgresql/data \
     postgres:17
   ```

3. Set your local `.env` to point Prisma to this database:

   ```env
   # Prisma uses POSTGRES_URL in schema.prisma
   POSTGRES_URL=postgresql://aztec:Aztec403!@localhost:5432/autolinkpro
   ```

4. Verify the container is healthy and accepting connections:

   ```bash
   docker logs -f autolink-postgres   # wait for "database system is ready to accept connections"
   # optional psql shell
   docker exec -it autolink-postgres psql -U aztec -d autolinkpro
   ```

5. When finished, stop/remove the container (data persists in the named volume):

   ```bash
   docker stop autolink-postgres && docker rm autolink-postgres
   ```

**Note:** You can also just use the docker application itself to create and run the container. It is much easier than running commands.

Security note: these credentials are for local development only; do not reuse in staging/production.

1. **Database & Prisma**

   ```bash
   pnpm db:migrate:dev          # prisma migrate dev (packages/database)
   pnpm db:seed                 # optional seed script
   pnpm --filter @repo/database studio   # Prisma Studio inspector
   ```

   For production/staging deploys run `pnpm db:migrate:deploy`. Use `pnpm db:push` only for prototypes.

2. **Run the apps**
   ```bash
   pnpm dev --filter aztec      # http://localhost:3000 (set PORT to change)
   pnpm dev --filter odetail    # http://localhost:3001
   ```
   `pnpm dev` (without filters) lets Turbo orchestrate all dev targets, including Prisma generate/watch steps.

## Emails & Resend

- Transactional templates live under `apps/*/src/emails` and are built with `react-email`.
- Preview locally with `pnpm --filter aztec run email` (or `odetail`).
- Production deploys require `RESEND_API_KEY` and verified sender domains configured in the Resend dashboard.

## Common Scripts

| Command                  | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| `pnpm dev`               | Runs all `dev` scripts through Turbo (Next.js apps + database watchers). |
| `pnpm build`             | Workspace build pipeline (Prisma generate, migrations, Next builds).     |
| `pnpm lint`              | Workspace-wide linting via shared ESLint config.                         |
| `pnpm format`            | Formats TS/TSX/MD files with Prettier.                                   |
| `pnpm generate`          | Runs Prisma generate before builds/dev.                                  |
| `pnpm db:migrate:deploy` | Applies latest migrations against prod/staging DB.                       |
| `pnpm db:push`           | Push schema changes without migrations (development only).               |

## Deployment Notes

- Each app can deploy independently (Vercel, Docker, etc.) as long as it receives the environment variables above and can reach the shared Postgres instance.
- The `build` pipeline depends on `generate` and `db:migrate:deploy`, ensuring Prisma clients are up to date before shipping.
- Keep prisma migrations in `packages/database/prisma/migrations` and commit them with related feature work.

## Troubleshooting

- **Prisma client not found** – run `pnpm generate` or `pnpm db:migrate:dev`.
- **Env drift between apps** – store shared defaults in the repo root and override per app via `.env.local`.
- **Email previews failing** – ensure `resend` CLI dependencies are installed (`pnpm install`) and run the `email` script inside the correct app.

Welcome to the Autolink CRM codebase! Open an issue or start a discussion if you run into gaps in this README.
