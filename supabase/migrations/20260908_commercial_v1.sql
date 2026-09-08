begin;
create table if not exists public.customers(
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,
 first_name text not null,last_name text,email text,phone text,birth_date date,preferred_language text not null default 'es',
 marketing_consent boolean not null default false,consent_at timestamptz,total_visits integer not null default 0,total_spend numeric(12,2) not null default 0,
 last_visit_at timestamptz,notes text,status text not null default 'active' check(status in('active','inactive','blocked')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(company_id,email)
);
create table if not exists public.customer_tags(id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,name text not null,color text not null default '#2f6a54',unique(company_id,name));
create table if not exists public.customer_tag_links(customer_id uuid not null references public.customers(id) on delete cascade,tag_id uuid not null references public.customer_tags(id) on delete cascade,primary key(customer_id,tag_id));
create table if not exists public.reservations(
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,restaurant_id uuid not null references public.restaurants(id) on delete cascade,
 customer_id uuid references public.customers(id) on delete set null,reservation_date date not null,reservation_time time not null,party_size integer not null check(party_size>0),
 area text,table_reference text,source text not null default 'direct' check(source in('direct','phone','web','walk_in','partner')),
 status text not null default 'confirmed' check(status in('pending','confirmed','seated','completed','cancelled','no_show')),
 occasion text,dietary_notes text,internal_notes text,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.customer_interactions(
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,customer_id uuid not null references public.customers(id) on delete cascade,
 interaction_type text not null check(interaction_type in('note','call','email','complaint','praise','campaign')),
 subject text,details text,occurred_at timestamptz not null default now(),created_at timestamptz not null default now()
);
create table if not exists public.marketing_campaigns(
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,name text not null,channel text not null default 'email' check(channel in('email','sms','whatsapp','push')),
 audience text not null default 'all',status text not null default 'draft' check(status in('draft','scheduled','sent','cancelled')),
 scheduled_at timestamptz,sent_count integer not null default 0,open_count integer not null default 0,created_at timestamptz not null default now()
);
create index if not exists customers_company_idx on public.customers(company_id,status,last_visit_at desc);create index if not exists reservations_agenda_idx on public.reservations(restaurant_id,reservation_date,reservation_time);create index if not exists interactions_customer_idx on public.customer_interactions(customer_id,occurred_at desc);create index if not exists campaigns_company_idx on public.marketing_campaigns(company_id,status);
alter table public.customers enable row level security;alter table public.customer_tags enable row level security;alter table public.customer_tag_links enable row level security;alter table public.reservations enable row level security;alter table public.customer_interactions enable row level security;alter table public.marketing_campaigns enable row level security;
do $$ declare t text;begin foreach t in array array['customers','customer_tags','reservations','customer_interactions','marketing_campaigns'] loop execute format('drop policy if exists company_members_access on public.%I',t);execute format('create policy company_members_access on public.%I for all to authenticated using(exists(select 1 from public.company_members cm where cm.company_id=%I.company_id and cm.user_id=auth.uid())) with check(exists(select 1 from public.company_members cm where cm.company_id=%I.company_id and cm.user_id=auth.uid()))',t,t,t);end loop;end $$;
drop policy if exists customer_tag_links_access on public.customer_tag_links;create policy customer_tag_links_access on public.customer_tag_links for all to authenticated using(exists(select 1 from public.customers c join public.company_members cm on cm.company_id=c.company_id where c.id=customer_id and cm.user_id=auth.uid())) with check(exists(select 1 from public.customers c join public.company_members cm on cm.company_id=c.company_id where c.id=customer_id and cm.user_id=auth.uid()));
grant select,insert,update,delete on public.customers,public.customer_tags,public.customer_tag_links,public.reservations,public.customer_interactions,public.marketing_campaigns to authenticated;
do $$ declare c uuid;r uuid;a uuid;b uuid;begin select id into c from public.companies order by created_at limit 1;select id into r from public.restaurants where company_id=c order by created_at limit 1;if c is not null and r is not null then
 insert into public.customers(company_id,first_name,last_name,email,phone,marketing_consent,total_visits,total_spend,last_visit_at,notes) values
 (c,'Marta','García','marta.garcia@example.com','600 123 456',true,8,624,now()-interval '7 days','Prefiere mesa tranquila'),
 (c,'Javier','Ruiz','javier.ruiz@example.com','611 234 567',false,3,188,now()-interval '21 days','Alergia a frutos secos') on conflict(company_id,email) do update set total_visits=excluded.total_visits,total_spend=excluded.total_spend;
 select id into a from public.customers where company_id=c and email='marta.garcia@example.com';select id into b from public.customers where company_id=c and email='javier.ruiz@example.com';
 insert into public.reservations(company_id,restaurant_id,customer_id,reservation_date,reservation_time,party_size,area,source,status,occasion) values
 (c,r,a,current_date,current_time::time,4,'Sala','web','confirmed','Cumpleaños'),(c,r,b,current_date,(current_time+interval '2 hours')::time,2,'Terraza','phone','pending',null);
 insert into public.marketing_campaigns(company_id,name,channel,audience,status) values(c,'Clientes que hace 30 días que no vienen','email','inactive_30_days','draft') on conflict do nothing;
end if;end $$;
commit;
