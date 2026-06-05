import AdminLayout from '@/components/AdminLayout';
import { useEffect, useMemo, useState } from 'react';

type Customer = { id: number; name: string; email: string; phone?: string | null; notes?: string | null; colorFormula?: string | null; allergies?: string | null; updatedAt?: string };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', colorFormula: '', allergies: '', notes: '' });
  const [message, setMessage] = useState('');
  const url = useMemo(() => `/api/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`, [search]);

  async function load() { const data = await fetch(url).then(r => r.json()); setCustomers(Array.isArray(data) ? data : []); }
  useEffect(() => { load(); }, [url]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setMessage(res.ok ? 'Cliente guardado correctamente.' : 'No se pudo guardar el cliente.');
    if (res.ok) { setForm({ name: '', email: '', phone: '', colorFormula: '', allergies: '', notes: '' }); load(); }
  }

  return (
    <AdminLayout title="Clientes">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><h1 className="text-3xl font-bold text-accent">Clientes</h1><p className="mt-2 text-gray-600">Historial, fórmulas de color y observaciones.</p></div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente" className="rounded-xl border border-gray-300 p-3 md:w-80" />
      </div>
      {message && <div className="mb-4 rounded-xl bg-green-100 p-3 text-green-800">{message}</div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={save} className="rounded-2xl bg-white p-5 shadow lg:col-span-1">
          <h2 className="mb-4 text-xl font-bold text-accent">Nuevo cliente</h2>
          {(['name','email','phone','colorFormula','allergies'] as const).map((key) => (
            <input key={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={{name:'Nombre',email:'Email',phone:'Teléfono',colorFormula:'Fórmula color',allergies:'Alergias'}[key]} className="mb-3 w-full rounded-xl border border-gray-300 p-3" required={key==='name'||key==='email'} />
          ))}
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones" rows={4} className="mb-3 w-full rounded-xl border border-gray-300 p-3" />
          <button className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white">Guardar</button>
        </form>
        <section className="rounded-2xl bg-white p-5 shadow lg:col-span-2">
          <div className="space-y-3">
            {customers.length === 0 ? <p>No hay clientes todavía.</p> : customers.map(c => (
              <div key={c.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex flex-col justify-between gap-2 md:flex-row"><div><h3 className="font-bold text-accent">{c.name}</h3><p className="text-sm text-gray-600">{c.email} · {c.phone || 'Sin teléfono'}</p></div>{c.updatedAt && <span className="text-xs text-gray-400">Actualizado {new Date(c.updatedAt).toLocaleDateString('es-ES')}</span>}</div>
                {(c.colorFormula || c.allergies || c.notes) && <div className="mt-3 grid gap-2 text-sm md:grid-cols-3"><p><strong>Color:</strong> {c.colorFormula || '—'}</p><p><strong>Alergias:</strong> {c.allergies || '—'}</p><p><strong>Notas:</strong> {c.notes || '—'}</p></div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
