import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import html2canvas from 'html2canvas';

type Service = {
  id: number;
  name: string;
  price: number;
  priceLabel?: string | null;
  active?: boolean;
};

type BookingData = {
  id: number;
  clientName: string;
  clientPhone?: string | null;
  startTime: string;
  paid?: boolean;
  service: { id: number; name: string; price: number };
  professional?: { name: string } | null;
};

type Item = {
  key: string;
  serviceId?: number;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

const DENOMS = [
  ['100 €', 10000], ['50 €', 5000], ['20 €', 2000], ['10 €', 1000],
  ['5 €', 500], ['2 €', 200], ['1 €', 100], ['0,50 €', 50],
  ['0,20 €', 20], ['0,10 €', 10], ['0,05 €', 5], ['0,02 €', 2], ['0,01 €', 1],
] as const;

const toCents = (value: string | number) => {
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

const money = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value / 100);

const itemKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function normalizeWhatsappPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('34')) return digits;
  return digits.length === 9 ? `34${digits}` : digits;
}

export default function Checkout() {
  const router = useRouter();
  const bookingId = Number(router.query.bookingId || 0);
  const ticketRef = useRef<HTMLDivElement | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [received, setReceived] = useState(0);
  const [cashCounts, setCashCounts] = useState<Record<number, number>>({});
  const [manual, setManual] = useState('');
  const [concept, setConcept] = useState('');
  const [conceptPrice, setConceptPrice] = useState('');
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [finalizing, setFinalizing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [ticketPhone, setTicketPhone] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => setServices(Array.isArray(data) ? data.filter((s: Service) => s.active !== false) : []))
      .catch(() => setError('No se pudieron cargar los servicios.'));

    try {
      const stored = JSON.parse(localStorage.getItem('gema_checkout_usage') || '{}');
      if (stored && typeof stored === 'object') setUsage(stored);
    } catch {}
  }, []);

  useEffect(() => {
    if (!router.isReady || !bookingId) return;

    fetch(`/api/staff/checkout-booking?id=${bookingId}`)
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'No se pudo cargar la cita.');
        return data;
      })
      .then((data: BookingData) => {
        setBooking(data);
        setTicketPhone(data.clientPhone || '');
        setItems([{
          key: itemKey(),
          serviceId: data.service.id,
          name: data.service.name,
          unitPriceCents: toCents(data.service.price),
          quantity: 1,
        }]);
      })
      .catch((err: any) => setError(err?.message || 'No se pudo cargar la cita.'));
  }, [router.isReady, bookingId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? services.filter(s => s.name.toLowerCase().includes(q)) : [...services];
    return list.sort((a, b) => {
      const score = (usage[String(b.id)] || 0) - (usage[String(a.id)] || 0);
      return score || a.name.localeCompare(b.name);
    });
  }, [services, search, usage]);

  const total = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const change = received - total;

  const ticketText = useMemo(() => {
    const now = new Date();
    return [
      'GEMA ESTUDIO DE BELLEZA',
      'Ticket digital',
      '',
      `Fecha: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      booking?.clientName ? `Clienta: ${booking.clientName}` : '',
      booking?.professional?.name ? `Profesional: ${booking.professional.name}` : '',
      '',
      ...items.map(item => `• ${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}: ${money(item.unitPriceCents * item.quantity)}`),
      '',
      `TOTAL: ${money(total)}`,
      `Recibido: ${money(received)}`,
      `Cambio: ${money(Math.max(change, 0))}`,
      '',
      'Gracias por confiar en Gema Estudio de Belleza.',
      'gemaestudiodebelleza.es',
    ].filter(Boolean).join('\n');
  }, [items, total, received, change, booking]);

  const whatsappTextUrl = useMemo(() => {
    const phone = normalizeWhatsappPhone(ticketPhone);
    if (!phone) return '';
    return `https://wa.me/${phone}?text=${encodeURIComponent(ticketText)}`;
  }, [ticketPhone, ticketText]);

  function recordUsage(serviceId?: number) {
    if (!serviceId) return;
    setUsage(current => {
      const next = { ...current, [String(serviceId)]: (current[String(serviceId)] || 0) + 1 };
      localStorage.setItem('gema_checkout_usage', JSON.stringify(next));
      return next;
    });
  }

  function addService(service: Service) {
    recordUsage(service.id);
    setItems(current => {
      const existing = current.find(i => i.serviceId === service.id);
      if (existing) {
        return current.map(i => i.serviceId === service.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...current, {
        key: itemKey(),
        serviceId: service.id,
        name: service.name,
        unitPriceCents: toCents(service.price),
        quantity: 1,
      }];
    });
  }

  function addConcept() {
    const price = toCents(conceptPrice);
    if (!concept.trim() || price <= 0) return;
    setItems(current => [...current, {
      key: itemKey(),
      name: concept.trim(),
      unitPriceCents: price,
      quantity: 1,
    }]);
    setConcept('');
    setConceptPrice('');
  }

  function quantity(key: string, delta: number) {
    setItems(current => current
      .map(i => i.key === key ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
      .filter(i => i.quantity > 0)
    );
  }

  function reset() {
    if (items.length && !confirm('¿Empezar una venta nueva?')) return;
    setBooking(null);
    setItems([]);
    setReceived(0);
    setManual('');
    setDone(false);
    setTicketPhone('');
    router.replace('/staff/checkout', undefined, { shallow: true });
  }

  async function ticketBlob() {
    if (!ticketRef.current) throw new Error('No se pudo generar el ticket.');
    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      backgroundColor: '#fffaf7',
      useCORS: true,
    });

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo crear la imagen.')), 'image/png');
    });
  }

  async function shareVisualTicket() {
    try {
      setSharing(true);
      const blob = await ticketBlob();
      const file = new File([blob], `ticket-gema-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Ticket Gema Estudio de Belleza',
          text: 'Te envío tu ticket digital.',
          files: [file],
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
      alert('Ticket descargado. Ya puedes adjuntarlo en WhatsApp.');
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError(err?.message || 'No se pudo compartir el ticket.');
      }
    } finally {
      setSharing(false);
    }
  }

  async function finishSale() {
    if (!items.length || total <= 0) return setError('Añade al menos un servicio.');
    if (received < total) return setError('El importe recibido no cubre el total.');

    setFinalizing(true);
    setError('');

    try {
      if (bookingId) {
        const response = await fetch('/api/staff/finalize-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            totalCents: total,
            receivedCents: received,
            changeCents: Math.max(change, 0),
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || 'No se pudo finalizar el cobro.');
      }

      items.forEach(item => recordUsage(item.serviceId));
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'No se pudo finalizar el cobro.');
    } finally {
      setFinalizing(false);
    }
  }

  if (done) {
    const now = new Date();

    return (
      <main className="min-h-screen bg-[#f8eee8] p-4 text-[#3b2b25] md:p-8">
        <div className="mx-auto max-w-2xl rounded-[32px] bg-white p-5 shadow-xl md:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d7aa8e] text-4xl text-[#8a5a42]">✓</div>
            <h1 className="mt-4 text-4xl font-extrabold text-green-800">¡Venta finalizada!</h1>
            <p className="mt-3 text-xl">Total cobrado: <strong>{money(total)}</strong></p>
            <div className="mx-auto mt-3 inline-flex rounded-2xl bg-[#f4e4dc] px-6 py-3 text-3xl font-extrabold text-[#8a5a42]">
              Cambio: {money(Math.max(change, 0))}
            </div>
          </div>

          <div
            ref={ticketRef}
            className="relative mx-auto mt-7 overflow-hidden rounded-3xl border border-[#ead7cd] bg-[#fffaf7] p-6 shadow-lg"
          >
            <div className="pointer-events-none absolute -left-8 top-10 h-32 w-32 rounded-full bg-[#f4e4dc]/60 blur-2xl" />
            <div className="pointer-events-none absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-[#ead7cd]/60 blur-2xl" />

            <div className="relative">
              <div className="text-center">
                <p className="text-5xl font-serif tracking-[0.18em] text-[#6f4533]">GEMA</p>
                <p className="mt-1 text-sm font-semibold tracking-[0.28em] text-[#8a5a42]">ESTUDIO DE BELLEZA</p>
                <div className="mx-auto mt-4 h-px w-40 bg-[#d8b7a0]" />
                <p className="mt-3 text-sm font-bold tracking-[0.2em] text-[#8a5a42]">TICKET DIGITAL</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-white/80 p-4 text-sm">
                <div>
                  <p className="text-gray-500">Fecha</p>
                  <p className="font-semibold">{now.toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Hora</p>
                  <p className="font-semibold">{now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {booking?.clientName ? (
                  <div>
                    <p className="text-gray-500">Clienta</p>
                    <p className="font-semibold">{booking.clientName}</p>
                  </div>
                ) : null}
                {booking?.professional?.name ? (
                  <div>
                    <p className="text-gray-500">Profesional</p>
                    <p className="font-semibold">{booking.professional.name}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <div className="rounded-xl bg-[#f4e4dc] px-4 py-2 text-sm font-bold tracking-[0.12em] text-[#8a5a42]">
                  DETALLE DE SERVICIOS
                </div>

                <div className="mt-3 space-y-3">
                  {items.map(item => (
                    <div key={item.key} className="flex items-end justify-between gap-4 border-b border-dashed border-[#d8b7a0] pb-2">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        {item.quantity > 1 ? <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p> : null}
                      </div>
                      <p className="shrink-0 font-bold">{money(item.unitPriceCents * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-2 rounded-2xl bg-white/90 p-4">
                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <strong>{money(total)}</strong>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Recibido</span>
                  <strong>{money(received)}</strong>
                </div>
                <div className="flex justify-between rounded-xl bg-green-100 px-3 py-2 text-xl text-green-800">
                  <span>Cambio</span>
                  <strong>{money(Math.max(change, 0))}</strong>
                </div>
              </div>

              <div className="mt-7 text-center">
                <p className="text-lg italic text-[#8a5a42]">Gracias por confiar en</p>
                <p className="text-xl font-semibold text-[#6f4533]">Gema Estudio de Belleza</p>
                <p className="mt-4 text-sm text-gray-600">gemaestudiodebelleza.es</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
  <label className="text-sm font-semibold">Teléfono de la clienta</label>

  <div className="mt-1 grid gap-2 sm:grid-cols-[1fr_auto]">
    <input
      value={ticketPhone}
      onChange={(e) => setTicketPhone(e.target.value)}
      inputMode="tel"
      placeholder="Ej. 647067368"
      className="w-full rounded-xl border p-3"
    />

    <button
      type="button"
      onClick={async () => {
        try {
          const nav = navigator as any;

          if (!nav.contacts?.select) {
            alert('Este móvil o navegador no permite acceder a los contactos.');
            return;
          }

          const contacts = await nav.contacts.select(
            ['name', 'tel'],
            { multiple: false }
          );

          const phone = contacts?.[0]?.tel?.[0];

          if (phone) {
            setTicketPhone(phone);
          }
        } catch (error) {
          console.error('Error seleccionando contacto:', error);
        }
      }}
      className="rounded-xl bg-[#f4e4dc] px-5 py-3 font-bold text-[#8a5a42]"
    >
      Buscar contacto
    </button>
  </div>
</div>

          {error ? <div className="mt-4 rounded-xl bg-red-100 p-3 text-red-700">{error}</div> : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              onClick={shareVisualTicket}
              disabled={sharing}
              className="rounded-xl bg-green-500 px-5 py-4 font-bold text-white disabled:opacity-60"
            >
              {sharing ? 'Generando ticket...' : 'Enviar ticket visual por WhatsApp'}
            </button>

            {whatsappTextUrl ? (
              <a
                href={whatsappTextUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[#3b2b25] px-5 py-4 text-center font-bold text-white"
              >
                Enviar también como texto
              </a>
            ) : (
              <button
                onClick={() => alert('Introduce el teléfono de la clienta.')}
                className="rounded-xl bg-[#3b2b25] px-5 py-4 font-bold text-white"
              >
                Enviar también como texto
              </button>
            )}

            <button onClick={reset} className="rounded-xl bg-[#a66f54] px-5 py-4 font-bold text-white">
              Nueva venta
            </button>

            <Link href="/staff" className="rounded-xl bg-[#f4e4dc] px-5 py-4 text-center font-bold text-[#8a5a42]">
              Volver a agenda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8eee8] p-3 text-[#3b2b25] md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[#8a5a42] md:text-4xl">Caja inteligente</h1>
            <p className="text-gray-600">
              {booking ? `Cobro de ${booking.clientName}` : 'Suma servicios y calcula el cambio.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/staff" className="rounded-xl bg-white px-4 py-3 font-bold text-[#8a5a42] shadow">Agenda</Link>
            <button onClick={reset} className="rounded-xl bg-[#a66f54] px-4 py-3 font-bold text-white shadow">Nueva venta</button>
          </div>
        </header>

        {error && <div className="mt-4 rounded-2xl bg-red-100 p-4 text-red-700">{error}</div>}

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
          <section className="rounded-3xl bg-white p-4 shadow md:p-6">
            <h2 className="text-xl font-bold text-[#8a5a42]">Servicios</h2>

<input
  value={search}
  onChange={e => setSearch(e.target.value)}
  placeholder="Buscar servicio..."
  className="mt-4 w-full rounded-2xl border p-4 text-lg"
/>

{items.length > 0 && (
  <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#8a5a42] px-4 py-3 text-white shadow-sm">
    <div>
      <span className="font-bold">
        {items.reduce((sum, item) => sum + item.quantity, 0)}
      </span>
      <span className="ml-2 text-sm">
        servicios añadidos
      </span>
    </div>

    <div className="text-lg font-bold">
      {money(total)}
    </div>
  </div>
)}

<div className="mt-4 grid max-h-[50vh] gap-2 overflow-y-auto sm:grid-cols-2">
              {filtered.map(service => {
  const selectedItem = items.find(
    (item) => item.serviceId === service.id
  );

  const quantitySelected = selectedItem?.quantity || 0;

  return (
    <button
      key={service.id}
      onClick={() => addService(service)}
      className={`relative flex min-h-20 items-center justify-between gap-3 rounded-2xl border p-4 text-left transition active:scale-[.98] ${
        quantitySelected > 0
          ? 'border-[#8a5a42] bg-[#f4e4dc] ring-2 ring-[#d8b7a0]'
          : 'border-[#ead7cd] bg-[#fffaf7]'
      }`}
    >
      <div className="flex flex-col">
        <span className="font-semibold">{service.name}</span>

        {quantitySelected > 0 && (
          <span className="mt-2 w-fit rounded-full bg-[#8a5a42] px-3 py-1 text-xs font-bold text-white">
            Añadido × {quantitySelected}
          </span>
        )}
      </div>

      <span
        className={`shrink-0 rounded-full px-3 py-1 font-bold ${
          quantitySelected > 0
            ? 'bg-[#8a5a42] text-white'
            : 'bg-white text-[#8a5a42]'
        }`}
      >
        {service.priceLabel || money(toCents(service.price))}
      </span>

      {quantitySelected > 0 && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
          ✓
        </span>
      )}
    </button>
  );
})}
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
                {!items.length ? <div className="rounded-2xl border border-dashed p-6 text-center text-gray-500">Pulsa un servicio para añadirlo.</div> : items.map(item => (
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
                {DENOMS.map(([label, value]) => {
  const count = cashCounts[value] || 0;

  return (
    <button
      key={value}
      onClick={() => {
        setReceived(current => current + value);

        setCashCounts(current => ({
          ...current,
          [value]: (current[value] || 0) + 1,
        }));
      }}
      className={`relative min-h-12 rounded-xl border px-2 py-3 font-bold transition active:scale-95 ${
        count > 0
          ? 'border-green-600 bg-green-100 text-green-800 ring-2 ring-green-300'
          : 'border-[#d8b7a0] bg-[#fffaf7] text-[#8a5a42]'
      }`}
    >
      + {label}

      {count > 0 && (
        <span className="absolute right-1 top-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
          ×{count}
        </span>
      )}
    </button>
  );
})}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                <input value={manual} onChange={e => setManual(e.target.value)} inputMode="decimal" placeholder="Importe entregado" className="rounded-xl border p-3 text-lg" />
                <button onClick={() => setReceived(toCents(manual))} className="rounded-xl bg-[#f4e4dc] px-4 py-3 font-bold text-[#8a5a42]">Usar importe</button>
                <button onClick={() => { setReceived(total); setManual((total / 100).toFixed(2).replace('.', ',')); }} className="rounded-xl bg-[#a66f54] px-4 py-3 font-bold text-white">Importe exacto</button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#f8eee8] p-4">
                  <p className="text-sm text-gray-500">Recibido</p>
                  <p className="text-3xl font-extrabold text-[#8a5a42]">{money(received)}</p>
                  <button
  onClick={() => {
    setReceived(0);
    setManual('');
    setCashCounts({});
  }}
  className="mt-2 text-sm font-semibold text-red-600"
>
  Borrar efectivo
</button>
                </div>

                <div className={`sm:col-span-2 rounded-2xl p-5 ${total === 0 ? 'bg-gray-100' : change >= 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <p className="text-sm uppercase tracking-[.15em] text-gray-600">{change >= 0 ? 'Cambio a devolver' : 'Falta por entregar'}</p>
                  <p className={`text-5xl font-extrabold ${change >= 0 ? 'text-green-700' : 'text-yellow-800'}`}>{money(Math.abs(change))}</p>
                </div>
              </div>

              <button
                onClick={finishSale}
                disabled={finalizing || total <= 0 || received < total}
                className="mt-4 w-full rounded-2xl bg-green-600 px-5 py-4 text-xl font-extrabold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
              >
                {finalizing ? 'Finalizando...' : '✓ Venta finalizada'}
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
