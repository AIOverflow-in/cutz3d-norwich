# 3D Cutz Norwich

A production-ready website and online booking platform for **3D Cutz**, 19 Prince of Wales Road, Norwich. It combines a distinctive responsive storefront, real-time appointment availability, secure customer self-service, and a protected salon dashboard.

## What is included

- SEO landing page with LocalBusiness, FAQ and service structured data
- Three-step appointment flow with server-validated availability
- Atomic booking conflict checks in Neon Postgres
- Private management links plus reference-and-email recovery
- Customer rescheduling and cancellation
- Passwordless, email-only salon dashboard with booking status history
- Resend notifications for booking and status events
- Local SEO journal, sitemap, robots rules, Open Graph image and manifest
- Scheduled OpenAI article generation through GitHub Actions
- Desktop and mobile Playwright regression tests

This is deliberately a booking product, not an ERP: there is no payroll, inventory, accounting or unrelated administration.

## Stack

- Next.js 16, React 19 and TypeScript
- Prisma 6 with Neon Postgres
- Resend transactional email
- OpenAI Responses API for reviewable weekly article drafts
- Vercel hosting and GitHub Actions

## Local development

```bash
npm install
cp .env.example .env.local
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The salon dashboard is at `/dashboard`; entering the authorised `ADMIN_EMAIL` sends a 15-minute magic link.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npm audit
```

The browser suite uses an installed Google Chrome and tests both desktop and mobile layouts. API integration tests should use a clearly named test appointment and cancel it afterward.

## Environment variables

Copy [.env.example](./.env.example). Important rules:

- `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY` and `OPENAI_API_KEY` are server secrets.
- Never prefix a secret with `NEXT_PUBLIC_`.
- `EMAIL_FROM` should use a domain verified in Resend for production.
- `ADMIN_EMAIL` is the only address permitted to request dashboard access.
- Add `OPENAI_API_KEY` to GitHub Actions secrets as well as Vercel if the weekly workflow is enabled.

## Booking lifecycle

1. The customer chooses a service and the server calculates free slots in `Europe/London`.
2. `POST /api/bookings` validates service data, checks overlap inside a serializable transaction and stores a hashed management token.
3. The salon receives an email and handles the request at `/dashboard`.
4. The customer can reschedule or cancel with the private link; every change creates an audit event.

Prices and durations are currently maintained in [`lib/data.ts`](./lib/data.ts). Business hours are environment-configurable.

## Automated journal

`.github/workflows/weekly-blog.yml` runs each Tuesday. It asks the OpenAI Responses API for a constrained JSON article, commits it to `content/blog`, and lets the normal Vercel Git integration deploy it. Generated claims stay reviewable in Git; the prompt forbids invented reviews, staff, awards, phone numbers and opening hours.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel, Neon, email, domain and search-launch instructions.

## Content provenance

Company identity and the Norwich address come from the supplied Companies House and public business profiles. The logo comes from the salon's public profile. Editorial barber images are locally optimised stock assets and should be replaced with salon-owned portfolio media when available. No reviews, awards, phone number or unverified operating claims are fabricated.
