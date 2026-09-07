import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, X } from 'lucide-react'
import { clockEmployee, createVacationRequest, getEmployeePortal } from '../../services/restaurant-data'

type PortalData = NonNullable<Awaited<ReturnType<typeof getEmployeePortal>>>

export function EmployeePortal() {
  const [data, setData] = useState<PortalData | null>(null)
  const [message, setMessage] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [notes, setNotes] = useState('')

  const load = () => getEmployeePortal().then(setData).catch(error => setMessage(error.message))
  useEffect(() => { void load() }, [])

  const registerClock = async () => {
    if (!data || data.preview) return
    try {
      const openEntry = data.entry && !data.entry.clock_out ? data.entry : null
      await clockEmployee(data.employee.id, data.restaurantId, openEntry)
      setMessage(openEntry ? 'Salida registrada.' : 'Entrada registrada.')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo registrar.')
    }
  }

  const sendRequest = async () => {
    if (!data || data.preview || !start || !end) return
    try {
      await createVacationRequest(data.employee.id, start, end, notes)
      setRequestOpen(false)
      setMessage('Solicitud enviada.')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo enviar.')
    }
  }

  if (!data) return <div className="card p-8">{message || 'Cargando portal del empleado…'}</div>
  const openEntry = data.entry && !data.entry.clock_out ? data.entry : null

  return <div className="fade-in max-w-5xl mx-auto">
    <div className="flex flex-wrap justify-between gap-4">
      <div><p className="text-sm text-[#bd622f] font-semibold">Portal del empleado</p><h1 className="text-3xl font-semibold mt-1">Hola, {data.employee.first_name}</h1></div>
      {data.preview && <span className="h-fit rounded-full bg-[#fff0e5] text-[#9b4d27] px-4 py-2 text-sm font-semibold">Vista previa de administrador</span>}
    </div>
    {data.preview && <p className="mt-5 rounded-xl bg-[#fff7f0] border border-[#efd9c7] p-4 text-sm text-[#75675e]">Este usuario no está vinculado a una ficha de empleado. Puedes revisar el portal, pero las acciones están desactivadas.</p>}
    {message && <p className="mt-4 text-sm text-[#486052]">{message}</p>}
    <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-5 mt-7">
      <section className="rounded-[1.5rem] p-7 bg-[#173c2e] text-white">
        <p className="text-white/60 text-sm">Control de jornada</p><p className="text-3xl font-semibold mt-3">{openEntry ? 'Jornada en curso' : 'Listo para comenzar'}</p>
        {openEntry && <p className="text-white/65 mt-2">Entrada: {new Date(openEntry.clock_in).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>}
        <button disabled={data.preview || !data.restaurantId} onClick={registerClock} className="mt-10 w-full h-12 bg-white text-[#173c2e] rounded-xl font-semibold disabled:opacity-50">{openEntry ? 'Finalizar jornada' : 'Fichar entrada'}</button>
      </section>
      <section className="card p-6"><h2 className="font-semibold text-lg">Próximos turnos</h2><div className="mt-4 divide-y">
        {data.shifts.length === 0 ? <p className="py-6 text-[#78827d]">No hay próximos turnos.</p> : data.shifts.map(shift => {
          const department = Array.isArray(shift.departments) ? shift.departments[0] : shift.departments
          return <div key={shift.id} className="py-4 flex items-center"><span className="h-12 w-14 rounded-xl bg-[#fff0e5] text-[#b85828] grid place-items-center text-xs font-bold">{new Date(`${shift.shift_date}T12:00`).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span><div className="ml-4"><p className="font-semibold">{shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}</p><p className="text-sm text-[#7c8681]">{department?.name || 'Turno'}</p></div></div>
        })}
      </div></section>
    </div>
    <div className="grid sm:grid-cols-2 gap-5 mt-5">
      <button disabled={data.preview} onClick={() => setRequestOpen(true)} className="card p-5 text-left disabled:opacity-60"><CalendarDays className="text-[#d16d38]"/><p className="font-semibold mt-4">Solicitar vacaciones</p><p className="text-sm text-[#79837e] mt-1">Envía una solicitud al responsable</p></button>
      <div className="card p-5"><CheckCircle2 className="text-[#397158]"/><p className="font-semibold mt-4">Mis solicitudes</p><p className="text-sm text-[#79837e] mt-1">{data.requests.length} solicitudes registradas</p></div>
    </div>
    {requestOpen && <div className="fixed inset-0 bg-[#183128]/35 z-50 flex justify-end" onMouseDown={() => setRequestOpen(false)}><div className="w-full max-w-lg h-full bg-[#fbfcfa] p-7" onMouseDown={event => event.stopPropagation()}><div className="flex justify-between"><h2 className="text-2xl font-semibold">Solicitar vacaciones</h2><button onClick={() => setRequestOpen(false)}><X/></button></div><div className="grid gap-4 mt-8"><label className="text-sm font-medium">Desde<input type="date" value={start} onChange={event => setStart(event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3"/></label><label className="text-sm font-medium">Hasta<input type="date" value={end} onChange={event => setEnd(event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3"/></label><label className="text-sm font-medium">Comentario<textarea value={notes} onChange={event => setNotes(event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 min-h-24"/></label></div><button onClick={sendRequest} className="mt-8 w-full rounded-xl bg-[#244e3d] text-white px-5 py-3 font-semibold">Enviar solicitud</button></div></div>}
  </div>
}
