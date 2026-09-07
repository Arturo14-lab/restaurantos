import { useEffect, useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { getRoles } from '../../services/settings-data'
import type { RoleRecord } from '../../types/domain'
import { SettingsLayout } from './SettingsLayout'

const access: Record<string,string[]> = {
  owner:['Control total','Configuración','Usuarios y roles','Todos los restaurantes'],
  manager:['Gestión general','Personal y horarios','Operaciones','Compras e inventario'],
  supervisor:['Operación del local','Equipo asignado','Turnos y fichajes','Tareas e incidencias'],
  admin:['Gestión administrativa','Personal','Documentos','Fichajes'],
  employee:['Portal del empleado','Horario propio','Fichaje propio','Solicitudes'],
}

export function RolesSettings() {
  const [roles,setRoles]=useState<RoleRecord[]>([])
  const [message,setMessage]=useState('')
  useEffect(()=>{getRoles().then(setRoles).catch(e=>setMessage(e.message))},[])
  return <SettingsLayout eyebrow="Accesos" title="Roles y permisos" description="Responsabilidades base que determinan lo que puede hacer cada tipo de usuario.">
    {message&&<p className="mb-4 text-sm text-red-700">{message}</p>}
    <div className="grid md:grid-cols-2 gap-4">{roles.map(role=><article key={role.id} className="card p-5"><div className="flex items-center gap-3"><span className="h-11 w-11 rounded-xl bg-[#e8efe9] text-[#315f4c] grid place-items-center"><ShieldCheck size={21}/></span><div><h2 className="font-semibold">{role.name}</h2><p className="text-xs uppercase tracking-wide text-[#89928e] mt-1">{role.code}</p></div></div><p className="text-sm text-[#6e7873] mt-4">{role.description}</p><ul className="mt-5 space-y-2">{(access[role.code]??['Acceso básico']).map(item=><li key={item} className="flex items-center gap-2 text-sm"><Check size={15} className="text-[#3d785e]"/>{item}</li>)}</ul></article>)}</div>
    <div className="rounded-2xl bg-[#eef3ef] p-5 mt-6"><p className="font-semibold">Siguiente nivel: permisos configurables</p><p className="text-sm text-[#65716a] mt-2">La futura matriz permitirá decidir por módulo si un rol puede ver, crear, editar, aprobar o eliminar. Se añadirá con políticas de seguridad en Supabase antes de permitir su edición.</p></div>
  </SettingsLayout>
}
