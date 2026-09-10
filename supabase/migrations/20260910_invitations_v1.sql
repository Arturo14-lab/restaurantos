begin;
create extension if not exists pgcrypto;

create table if not exists public.user_invitations(
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  email text not null,
  first_name text not null,
  last_name text not null,
  role_id uuid not null references public.roles(id),
  invited_by uuid not null,
  token_hash text not null unique,
  status text not null default 'pending' check(status in('pending','accepted','revoked','expired')),
  expires_at timestamptz not null default now()+interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_invitations_company_idx on public.user_invitations(company_id,created_at desc);
create unique index if not exists user_invitations_pending_email_idx on public.user_invitations(company_id,lower(email)) where status='pending';
alter table public.user_invitations enable row level security;
drop policy if exists user_invitations_read on public.user_invitations;
create policy user_invitations_read on public.user_invitations for select to authenticated using(exists(select 1 from public.company_members cm where cm.company_id=user_invitations.company_id and cm.user_id=auth.uid()));
grant select on public.user_invitations to authenticated;

create or replace function public.create_user_invitation(p_email text,p_first_name text,p_last_name text,p_role_id uuid,p_restaurant_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid:=auth.uid(); cid uuid; inviter_role text; invitation_id uuid; plain_token text; expiry timestamptz:=now()+interval '7 days';
begin
  if uid is null then raise exception 'Debes iniciar sesión'; end if;
  select cm.company_id,r.code into cid,inviter_role from public.company_members cm join public.roles r on r.id=cm.role_id where cm.user_id=uid order by cm.created_at limit 1;
  if cid is null or inviter_role not in('owner','admin','manager') then raise exception 'No tienes permiso para invitar usuarios'; end if;
  if not exists(select 1 from public.roles where id=p_role_id) then raise exception 'El rol no es válido'; end if;
  if p_restaurant_id is not null and not exists(select 1 from public.restaurants where id=p_restaurant_id and company_id=cid) then raise exception 'El restaurante no pertenece a la empresa'; end if;
  update public.user_invitations set status='expired',updated_at=now() where company_id=cid and lower(email)=lower(trim(p_email)) and status='pending' and expires_at<=now();
  plain_token:=encode(gen_random_bytes(32),'hex');
  insert into public.user_invitations(company_id,restaurant_id,email,first_name,last_name,role_id,invited_by,token_hash,expires_at)
  values(cid,p_restaurant_id,lower(trim(p_email)),trim(p_first_name),trim(p_last_name),p_role_id,uid,encode(digest(plain_token,'sha256'),'hex'),expiry)
  on conflict(company_id,lower(email)) where status='pending' do update set restaurant_id=excluded.restaurant_id,first_name=excluded.first_name,last_name=excluded.last_name,role_id=excluded.role_id,invited_by=uid,token_hash=excluded.token_hash,expires_at=expiry,updated_at=now()
  returning id into invitation_id;
  return jsonb_build_object('id',invitation_id,'token',plain_token,'expires_at',expiry);
end $$;

create or replace function public.accept_user_invitation(p_token text)
returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid:=auth.uid(); user_email text; inv public.user_invitations%rowtype; member_id uuid;
begin
  if uid is null then raise exception 'Debes iniciar sesión para aceptar la invitación'; end if;
  select email into user_email from auth.users where id=uid;
  select * into inv from public.user_invitations where token_hash=encode(digest(p_token,'sha256'),'hex') and status='pending' for update;
  if inv.id is null then raise exception 'La invitación no existe o ya se utilizó'; end if;
  if inv.expires_at<=now() then update public.user_invitations set status='expired',updated_at=now() where id=inv.id; raise exception 'La invitación ha caducado'; end if;
  if lower(user_email)<>lower(inv.email) then raise exception 'Esta invitación pertenece a otro correo'; end if;
  insert into public.profiles(id,first_name,last_name) values(uid,inv.first_name,inv.last_name) on conflict(id) do update set first_name=excluded.first_name,last_name=excluded.last_name;
  insert into public.company_members(company_id,user_id,role_id) values(inv.company_id,uid,inv.role_id) on conflict(company_id,user_id) do update set role_id=excluded.role_id returning id into member_id;
  if inv.restaurant_id is not null then insert into public.member_restaurant_access(company_id,company_member_id,restaurant_id) values(inv.company_id,member_id,inv.restaurant_id) on conflict(company_member_id,restaurant_id) do nothing; end if;
  update public.user_invitations set status='accepted',accepted_at=now(),updated_at=now() where id=inv.id;
  return jsonb_build_object('company_id',inv.company_id,'member_id',member_id);
end $$;
grant execute on function public.create_user_invitation(text,text,text,uuid,uuid) to authenticated;
grant execute on function public.accept_user_invitation(text) to authenticated;
commit;

