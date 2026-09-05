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

## Local Verification

```bash
npm ci
npm run build
npm run preview
```
