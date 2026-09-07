import { useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, CalendarDays, Check, ChevronLeft, ChevronRight, CircleUserRound, Clock3, LayoutDashboard, LogOut, Menu, Plus, Search, Users, UtensilsCrossed, X } from 'lucide-react'
import { employees, shifts } from './data/demo'
import { isSupabaseConfigured, supabase } from './lib/supabase'

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

function Shell({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const links = [
    ['/', LayoutDashboard, 'Dashboard'], ['/empleados', Users, 'Empleados'], ['/horarios', CalendarDays, 'Horarios'], ['/mi-app', CircleUserRound, 'App empleado'],
  ] as const
  return <div className="min-h-screen bg-[#f4f6f2] lg:grid lg:grid-cols-[250px_1fr]">
    {open && <button aria-label="Cerrar menú" onClick={()=>setOpen(false)} className="fixed inset-0 bg-black/30 z-30 lg:hidden" />}
    <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[250px] bg-[#102820] text-white px-4 py-6 flex flex-col transition-transform ${open?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
      <div className="px-3 flex justify-between items-center"><Logo light/><button onClick={()=>setOpen(false)} className="lg:hidden text-white/60"><X/></button></div>
      <div className="mt-10 px-3"><p className="text-[12px] uppercase tracking-widest text-white/40">Restaurante</p><p className="font-medium mt-2">Valencia Centro</p></div>
      <nav className="mt-8 space-y-1">{links.map(([to, Icon, label])=><NavLink key={to} end={to==='/'} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${isActive?'bg-white/12 text-white':'text-white/58 hover:bg-white/7 hover:text-white'}`}><Icon size={19}/>{label}</NavLink>)}</nav>
      <button onClick={onLogout} className="mt-auto flex items-center gap-3 px-3 py-3 text-sm text-white/55 hover:text-white"><LogOut size={18}/>Cerrar sesión</button>
    </aside>
    <div className="min-w-0">
      <header className="h-18 bg-white/80 backdrop-blur border-b border-[#e5e9e5] flex items-center px-5 lg:px-8 sticky top-0 z-20">
        <button aria-label="Abrir menú" onClick={()=>setOpen(true)} className="lg:hidden mr-4"><Menu/></button>
        <div className="ml-auto flex items-center gap-3"><button aria-label="Notificaciones" className="w-10 h-10 grid place-items-center rounded-full hover:bg-[#edf1ed] relative"><Bell size={19}/><i className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#d97840]"/></button><div className="h-9 w-9 rounded-full bg-[#d97840] text-white grid place-items-center text-sm font-semibold">LM</div><div className="hidden sm:block"><p className="text-sm font-semibold leading-none">Lucía Martín</p><p className="text-xs text-[#7a847f] mt-1">Administradora</p></div></div>
      </header>
      <div className="p-5 sm:p-8 xl:p-10 max-w-[1500px] mx-auto">{children}</div>
    </div>
  </div>
}

function PageTitle({ eyebrow, title, action }: {eyebrow:string; title:string; action?:ReactNode}) { return <div className="flex flex-wrap gap-4 items-end justify-between mb-8"><div><p className="text-sm text-[#bd622f] font-semibold">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight mt-1">{title}</h1></div>{action}</div> }
function Stat({label,value,note,icon:Icon,tone}:{label:string;value:string;note:string;icon:typeof Users;tone:string}) { return <div className="card p-5 soft-shadow"><div className="flex items-start justify-between"><div><p className="text-sm text-[#748079]">{label}</p><p className="text-3xl font-semibold mt-2">{value}</p></div><span className={`h-11 w-11 rounded-xl grid place-items-center ${tone}`}><Icon size={21}/></span></div><p className="text-sm text-[#5f6b65] mt-4">{note}</p></div> }

function Dashboard() { return <div className="fade-in"><PageTitle eyebrow="Lunes, 7 de septiembre" title="Buenos días, Lucía"/><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4"><Stat label="Equipo activo" value="3" note="2 trabajando hoy" icon={Users} tone="bg-[#e5f0e9] text-[#2f6a54]"/><Stat label="Horas esta semana" value="86 h" note="12 turnos publicados" icon={Clock3} tone="bg-[#fff0e5] text-[#c4632f]"/><Stat label="Ausencias" value="1" note="Pendiente de revisar" icon={CalendarDays} tone="bg-[#eeeaf8] text-[#6d5b9f]"/><Stat label="Fichajes de hoy" value="1/2" note="Carlos ha fichado" icon={Check} tone="bg-[#e5eef4] text-[#3c718c]"/></div>
  <div className="grid xl:grid-cols-[1.35fr_.65fr] gap-5 mt-5"><section className="card p-5 sm:p-6"><div className="flex justify-between"><div><h2 className="font-semibold text-lg">Turnos de hoy</h2><p className="text-sm text-[#748079] mt-1">Lunes, 7 de septiembre</p></div><NavLink to="/horarios" className="text-sm font-semibold text-[#2f6a54]">Ver horario</NavLink></div><div className="mt-5 divide-y divide-[#edf0ed]">{employees.slice(0,3).map((e,i)=><div key={e.id} className="py-4 flex items-center gap-3"><Avatar employee={e}/><div className="min-w-0"><p className="font-medium">{e.name}</p><p className="text-sm text-[#7a847f]">{e.role} · {e.department}</p></div><div className="ml-auto text-right"><p className="font-medium text-sm">{['10:00–16:00','09:00–17:00','12:00–20:00'][i]}</p><p className={`text-xs mt-1 ${i===0?'text-[#2f6a54]':'text-[#89928e]'}`}>{i===0?'Trabajando':'Próximamente'}</p></div></div>)}</div></section>
  <section className="card p-5 sm:p-6"><h2 className="font-semibold text-lg">Necesita atención</h2><div className="mt-5 rounded-xl bg-[#fff5ed] p-4 border border-[#f5ddca]"><span className="text-xs font-semibold text-[#bc5c2c]">VACACIONES</span><p className="font-medium mt-2">Solicitud de Laura</p><p className="text-sm text-[#756b65] mt-1">21–25 de septiembre</p><button className="mt-4 text-sm font-semibold text-[#9e4a22]">Revisar solicitud →</button></div><div className="mt-3 rounded-xl bg-[#eef3ef] p-4"><span className="text-xs font-semibold text-[#3a6653]">CAMBIO DE TURNO</span><p className="font-medium mt-2">Carlos solicita un cambio</p><p className="text-sm text-[#68736d] mt-1">Miércoles, turno de tarde</p></div></section></div></div> }

function Avatar({employee}:{employee:typeof employees[number]}) { return <span style={{background:employee.color}} className="h-10 w-10 shrink-0 rounded-full text-white grid place-items-center text-sm font-semibold">{employee.initials}</span> }
function Employees() { const [q,setQ]=useState(''); const filtered=employees.filter(e=>(e.name+e.role+e.department).toLowerCase().includes(q.toLowerCase())); return <div className="fade-in"><PageTitle eyebrow="Personal" title="Equipo" action={<button className="h-11 px-4 rounded-xl bg-[#173c2e] text-white font-semibold text-sm flex items-center gap-2"><Plus size={17}/>Añadir empleado</button>}/><div className="card overflow-hidden"><div className="p-4 border-b border-[#e7ebe7]"><label className="relative block max-w-sm"><Search className="absolute left-3 top-3 text-[#87908b]" size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar en el equipo…" className="h-11 w-full pl-10 pr-4 rounded-xl bg-[#f4f6f2] outline-none focus:ring-2 focus:ring-[#2f6a54]/20"/></label></div><div className="divide-y divide-[#edf0ed]">{filtered.map(e=><div key={e.id} className="p-4 sm:px-6 flex flex-wrap items-center gap-4"><Avatar employee={e}/><div className="min-w-[180px] flex-1"><p className="font-semibold">{e.name}</p><p className="text-sm text-[#78827d] mt-1">{e.email}</p></div><div className="w-36"><p className="text-sm font-medium">{e.role}</p><p className="text-xs text-[#89928d] mt-1">{e.department}</p></div><span className={`text-xs font-semibold rounded-full px-3 py-1 ${e.status==='Activo'?'bg-[#e4f0e9] text-[#2d6b50]':'bg-[#fff0e4] text-[#a65128]'}`}>{e.status}</span><span className="text-sm text-[#7f8984] w-16">{e.code}</span><button className="text-sm font-semibold text-[#2f6a54]">Ver ficha</button></div>)}{filtered.length===0&&<p className="p-10 text-center text-[#7b8580]">No hay resultados para esa búsqueda.</p>}</div></div></div> }

function Schedule() { return <div className="fade-in"><PageTitle eyebrow="Semana 7–13 septiembre" title="Horario del equipo" action={<div className="flex gap-2"><button aria-label="Semana anterior" className="h-11 w-11 rounded-xl border bg-white grid place-items-center"><ChevronLeft size={18}/></button><button aria-label="Semana siguiente" className="h-11 w-11 rounded-xl border bg-white grid place-items-center"><ChevronRight size={18}/></button><button className="h-11 px-4 rounded-xl bg-[#173c2e] text-white font-semibold text-sm hidden sm:flex items-center gap-2"><Plus size={17}/>Añadir turno</button></div>}/><div className="card overflow-x-auto"><div className="min-w-[940px]"><div className="grid grid-cols-[180px_repeat(7,1fr)] bg-[#f8f9f7] border-b border-[#e5e9e5]"><div className="p-4 text-sm font-semibold">Empleado</div>{days.map((d,i)=><div key={d} className={`p-4 text-center text-sm font-semibold ${i===0?'text-[#c86231] bg-[#fff7f1]':''}`}>{d}</div>)}</div>{employees.map(e=><div key={e.id} className="grid grid-cols-[180px_repeat(7,1fr)] min-h-24 border-b last:border-0 border-[#edf0ed]"><div className="p-4 flex items-center gap-3"><Avatar employee={e}/><div><p className="text-sm font-semibold">{e.name.split(' ')[0]}</p><p className="text-xs text-[#87908b]">{e.department}</p></div></div>{days.map((_,day)=>{const s=shifts.find(x=>x.employeeId===e.id&&x.day===day);return <div key={day} className={`p-2 border-l border-[#edf0ed] ${day===0?'bg-[#fffaf6]':''}`}>{s&&<div className="h-full rounded-lg bg-[#e5f0e9] border-l-[3px] border-[#3f785f] p-2"><p className="text-xs font-semibold text-[#25533f]">{s.time}</p><p className="text-[11px] text-[#60806f] mt-1">{s.area}</p></div>}</div>})}</div>)}</div></div><div className="mt-4 flex gap-5 text-sm text-[#707b75]"><span><b className="text-[#18211d]">86 h</b> planificadas</span><span><b className="text-[#18211d]">12</b> turnos</span><span className="ml-auto text-[#2f6a54] font-semibold">Horario publicado</span></div></div> }

function EmployeeApp() { return <div className="fade-in max-w-5xl mx-auto"><PageTitle eyebrow="Portal del empleado" title="Hola, Carlos"/><div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5"><section className="rounded-[1.5rem] p-6 sm:p-8 bg-[#173c2e] text-white soft-shadow"><p className="text-white/60 text-sm">Turno de hoy</p><p className="text-4xl font-semibold mt-3">10:00–16:00</p><p className="text-white/65 mt-2">Sala · Valencia Centro</p><div className="mt-10 rounded-2xl bg-white/10 p-5 flex items-center justify-between"><div><p className="text-sm text-white/60">Entrada registrada</p><p className="font-semibold mt-1">09:57</p></div><span className="h-11 w-11 rounded-full bg-[#d97840] grid place-items-center"><Check/></span></div><button className="mt-4 w-full h-12 bg-white text-[#173c2e] rounded-xl font-semibold">Finalizar jornada</button></section><section className="card p-6"><h2 className="font-semibold text-lg">Mis próximos turnos</h2><div className="mt-4 divide-y divide-[#edf0ed]">{[['Mié 9','18:00–00:00'],['Vie 11','12:00–18:00'],['Lun 14','10:00–16:00']].map(([d,t])=><div key={d} className="py-4 flex items-center"><span className="h-11 w-14 rounded-xl bg-[#fff0e5] text-[#b85828] grid place-items-center text-sm font-bold">{d}</span><div className="ml-4"><p className="font-semibold">{t}</p><p className="text-sm text-[#7c8681]">Sala</p></div><ChevronRight className="ml-auto text-[#9ba39f]" size={18}/></div>)}</div><button className="mt-4 w-full rounded-xl bg-[#f0f3f0] h-11 font-semibold text-sm text-[#315c49]">Ver mi horario completo</button></section></div><div className="grid sm:grid-cols-2 gap-5 mt-5"><button className="card p-5 text-left hover:border-[#98afa3]"><CalendarDays className="text-[#d16d38]"/><p className="font-semibold mt-4">Solicitar vacaciones</p><p className="text-sm text-[#79837e] mt-1">Envía una nueva solicitud</p></button><button className="card p-5 text-left hover:border-[#98afa3]"><Clock3 className="text-[#4c7a65]"/><p className="font-semibold mt-4">Cambiar un turno</p><p className="text-sm text-[#79837e] mt-1">Propón un cambio al equipo</p></button></div></div> }

export default function App() {
  const [loggedIn,setLoggedIn]=useState(()=>sessionStorage.getItem('restaurantos-session')==='true')
  const nav=useNavigate()
  const login=()=>{sessionStorage.setItem('restaurantos-session','true');setLoggedIn(true);nav('/')}
  const logout=async()=>{if(supabase)await supabase.auth.signOut();sessionStorage.removeItem('restaurantos-session');setLoggedIn(false);nav('/login')}
  if(!loggedIn) return <Routes><Route path="*" element={<Login onLogin={login}/>}/></Routes>
  return <Shell onLogout={logout}><Routes><Route path="/" element={<Dashboard/>}/><Route path="/empleados" element={<Employees/>}/><Route path="/horarios" element={<Schedule/>}/><Route path="/mi-app" element={<EmployeeApp/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Shell>
}
