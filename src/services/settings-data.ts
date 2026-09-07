import { supabase } from '../lib/supabase'
import type { CompanyRecord, RestaurantRecord } from '../types/domain'

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
