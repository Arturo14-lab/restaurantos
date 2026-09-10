begin;
create or replace function public.create_user_invitation(p_email text,p_first_name text,p_last_name text,p_role_id uuid,p_restaurant_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare uid uuid:=auth.uid();cid uuid;inviter_role text;invitation_id uuid;plain_token text;expiry timestamptz:=now()+interval '7 days';
begin
 if uid is null then raise exception 'Debes iniciar sesión';end if;
 select cm.company_id,r.code into cid,inviter_role from public.company_members cm join public.roles r on r.id=cm.role_id where cm.user_id=uid order by cm.created_at limit 1;
 if cid is null or inviter_role not in('owner','admin','manager') then raise exception 'No tienes permiso para invitar usuarios';end if;
 if exists(select 1 from auth.users au join public.company_members cm on cm.user_id=au.id where cm.company_id=cid and lower(au.email)=lower(trim(p_email))) then raise exception 'Este correo ya pertenece a la empresa';end if;
 if not exists(select 1 from public.roles where id=p_role_id) then raise exception 'El rol no es válido';end if;
 if p_restaurant_id is not null and not exists(select 1 from public.restaurants where id=p_restaurant_id and company_id=cid) then raise exception 'El restaurante no pertenece a la empresa';end if;
 update public.user_invitations set status='expired',updated_at=now() where company_id=cid and lower(email)=lower(trim(p_email)) and status='pending' and expires_at<=now();
 plain_token:=encode(gen_random_bytes(32),'hex');
 insert into public.user_invitations(company_id,restaurant_id,email,first_name,last_name,role_id,invited_by,token_hash,expires_at)
 values(cid,p_restaurant_id,lower(trim(p_email)),trim(p_first_name),trim(p_last_name),p_role_id,uid,encode(digest(plain_token,'sha256'),'hex'),expiry)
 on conflict(company_id,lower(email)) where status='pending' do update set restaurant_id=excluded.restaurant_id,first_name=excluded.first_name,last_name=excluded.last_name,role_id=excluded.role_id,invited_by=uid,token_hash=excluded.token_hash,expires_at=expiry,updated_at=now()
 returning id into invitation_id;
 return jsonb_build_object('id',invitation_id,'token',plain_token,'expires_at',expiry);
end $$;

create or replace function public.revoke_user_invitation(p_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid();
begin
 update public.user_invitations i set status='revoked',updated_at=now() where i.id=p_id and i.status='pending' and exists(select 1 from public.company_members cm join public.roles r on r.id=cm.role_id where cm.company_id=i.company_id and cm.user_id=uid and r.code in('owner','admin','manager'));
 if not found then raise exception 'No se pudo cancelar la invitación';end if;
end $$;
grant execute on function public.revoke_user_invitation(uuid) to authenticated;
commit;

