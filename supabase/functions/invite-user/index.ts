import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
 try{
  const authorization=req.headers.get('Authorization');if(!authorization)throw new Error('Sesión no válida')
  const body=await req.json()
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:authorization}}})
  const{data,error}=await userClient.rpc('create_user_invitation',{p_email:body.email,p_first_name:body.firstName,p_last_name:body.lastName,p_role_id:body.roleId,p_restaurant_id:body.restaurantId||null})
  if(error)throw error
  const redirectTo=`${body.appUrl}/aceptar-invitacion?token=${data.token}`
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const{error:mailError}=await admin.auth.admin.inviteUserByEmail(body.email,{redirectTo,data:{first_name:body.firstName,last_name:body.lastName}})
  if(mailError)throw mailError
  return new Response(JSON.stringify({id:data.id,expires_at:data.expires_at}),{headers:{...cors,'Content-Type':'application/json'}})
 }catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:'No se pudo enviar la invitación'}),{status:400,headers:{...cors,'Content-Type':'application/json'}})}
})

