-- Stripe customer and subscription state. Stripe remains the billing source of truth.

create table if not exists public.billing_customers (
  organization_id uuid primary key,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_subscriptions (
  organization_id uuid primary key,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  stripe_price_id text not null,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;

drop policy if exists billing_customers_member_select on public.billing_customers;
create policy billing_customers_member_select on public.billing_customers
  for select to authenticated
  using (organization_id = public.current_organization_id());

drop policy if exists billing_subscriptions_member_select on public.billing_subscriptions;
create policy billing_subscriptions_member_select on public.billing_subscriptions
  for select to authenticated
  using (organization_id = public.current_organization_id());
