import { Building2, CreditCard, MapPin, Puzzle, ShieldCheck, SlidersHorizontal, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

const sections = [
  { icon: Building2, title: 'Empresa', text: 'Datos fiscales, identidad, moneda y zona horaria.', status: 'Configurada', to: '/configuracion/empresa' },
  { icon: MapPin, title: 'Restaurantes', text: 'Locales, direcciones, horarios, zonas y almacenes.', status: '1 restaurante', to: '/configuracion/restaurantes' },
  { icon: UsersRound, title: 'Usuarios', text: 'Invitaciones, acceso y pertenencia a la empresa.', status: '1 usuario' },
  { icon: ShieldCheck, title: 'Roles y permisos', text: 'Capacidades por empresa, restaurante y módulo.', status: '5 roles base' },
  { icon: Puzzle, title: 'Módulos', text: 'Funciones activas para esta organización.', status: '4 activos' },
  { icon: SlidersHorizontal, title: 'Catálogos', text: 'Departamentos, puestos, categorías y unidades.', status: 'Configurar' },
  { icon: CreditCard, title: 'Plan y facturación', text: 'Plan contratado, límites, uso y facturas.', status: 'Desarrollo' },
]

export function SettingsHome() {
  return <div className="fade-in">
    <p className="text-sm text-[#bd622f] font-semibold">Administración</p>
    <h1 className="text-3xl font-semibold tracking-tight mt-1">Configuración</h1>
    <p className="text-[#6e7873] mt-3 max-w-2xl">Gestiona la organización sin tocar código ni acceder a la base de datos.</p>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">{sections.map(({icon:Icon,title,text,status,to})=>{const content=<><div className="flex items-start justify-between gap-4"><span className="h-11 w-11 rounded-xl bg-[#e8efe9] text-[#315f4c] grid place-items-center"><Icon size={21}/></span><span className="text-xs font-semibold rounded-full bg-[#f0f3f0] text-[#6c7771] px-3 py-1">{status}</span></div>
      <h2 className="font-semibold mt-5">{title}</h2><p className="text-sm text-[#75807a] mt-2 leading-relaxed">{text}</p></>;return to?<Link key={title} to={to} className="card p-5 text-left hover:border-[#9caf9f] hover:-translate-y-0.5 transition-all">{content}</Link>:<button key={title} className="card p-5 text-left hover:border-[#9caf9f] hover:-translate-y-0.5 transition-all">{content}</button>})}</div>
  </div>
}
