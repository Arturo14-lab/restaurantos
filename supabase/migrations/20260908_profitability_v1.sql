begin;

create table if not exists public.recipes(
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 name text not null, category text, yield_quantity numeric(12,3) not null default 1, yield_unit text not null default 'ración',
 preparation_minutes integer not null default 0, indirect_cost_percent numeric(5,2) not null default 0,
 active boolean not null default true, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(company_id,name)
);
create table if not exists public.recipe_ingredients(
 id uuid primary key default gen_random_uuid(), recipe_id uuid not null references public.recipes(id) on delete cascade,
 product_id uuid not null references public.products(id), quantity numeric(12,4) not null, unit text not null default 'kg',
 waste_percent numeric(5,2) not null default 0, unique(recipe_id,product_id)
);
create table if not exists public.menu_items(
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 restaurant_id uuid references public.restaurants(id) on delete cascade, recipe_id uuid references public.recipes(id) on delete set null,
 name text not null, category text, sale_price numeric(12,2) not null default 0, tax_rate numeric(5,2) not null default 10,
 active boolean not null default true, created_at timestamptz not null default now(), unique(company_id,restaurant_id,name)
);
create table if not exists public.operating_expenses(
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 restaurant_id uuid not null references public.restaurants(id) on delete cascade, expense_date date not null default current_date,
 category text not null, description text not null, amount numeric(12,2) not null default 0,
 recurrence text not null default 'one_off' check(recurrence in('one_off','weekly','monthly','yearly')),
 status text not null default 'confirmed' check(status in('planned','confirmed','paid')), notes text, created_at timestamptz not null default now()
);
create table if not exists public.daily_sales(
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 restaurant_id uuid not null references public.restaurants(id) on delete cascade, business_date date not null,
 net_sales numeric(12,2) not null default 0, gross_sales numeric(12,2) not null default 0, covers integer not null default 0,
 food_cost numeric(12,2) not null default 0, labor_cost numeric(12,2) not null default 0,
 source text not null default 'manual', notes text, created_at timestamptz not null default now(), unique(restaurant_id,business_date)
);

create index if not exists recipes_company_idx on public.recipes(company_id,active);
create index if not exists menu_items_restaurant_idx on public.menu_items(restaurant_id,active);
create index if not exists operating_expenses_date_idx on public.operating_expenses(restaurant_id,expense_date desc);
create index if not exists daily_sales_date_idx on public.daily_sales(restaurant_id,business_date desc);

alter table public.recipes enable row level security; alter table public.recipe_ingredients enable row level security;
alter table public.menu_items enable row level security; alter table public.operating_expenses enable row level security; alter table public.daily_sales enable row level security;
do $$ declare t text; begin foreach t in array array['recipes','menu_items','operating_expenses','daily_sales'] loop
 execute format('drop policy if exists company_members_access on public.%I',t);
 execute format('create policy company_members_access on public.%I for all to authenticated using(exists(select 1 from public.company_members cm where cm.company_id=%I.company_id and cm.user_id=auth.uid())) with check(exists(select 1 from public.company_members cm where cm.company_id=%I.company_id and cm.user_id=auth.uid()))',t,t,t);
end loop; end $$;
drop policy if exists recipe_ingredients_access on public.recipe_ingredients;
create policy recipe_ingredients_access on public.recipe_ingredients for all to authenticated
 using(exists(select 1 from public.recipes r join public.company_members cm on cm.company_id=r.company_id where r.id=recipe_id and cm.user_id=auth.uid()))
 with check(exists(select 1 from public.recipes r join public.company_members cm on cm.company_id=r.company_id where r.id=recipe_id and cm.user_id=auth.uid()));
grant select,insert,update,delete on public.recipes,public.recipe_ingredients,public.menu_items,public.operating_expenses,public.daily_sales to authenticated;

do $$ declare c uuid; r uuid; rec1 uuid; rec2 uuid; begin
 select id into c from public.companies order by created_at limit 1;
 select id into r from public.restaurants where company_id=c order by created_at limit 1;
 if c is not null and r is not null then
  insert into public.recipes(company_id,name,category,yield_quantity,preparation_minutes,indirect_cost_percent)
   values(c,'Hamburguesa de la casa','Principales',1,15,5),(c,'Ensalada mediterránea','Entrantes',1,10,4)
   on conflict(company_id,name) do update set category=excluded.category;
  select id into rec1 from public.recipes where company_id=c and name='Hamburguesa de la casa';
  select id into rec2 from public.recipes where company_id=c and name='Ensalada mediterránea';
  insert into public.menu_items(company_id,restaurant_id,recipe_id,name,category,sale_price,tax_rate)
   values(c,r,rec1,'Hamburguesa RestaurantOS','Principales',14.90,10),(c,r,rec2,'Ensalada mediterránea','Entrantes',9.50,10)
   on conflict(company_id,restaurant_id,name) do update set sale_price=excluded.sale_price,recipe_id=excluded.recipe_id;
  insert into public.operating_expenses(company_id,restaurant_id,expense_date,category,description,amount,recurrence,status)
   values(c,r,date '2026-09-07','Suministros','Electricidad y gas',420,'monthly','confirmed'),
         (c,r,date '2026-09-07','Alquiler','Alquiler del local',2400,'monthly','paid')
   on conflict do nothing;
  insert into public.daily_sales(company_id,restaurant_id,business_date,net_sales,gross_sales,covers,food_cost,labor_cost)
   values(c,r,date '2026-09-07',3650,4015,142,1010,1095),(c,r,date '2026-09-06',3280,3608,128,930,1030)
   on conflict(restaurant_id,business_date) do update set net_sales=excluded.net_sales,gross_sales=excluded.gross_sales,covers=excluded.covers,food_cost=excluded.food_cost,labor_cost=excluded.labor_cost;
  insert into public.recipe_ingredients(recipe_id,product_id,quantity,unit,waste_percent)
   select rec1,p.id,case when p.unit='kg' then .22 else 1 end,p.unit,3 from public.products p where p.company_id=c order by p.name limit 2
   on conflict(recipe_id,product_id) do nothing;
 end if;
end $$;
commit;
