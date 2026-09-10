import { supabase } from '../lib/supabase'

export type InvitationRecord={id:string;email:string;first_name:string;last_name:string;status:string;expires_at:string;created_at:string;role:{name:string}|null}
export async function getInvitations(){if(!supabase)return[];const{data,error}=await supabase.from('user_invitations').select('id,email,first_name,last_name,status,expires_at,created_at,roles(name)').order('created_at',{ascending:false});if(error)throw error;return(data??[]).map(row=>({...row,role:(Array.isArray(row.roles)?row.roles[0]:row.roles) as {name:string}|null})) as InvitationRecord[]}
export async function createInvitation(values:{email:string;firstName:string;lastName:string;roleId:string;restaurantId:string}){if(!supabase)throw new Error('Supabase no está configurado');const{data,error}=await supabase.rpc('create_user_invitation',{p_email:values.email,p_first_name:values.firstName,p_last_name:values.lastName,p_role_id:values.roleId,p_restaurant_id:values.restaurantId||null});if(error)throw error;return data as {id:string;token:string;expires_at:string}}
export async function acceptInvitation(token:string){if(!supabase)throw new Error('Supabase no está configurado');const{error}=await supabase.rpc('accept_user_invitation',{p_token:token});if(error)throw error}

