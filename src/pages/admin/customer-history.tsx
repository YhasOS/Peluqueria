import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function euro(v:number){return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(v||0));}

export default function CustomerHistory(){
 const router=useRouter(); const id=Number(router.query.id||0); const [data,setData]=useState<any>(null); const [error,setError]=useState('');
 useEffect(()=>{if(!router.isReady||!id)return; fetch(`/api/customers/history?id=${id}`).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);return d}).then(setData).catch(e=>setError(e.message));},[router.isReady,id]);
 return <AdminLayout title="Histórico clienta">
  <div className="mb-6 flex items-center justify-between gap-3"><div><h1 className="text-3xl font-bold text-accent">Histórico de clienta</h1>{data&&<p className="mt-1 text-gray-600">{data.customer.name}</p>}</div><Link href="/admin/customers" className="rounded-xl bg-white px-4 py-3 font-bold text-accent shadow">Volver</Link></div>
  {error&&<div className="rounded-xl bg-red-100 p-4 text-red-700">{error}</div>}
  {!data?<p>Cargando...</p>:<>
   <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow"><p className="text-gray-500">Visitas realizadas</p><p className="text-3xl font-bold text-accent">{data.totalVisits}</p></div><div className="rounded-2xl bg-white p-5 shadow"><p className="text-gray-500">Servicios realizados</p><p className="text-3xl font-bold text-accent">{data.totalServices}</p></div><div className="rounded-2xl bg-white p-5 shadow"><p className="text-gray-500">Importe acumulado</p><p className="text-3xl font-bold text-accent">{euro(data.totalAmount)}</p></div></div>
   <section className="mt-6 rounded-2xl bg-white p-5 shadow"><h2 className="text-xl font-bold text-accent">Servicios más realizados</h2><div className="mt-4 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left"><th className="py-2">Servicio</th><th>Veces</th><th>Importe</th></tr></thead><tbody>{data.summary.map((s:any)=><tr key={s.serviceId} className="border-b"><td className="py-3 font-semibold">{s.name}</td><td>{s.count}</td><td>{euro(s.amount)}</td></tr>)}</tbody></table></div></section>
   <section className="mt-6 rounded-2xl bg-white p-5 shadow"><h2 className="text-xl font-bold text-accent">Visitas</h2><div className="mt-4 space-y-3">{data.bookings.map((b:any)=>{const ss=b.bookingServices?.length?b.bookingServices.map((x:any)=>x.service.name).join(' + '):b.service.name; const amount=b.bookingServices?.length?b.bookingServices.reduce((a:number,x:any)=>a+Number(x.price||0),0):Number(b.service.price||0);return <div key={b.id} className="rounded-xl border p-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-bold">{new Date(b.startTime).toLocaleDateString('es-ES')} · {new Date(b.startTime).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</p><p className="text-accent">{ss}</p><p className="text-sm text-gray-500">{b.professional?.name||'Sin asignar'} · {b.status}</p></div><strong>{euro(amount)}</strong></div></div>})}</div></section>
  </>}
 </AdminLayout>
}
