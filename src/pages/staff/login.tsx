import { useState } from 'react';
import { useRouter } from 'next/router';

export default function StaffLogin(){
 const r=useRouter(); const [username,setUsername]=useState(''); const [password,setPassword]=useState(''); const [msg,setMsg]=useState('');
 async function submit(e:any){e.preventDefault(); const res=await fetch('/api/staff/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})}); const d=await res.json(); if(!res.ok){setMsg(d.error);return;} r.push('/staff');}
 return <main className="min-h-screen bg-[#f8eee8] px-4 py-10"><section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow"><h1 className="text-3xl font-bold text-[#8a5a42]">Panel trabajadora</h1><form onSubmit={submit} className="mt-6 space-y-4"><input className="w-full rounded-xl border p-3" placeholder="Usuario" value={username} onChange={e=>setUsername(e.target.value)}/><input className="w-full rounded-xl border p-3" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)}/><button className="w-full rounded-xl bg-[#b9896f] p-3 font-semibold text-white">Entrar</button></form>{msg&&<p className="mt-4 text-red-600">{msg}</p>}</section></main>
}
