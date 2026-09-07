export type EmployeeRecord = {
  id: string
  company_id?: string
  employee_code: string | null
  first_name: string
  last_name: string
  email: string | null
  phone?: string | null
  position_id?: string | null
  department_id?: string | null
  hire_date?: string | null
  weekly_contract_hours?: number | null
  hourly_cost?: number | null
  notes?: string | null
  status: string
  departments: { name: string } | null
  positions: { name: string } | null
}

export type DepartmentRecord = { id: string; company_id: string; name: string; description: string | null; active: boolean }
export type PositionRecord = { id: string; company_id: string; department_id: string | null; name: string; description: string | null; active: boolean }

export type ShiftRecord = {
  id: string
  schedule_period_id?: string
  restaurant_id?: string
  employee_id: string
  position_id?: string | null
  department_id?: string | null
  shift_date: string
  start_time: string
  end_time: string
  break_minutes?: number
  notes?: string | null
  status?: string
  departments: { name: string } | null
  employees: { id: string; first_name: string; last_name: string } | null
}

export type SchedulePeriodRecord = { id:string; restaurant_id:string; start_date:string; end_date:string; status:string; published_at:string|null }
export type TimeEntryRecord = { id:string; employee_id:string; restaurant_id:string; shift_id:string|null; clock_in:string; clock_out:string|null; break_minutes:number; source:string; status:string; notes:string|null; employees:{first_name:string;last_name:string}|null }
export type VacationRequestRecord = { id:string; employee_id:string; start_date:string; end_date:string; status:string; employee_notes:string|null; employees:{first_name:string;last_name:string}|null }
export type ShiftChangeRequestRecord = { id:string; shift_id:string; requested_by_employee_id:string; replacement_employee_id:string|null; request_type:string; status:string; reason:string|null; employees:{first_name:string;last_name:string}|null; shifts:{shift_date:string;start_time:string;end_time:string}|null }

export type DashboardMetrics = {
  employees: number
  hours: number
  shifts: number
  vacations: number
  entries: number
  today: number
}

export type CompanyRecord = {
  id: string
  name: string
  legal_name: string | null
  tax_id: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  currency: string
  timezone: string
  active: boolean
}

export type RestaurantRecord = {
  id: string
  company_id: string
  name: string
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  phone: string | null
  email: string | null
  active: boolean
}

export type RoleRecord = {
  id: string
  code: string
  name: string
  description: string | null
}

export type CompanyMemberRecord = {
  id: string
  company_id: string
  user_id: string
  role_id: string
  active: boolean
  role: RoleRecord | null
  profile: {
    first_name: string | null
    last_name: string | null
    phone: string | null
    avatar_url: string | null
  } | null
}
