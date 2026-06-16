import { useEffect, useState } from 'react';

function fmt(d:string){return new Date(d).toLocaleString('es-ES',{dateStyle:'short',timeStyle:'short'});}

export default function ClientePanel(){
  const [items,setItems]=useState<any[]>([]); const [msg,setMsg]=useState('');
  async function load(){const r=await fetch('/api/client/bookings'); if(r.status===401){location.href='/cliente/acceso';return;} setItems(await r.json());}
  useEffect(()=>{load();},[]);
  async function cancel(id:number){ if(!confirm('¿Cancelar esta cita?')) return; const r=await fetch('/api/bookings/cancel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); const d=await r.json(); setMsg(d.error||'Cita cancelada'); load(); }
  async function reschedule(id:number){ const value=prompt('Nueva fecha y hora en formato 2026-06-20T10:30'); if(!value) return; const r=await fetch('/api/bookings/reschedule',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,newStart:value})}); const d=await r.json(); setMsg(d.error||'Cita cambiada'); load(); }
  const now=Date.now();
  return <main className="min-h-screen bg-[#f8eee8] px-4 py-8">
    <section className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold text-[#8a5a42]">Mis citas</h1>
      <p className="mt-2 text-gray-600">Consulta, cambia o cancela tus reservas.</p>
      {msg && <p className="mt-4 rounded-xl bg-white p-3 text-[#8a5a42]">{msg}</p>}
      <div className="mt-6 grid gap-4">
        {items.map(b=><article key={b.id} className="rounded-2xl bg-white p-5 shadow">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold text-[#8a5a42]">{b.serviceName || 'Servicio'}</p>
              <p>{fmt(b.startTime)} · {b.staffName || 'Gema'}</p>
              <p className="text-sm text-gray-500">Estado: {b.status || 'confirmed'}</p>
            </div>
            {new Date(b.startTime).getTime()>now && (b.status||'confirmed')!=='cancelled' && <div className="flex gap-2">
              <button onClick={()=>reschedule(b.id)} className="rounded-xl border px-4 py-2">Cambiar</button>
              <button onClick={()=>cancel(b.id)} className="rounded-xl border border-red-300 px-4 py-2 text-red-600">Cancelar</button>
            </div>}
          </div>
        </article>)}
      </div>
    </section>
  </main>
}
