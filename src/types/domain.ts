export type EmployeeRecord = {
  id: string
  employee_code: string | null
  first_name: string
  last_name: string
  email: string | null
  status: string
  departments: { name: string } | null
  positions: { name: string } | null
}

export type ShiftRecord = {
  id: string
  employee_id: string
  shift_date: string
  start_time: string
  end_time: string
  departments: { name: string } | null
  employees: { id: string; first_name: string; last_name: string } | null
}

export type DashboardMetrics = {
  employees: number
  hours: number
  shifts: number
  vacations: number
  entries: number
  today: number
}
