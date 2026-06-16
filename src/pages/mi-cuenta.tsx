import Layout from '@/components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Booking = {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  notes?: string | null;
  startTime: string;
  endTime: string;
  status?: string;
  service?: { name: string; priceLabel?: string | null; totalDuration: number; category?: { name: string } };
  professional?: { name: string } | null;
};

type PortalData = { customer?: any; upcoming: Booking[]; past: Booking[] };

function formatDate(value: string) { return new Date(value).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }); }
function formatTime(value: string) { return new Date(value).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); }
function toInputDateTime(value: string) {
  const d = new Date(value);
  const pad = (n:number) => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MiCuenta() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStart, setNewStart] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('gema_customer_email') || '';
    const savedPhone = localStorage.getItem('gema_customer_phone') || '';
    setEmail(savedEmail); setPhone(savedPhone);
    if (savedEmail || savedPhone) loadPortal(savedEmail, savedPhone);
  }, []);

  async function loadPortal(e = email, p = phone) {
    setLoading(true); setError(''); setMessage('');
    const params = new URLSearchParams();
    if (e) params.set('email', e);
    if (p) params.set('phone', p);
    const res = await fetch(`/api/customer-portal?${params.toString()}`);
    const json = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) { setError(json?.error || 'No hemos podido localizar tus citas.'); return; }
    localStorage.setItem('gema_customer_email', e);
    localStorage.setItem('gema_customer_phone', p);
    setData(json);
  }

  async function cancelBooking(booking: Booking) {
    if (!confirm('¿Quieres cancelar esta cita?')) return;
    setError(''); setMessage('');
    const res = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: booking.id, email, phone })
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) { setError(json?.error || 'No se ha podido cancelar la cita.'); return; }
    setMessage('Cita cancelada correctamente.');
    await loadPortal(email, phone);
  }

  async function saveReschedule(booking: Booking) {
    if (!newStart) { setError('Selecciona una nueva fecha y hora.'); return; }
    setError(''); setMessage('');
    const res = await fetch('/api/bookings/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: booking.id, email, phone, newStart })
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) { setError(json?.error || 'No se ha podido cambiar la cita.'); return; }
    setEditingId(null); setNewStart('');
    setMessage('Cita cambiada correctamente.');
    await loadPortal(email, phone);
  }

  const Card = ({ booking, allowActions=false }: { booking: Booking; allowActions?: boolean }) => {
    const status = booking.status || 'confirmed';
    const isCancelled = status === 'cancelled';
    return <article className="rounded-[1.6rem] border border-primary bg-white/90 p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-serif text-2xl text-accent-dark">{booking.service?.name || 'Servicio'}</p>
          <p className="mt-1 text-sm uppercase tracking-[0.2em] text-accent">{booking.service?.category?.name || 'Gema Estudio'}</p>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-bold ${isCancelled ? 'bg-red-50 text-red-700' : 'bg-primary-light text-accent-dark'}`}>{isCancelled ? 'cancelada' : status}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
        <p><strong>Fecha:</strong><br />{formatDate(booking.startTime)}</p>
        <p><strong>Hora:</strong><br />{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
        <p><strong>Profesional:</strong><br />{booking.professional?.name || 'Indiferente'}</p>
        <p><strong>Duración:</strong><br />{booking.service?.totalDuration || 0} minutos</p>
      </div>
      {booking.notes && <p className="mt-4 rounded-2xl bg-secondary p-4 text-sm text-gray-700"><strong>Notas:</strong> {booking.notes}</p>}

      {allowActions && !isCancelled && (
        <div className="mt-5 rounded-2xl bg-primary-light/60 p-4">
          {editingId === booking.id ? (
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input type="datetime-local" value={newStart} onChange={(e)=>setNewStart(e.target.value)} className="rounded-xl border border-primary bg-white p-3 outline-none focus:border-accent" />
              <button onClick={()=>saveReschedule(booking)} className="rounded-full bg-accent px-5 py-3 font-bold text-white">Guardar cambio</button>
              <button onClick={()=>{setEditingId(null); setNewStart('');}} className="rounded-full border border-accent px-5 py-3 font-bold text-accent">Cerrar</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button onClick={()=>{setEditingId(booking.id); setNewStart(toInputDateTime(booking.startTime));}} className="rounded-full border border-accent px-5 py-3 font-bold text-accent-dark">Cambiar cita</button>
              <button onClick={()=>cancelBooking(booking)} className="rounded-full border border-red-300 px-5 py-3 font-bold text-red-700">Cancelar cita</button>
              <a href="https://wa.me/34647067368" target="_blank" rel="noreferrer" className="rounded-full bg-green-500 px-5 py-3 font-bold text-white">Contactar por WhatsApp</a>
            </div>
          )}
          <p className="mt-3 text-xs text-gray-600">Los cambios o cancelaciones con menos de 24 horas deben hacerse por WhatsApp.</p>
        </div>
      )}
    </article>;
  };

  return (
    <Layout title="Mi cuenta">
      <section className="overflow-hidden rounded-[2.4rem] border border-white/80 bg-white/90 p-8 shadow-soft md:p-12">
        <p className="font-script text-5xl text-accent">App de clientas</p>
        <h1 className="mt-1 font-serif text-4xl text-accent-dark md:text-5xl">Tus citas y tratamientos</h1>
        <p className="mt-4 max-w-3xl text-gray-700">Consulta tus próximas reservas, citas pasadas, servicios realizados y cambia o cancela tu cita cuando sea posible.</p>
      </section>

      <section className="mt-8 rounded-[2rem] bg-white/90 p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email usado en la reserva" className="rounded-2xl border border-primary bg-white p-4 outline-none focus:border-accent" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono / WhatsApp" className="rounded-2xl border border-primary bg-white p-4 outline-none focus:border-accent" />
          <button onClick={() => loadPortal()} className="rounded-full bg-accent px-7 py-4 font-bold text-white shadow-soft hover:bg-accent-dark">Ver mis citas</button>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
        {message && <p className="mt-4 rounded-2xl bg-green-50 p-4 text-green-700">{message}</p>}
      </section>

      {loading && <div className="mt-8 rounded-3xl bg-white/80 p-8 shadow-soft">Cargando tus citas...</div>}

      {data && !loading && (
        <>
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div><p className="font-script text-4xl text-accent">Próximas reservas</p><h2 className="font-serif text-3xl text-accent-dark">Tus próximas citas</h2></div>
              <Link href="/services" className="rounded-full bg-accent px-5 py-3 font-bold text-white">Nueva reserva</Link>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {data.upcoming.length ? data.upcoming.map((b) => <Card key={b.id} booking={b} allowActions />) : <div className="rounded-[1.6rem] bg-white/85 p-8 shadow-soft">No tienes próximas citas.</div>}
            </div>
          </section>

          <section className="mt-12">
            <p className="font-script text-4xl text-accent">Historial</p>
            <h2 className="font-serif text-3xl text-accent-dark">Servicios realizados</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {data.past.length ? data.past.map((b) => <Card key={b.id} booking={b} />) : <div className="rounded-[1.6rem] bg-white/85 p-8 shadow-soft">Aún no hay citas pasadas registradas.</div>}
            </div>
          </section>
        </>
      )}
    </Layout>
  );
}
