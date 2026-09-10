import { Component, Suspense, lazy, useEffect, useState, type ErrorInfo, type FormEvent, type ReactNode } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Banknote, BarChart3, Bell, Boxes, CalendarDays, Check, ChevronLeft, ChevronRight, CircleUserRound, ClipboardCheck, Clock3, CloudCog, ContactRound, FileText, LayoutDashboard, ListTodo, LockKeyhole, LogOut, Menu, Plus, Search, Settings, ShoppingCart, Users, UtensilsCrossed, Wrench, X } from 'lucide-react'
import { employees, shifts } from './data/demo'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { getDashboardMetrics, getEmployees, getWeekShifts } from './services/restaurant-data'
import { getCurrentAccess, type AccessProfile } from './services/access-control'
const SettingsHome=lazy(()=>import('./features/settings/SettingsHome').then(m=>({default:m.SettingsHome})))
const CompanySettings=lazy(()=>import('./features/settings/CompanySettings').then(m=>({default:m.CompanySettings})))
const RestaurantsSettings=lazy(()=>import('./features/settings/RestaurantsSettings').then(m=>({default:m.RestaurantsSettings})))
const UsersSettings=lazy(()=>import('./features/settings/UsersSettings').then(m=>({default:m.UsersSettings})))
const RolesSettings=lazy(()=>import('./features/settings/RolesSettings').then(m=>({default:m.RolesSettings})))
const CatalogsSettings=lazy(()=>import('./features/settings/CatalogsSettings').then(m=>({default:m.CatalogsSettings})))
const EmployeesManagement=lazy(()=>import('./features/people/EmployeesManagement').then(m=>({default:m.EmployeesManagement})))
const ScheduleManagement=lazy(()=>import('./features/schedule/ScheduleManagement').then(m=>({default:m.ScheduleManagement})))
const TimeTracking=lazy(()=>import('./features/schedule/TimeTracking').then(m=>({default:m.TimeTracking})))
const ActionCenter=lazy(()=>import('./features/schedule/ActionCenter').then(m=>({default:m.ActionCenter})))
const EmployeePortal=lazy(()=>import('./features/employee/EmployeePortal').then(m=>({default:m.EmployeePortal})))
const OperationsHub=lazy(()=>import('./features/operations/OperationsHub').then(m=>({default:m.OperationsHub})))
const PurchasesHub=lazy(()=>import('./features/purchases/PurchasesHub').then(m=>({default:m.PurchasesHub})))
const InventoryHub=lazy(()=>import('./features/inventory/InventoryHub').then(m=>({default:m.InventoryHub})))
const ProfitabilityHub=lazy(()=>import('./features/profitability/ProfitabilityHub').then(m=>({default:m.ProfitabilityHub})))
const CommercialHub=lazy(()=>import('./features/commercial/CommercialHub').then(m=>({default:m.CommercialHub})))
const CashHub=lazy(()=>import('./features/cash/CashHub').then(m=>({default:m.CashHub})))
const BillingHub=lazy(()=>import('./features/billing/BillingHub').then(m=>({default:m.BillingHub})))
const IntegrationsHub=lazy(()=>import('./features/integrations/IntegrationsHub').then(m=>({default:m.IntegrationsHub})))
const SecurityHub=lazy(()=>import('./features/security/SecurityHub').then(m=>({default:m.SecurityHub})))
const OnboardingWizard=lazy(()=>import('./features/onboarding/OnboardingWizard').then(m=>({default:m.OnboardingWizard})))
const InvitationAccept=lazy(()=>import('./features/onboarding/InvitationAccept').then(m=>({default:m.InvitationAccept})))

const days = ['Lun 7', 'Mar 8', 'Mié 9', 'Jue 10', 'Vie 11', 'Sáb 12', 'Dom 13']

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('demo@restaurantos.es')
  const [password, setPassword] = useState('demorestaurantos')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    if (supabase) {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError('No hemos podido iniciar sesión. Revisa el correo y la contraseña.'); setLoading(false); return }
    }
    onLogin()
  }
  return <main className="min-h-screen grid lg:grid-cols-[1.05fr_.95fr] bg-[#102820]">
    <section className="hidden lg:flex p-14 xl:p-20 text-white flex-col justify-between relative overflow-hidden">
      <div className="absolute w-[520px] h-[520px] rounded-full bg-[#d97840]/15 blur-3xl -left-40 top-20" />
      <Logo light />
      <div className="relative max-w-xl">
        <p className="text-[#f2ab75] text-sm font-semibold tracking-[.2em] uppercase">Tu restaurante, en orden</p>
        <h1 className="text-5xl xl:text-6xl leading-[1.05] font-semibold mt-5">Menos hojas de cálculo. Más tiempo para tu equipo.</h1>
        <p className="text-white/65 text-lg mt-7 max-w-lg">Personal, turnos y jornada diaria en un único lugar, sencillo de usar.</p>
      </div>
      <p className="text-sm text-white/45">RestaurantOS · Valencia</p>
    </section>
    <section className="bg-[#f4f6f2] min-h-screen flex items-center justify-center p-6 sm:p-10 rounded-none lg:rounded-l-[2.5rem]">
      <div className="w-full max-w-md">
        <div className="lg:hidden mb-12"><Logo /></div>
        <p className="text-sm font-semibold text-[#d56f36]">Bienvenido de nuevo</p>
        <h2 className="text-3xl font-semibold mt-2 tracking-tight">Entra en RestaurantOS</h2>
        <p className="text-[#69736e] mt-3">Gestiona tu restaurante desde aquí.</p>
        <form onSubmit={submit} className="mt-9 space-y-5">
          <label className="block text-sm font-medium">Correo electrónico<input aria-label="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="mt-2 w-full h-12 rounded-xl border border-[#d9dfda] bg-white px-4 outline-none focus:ring-2 focus:ring-[#2f6a54]/25 focus:border-[#2f6a54]" /></label>
          <label className="block text-sm font-medium">Contraseña<input aria-label="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="mt-2 w-full h-12 rounded-xl border border-[#d9dfda] bg-white px-4 outline-none focus:ring-2 focus:ring-[#2f6a54]/25 focus:border-[#2f6a54]" /></label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="w-full h-12 rounded-xl bg-[#173c2e] hover:bg-[#0f2e23] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{loading ? 'Entrando…' : 'Entrar'} <ArrowRight size={17}/></button>
        </form>
        {!isSupabaseConfigured && <div className="mt-6 rounded-xl bg-[#e6eee9] px-4 py-3 text-sm text-[#365646]">Modo demostración activo. Pulsa “Entrar” para ver la app.</div>}
      </div>
    </section>
  </main>
}

function Logo({ light=false }: { light?: boolean }) { return <div className={`flex items-center gap-3 font-semibold text-lg ${light?'text-white':'text-[#173c2e]'}`}><span className="h-10 w-10 rounded-xl bg-[#d97840] text-white grid place-items-center"><UtensilsCrossed size={20}/></span>RestaurantOS</div> }

function Shell({ children, onLogout, access }: { children: ReactNode; onLogout: () => void; access:AccessProfile|null }) {
  const [open, setOpen] = useState(false)
  const groups = [
    { label:'General', links:[['/',LayoutDashboard,'Dashboard','dashboard'],['/acciones',ListTodo,'Centro de acciones','operations']] },
    { label:'Personal', links:[['/empleados',Users,'Empleados','people'],['/horarios',CalendarDays,'Horarios','schedule'],['/fichajes',Clock3,'Fichajes','schedule']] },
    { label:'Gestión', links:[['/operaciones',ClipboardCheck,'Operaciones','operations'],['/compras',ShoppingCart,'Compras','purchases'],['/inventario',Boxes,'Inventario','inventory'],['/rentabilidad',BarChart3,'Rentabilidad','profitability'],['/clientes',ContactRound,'Clientes y reservas','customers'],['/caja',Banknote,'Caja y cierres','cash'],['/facturacion',FileText,'Facturación','billing']] },
    { label:'Cuenta', links:[['/integraciones',CloudCog,'Integraciones','integrations'],['/seguridad',LockKeyhole,'Seguridad','settings'],['/configuracion',Settings,'Configuración','settings'],['/mi-app',CircleUserRound,'App empleado','schedule']] },
  ] as const
  const can=(module:string)=>!access?.allowedModules||access.allowedModules.has(module)
  return <div className="min-h-screen bg-[#f4f6f2] lg:grid lg:grid-cols-[250px_1fr]">
    {open && <button aria-label="Cerrar menú" onClick={()=>setOpen(false)} className="fixed inset-0 bg-black/30 z-30 lg:hidden" />}
    <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[250px] bg-[#102820] text-white px-4 py-6 flex flex-col transition-transform ${open?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
      <div className="px-3 flex justify-between items-center"><Logo light/><button onClick={()=>setOpen(false)} className="lg:hidden text-white/60"><X/></button></div>
      <div className="mt-10 px-3"><p className="text-[12px] uppercase tracking-widest text-white/40">Restaurante</p><p className="font-medium mt-2">Valencia Centro</p></div>
      <nav className="mt-7 space-y-5 overflow-y-auto pr-1">{groups.map(group=>{const visible=group.links.filter(link=>can(link[3]));return visible.length?<div key={group.label}><p className="px-3 mb-1 text-[11px] uppercase tracking-[.16em] text-white/30">{group.label}</p>{visible.map(([to,Icon,label])=><NavLink key={to} end={to==='/'} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive?'bg-white/12 text-white':'text-white/58 hover:bg-white/7 hover:text-white'}`}><Icon size={18}/>{label}</NavLink>)}</div>:null})}</nav>
      <button onClick={onLogout} className="mt-auto flex items-center gap-3 px-3 py-3 text-sm text-white/55 hover:text-white"><LogOut size={18}/>Cerrar sesión</button>
    </aside>
    <div className="min-w-0">
      <header className="h-18 bg-white/80 backdrop-blur border-b border-[#e5e9e5] flex items-center px-5 lg:px-8 sticky top-0 z-20">
        <button aria-label="Abrir menú" onClick={()=>setOpen(true)} className="lg:hidden mr-4"><Menu/></button>
        <div className="ml-auto flex items-center gap-3"><button aria-label="Notificaciones" className="w-10 h-10 grid place-items-center rounded-full hover:bg-[#edf1ed] relative"><Bell size={19}/><i className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#d97840]"/></button><div className="h-9 w-9 rounded-full bg-[#d97840] text-white grid place-items-center text-sm font-semibold">AR</div><div className="hidden sm:block"><p className="text-sm font-semibold leading-none">Arturo</p><p className="text-xs text-[#7a847f] mt-1">{access?.roleName??'Cargando acceso…'}</p></div></div>
      </header>
      <div className="p-5 sm:p-8 xl:p-10 max-w-[1500px] mx-auto">{children}</div>
    </div>
  </div>
}

function PageTitle({ eyebrow, title, action }: {eyebrow:string; title:string; action?:ReactNode}) { return <div className="flex flex-wrap gap-4 items-end justify-between mb-8"><div><p className="text-sm text-[#bd622f] font-semibold">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight mt-1">{title}</h1></div>{action}</div> }
function Stat({label,value,note,icon:Icon,tone}:{label:string;value:string;note:string;icon:typeof Users;tone:string}) { return <div className="card p-5 soft-shadow"><div className="flex items-start justify-between"><div><p className="text-sm text-[#748079]">{label}</p><p className="text-3xl font-semibold mt-2">{value}</p></div><span className={`h-11 w-11 rounded-xl grid place-items-center ${tone}`}><Icon size={21}/></span></div><p className="text-sm text-[#5f6b65] mt-4">{note}</p></div> }

function Dashboard() {
  const [metrics,setMetrics]=useState({employees:3,hours:120,shifts:15,vacations:1,entries:1,today:3})
  useEffect(()=>{
    if(!supabase) return
    getDashboardMetrics().then(setMetrics).catch(()=>undefined)
  },[])
  return <div className="fade-in"><PageTitle eyebrow="Lunes, 7 de septiembre" title="Buenos días, Arturo"/><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4"><Stat label="Equipo activo" value={String(metrics.employees)} note={`${metrics.today} trabajando hoy`} icon={Users} tone="bg-[#e5f0e9] text-[#2f6a54]"/><Stat label="Horas esta semana" value={`${metrics.hours} h`} note={`${metrics.shifts} turnos publicados`} icon={Clock3} tone="bg-[#fff0e5] text-[#c4632f]"/><Stat label="Vacaciones" value={String(metrics.vacations)} note="Pendientes de revisar" icon={CalendarDays} tone="bg-[#eeeaf8] text-[#6d5b9f]"/><Stat label="Fichajes de hoy" value={`${metrics.entries}/${metrics.today}`} note="Registros completados" icon={Check} tone="bg-[#e5eef4] text-[#3c718c]"/></div>
  <div className="grid xl:grid-cols-[1.35fr_.65fr] gap-5 mt-5"><section className="card p-5 sm:p-6"><div className="flex justify-between"><div><h2 className="font-semibold text-lg">Turnos de hoy</h2><p className="text-sm text-[#748079] mt-1">Lunes, 7 de septiembre</p></div><NavLink to="/horarios" className="text-sm font-semibold text-[#2f6a54]">Ver horario</NavLink></div><div className="mt-5 divide-y divide-[#edf0ed]">{employees.slice(0,3).map((e,i)=><div key={e.id} className="py-4 flex items-center gap-3"><Avatar employee={e}/><div className="min-w-0"><p className="font-medium">{e.name}</p><p className="text-sm text-[#7a847f]">{e.role} · {e.department}</p></div><div className="ml-auto text-right"><p className="font-medium text-sm">{['10:00–16:00','09:00–17:00','12:00–20:00'][i]}</p><p className={`text-xs mt-1 ${i===0?'text-[#2f6a54]':'text-[#89928e]'}`}>{i===0?'Trabajando':'Próximamente'}</p></div></div>)}</div></section>
  <section className="card p-5 sm:p-6"><h2 className="font-semibold text-lg">Necesita atención</h2><div className="mt-5 rounded-xl bg-[#fff5ed] p-4 border border-[#f5ddca]"><span className="text-xs font-semibold text-[#bc5c2c]">VACACIONES</span><p className="font-medium mt-2">Solicitud pendiente</p><p className="text-sm text-[#756b65] mt-1">21–23 de septiembre</p><button className="mt-4 text-sm font-semibold text-[#9e4a22]">Revisar solicitud →</button></div><div className="mt-3 rounded-xl bg-[#eef3ef] p-4"><span className="text-xs font-semibold text-[#3a6653]">CAMBIO DE TURNO</span><p className="font-medium mt-2">Carlos solicita un cambio</p><p className="text-sm text-[#68736d] mt-1">Miércoles, turno de tarde</p></div></section></div></div>
}

function Avatar({employee}:{employee:typeof employees[number]}) { return <span style={{background:employee.color}} className="h-10 w-10 shrink-0 rounded-full text-white grid place-items-center text-sm font-semibold">{employee.initials}</span> }
function Employees() {
  const [q,setQ]=useState('')
  const [team,setTeam]=useState(employees)
  const [loading,setLoading]=useState(Boolean(supabase))
  const [loadError,setLoadError]=useState('')

  useEffect(()=>{
    if(!supabase) return
    let active=true
    getEmployees().then(data=>{
        if(!active) return
        const colors=['#db7c43','#5e8f78','#71669b','#3c718c']
          setTeam(data.map((row,index)=>({
            id:row.id,
            name:`${row.first_name} ${row.last_name}`.trim(),
            initials:`${row.first_name[0] ?? ''}${row.last_name[0] ?? ''}`.toUpperCase(),
            code:row.employee_code ?? '—',
            role:row.positions?.name ?? 'Sin puesto',
            department:row.departments?.name ?? 'Sin departamento',
            email:row.email ?? 'Sin correo',
            status:row.status==='active' ? 'Activo' : 'Ausente',
            color:colors[index%colors.length],
          })))
        setLoading(false)
      }).catch(()=>{if(active){setLoadError('No hemos podido cargar el equipo. Revisa los permisos del usuario.');setTeam([]);setLoading(false)}})
    return()=>{active=false}
  },[])

  const filtered=team.filter(e=>(e.name+e.role+e.department).toLowerCase().includes(q.toLowerCase()))
  return <div className="fade-in"><PageTitle eyebrow="Personal" title="Equipo" action={<button className="h-11 px-4 rounded-xl bg-[#173c2e] text-white font-semibold text-sm flex items-center gap-2"><Plus size={17}/>Añadir empleado</button>}/><div className="card overflow-hidden"><div className="p-4 border-b border-[#e7ebe7]"><label className="relative block max-w-sm"><Search className="absolute left-3 top-3 text-[#87908b]" size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en el equipo…" className="h-11 w-full pl-10 pr-4 rounded-xl bg-[#f4f6f2] outline-none focus:ring-2 focus:ring-[#2f6a54]/20"/></label></div><div className="divide-y divide-[#edf0ed]">{loading&&<p className="p-10 text-center text-[#7b8580]">Cargando el equipo…</p>}{loadError&&<p role="alert" className="p-5 m-4 rounded-xl bg-red-50 text-red-700 text-sm">{loadError}</p>}{!loading&&filtered.map(e=><div key={e.id} className="p-4 sm:px-6 flex flex-wrap items-center gap-4"><Avatar employee={e}/><div className="min-w-[180px] flex-1"><p className="font-semibold">{e.name}</p><p className="text-sm text-[#78827d] mt-1">{e.email}</p></div><div className="w-36"><p className="text-sm font-medium">{e.role}</p><p className="text-xs text-[#89928d] mt-1">{e.department}</p></div><span className={`text-xs font-semibold rounded-full px-3 py-1 ${e.status==='Activo'?'bg-[#e4f0e9] text-[#2d6b50]':'bg-[#fff0e4] text-[#a65128]'}`}>{e.status}</span><span className="text-sm text-[#7f8984] w-16">{e.code}</span><button className="text-sm font-semibold text-[#2f6a54]">Ver ficha</button></div>)}{!loading&&!loadError&&filtered.length===0&&<p className="p-10 text-center text-[#7b8580]">No hay resultados para esa búsqueda.</p>}</div></div></div>
}

function Schedule() {
  const [scheduleTeam,setScheduleTeam]=useState(employees)
  const [scheduleShifts,setScheduleShifts]=useState(shifts)
  const [loading,setLoading]=useState(Boolean(supabase))
  const [loadError,setLoadError]=useState('')

  useEffect(()=>{
    if(!supabase) return
    let active=true
    getWeekShifts().then(data=>{
        if(!active) return
          const rows=data
          const people=new Map<string,typeof employees[number]>()
          const colors=['#db7c43','#5e8f78','#71669b','#3c718c']
          rows.forEach(row=>{
            if(row.employees&&!people.has(row.employee_id)){
              const position=people.size
              people.set(row.employee_id,{
                id:row.employee_id,
                name:`${row.employees.first_name} ${row.employees.last_name}`.trim(),
                initials:`${row.employees.first_name[0]??''}${row.employees.last_name[0]??''}`.toUpperCase(),
                code:'', role:'', department:row.departments?.name??'Sin departamento', email:'', status:'Activo', color:colors[position%colors.length],
              })
            }
          })
          setScheduleTeam([...people.values()])
          setScheduleShifts(rows.map(row=>({
            employeeId:row.employee_id,
            day:Math.round((new Date(`${row.shift_date}T12:00:00`).getTime()-new Date('2026-09-07T12:00:00').getTime())/86400000),
            time:`${row.start_time.slice(0,5)}–${row.end_time.slice(0,5)}`,
            area:row.departments?.name??'Turno',
          })))
        setLoading(false)
      }).catch(()=>{if(active){setLoadError('No hemos podido cargar los turnos. Revisa los permisos del horario.');setScheduleTeam([]);setScheduleShifts([]);setLoading(false)}})
    return()=>{active=false}
  },[])

  const hours=scheduleShifts.reduce((total,shift)=>{
    const [start,end]=shift.time.split('–').map(value=>{const [h,m]=value.split(':').map(Number);return h+m/60})
    return total+Math.max(0,end-start)
  },0)

  return <div className="fade-in"><PageTitle eyebrow="Semana 7–13 septiembre" title="Horario del equipo" action={<div className="flex gap-2"><button aria-label="Semana anterior" className="h-11 w-11 rounded-xl border bg-white grid place-items-center"><ChevronLeft size={18}/></button><button aria-label="Semana siguiente" className="h-11 w-11 rounded-xl border bg-white grid place-items-center"><ChevronRight size={18}/></button><button className="h-11 px-4 rounded-xl bg-[#173c2e] text-white font-semibold text-sm hidden sm:flex items-center gap-2"><Plus size={17}/>Añadir turno</button></div>}/>{loadError&&<p role="alert" className="p-5 mb-4 rounded-xl bg-red-50 text-red-700 text-sm">{loadError}</p>}<div className="card overflow-x-auto"><div className="min-w-[940px]"><div className="grid grid-cols-[180px_repeat(7,1fr)] bg-[#f8f9f7] border-b border-[#e5e9e5]"><div className="p-4 text-sm font-semibold">Empleado</div>{days.map((d,i)=><div key={d} className={`p-4 text-center text-sm font-semibold ${i===0?'text-[#c86231] bg-[#fff7f1]':''}`}>{d}</div>)}</div>{loading&&<p className="p-10 text-[#7b8580]">Cargando el horario…</p>}{!loading&&scheduleTeam.map(e=><div key={e.id} className="grid grid-cols-[180px_repeat(7,1fr)] min-h-24 border-b last:border-0 border-[#edf0ed]"><div className="p-4 flex items-center gap-3"><Avatar employee={e}/><div><p className="text-sm font-semibold">{e.name.split(' ')[0]}</p><p className="text-xs text-[#87908b]">{e.department}</p></div></div>{days.map((_,day)=>{const s=scheduleShifts.find(x=>x.employeeId===e.id&&x.day===day);return <div key={day} className={`p-2 border-l border-[#edf0ed] ${day===0?'bg-[#fffaf6]':''}`}>{s&&<div className="h-full rounded-lg bg-[#e5f0e9] border-l-[3px] border-[#3f785f] p-2"><p className="text-xs font-semibold text-[#25533f]">{s.time}</p><p className="text-[11px] text-[#60806f] mt-1">{s.area}</p></div>}</div>})}</div>)}</div></div><div className="mt-4 flex gap-5 text-sm text-[#707b75]"><span><b className="text-[#18211d]">{hours} h</b> planificadas</span><span><b className="text-[#18211d]">{scheduleShifts.length}</b> turnos</span><span className="ml-auto text-[#2f6a54] font-semibold">Horario publicado</span></div></div>
}

function EmployeeApp() { return <div className="fade-in max-w-5xl mx-auto"><PageTitle eyebrow="Portal del empleado" title="Hola, Carlos"/><div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5"><section className="rounded-[1.5rem] p-6 sm:p-8 bg-[#173c2e] text-white soft-shadow"><p className="text-white/60 text-sm">Turno de hoy</p><p className="text-4xl font-semibold mt-3">10:00–16:00</p><p className="text-white/65 mt-2">Sala · Valencia Centro</p><div className="mt-10 rounded-2xl bg-white/10 p-5 flex items-center justify-between"><div><p className="text-sm text-white/60">Entrada registrada</p><p className="font-semibold mt-1">09:57</p></div><span className="h-11 w-11 rounded-full bg-[#d97840] grid place-items-center"><Check/></span></div><button className="mt-4 w-full h-12 bg-white text-[#173c2e] rounded-xl font-semibold">Finalizar jornada</button></section><section className="card p-6"><h2 className="font-semibold text-lg">Mis próximos turnos</h2><div className="mt-4 divide-y divide-[#edf0ed]">{[['Mié 9','18:00–00:00'],['Vie 11','12:00–18:00'],['Lun 14','10:00–16:00']].map(([d,t])=><div key={d} className="py-4 flex items-center"><span className="h-11 w-14 rounded-xl bg-[#fff0e5] text-[#b85828] grid place-items-center text-sm font-bold">{d}</span><div className="ml-4"><p className="font-semibold">{t}</p><p className="text-sm text-[#7c8681]">Sala</p></div><ChevronRight className="ml-auto text-[#9ba39f]" size={18}/></div>)}</div><button className="mt-4 w-full rounded-xl bg-[#f0f3f0] h-11 font-semibold text-sm text-[#315c49]">Ver mi horario completo</button></section></div><div className="grid sm:grid-cols-2 gap-5 mt-5"><button className="card p-5 text-left hover:border-[#98afa3]"><CalendarDays className="text-[#d16d38]"/><p className="font-semibold mt-4">Solicitar vacaciones</p><p className="text-sm text-[#79837e] mt-1">Envía una nueva solicitud</p></button><button className="card p-5 text-left hover:border-[#98afa3]"><Clock3 className="text-[#4c7a65]"/><p className="font-semibold mt-4">Cambiar un turno</p><p className="text-sm text-[#79837e] mt-1">Propón un cambio al equipo</p></button></div></div> }

function ModuleLoading(){return <div className="min-h-[45vh] grid place-items-center" role="status"><div className="text-center"><span className="mx-auto block h-9 w-9 rounded-full border-4 border-[#d8e2dc] border-t-[#2f6a54] animate-spin"/><p className="text-sm text-[#6e7873] mt-4">Cargando módulo…</p></div></div>}
class AppErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(error:Error,info:ErrorInfo){console.error('RestaurantOS module error',error,info)}render(){if(this.state.failed)return <div className="card max-w-xl mx-auto p-8 text-center"><span className="h-12 w-12 rounded-xl bg-[#fff0e5] text-[#bd622f] grid place-items-center mx-auto"><Wrench/></span><h2 className="text-xl font-semibold mt-5">No hemos podido abrir este módulo</h2><p className="text-sm text-[#6e7873] mt-2">Recarga la página. Si continúa, vuelve al Dashboard y revisaremos el problema sin perder datos.</p><div className="flex justify-center gap-3 mt-6"><button onClick={()=>location.reload()} className="rounded-xl bg-[#173c2e] text-white px-4 py-2.5 font-semibold text-sm">Recargar</button><a href="/" className="rounded-xl border px-4 py-2.5 font-semibold text-sm">Ir al Dashboard</a></div></div>;return this.props.children}}
function ModuleGuard({access,module,children}:{access:AccessProfile|null;module:string;children:ReactNode}){if(access?.allowedModules&&!access.allowedModules.has(module))return <div className="card max-w-xl mx-auto p-8 text-center"><span className="h-12 w-12 rounded-xl bg-[#fff0e5] text-[#bd622f] grid place-items-center mx-auto"><LockKeyhole/></span><h1 className="text-2xl font-semibold mt-5">Acceso restringido</h1><p className="text-sm text-[#6e7873] mt-2">Tu rol no tiene permiso para abrir este módulo. Solicita acceso a un propietario o administrador.</p><NavLink to="/" className="inline-block mt-6 rounded-xl bg-[#173c2e] text-white px-4 py-2.5 font-semibold text-sm">Volver al Dashboard</NavLink></div>;return children}

export default function App() {
  const [loggedIn,setLoggedIn]=useState(()=>sessionStorage.getItem('restaurantos-session')==='true')
  const [access,setAccess]=useState<AccessProfile|null>(null)
  const nav=useNavigate()
  const location=useLocation()
  useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>{if(data.session){sessionStorage.setItem('restaurantos-session','true');setLoggedIn(true)}});const{data}=supabase.auth.onAuthStateChange((_event,session)=>{if(session){sessionStorage.setItem('restaurantos-session','true');setLoggedIn(true)}});return()=>data.subscription.unsubscribe()},[])
  useEffect(()=>{if(!loggedIn)return;let active=true;getCurrentAccess().then(value=>{if(active)setAccess(value)}).catch(()=>{if(active)setAccess(null)});return()=>{active=false}},[loggedIn])
  useEffect(()=>{if(access?.roleName==='Sin rol'&&!location.pathname.startsWith('/aceptar-invitacion'))nav('/inicio')},[access,nav,location.pathname])
  const login=()=>{sessionStorage.setItem('restaurantos-session','true');setLoggedIn(true);nav('/')}
  const logout=async()=>{if(supabase)await supabase.auth.signOut();sessionStorage.removeItem('restaurantos-session');setLoggedIn(false);nav('/login')}
  if(location.pathname.startsWith('/aceptar-invitacion'))return <AppErrorBoundary><Suspense fallback={<ModuleLoading/>}><InvitationAccept/></Suspense></AppErrorBoundary>
  if(!loggedIn) return <Routes><Route path="*" element={<Login onLogin={login}/>}/></Routes>
  const guard=(module:string,children:ReactNode)=><ModuleGuard access={access} module={module}>{children}</ModuleGuard>
  if(access?.roleName==='Sin rol')return <AppErrorBoundary><Suspense fallback={<ModuleLoading/>}><Routes><Route path="*" element={<OnboardingWizard/>}/></Routes></Suspense></AppErrorBoundary>
  return <Shell onLogout={logout} access={access}><AppErrorBoundary><Suspense fallback={<ModuleLoading/>}><Routes>
    <Route path="/" element={guard('dashboard',<Dashboard/>)}/>
    <Route path="/acciones" element={guard('operations',<ActionCenter/>)}/>
    <Route path="/empleados" element={guard('people',<EmployeesManagement/>)}/><Route path="/horarios" element={guard('schedule',<ScheduleManagement/>)}/>
    <Route path="/fichajes" element={guard('schedule',<TimeTracking/>)}/>
    <Route path="/operaciones" element={guard('operations',<OperationsHub/>)}/>
    <Route path="/compras" element={guard('purchases',<PurchasesHub/>)}/>
    <Route path="/inventario" element={guard('inventory',<InventoryHub/>)}/>
    <Route path="/rentabilidad" element={guard('profitability',<ProfitabilityHub/>)}/>
    <Route path="/clientes" element={guard('customers',<CommercialHub/>)}/>
    <Route path="/caja" element={guard('cash',<CashHub/>)}/>
    <Route path="/facturacion" element={guard('billing',<BillingHub/>)}/>
    <Route path="/integraciones" element={guard('integrations',<IntegrationsHub/>)}/>
    <Route path="/seguridad" element={guard('settings',<SecurityHub/>)}/>
    <Route path="/configuracion" element={guard('settings',<SettingsHome/>)}/><Route path="/configuracion/empresa" element={guard('settings',<CompanySettings/>)}/><Route path="/configuracion/restaurantes" element={guard('settings',<RestaurantsSettings/>)}/><Route path="/configuracion/usuarios" element={guard('settings',<UsersSettings/>)}/><Route path="/configuracion/roles" element={guard('settings',<RolesSettings/>)}/><Route path="/configuracion/catalogos" element={guard('settings',<CatalogsSettings/>)}/><Route path="/mi-app" element={guard('schedule',<EmployeePortal/>)}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Suspense></AppErrorBoundary></Shell>
}

