import type { LucideIcon } from 'lucide-react'

export function ModulePlaceholder({ icon: Icon, eyebrow, title, description, items }: {
  icon: LucideIcon; eyebrow: string; title: string; description: string; items: string[]
}) {
  return <div className="fade-in max-w-5xl">
    <p className="text-sm text-[#bd622f] font-semibold">{eyebrow}</p>
    <h1 className="text-3xl font-semibold tracking-tight mt-1">{title}</h1>
    <div className="card soft-shadow mt-8 p-6 sm:p-8">
      <span className="h-12 w-12 rounded-xl bg-[#e5f0e9] text-[#2f6a54] grid place-items-center"><Icon size={23}/></span>
      <h2 className="text-xl font-semibold mt-5">Estructura preparada</h2>
      <p className="text-[#68736d] mt-2 max-w-2xl">{description}</p>
      <div className="grid sm:grid-cols-2 gap-3 mt-7">{items.map(item=><div key={item} className="rounded-xl bg-[#f4f6f2] px-4 py-3 text-sm font-medium">{item}</div>)}</div>
      <p className="mt-7 text-sm text-[#8a938f]">Este módulo se activará por fases sin cambiar la navegación ni la arquitectura.</p>
    </div>
  </div>
}
