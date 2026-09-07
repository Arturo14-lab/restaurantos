import { useEffect, useState } from 'react'
import { MapPin, Plus, X } from 'lucide-react'
import { getCompany, getRestaurants, saveRestaurant } from '../../services/settings-data'
import type { RestaurantRecord } from '../../types/domain'
import { SettingsLayout } from './SettingsLayout'

const emptyRestaurant = (company_id=''): RestaurantRecord => ({id:'',company_id,name:'',address:'',city:'',postal_code:'',country:'España',phone:'',email:'',active:true})

export function RestaurantsSettings() {
  const [restaurants,setRestaurants]=useState<RestaurantRecord[]>([])
  const [companyId,setCompanyId]=useState('')
  const [editing,setEditing]=useState<RestaurantRecord|null>(null)
  const [message,setMessage]=useState('')
  const load=async()=>{const [company,items]=await Promise.all([getCompany(),getRestaurants()]);setCompanyId(company?.id??'');setRestaurants(items)}
  useEffect(()=>{load().catch(e=>setMessage(e.message))},[])
  const save=async()=>{if(!editing?.name.trim())return setMessage('Escribe el nombre del restaurante.');try{await saveRestaurant({...editing,company_id:editing.company_id||companyId,name:editing.name.trim()});setEditing(null);setMessage('Restaurante guardado correctamente.');await load()}catch(e){setMessage(e instanceof Error?e.message:'No se pudo guardar el restaurante.')}}
  return <SettingsLayout eyebrow="Organización" title="Restaurantes" description="Crea y administra los locales que pertenecen a la empresa.">
    <div className="flex justify-between items-center gap-4 mb-5"><p className="text-sm text-[#6e7873]">{restaurants.length} {restaurants.length===1?'restaurante':'restaurantes'}</p><button onClick={()=>setEditing(emptyRestaurant(companyId))} className="inline-flex items-center gap-2 rounded-xl bg-[#244e3d] text-white px-4 py-3 font-semibold"><Plus size={18}/> Nuevo restaurante</button></div>
    {message&&<p className="mb-4 text-sm text-[#53645b]">{message}</p>}
    <div className="grid md:grid-cols-2 gap-4">{restaurants.map(item=><button key={item.id} onClick={()=>setEditing(item)} className="card p-5 text-left hover:border-[#8da593] transition-colors"><div className="flex items-start justify-between"><span className="h-11 w-11 rounded-xl bg-[#e8efe9] text-[#315f4c] grid place-items-center"><MapPin size={21}/></span><span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.active?'bg-[#e8f2eb] text-[#397052]':'bg-[#eef0ee] text-[#747c77]'}`}>{item.active?'Activo':'Inactivo'}</span></div><h2 className="font-semibold mt-5">{item.name}</h2><p className="text-sm text-[#75807a] mt-2">{[item.address,item.city,item.postal_code].filter(Boolean).join(', ')||'Dirección pendiente'}</p></button>)}</div>
    {editing&&<div className="fixed inset-0 bg-[#183128]/35 z-50 flex justify-end" onMouseDown={()=>setEditing(null)}><div className="w-full max-w-xl h-full bg-[#fbfcfa] shadow-2xl overflow-y-auto p-6 md:p-8" onMouseDown={e=>e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-sm text-[#bd622f] font-semibold">Restaurante</p><h2 className="text-2xl font-semibold mt-1">{editing.id?'Editar local':'Nuevo local'}</h2></div><button onClick={()=>setEditing(null)} className="p-2 rounded-lg hover:bg-[#edf1ed]" aria-label="Cerrar"><X/></button></div><div className="grid gap-4 mt-8">{([['name','Nombre'],['address','Dirección'],['city','Ciudad'],['postal_code','Código postal'],['country','País'],['email','Correo electrónico'],['phone','Teléfono']] as Array<[keyof RestaurantRecord,string]>).map(([key,label])=><label key={key} className="text-sm font-medium text-[#46534c]">{label}<input value={String(editing[key]??'')} onChange={e=>setEditing({...editing,[key]:e.target.value})} className="mt-2 w-full rounded-xl border border-[#dce3de] bg-white px-4 py-3 outline-none focus:border-[#6f927f]"/></label>)}<label className="flex items-center gap-3 mt-2"><input type="checkbox" checked={editing.active} onChange={e=>setEditing({...editing,active:e.target.checked})}/><span className="text-sm font-medium">Restaurante activo</span></label></div><div className="flex justify-end gap-3 mt-8"><button onClick={()=>setEditing(null)} className="px-5 py-3 font-semibold">Cancelar</button><button onClick={save} className="rounded-xl bg-[#244e3d] text-white px-5 py-3 font-semibold">Guardar restaurante</button></div></div></div>}
  </SettingsLayout>
}
