# Pharm

Next.js 16 app for Enviro Pharmacy, with Prisma/PostgreSQL, NextAuth credentials auth, dashboard tooling, storefront pages, and email-based password reset flows.

## Local Setup

1. Copy [.env.example](.env.example) to `.env` and fill in the values.
2. Install dependencies:

```bash
pnpm install
```

3. Run Prisma migrations:

```bash
pnpm prisma migrate deploy
```

4. Start the app:

```bash
pnpm dev
```

## Environment Variables

Required:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma and the `pg` adapter.
- `AUTH_SECRET`: secret used by NextAuth.

Recommended:

- `NEXTAUTH_URL`: app base URL used locally and as the primary reset-link base.
- `AUTH_URL`: optional alternate public base URL.
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Vercel Deployment

This repo is prepared for Vercel with Prisma generation on install.

1. Import the repository into Vercel.
2. Set the framework preset to `Next.js`.
3. Add the environment variables from [.env.example](.env.example) in the Vercel project settings.
4. Use a hosted PostgreSQL database and set `DATABASE_URL` to the production connection string.
5. Set `NEXTAUTH_URL` or `AUTH_URL` to your production domain.
6. If you need password reset and order emails in production, configure the SMTP variables.
7. Deploy.

Notes:

- `postinstall` runs `prisma generate`, which Vercel needs so `@prisma/client` is available at build/runtime.
- Password reset links fall back to `AUTH_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, or `VERCEL_URL` when `NEXTAUTH_URL` is not set.
- If your database provider requires SSL, prefer `sslmode=verify-full` in `DATABASE_URL`.

## Production Build

```bash
pnpm build
```
