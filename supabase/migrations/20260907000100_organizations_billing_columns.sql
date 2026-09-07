-- Add billing/subscription tracking columns to organizations table.
-- These are written by the stripe-webhook edge function and read by the app.

alter table public.organizations
  add column if not exists subscription_status text,
  add column if not exists subscription_plan   text,
  add column if not exists stripe_customer_id  text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_period_end timestamptz;

create index if not exists organizations_subscription_status_idx
  on public.organizations (subscription_status);
