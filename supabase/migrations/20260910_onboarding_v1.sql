begin;
create or replace function public.onboard_restaurant_company(payload jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid();cid uuid;rid uuid;owner_role uuid;sala uuid;cocina uuid;
begin
 if uid is null then raise exception 'Debes iniciar sesión';end if;
 if exists(select 1 from public.company_members where user_id=uid and active=true) then raise exception 'Este usuario ya pertenece a una empresa';end if;
 if coalesce(trim(payload->>'company_name'),'')='' or coalesce(trim(payload->>'restaurant_name'),'')='' then raise exception 'Empresa y restaurante son obligatorios';end if;
 select id into owner_role from public.roles where code='owner' limit 1;if owner_role is null then raise exception 'No existe el rol propietario';end if;
 insert into public.companies(name,legal_name,tax_id,email,phone,currency,timezone,active) values(trim(payload->>'company_name'),nullif(trim(payload->>'legal_name'),''),nullif(trim(payload->>'tax_id'),''),nullif(trim(payload->>'email'),''),nullif(trim(payload->>'phone'),''),'EUR','Europe/Madrid',true) returning id into cid;
 insert into public.restaurants(company_id,name,address,city,postal_code,country,email,phone,active) values(cid,trim(payload->>'restaurant_name'),nullif(trim(payload->>'address'),''),nullif(trim(payload->>'city'),''),nullif(trim(payload->>'postal_code'),''),'España',nullif(trim(payload->>'email'),''),nullif(trim(payload->>'phone'),''),true) returning id into rid;
 insert into public.company_members(company_id,user_id,role_id,active) values(cid,uid,owner_role,true);
 insert into public.departments(company_id,name,description,active) values(cid,'Sala','Servicio y atención al cliente',true) returning id into sala;
 insert into public.departments(company_id,name,description,active) values(cid,'Cocina','Producción y preparación',true) returning id into cocina;
 insert into public.positions(company_id,department_id,name,description,active) values(cid,sala,'Camarero/a','Equipo de sala',true),(cid,sala,'Encargado/a','Responsable del servicio',true),(cid,cocina,'Cocinero/a','Equipo de cocina',true),(cid,cocina,'Jefe/a de cocina','Responsable de cocina',true);
 insert into public.payment_methods(company_id,name,method_type,sort_order) values(cid,'Efectivo','cash',10),(cid,'Tarjeta','card',20),(cid,'Transferencia','bank_transfer',30);
 insert into public.cash_registers(company_id,restaurant_id,name,code,location,active) values(cid,rid,'Caja principal','CAJA-01','Mostrador',true);
 insert into public.invoice_series(company_id,restaurant_id,name,prefix,next_number,document_type,active) values(cid,rid,'Serie general',concat('FAC-',extract(year from current_date)::int,'-'),1,'invoice',true);
 insert into public.security_settings(company_id,session_timeout_minutes,password_min_length,require_mfa_for_admins,audit_retention_days,allow_support_access) values(cid,480,10,false,365,false);
 insert into public.audit_logs(company_id,restaurant_id,user_id,action,module,entity_type,entity_id,summary) values(cid,rid,uid,'create','onboarding','company',cid,'Empresa creada mediante el asistente inicial');
 return jsonb_build_object('company_id',cid,'restaurant_id',rid);
end $$;
revoke all on function public.onboard_restaurant_company(jsonb) from public;grant execute on function public.onboard_restaurant_company(jsonb) to authenticated;
commit;
