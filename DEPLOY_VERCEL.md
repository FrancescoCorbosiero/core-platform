# Deploy to Vercel

## 1. Set up a hosted Postgres database

You need a hosted Postgres instance. Pick one:

- **Vercel Postgres** (powered by Neon) — easiest, lives in the same dashboard
- **Neon** (neon.tech) — free tier, generous limits
- **Supabase** — also free tier with Postgres

You'll get a connection string like:
```
postgresql://user:pass@host:5432/dbname?sslmode=require
```

## 2. Connect repo to Vercel

1. Go to https://vercel.com/new
2. Import the `FrancescoCorbosiero/core-platform` repo
3. Framework preset: **Next.js** (should auto-detect)
4. Build command: leave default (`next build`)
5. Output directory: leave default

## 3. Set environment variables

In the Vercel project settings > Environment Variables, add:

### Required (deploy will fail without these)

| Variable | Value |
|---|---|
| `DATABASE_URI` | Your hosted Postgres connection string |
| `PAYLOAD_SECRET` | Random 32+ char string (generate with `openssl rand -hex 16`) |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` (update after first deploy) |

### Optional (add when ready)

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PRICE_BASE_MONTHLY` | `price_...` |
| `STRIPE_PRICE_BASE_ANNUAL` | `price_...` |
| `STRIPE_PRICE_PRO_MONTHLY` | `price_...` |
| `STRIPE_PRICE_PRO_ANNUAL` | `price_...` |
| `MUX_TOKEN_ID` | Mux token ID |
| `MUX_TOKEN_SECRET` | Mux token secret |
| `MUX_SIGNING_KEY_ID` | Mux signing key ID |
| `MUX_SIGNING_PRIVATE_KEY` | Mux signing private key |
| `RESEND_API_KEY` | `re_...` |
| `RESEND_FROM_EMAIL` | `noreply@tereso.it` |
| `SENTRY_DSN` | Sentry DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (client-side) |
| `SENTRY_ORG` | Sentry org slug |
| `SENTRY_PROJECT` | Sentry project slug |
| `OTEL_SERVICE_NAME` | `tereso` |

## 4. Deploy

Hit **Deploy**. Payload auto-runs database migrations on startup — tables will be created automatically.

## 5. After deploy

1. Visit `https://your-project.vercel.app/admin`
2. You should see the "Create first user" page (fully styled)
3. Create your admin account
4. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to match your actual URL if needed, then redeploy

## Notes

- The `payload.config.ts` throws an error if `DATABASE_URI` is missing — the build will fail with a clear message if you forget it.
- Subsequent deploys are automatic on push to main.
- To use a custom domain, configure it in Vercel project settings > Domains.
