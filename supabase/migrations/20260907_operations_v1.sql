begin;

create table if not exists public.operational_tasks (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade, title text not null, description text,
  category text not null default 'general', priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  status text not null default 'pending' check (status in ('pending','in_progress','completed','cancelled')),
  due_at timestamptz, assigned_employee_id uuid references public.employees(id) on delete set null,
  completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade, name text not null,
  shift_type text not null default 'opening' check (shift_type in ('opening','closing','service','custom')),
  active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(), checklist_id uuid not null references public.checklists(id) on delete cascade,
  title text not null, sort_order integer not null default 0, required boolean not null default true
);
create table if not exists public.checklist_runs (
  id uuid primary key default gen_random_uuid(), checklist_id uuid not null references public.checklists(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade, run_date date not null default current_date,
  status text not null default 'in_progress' check (status in ('pending','in_progress','completed')),
  started_at timestamptz not null default now(), completed_at timestamptz, unique(checklist_id,run_date)
);
create table if not exists public.checklist_run_items (
  id uuid primary key default gen_random_uuid(), run_id uuid not null references public.checklist_runs(id) on delete cascade,
  item_id uuid not null references public.checklist_items(id) on delete cascade, completed boolean not null default false,
  completed_at timestamptz, notes text, unique(run_id,item_id)
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade, title text not null, description text,
  category text not null default 'operations', priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  status text not null default 'new' check (status in ('new','assigned','in_progress','resolved','closed')),
  assigned_employee_id uuid references public.employees(id) on delete set null, occurred_at timestamptz not null default now(),
  resolved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade, name text not null, category text,
  serial_number text, location text, status text not null default 'operational' check (status in ('operational','maintenance','out_of_service','retired')),
  last_maintenance_at date, next_maintenance_at date, notes text, created_at timestamptz not null default now()
);
create table if not exists public.maintenance_requests (
  id uuid primary key default gen_random_uuid(), equipment_id uuid references public.equipment(id) on delete set null,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade, title text not null, description text,
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  status text not null default 'pending' check (status in ('pending','scheduled','in_progress','completed','cancelled')),
  scheduled_for date, completed_at timestamptz, cost numeric(12,2), created_at timestamptz not null default now()
);

create index if not exists operational_tasks_restaurant_status_idx on public.operational_tasks(restaurant_id,status,due_at);
create index if not exists incidents_restaurant_status_idx on public.incidents(restaurant_id,status,created_at desc);
create index if not exists equipment_restaurant_status_idx on public.equipment(restaurant_id,status);
create index if not exists maintenance_restaurant_status_idx on public.maintenance_requests(restaurant_id,status,scheduled_for);

alter table public.operational_tasks enable row level security; alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security; alter table public.checklist_runs enable row level security;
alter table public.checklist_run_items enable row level security; alter table public.incidents enable row level security;
alter table public.equipment enable row level security; alter table public.maintenance_requests enable row level security;

do $$ declare t text; begin
  foreach t in array array['operational_tasks','checklists','incidents','equipment'] loop
    execute format('drop policy if exists company_members_access on public.%I',t);
    execute format('create policy company_members_access on public.%I for all to authenticated using (exists (select 1 from public.company_members cm where cm.company_id=%I.company_id and cm.user_id=auth.uid())) with check (exists (select 1 from public.company_members cm where cm.company_id=%I.company_id and cm.user_id=auth.uid()))',t,t,t);
  end loop;
end $$;

drop policy if exists checklist_items_access on public.checklist_items;
create policy checklist_items_access on public.checklist_items for all to authenticated using (exists(select 1 from public.checklists c join public.company_members cm on cm.company_id=c.company_id where c.id=checklist_id and cm.user_id=auth.uid())) with check (exists(select 1 from public.checklists c join public.company_members cm on cm.company_id=c.company_id where c.id=checklist_id and cm.user_id=auth.uid()));
drop policy if exists checklist_runs_access on public.checklist_runs;
create policy checklist_runs_access on public.checklist_runs for all to authenticated using (exists(select 1 from public.restaurants r join public.company_members cm on cm.company_id=r.company_id where r.id=restaurant_id and cm.user_id=auth.uid())) with check (exists(select 1 from public.restaurants r join public.company_members cm on cm.company_id=r.company_id where r.id=restaurant_id and cm.user_id=auth.uid()));
drop policy if exists checklist_run_items_access on public.checklist_run_items;
create policy checklist_run_items_access on public.checklist_run_items for all to authenticated using (exists(select 1 from public.checklist_runs cr join public.restaurants r on r.id=cr.restaurant_id join public.company_members cm on cm.company_id=r.company_id where cr.id=run_id and cm.user_id=auth.uid())) with check (exists(select 1 from public.checklist_runs cr join public.restaurants r on r.id=cr.restaurant_id join public.company_members cm on cm.company_id=r.company_id where cr.id=run_id and cm.user_id=auth.uid()));
drop policy if exists maintenance_access on public.maintenance_requests;
create policy maintenance_access on public.maintenance_requests for all to authenticated using (exists(select 1 from public.restaurants r join public.company_members cm on cm.company_id=r.company_id where r.id=restaurant_id and cm.user_id=auth.uid())) with check (exists(select 1 from public.restaurants r join public.company_members cm on cm.company_id=r.company_id where r.id=restaurant_id and cm.user_id=auth.uid()));

grant usage on schema public to authenticated;
grant select, insert, update, delete on table
  public.operational_tasks, public.checklists, public.checklist_items, public.checklist_runs,
  public.checklist_run_items, public.incidents, public.equipment, public.maintenance_requests
to authenticated;

commit;
