import { useEffect, useState } from 'react'
import { Building2, CheckCircle2, LoaderCircle } from 'lucide-react'
import { getCompany, updateCompany } from '../../services/settings-data'
import type { CompanyRecord } from '../../types/domain'
import { SettingsLayout } from './SettingsLayout'

const fields: Array<{ key: keyof CompanyRecord; label: string; type?: string }> = [
  { key: 'name', label: 'Nombre comercial' }, { key: 'legal_name', label: 'Razón social' },
  { key: 'tax_id', label: 'NIF / CIF' }, { key: 'email', label: 'Correo electrónico', type: 'email' },
  { key: 'phone', label: 'Teléfono' }, { key: 'currency', label: 'Moneda' }, { key: 'timezone', label: 'Zona horaria' },
]

export function CompanySettings() {
  const [company,setCompany]=useState<CompanyRecord|null>(null)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  useEffect(()=>{getCompany().then(setCompany).catch(e=>setMessage(e.message)).finally(()=>setLoading(false))},[])
  const save=async()=>{if(!company)return;setSaving(true);setMessage('');try{setCompany(await updateCompany(company.id,company));setMessage('Cambios guardados correctamente.')}catch(e){setMessage(e instanceof Error?e.message:'No se pudieron guardar los cambios.')}finally{setSaving(false)}}
  return <SettingsLayout eyebrow="Organización" title="Empresa" description="Información general y fiscal que se aplicará a todos los restaurantes.">
    {loading?<div className="card p-8 flex items-center gap-3 text-[#68736d]"><LoaderCircle className="animate-spin"/> Cargando empresa…</div>:!company?<div className="card p-8">No se ha encontrado una empresa asociada a este usuario.</div>:<div className="card overflow-hidden">
      <div className="p-6 border-b border-[#e4e9e5] flex items-center gap-4"><span className="h-12 w-12 rounded-xl bg-[#e8efe9] text-[#315f4c] grid place-items-center"><Building2/></span><div><h2 className="font-semibold">Datos de la empresa</h2><p className="text-sm text-[#748078]">Puedes modificarlos desde aquí cuando sea necesario.</p></div></div>
      <div className="p-6 grid md:grid-cols-2 gap-5">{fields.map(({key,label,type})=><label key={key} className="text-sm font-medium text-[#46534c]">{label}<input type={type??'text'} value={String(company[key]??'')} onChange={e=>setCompany({...company,[key]:e.target.value})} className="mt-2 w-full rounded-xl border border-[#dce3de] bg-white px-4 py-3 outline-none focus:border-[#6f927f]"/></label>)}</div>
      <div className="px-6 py-5 bg-[#f8faf8] border-t border-[#e4e9e5] flex flex-wrap items-center justify-between gap-4"><p className={`text-sm ${message.startsWith('Cambios')?'text-[#2f6b50]':'text-[#a24c35]'}`}>{message&&<span className="inline-flex items-center gap-2">{message.startsWith('Cambios')&&<CheckCircle2 size={16}/>} {message}</span>}</p><button onClick={save} disabled={saving} className="rounded-xl bg-[#244e3d] text-white px-5 py-3 font-semibold disabled:opacity-60">{saving?'Guardando…':'Guardar cambios'}</button></div>
    </div>}
  </SettingsLayout>
}
