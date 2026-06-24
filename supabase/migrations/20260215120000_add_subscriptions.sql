-- Tabela de subscriptions para billing dos tenants via Stripe
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id)
);

-- RLS
alter table public.subscriptions enable row level security;

create policy "Tenant owner can view subscription"
  on public.subscriptions for select
  using (tenant_id in (
    select id from public.tenants where owner_id = auth.uid()
  ));
