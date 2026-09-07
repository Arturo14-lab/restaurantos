import { supabase } from '../lib/supabase'
import type { DashboardMetrics, EmployeeRecord, SchedulePeriodRecord, ShiftChangeRequestRecord, ShiftRecord, TimeEntryRecord, VacationRequestRecord } from '../types/domain'

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
    .select('id,schedule_period_id,restaurant_id,employee_id,position_id,department_id,shift_date,start_time,end_time,break_minutes,notes,status,departments(name),employees(id,first_name,last_name)')
    .gte('shift_date', startDate)
    .lte('shift_date', endDate)
    .order('shift_date')
    .order('start_time')
  if (error) throw error
  return (data ?? []) as unknown as ShiftRecord[]
}

export async function getSchedulePeriod(restaurantId:string,startDate:string,endDate:string):Promise<SchedulePeriodRecord|null>{
  if(!supabase)return null
  const {data,error}=await supabase.from('schedule_periods').select('id,restaurant_id,start_date,end_date,status,published_at').eq('restaurant_id',restaurantId).eq('start_date',startDate).eq('end_date',endDate).maybeSingle()
  if(error)throw error
  return data as SchedulePeriodRecord|null
}

export async function ensureSchedulePeriod(restaurantId:string,startDate:string,endDate:string):Promise<SchedulePeriodRecord>{
  const existing=await getSchedulePeriod(restaurantId,startDate,endDate);if(existing)return existing
  if(!supabase)throw new Error('Supabase no está configurado')
  const {data,error}=await supabase.from('schedule_periods').insert({restaurant_id:restaurantId,start_date:startDate,end_date:endDate,status:'draft'}).select().single()
  if(error)throw error
  return data as SchedulePeriodRecord
}

export async function saveShift(values:Partial<ShiftRecord>&Pick<ShiftRecord,'schedule_period_id'|'restaurant_id'|'employee_id'|'shift_date'|'start_time'|'end_time'>){
  if(!supabase)throw new Error('Supabase no está configurado')
  const payload={...values};delete payload.departments;delete payload.employees
  const query=values.id?supabase.from('shifts').update(payload).eq('id',values.id):supabase.from('shifts').insert(payload)
  const {error}=await query;if(error)throw error
}

export async function publishSchedulePeriod(id:string){
  if(!supabase)throw new Error('Supabase no está configurado')
  const {error}=await supabase.from('schedule_periods').update({status:'published',published_at:new Date().toISOString()}).eq('id',id)
  if(error)throw error
}

export async function getTimeEntries():Promise<TimeEntryRecord[]>{
  if(!supabase)return []
  const {data,error}=await supabase.from('time_entries').select('id,employee_id,restaurant_id,shift_id,clock_in,clock_out,break_minutes,source,status,notes,employees(first_name,last_name)').order('clock_in',{ascending:false}).limit(100)
  if(error)throw error
  return (data??[]) as unknown as TimeEntryRecord[]
}

export async function saveTimeEntry(values:Partial<TimeEntryRecord>&Pick<TimeEntryRecord,'employee_id'|'restaurant_id'|'clock_in'|'status'>){
  if(!supabase)throw new Error('Supabase no está configurado')
  const payload={...values};delete payload.employees
  const query=values.id?supabase.from('time_entries').update(payload).eq('id',values.id):supabase.from('time_entries').insert(payload)
  const {error}=await query;if(error)throw error
}

export async function getPendingRequests(){
  if(!supabase)return {vacations:[] as VacationRequestRecord[],changes:[] as ShiftChangeRequestRecord[]}
  const [vacationResult,changeResult]=await Promise.all([
    supabase.from('vacation_requests').select('id,employee_id,start_date,end_date,status,employee_notes,employees(first_name,last_name)').eq('status','pending').order('start_date'),
    supabase.from('shift_change_requests').select('id,shift_id,requested_by_employee_id,replacement_employee_id,request_type,status,reason,employees!shift_change_requests_requested_by_employee_id_fkey(first_name,last_name),shifts(shift_date,start_time,end_time)').eq('status','pending'),
  ])
  if(vacationResult.error)throw vacationResult.error
  if(changeResult.error)throw changeResult.error
  return {vacations:(vacationResult.data??[]) as unknown as VacationRequestRecord[],changes:(changeResult.data??[]) as unknown as ShiftChangeRequestRecord[]}
}

export async function resolveRequest(table:'vacation_requests'|'shift_change_requests',id:string,status:'approved'|'rejected'){
  if(!supabase)throw new Error('Supabase no está configurado')
  const {error}=await supabase.from(table).update({status}).eq('id',id)
  if(error)throw error
}

export async function getEmployeePortal(){
  if(!supabase)return null
  const {data:{user}}=await supabase.auth.getUser()
  let preview=false
  let employeeResult=user?await supabase.from('employees').select('id,first_name,last_name,profile_id').eq('profile_id',user.id).maybeSingle():{data:null,error:null}
  if(employeeResult.error)throw employeeResult.error
  if(!employeeResult.data){preview=true;employeeResult=await supabase.from('employees').select('id,first_name,last_name,profile_id').eq('status','active').order('first_name').limit(1).maybeSingle()}
  const employee=employeeResult.data;if(!employee)return null
  const today=new Date().toISOString().slice(0,10)
  const [shiftResult,entryResult,requestResult,assignmentResult]=await Promise.all([
    supabase.from('shifts').select('id,restaurant_id,shift_date,start_time,end_time,departments(name)').eq('employee_id',employee.id).gte('shift_date',today).order('shift_date').order('start_time').limit(8),
    supabase.from('time_entries').select('id,clock_in,clock_out,status').eq('employee_id',employee.id).gte('clock_in',`${today}T00:00:00`).order('clock_in',{ascending:false}).limit(1).maybeSingle(),
    supabase.from('vacation_requests').select('id,start_date,end_date,status').eq('employee_id',employee.id).order('created_at',{ascending:false}).limit(5),
    supabase.from('employee_restaurants').select('restaurant_id').eq('employee_id',employee.id).eq('is_primary',true).limit(1).maybeSingle(),
  ])
  const error=shiftResult.error||entryResult.error||requestResult.error||assignmentResult.error;if(error)throw error
  return {employee,preview,shifts:shiftResult.data??[],entry:entryResult.data,requests:requestResult.data??[],restaurantId:assignmentResult.data?.restaurant_id??shiftResult.data?.[0]?.restaurant_id??''}
}

export async function createVacationRequest(employeeId:string,startDate:string,endDate:string,notes:string){
  if(!supabase)throw new Error('Supabase no está configurado')
  const {error}=await supabase.from('vacation_requests').insert({employee_id:employeeId,start_date:startDate,end_date:endDate,status:'pending',employee_notes:notes})
  if(error)throw error
}

export async function clockEmployee(employeeId:string,restaurantId:string,openEntry?:{id:string}|null){
  if(!supabase)throw new Error('Supabase no está configurado')
  const {error}=openEntry?await supabase.from('time_entries').update({clock_out:new Date().toISOString(),status:'completed'}).eq('id',openEntry.id):await supabase.from('time_entries').insert({employee_id:employeeId,restaurant_id:restaurantId,clock_in:new Date().toISOString(),source:'employee',status:'open',break_minutes:0})
  if(error)throw error
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
