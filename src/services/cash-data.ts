import { supabase } from '../lib/supabase'

export type CashRegister = {
  id: string
  company_id: string
  restaurant_id: string
  name: string
  location: string | null
  active: boolean
  created_at: string
}

export type CashSession = {
  id: string
  company_id: string
  restaurant_id: string
  register_id: string
  opened_by: string | null
  closed_by: string | null
  opened_at: string
  closed_at: string | null
  opening_float: number
  difference?: number | null
  status: string
  notes: string | null
  cash_registers?: { name: string } | { name: string }[] | null
}

export type CashMovement = {
  id: string
  company_id: string
  restaurant_id: string
  session_id: string
  movement_type: string
  amount: number
  payment_method_id: string | null
  description: string | null
  reference: string | null
  created_by: string | null
  created_at: string
  payment_methods?: { name: string } | { name: string }[] | null
}

export type PaymentMethod = {
  id: string
  company_id: string
  restaurant_id: string | null
  name: string
  code: string
  method_type: string
  active: boolean
  sort_order: number
}

export type PaymentSummary = {
  id: string
  company_id: string
  restaurant_id: string
  business_date?: string
  payment_method_id: string
  transaction_count: number
  amount: number
  payment_methods?: { name: string } | { name: string }[] | null
}

export type CashData = {
  registers: CashRegister[]
  sessions: CashSession[]
  movements: CashMovement[]
  paymentMethods: PaymentMethod[]
  payments: PaymentSummary[]
}

export type CashTable =
  | 'cash_registers'
  | 'cash_sessions'
  | 'cash_movements'
  | 'payment_methods'
  | 'cash_payment_summaries'

export async function getCashData(): Promise<CashData> {
  if (!supabase) {
    return { registers: [], sessions: [], movements: [], paymentMethods: [], payments: [] }
  }

  const [registers, sessions, movements, paymentMethods, dailySummaries] = await Promise.all([
    supabase.from('cash_registers').select('*').order('name'),
    supabase
      .from('cash_sessions')
      .select('*,cash_registers(name)')
      .order('opened_at', { ascending: false }),
    supabase
      .from('cash_movements')
      .select('*,payment_methods(name)')
      .order('created_at', { ascending: false }),
    supabase.from('payment_methods').select('*').order('sort_order').order('name'),
    supabase
      .from('cash_payment_summaries')
      .select('*,payment_methods(name),cash_sessions(business_date)')
      .order('updated_at', { ascending: false }),
  ])

  const error =
    registers.error ||
    sessions.error ||
    movements.error ||
    paymentMethods.error ||
    dailySummaries.error
  if (error) throw error

  return {
    registers: (registers.data ?? []) as CashRegister[],
    sessions: (sessions.data ?? []) as unknown as CashSession[],
    movements: (movements.data ?? []) as unknown as CashMovement[],
    paymentMethods: (paymentMethods.data ?? []) as PaymentMethod[],
    payments: (dailySummaries.data ?? []).map((row:Record<string,unknown>)=>{const session=Array.isArray(row.cash_sessions)?row.cash_sessions[0]:row.cash_sessions;return{...row,amount:Number(row.expected_amount??0),transaction_count:Number(row.transactions_count??0),business_date:(session as {business_date?:string}|null)?.business_date??''}}) as unknown as PaymentSummary[],
  }
}

export async function saveCash(table: CashTable, values: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase no está configurado')

  const query = values.id
    ? supabase.from(table).update(values).eq('id', String(values.id))
    : supabase.from(table).insert(values)
  const { error } = await query
  if (error) throw error
}
