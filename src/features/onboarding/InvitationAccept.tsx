import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, KeyRound } from 'lucide-react'
import { acceptInvitation } from '../../services/invitations-data'
import { supabase } from '../../lib/supabase'

export function InvitationAccept(){
 const[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[hasSession,setHasSession]=useState(false),[existing,setExisting]=useState(false)
 const[email,setEmail]=useState(''),[password,setPassword]=useState('')
 const token=new URLSearchParams(location.search).get('token')||localStorage.getItem('restaurantos-invitation')||''
 useEffect(()=>{if(token)localStorage.setItem('restaurantos-invitation',token);supabase?.auth.getSession().then(({data})=>setHasSession(Boolean(data.session)))},[token])
 const finish=async()=>{await acceptInvitation(token);localStorage.removeItem('restaurantos-invitation');sessionStorage.setItem('restaurantos-session','true');location.href='/'}
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!supabase)return;setBusy(true);setError('');setNotice('');try{
   if(hasSession){await finish();return}
   if(existing){const{error:authError}=await supabase.auth.signInWithPassword({email,password});if(authError)throw authError;await finish();return}
   const{data,error:authError}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:location.href}});if(authError)throw authError
   if(data.session){await finish()}else setNotice('Revisa tu correo y confirma la cuenta. Después volverás aquí para terminar el acceso.')
  }catch(reason){const detail=reason&&typeof reason==='object'&&'message' in reason?String(reason.message):'No se pudo completar la invitación';setError(detail)}finally{setBusy(false)}}
 return <main className="min-h-screen bg-[#f4f6f2] grid place-items-center p-5"><section className="card max-w-lg w-full p-8"><div className="text-center"><span className="h-14 w-14 rounded-2xl bg-[#fff0e5] text-[#bd622f] grid place-items-center mx-auto"><KeyRound/></span><h1 className="text-2xl font-semibold mt-5">Únete al equipo</h1><p className="text-[#6e7873] mt-2">Tu rol y restaurante ya están preparados.</p></div>
  {!token?<p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">El enlace de invitación está incompleto.</p>:<form onSubmit={submit} className="mt-7 space-y-4">{!hasSession&&<><label className="block text-sm font-medium">Correo invitado<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"/></label><label className="block text-sm font-medium">{existing?'Tu contraseña':'Crea una contraseña'}<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"/></label></>}
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice&&<p className="rounded-xl bg-[#e5f0e9] p-4 text-sm text-[#2e6b50]">{notice}</p>}
  {!notice&&<button disabled={busy} className="w-full rounded-xl bg-[#173c2e] text-white px-5 py-3 font-semibold disabled:opacity-50"><CheckCircle2 className="inline mr-2" size={18}/>{busy?'Activando acceso…':hasSession?'Aceptar invitación':existing?'Entrar y aceptar':'Crear cuenta y aceptar'}</button>}
  {hasSession&&<button type="button" onClick={async()=>{await supabase?.auth.signOut();sessionStorage.removeItem('restaurantos-session');setHasSession(false);setError('')}} className="w-full text-sm font-semibold text-[#426250]">Usar otra cuenta</button>}
  {!hasSession&&!notice&&<button type="button" onClick={()=>setExisting(!existing)} className="w-full text-sm font-semibold text-[#426250]">{existing?'Necesito crear mi cuenta':'Ya tengo una cuenta'}</button>}</form>}</section></main>
}

