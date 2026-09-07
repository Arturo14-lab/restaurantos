import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function SettingsLayout({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <div className="fade-in max-w-5xl">
    <Link to="/configuracion" className="inline-flex items-center gap-2 text-sm font-semibold text-[#53645b] hover:text-[#224a3a]"><ArrowLeft size={16}/> Volver a Configuración</Link>
    <p className="text-sm text-[#bd622f] font-semibold mt-7">{eyebrow}</p>
    <h1 className="text-3xl font-semibold tracking-tight mt-1">{title}</h1>
    <p className="text-[#6e7873] mt-3 max-w-2xl">{description}</p>
    <div className="mt-8">{children}</div>
  </div>
}
