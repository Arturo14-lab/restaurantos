import { supabase } from '../lib/supabase'
import type { CompanyMemberRecord, CompanyRecord, RestaurantRecord, RoleRecord } from '../types/domain'

export async function getCompany(): Promise<CompanyRecord | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('companies').select('*').limit(1).maybeSingle()
  if (error) throw error
  return data as CompanyRecord | null
}

export async function updateCompany(id: string, values: Partial<CompanyRecord>) {
  if (!supabase) throw new Error('Supabase no está configurado')
  const { data, error } = await supabase.from('companies').update(values).eq('id', id).select().single()
  if (error) throw error
  return data as CompanyRecord
}

export async function getRestaurants(): Promise<RestaurantRecord[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('restaurants').select('*').order('name')
  if (error) throw error
  return (data ?? []) as RestaurantRecord[]
}

export async function saveRestaurant(values: Partial<RestaurantRecord> & Pick<RestaurantRecord, 'company_id' | 'name'>) {
  if (!supabase) throw new Error('Supabase no está configurado')
  const query = values.id
    ? supabase.from('restaurants').update(values).eq('id', values.id)
    : supabase.from('restaurants').insert(values)
  const { data, error } = await query.select().single()
  if (error) throw error
  return data as RestaurantRecord
}

export async function getRoles(): Promise<RoleRecord[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('roles').select('id,code,name,description').order('name')
  if (error) throw error
  return (data ?? []) as RoleRecord[]
}

export async function getCompanyMembers(): Promise<CompanyMemberRecord[]> {
  if (!supabase) return []
  const { data: members, error } = await supabase
    .from('company_members')
    .select('id,company_id,user_id,role_id,active,roles(id,code,name,description)')
    .order('created_at')
  if (error) throw error
  const userIds = (members ?? []).map(member => member.user_id)
  const { data: profiles, error: profileError } = userIds.length
    ? await supabase.from('profiles').select('id,first_name,last_name,phone,avatar_url').in('id', userIds)
    : { data: [], error: null }
  if (profileError) throw profileError
  return (members ?? []).map(member => ({
    id: member.id,
    company_id: member.company_id,
    user_id: member.user_id,
    role_id: member.role_id,
    active: member.active,
    role: (Array.isArray(member.roles) ? member.roles[0] : member.roles) as RoleRecord | null,
    profile: profiles?.find(profile => profile.id === member.user_id) ?? null,
  }))
}

export async function updateCompanyMember(id: string, values: { role_id: string; active: boolean }) {
  if (!supabase) throw new Error('Supabase no está configurado')
  const { error } = await supabase.from('company_members').update(values).eq('id', id)
  if (error) throw error
}
