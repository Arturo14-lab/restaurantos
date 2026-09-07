import { supabase } from '../lib/supabase'
import type { DashboardMetrics, EmployeeRecord, ShiftRecord } from '../types/domain'

export async function getEmployees(): Promise<EmployeeRecord[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('employees')
    .select('id,company_id,employee_code,first_name,last_name,email,phone,position_id,department_id,hire_date,weekly_contract_hours,hourly_cost,status,notes,departments(name),positions(name)')
    .order('first_name')
  if (error) throw error
  return (data ?? []) as unknown as EmployeeRecord[]
}

export async function saveEmployee(values: Partial<EmployeeRecord> & Pick<EmployeeRecord, 'company_id' | 'first_name' | 'last_name'>, restaurantId?: string) {
  if (!supabase) throw new Error('Supabase no está configurado')
  const payload = { ...values }
  delete payload.departments
  delete payload.positions
  const query = values.id
    ? supabase.from('employees').update(payload).eq('id', values.id)
    : supabase.from('employees').insert(payload)
  const { data, error } = await query.select('id').single()
  if (error) throw error
  if (restaurantId) {
    const { error: assignmentError } = await supabase.from('employee_restaurants').upsert({ employee_id: data.id, restaurant_id: restaurantId, is_primary: true }, { onConflict: 'employee_id,restaurant_id' })
    if (assignmentError) throw assignmentError
  }
  return data.id as string
}

export async function getWeekShifts(startDate = '2026-09-07', endDate = '2026-09-13'): Promise<ShiftRecord[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('shifts')
    .select('id, employee_id, shift_date, start_time, end_time, departments(name), employees(id, first_name, last_name)')
    .gte('shift_date', startDate)
    .lte('shift_date', endDate)
    .order('shift_date')
    .order('start_time')
  if (error) throw error
  return (data ?? []) as unknown as ShiftRecord[]
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!supabase) return { employees: 3, hours: 120, shifts: 15, vacations: 1, entries: 1, today: 3 }
  const [employeeResult, shiftResult, vacationResult, entryResult] = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('shifts').select('shift_date,start_time,end_time').gte('shift_date', '2026-09-07').lte('shift_date', '2026-09-13'),
    supabase.from('vacation_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('time_entries').select('id', { count: 'exact', head: true }).gte('clock_in', '2026-09-07T00:00:00+02:00').lt('clock_in', '2026-09-08T00:00:00+02:00'),
  ])
  const error = employeeResult.error || shiftResult.error || vacationResult.error || entryResult.error
  if (error) throw error
  const shifts = shiftResult.data ?? []
  const hours = shifts.reduce((total, row) => {
    const toHours = (value: string) => {
      const [h, m] = value.slice(0, 5).split(':').map(Number)
      return h + m / 60
    }
    return total + Math.max(0, toHours(row.end_time) - toHours(row.start_time))
  }, 0)
  return {
    employees: employeeResult.count ?? 0,
    hours,
    shifts: shifts.length,
    vacations: vacationResult.count ?? 0,
    entries: entryResult.count ?? 0,
    today: shifts.filter(row => row.shift_date === '2026-09-07').length,
  }
}
