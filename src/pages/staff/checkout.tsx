import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Service = { id: number; name: string; price: number; priceLabel?: string | null; active?: boolean };
type Item = { key: string; serviceId?: number; name: string; unitPriceCents: number; quantity: number };

const DENOMS = [
  ['100 €', 10000], ['50 €', 5000], ['20 €', 2000], ['10 €', 1000],
  ['5 €', 500], ['2 €', 200], ['1 €', 100], ['0,50 €', 50],
  ['0,20 €', 20], ['0,10 €', 10], ['0,05 €', 5], ['0,02 €', 2], ['0,01 €', 1],
] as const;

const toCents = (value: string | number) => {
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

const money = (cents: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);

const key = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function Checkout() {
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [received, setReceived] = useState(0);
  const [manual, setManual] = useState('');
  const [concept, setConcept] = useState('');
  const [conceptPrice, setConceptPrice] = useState('');

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(data =>
      setServices(Array.isArray(data) ? data.filter((s: Service) => s.active !== false) : [])
    );
    try {
      const saved = JSON.parse(localStorage.getItem('gema_checkout') || '{}');
      if (Array.isArray(saved.items)) setItems(saved.items);
      if (Number.isFinite(saved.received)) setReceived(saved.received);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('gema_checkout', JSON.stringify({ items, received }));
  }, [items, received]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? services.filter(s => s.name.toLowerCase().includes(q)) : services;
  }, [services, search]);

  const total = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const change = received - total;

  function addService(service: Service) {
    setItems(current => {
      const found = current.find(i => i.serviceId === service.id);
      if (found) return current.map(i => i.serviceId === service.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...current, { key: key(), serviceId: service.id, name: service.name, unitPriceCents: toCents(service.price), quantity: 1 }];
    });
  }

  function addConcept() {
    const price = toCents(conceptPrice);
    if (!concept.trim() || price <= 0) return;
    setItems(current => [...current, { key: key(), name: concept.trim(), unitPriceCents: price, quantity: 1 }]);
    setConcept('');
    setConceptPrice('');
  }

  function quantity(itemKey: string, delta: number) {
    setItems(current => current
      .map(i => i.key === itemKey ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
      .filter(i => i.quantity > 0)
    );
  }

  function reset() {
    if (items.length && !confirm('¿Empezar una venta nueva?')) return;
    setItems([]);
    setReceived(0);
    setManual('');
    localStorage.removeItem('gema_checkout');
  }

  return (
    <main className="min-h-screen bg-[#f8eee8] p-3 text-[#3b2b25] md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[#8a5a42] md:text-4xl">Caja rápida</h1>
            <p className="text-gray-600">Suma servicios y calcula el cambio.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/staff" className="rounded-xl bg-white px-4 py-3 font-bold text-[#8a5a42] shadow">Agenda</Link>
            <button onClick={reset} className="rounded-xl bg-[#a66f54] px-4 py-3 font-bold text-white shadow">Nueva venta</button>
          </div>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
          <section className="rounded-3xl bg-white p-4 shadow md:p-6">
            <h2 className="text-xl font-bold text-[#8a5a42]">Servicios</h2>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar servicio..." className="mt-4 w-full rounded-2xl border p-4 text-lg" />
            <div className="mt-4 grid max-h-[50vh] gap-2 overflow-y-auto sm:grid-cols-2">
              {filtered.map(service => (
                <button key={service.id} onClick={() => addService(service)} className="flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-[#ead7cd] bg-[#fffaf7] p-4 text-left">
                  <span className="font-semibold">{service.name}</span>
                  <span className="rounded-full bg-white px-3 py-1 font-bold text-[#8a5a42]">{service.priceLabel || money(toCents(service.price))}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-[#f8eee8] p-4">
              <p className="font-bold text-[#8a5a42]">Otro concepto</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                <input value={concept} onChange={e => setConcept(e.target.value)} placeholder="Producto o servicio" className="rounded-xl border p-3" />
                <input value={conceptPrice} onChange={e => setConceptPrice(e.target.value)} placeholder="Precio €" inputMode="decimal" className="rounded-xl border p-3" />
                <button onClick={addConcept} className="rounded-xl bg-[#a66f54] px-5 py-3 font-bold text-white">Añadir</button>
              </div>
            </div>
          </section>

          <div className="grid gap-5">
            <section className="rounded-3xl bg-white p-4 shadow md:p-6">
              <h2 className="text-xl font-bold text-[#8a5a42]">Cuenta</h2>
              <div className="mt-4 max-h-[35vh] space-y-3 overflow-y-auto">
                {items.length === 0 ? <div className="rounded-2xl border border-dashed p-6 text-center text-gray-500">Pulsa un servicio para añadirlo.</div> : items.map(item => (
                  <div key={item.key} className="rounded-2xl border border-[#ead7cd] p-4">
                    <div className="flex justify-between gap-3">
                      <div><p className="font-bold">{item.name}</p><p className="text-sm text-gray-500">{money(item.unitPriceCents)} por unidad</p></div>
                      <button onClick={() => setItems(current => current.filter(i => i.key !== item.key))} className="text-sm font-semibold text-red-600">Quitar</button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => quantity(item.key, -1)} className="h-10 w-10 rounded-full bg-[#f8eee8] text-xl font-bold">−</button>
                        <span className="min-w-8 text-center text-lg font-bold">{item.quantity}</span>
                        <button onClick={() => quantity(item.key, 1)} className="h-10 w-10 rounded-full bg-[#f8eee8] text-xl font-bold">+</button>
                      </div>
                      <p className="text-xl font-extrabold text-[#8a5a42]">{money(item.unitPriceCents * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-[#8a5a42] p-5 text-white">
                <p className="text-sm uppercase tracking-[.2em] text-white/80">Total</p>
                <p className="text-5xl font-extrabold">{money(total)}</p>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-4 shadow md:p-6">
              <h2 className="text-xl font-bold text-[#8a5a42]">Efectivo recibido</h2>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {DENOMS.map(([label, value]) => (
                  <button key={value} onClick={() => setReceived(current => current + value)} className="min-h-12 rounded-xl border border-[#d8b7a0] bg-[#fffaf7] px-2 py-3 font-bold text-[#8a5a42]">+ {label}</button>
                ))}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                <input value={manual} onChange={e => setManual(e.target.value)} inputMode="decimal" placeholder="Importe entregado" className="rounded-xl border p-3 text-lg" />
                <button onClick={() => setReceived(toCents(manual))} className="rounded-xl bg-[#f4e4dc] px-4 py-3 font-bold text-[#8a5a42]">Usar importe</button>
                <button onClick={() => { setReceived(total); setManual((total / 100).toFixed(2).replace('.', ',')); }} className="rounded-xl bg-[#a66f54] px-4 py-3 font-bold text-white">Importe exacto</button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8eee8] p-4">
                  <p className="text-sm text-gray-500">Recibido</p>
                  <p className="text-3xl font-extrabold text-[#8a5a42]">{money(received)}</p>
                  <button onClick={() => { setReceived(0); setManual(''); }} className="mt-2 text-sm font-semibold text-red-600">Borrar efectivo</button>
                </div>
                <div className={`rounded-2xl p-4 ${total === 0 ? 'bg-gray-100' : change >= 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <p className="text-sm text-gray-600">{change >= 0 ? 'Cambio a devolver' : 'Falta por entregar'}</p>
                  <p className={`text-4xl font-extrabold ${change >= 0 ? 'text-green-700' : 'text-yellow-800'}`}>{money(Math.abs(change))}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
