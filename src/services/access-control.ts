import { supabase } from '../lib/supabase'

export type AccessProfile={roleCode:string;roleName:string;allowedModules:Set<string>|null}

export async function getCurrentAccess():Promise<AccessProfile>{
 if(!supabase)return{roleCode:'owner',roleName:'Propietario',allowedModules:null}
 const{data:userData,error:userError}=await supabase.auth.getUser()
 if(userError||!userData.user)throw userError??new Error('No hay una sesión activa')
 const{data:member,error:memberError}=await supabase.from('company_members').select('company_id,role_id,roles(code,name)').eq('user_id',userData.user.id).limit(1).maybeSingle()
 if(memberError)throw memberError
 if(!member)return{roleCode:'employee',roleName:'Sin rol',allowedModules:new Set(['dashboard'])}
 const role=Array.isArray(member.roles)?member.roles[0]:member.roles
 if(role?.code==='owner')return{roleCode:'owner',roleName:role.name,allowedModules:null}
 const{data:permissions,error:permissionError}=await supabase.from('role_module_permissions').select('module').eq('company_id',member.company_id).eq('role_id',member.role_id).eq('can_view',true)
 if(permissionError)throw permissionError
 return{roleCode:role?.code??'employee',roleName:role?.name??'Empleado',allowedModules:new Set((permissions??[]).map(p=>p.module))}
}
