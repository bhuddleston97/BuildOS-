# BuildOS Deployment

This app is a Vite React single-page app backed by Supabase.

## Environment Variables

Set these variables in your hosting provider before building:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Build Settings

- Install command: `npm ci`
- Build command: `npm run build`
- Publish directory: `dist`

For SPA routing, configure your host to rewrite all unmatched paths to `/index.html`.

## Production database rollout

Apply these migrations to a staging Supabase project first, then production:

1. `supabase/migrations/20260905_multi_tenant_rls.sql`
2. `supabase/migrations/20260905000100_organizations_memberships.sql`
3. `supabase/migrations/20260905000200_fix_organization_rpc.sql`
4. `supabase/migrations/20260905000300_role_policies.sql`
5. `supabase/migrations/20260905000400_secure_onboarding_rpcs.sql`
6. `supabase/migrations/20260905000500_invitations.sql`
7. `supabase/migrations/20260905000600_billing.sql`

The first migration enables tenant isolation and fails closed for records with
no `organization_id`. Before inviting users, assign every existing user to an
organization and backfill the same organization ID onto existing projects,
tasks, reports, schedules, vendors, subcontractors, notifications, and change
orders. Do not use the service role key in the browser; use the Supabase SQL
editor or a server-side administrative job for this backfill.

Verify isolation with two test users from different organizations. Test reads,
inserts, updates, deletes, and realtime subscriptions before production data is
loaded. Keep point-in-time recovery enabled and perform a restore drill before
the first client import.

## Invitation email provider

The invitation Edge Functions use Resend. Verify your sending domain in Resend,
then configure these Supabase Function secrets before enabling invitations:

```bash
npx supabase secrets set RESEND_API_KEY=re_...
npx supabase secrets set RESEND_FROM="BuildOS <invites@your-verified-domain.com>"
npx supabase secrets set APP_URL=https://your-buildos-domain.com APP_ORIGIN=https://your-buildos-domain.com
```

Deploy the functions with:

```bash
npx supabase functions deploy invite-member --use-api
npx supabase functions deploy accept-invitation --use-api
```

## Stripe checkout

Create four recurring Stripe Prices in test mode first: Starter monthly at
$60, Starter annual at $50/month billed annually, Professional monthly at
$100, and Professional annual at $83/month billed annually. Set their Stripe
price IDs and secrets in Supabase:

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase secrets set STRIPE_STARTER_MONTH_PRICE_ID=price_...
npx supabase secrets set STRIPE_STARTER_YEAR_PRICE_ID=price_...
npx supabase secrets set STRIPE_PROFESSIONAL_MONTH_PRICE_ID=price_...
npx supabase secrets set STRIPE_PROFESSIONAL_YEAR_PRICE_ID=price_...
```

Deploy `create-checkout` and `stripe-webhook`, then register the webhook URL
`https://your-project.supabase.co/functions/v1/stripe-webhook` for checkout and
subscription events. Test with Stripe test cards before switching to live keys.

## BuildOS authentication email

Signup confirmation emails are sent by Supabase Auth. To send them through
Resend with BuildOS branding, open Supabase Dashboard > Authentication > SMTP
Settings and configure:

- Host: `smtp.resend.com`
- Port: `465` (SSL) or `587` (TLS)
- Username: `resend`
- Password: your Resend API key
- Sender email: your verified Resend sender address
- Sender name: `BuildOS`

Then open Authentication > Email Templates and customize **Confirm signup**,
**Invite user**, **Magic Link**, **Change Email**, and **Reset Password**. Keep
the template variable `{{ .ConfirmationURL }}` as the action link. Set the
Supabase Auth Site URL to the deployed app URL and add `/signin` and `/invite`
to the allowed redirect URLs.

Do not send signup passwords through a custom frontend email function. Supabase
Auth should generate and verify confirmation links; Resend should only deliver
them through SMTP.

## Local Verification

```bash
npm ci
npm run build
npm run preview
```
