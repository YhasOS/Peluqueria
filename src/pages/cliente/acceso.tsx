import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ClienteAcceso() {
  const router = useRouter();
  const [email,setEmail]=useState('');
  const [phone,setPhone]=useState('');
  const [code,setCode]=useState('');
  const [step,setStep]=useState<'request'|'verify'>('request');
  const [msg,setMsg]=useState('');

  async function requestCode(e:any){
    e.preventDefault(); setMsg('Enviando código...');
    const r=await fetch('/api/client/request-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,phone})});
    const d=await r.json();
    if(!r.ok){setMsg(d.error||'Error');return;}
    setStep('verify'); setMsg('Te hemos enviado un código al email.');
  }
  async function verify(e:any){
    e.preventDefault(); setMsg('Comprobando...');
    const r=await fetch('/api/client/verify-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,phone,code})});
    const d=await r.json();
    if(!r.ok){setMsg(d.error||'Error');return;}
    router.push('/cliente');
  }
  return <main className="min-h-screen bg-[#f8eee8] px-4 py-10">
    <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow">
      <h1 className="text-3xl font-bold text-[#8a5a42]">Mi cuenta</h1>
      <p className="mt-2 text-gray-600">Accede sin contraseña. Solo necesitas tu email, teléfono y un código sencillo.</p>
      {step==='request'? <form onSubmit={requestCode} className="mt-6 space-y-4">
        <input className="w-full rounded-xl border p-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-xl border p-3" placeholder="Teléfono" value={phone} onChange={e=>setPhone(e.target.value)} />
        <button className="w-full rounded-xl bg-[#b9896f] p-3 font-semibold text-white">Recibir código</button>
      </form> : <form onSubmit={verify} className="mt-6 space-y-4">
        <input className="w-full rounded-xl border p-3 text-center text-2xl tracking-widest" placeholder="Código" value={code} onChange={e=>setCode(e.target.value)} />
        <button className="w-full rounded-xl bg-[#b9896f] p-3 font-semibold text-white">Entrar</button>
      </form>}
      {msg && <p className="mt-4 rounded-xl bg-[#f8eee8] p-3 text-sm text-[#8a5a42]">{msg}</p>}
    </section>
  </main>
}
