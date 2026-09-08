begin;

create table if not exists public.payment_methods (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 name text not null, method_type text not null default 'other' check(method_type in ('cash','card','bank_transfer','voucher','delivery','other')),
 active boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now(),
 unique(company_id,name)
);

create table if not exists public.cash_registers (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 restaurant_id uuid not null references public.restaurants(id) on delete cascade, name text not null, code text not null,
 location text, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(restaurant_id,code)
);

create table if not exists public.cash_sessions (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 restaurant_id uuid not null references public.restaurants(id) on delete cascade, register_id uuid not null references public.cash_registers(id) on delete cascade,
 business_date date not null default current_date, status text not null default 'open' check(status in ('open','closed','cancelled')),
 opened_at timestamptz not null default now(), opened_by uuid, opening_float numeric(12,2) not null default 0 check(opening_float >= 0), opening_note text,
 closed_at timestamptz, closed_by uuid, closing_note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check((status <> 'closed') or closed_at is not null)
);

create table if not exists public.cash_movements (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 restaurant_id uuid not null references public.restaurants(id) on delete cascade, session_id uuid not null references public.cash_sessions(id) on delete cascade,
 movement_type text not null check(movement_type in ('sale','refund','cash_in','cash_out','tip','correction')),
 payment_method_id uuid references public.payment_methods(id) on delete set null, amount numeric(12,2) not null check(amount <> 0),
 reference text, description text, occurred_at timestamptz not null default now(), created_by uuid, created_at timestamptz not null default now()
);

create table if not exists public.cash_sales_summaries (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 restaurant_id uuid not null references public.restaurants(id) on delete cascade, session_id uuid not null references public.cash_sessions(id) on delete cascade,
 gross_sales numeric(12,2) not null default 0, discounts numeric(12,2) not null default 0, refunds numeric(12,2) not null default 0,
 net_sales numeric(12,2) not null default 0, tax_amount numeric(12,2) not null default 0, tips numeric(12,2) not null default 0,
 orders_count integer not null default 0 check(orders_count >= 0), covers integer not null default 0 check(covers >= 0), updated_at timestamptz not null default now(),
 unique(session_id)
);

create table if not exists public.cash_payment_summaries (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 restaurant_id uuid not null references public.restaurants(id) on delete cascade, session_id uuid not null references public.cash_sessions(id) on delete cascade,
 payment_method_id uuid not null references public.payment_methods(id) on delete restrict, expected_amount numeric(12,2) not null default 0,
 transactions_count integer not null default 0 check(transactions_count >= 0), updated_at timestamptz not null default now(),
 unique(session_id,payment_method_id)
);

create table if not exists public.cash_counts (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 restaurant_id uuid not null references public.restaurants(id) on delete cascade, session_id uuid not null references public.cash_sessions(id) on delete cascade,
 count_type text not null default 'closing' check(count_type in ('opening','partial','closing')),
 expected_cash numeric(12,2) not null default 0, counted_cash numeric(12,2) not null default 0,
 difference numeric(12,2) generated always as (counted_cash - expected_cash) stored,
 denominations jsonb not null default '{}'::jsonb check(jsonb_typeof(denominations)='object'), notes text,
 counted_by uuid, counted_at timestamptz not null default now(), created_at timestamptz not null default now()
);

create index if not exists payment_methods_company_idx on public.payment_methods(company_id,active,sort_order);
create index if not exists cash_registers_restaurant_idx on public.cash_registers(restaurant_id,active);
create index if not exists cash_sessions_register_date_idx on public.cash_sessions(register_id,business_date desc,status);
create unique index if not exists cash_sessions_one_open_idx on public.cash_sessions(register_id) where status='open';
create index if not exists cash_movements_session_time_idx on public.cash_movements(session_id,occurred_at desc);
create index if not exists cash_movements_company_type_idx on public.cash_movements(company_id,movement_type,occurred_at desc);
create index if not exists cash_sales_summaries_restaurant_idx on public.cash_sales_summaries(restaurant_id,updated_at desc);
create index if not exists cash_payment_summaries_session_idx on public.cash_payment_summaries(session_id,payment_method_id);
create index if not exists cash_counts_session_idx on public.cash_counts(session_id,counted_at desc);

alter table public.payment_methods enable row level security;
alter table public.cash_registers enable row level security;
alter table public.cash_sessions enable row level security;
alter table public.cash_movements enable row level security;
alter table public.cash_sales_summaries enable row level security;
alter table public.cash_payment_summaries enable row level security;
alter table public.cash_counts enable row level security;

do $$ declare t text; begin
 foreach t in array array['payment_methods','cash_registers','cash_sessions','cash_movements','cash_sales_summaries','cash_payment_summaries','cash_counts'] loop
  execute format('drop policy if exists company_members_access on public.%I',t);
  execute format('create policy company_members_access on public.%I for all to authenticated using(exists(select 1 from public.company_members cm where cm.company_id=%I.company_id and cm.user_id=auth.uid())) with check(exists(select 1 from public.company_members cm where cm.company_id=%I.company_id and cm.user_id=auth.uid()))',t,t,t);
 end loop;
end $$;

grant select,insert,update,delete on public.payment_methods,public.cash_registers,public.cash_sessions,public.cash_movements,
 public.cash_sales_summaries,public.cash_payment_summaries,public.cash_counts to authenticated;

do $$ declare c uuid; r uuid; reg uuid; ses uuid; cash_method uuid; card_method uuid; begin
 select id into c from public.companies order by created_at limit 1;
 select id into r from public.restaurants where company_id=c order by created_at limit 1;
 if c is not null and r is not null then
  insert into public.payment_methods(company_id,name,method_type,sort_order) values
   (c,'Efectivo','cash',10),(c,'Tarjeta','card',20),(c,'Transferencia','bank_transfer',30)
   on conflict(company_id,name) do update set method_type=excluded.method_type,sort_order=excluded.sort_order,active=true;
  insert into public.cash_registers(company_id,restaurant_id,name,code,location)
   values(c,r,'Caja principal','CAJA-01','Mostrador')
   on conflict(restaurant_id,code) do update set name=excluded.name,location=excluded.location,active=true;
  select id into reg from public.cash_registers where restaurant_id=r and code='CAJA-01';
  select id into cash_method from public.payment_methods where company_id=c and name='Efectivo';
  select id into card_method from public.payment_methods where company_id=c and name='Tarjeta';
  select id into ses from public.cash_sessions where register_id=reg and status='open' order by opened_at limit 1;
  if ses is null then
   insert into public.cash_sessions(company_id,restaurant_id,register_id,business_date,status,opening_float,opening_note)
    values(c,r,reg,current_date,'open',150,'Fondo inicial demo') returning id into ses;
  end if;
  insert into public.cash_sales_summaries(company_id,restaurant_id,session_id,gross_sales,discounts,refunds,net_sales,tax_amount,tips,orders_count,covers)
   values(c,r,ses,1268.40,28.40,0,1240,112.73,36,48,83)
   on conflict(session_id) do update set gross_sales=excluded.gross_sales,discounts=excluded.discounts,net_sales=excluded.net_sales,tax_amount=excluded.tax_amount,tips=excluded.tips,orders_count=excluded.orders_count,covers=excluded.covers;
  insert into public.cash_payment_summaries(company_id,restaurant_id,session_id,payment_method_id,expected_amount,transactions_count) values
   (c,r,ses,cash_method,460,18),(c,r,ses,card_method,780,30)
   on conflict(session_id,payment_method_id) do update set expected_amount=excluded.expected_amount,transactions_count=excluded.transactions_count;
  if not exists(select 1 from public.cash_movements where session_id=ses and reference='DEMO-APERTURA') then
   insert into public.cash_movements(company_id,restaurant_id,session_id,movement_type,payment_method_id,amount,reference,description)
    values(c,r,ses,'cash_in',cash_method,150,'DEMO-APERTURA','Fondo inicial de caja');
  end if;
  if not exists(select 1 from public.cash_counts where session_id=ses and count_type='partial' and notes='Arqueo demo') then
   insert into public.cash_counts(company_id,restaurant_id,session_id,count_type,expected_cash,counted_cash,denominations,notes)
    values(c,r,ses,'partial',610,608.50,'{"50":6,"20":10,"10":8,"5":4,"coins":8.50}'::jsonb,'Arqueo demo');
  end if;
 end if;
end $$;

commit;
