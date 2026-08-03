# Production deployment

The website, Neon schema, booking APIs, protected dashboard, Resend notifications and OpenAI workflow are implemented. The remaining launch work is operational: attach the final domain, verify its sending domain, confirm salon business details, and rotate any credentials shared during setup.

## Vercel

Import the GitHub repository or deploy with the Vercel CLI. Configure every variable in `.env.example`; use the pooled Neon connection for `DATABASE_URL` and the direct connection for `DIRECT_URL`.

After the first deployment:

1. Set `NEXT_PUBLIC_SITE_URL` to the actual HTTPS production domain and redeploy.
2. Connect the custom domain in Vercel DNS settings.
3. Confirm `/`, `/book`, `/manage`, `/dashboard/login`, `/robots.txt` and `/sitemap.xml`.
4. Keep preview deployments private if they use production customer data.

## Neon

Apply schema changes before launch:

```bash
npx prisma generate
npx prisma db push
```

The app stores booking tokens only as SHA-256 hashes, performs overlap checks in serializable transactions, and records booking events. Backups and point-in-time recovery should be enabled in Neon when the account plan supports them.

## Dashboard access

Set `ADMIN_EMAIL` to the salon owner's address. `/dashboard` redirects unauthenticated visitors to a passwordless login form. Links expire after 15 minutes; sessions are stored server-side, use an HttpOnly/SameSite cookie, and expire after seven days.

For multiple staff members or granular permissions, replace the single-address allow-list with a proper users/roles table before adding them.

## Email

The Resend sandbox sender is suitable only for integration testing. Before public launch:

1. Verify the salon's domain in Resend.
2. Set `EMAIL_FROM` to a verified address such as `3D Cutz <bookings@domain.co.uk>`.
3. Keep `BOOKING_NOTIFY_EMAIL` and `ADMIN_EMAIL` as the owner's real inbox.
4. Test creation, rescheduling, cancellation, dashboard status changes and admin sign-in.

## Automated articles

Add `OPENAI_API_KEY` as a GitHub Actions repository secret. `BLOG_MODEL` defaults to `gpt-5-mini`. The scheduled workflow creates reviewable JSON in `content/blog`; it does not need database access. Protect the main branch or change the workflow to open pull requests if every article needs approval before publishing.

## Launch checklist

- Approve final service names, prices and durations in `lib/data.ts`
- Confirm opening hours, Sunday closure, booking lead time and manual-confirmation policy
- Add public phone/email once approved
- Replace stock photography with salon-owned work where possible
- Add privacy, cancellation/no-show and late-arrival policies
- Rotate the Neon, Resend, OpenAI and Vercel credentials used during development
- Add the domain to Google Search Console and submit `/sitemap.xml`
- Update the Google Business Profile website and booking links
- Keep business name, address and phone consistent across Google and the site
- Run the browser suite and a real production booking after the final domain is attached

## Security notes

Secrets belong only in Vercel/GitHub encrypted settings and local ignored `.env` files. Customer management tokens must not appear in analytics, support screenshots or public logs. Add rate limiting and bot protection before a large marketing campaign, and configure monitoring/alerts for API and email failures.
