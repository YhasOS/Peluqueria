import { useEffect, useMemo, useState } from 'react';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function fmtTime(value: string) {
  return new Date(value).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function money(value: any) {
  return `${Number(value || 0).toFixed(2)} â‚¬`;
}

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'No se pudo realizar la acciÃ³n');
  return data;
}
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function activatePushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Este navegador no soporta notificaciones push.');
  }

  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('No se han concedido permisos de notificaciÃ³n.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');

  const keyRes = await fetch('/api/push/public-key');
  const keyData = await keyRes.json();

  if (!keyData.publicKey) {
    throw new Error('No estÃ¡ configurada la clave pÃºblica de notificaciones.');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
  });

  const saveRes = await fetch('/api/staff/push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  });

  const saveData = await saveRes.json().catch(() => ({}));

  if (!saveRes.ok) {
    throw new Error(saveData.error || 'No se pudo activar la notificaciÃ³n.');
  }

  return true;
}
export default function StaffPanel() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [bookings, setBookings] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [staff, setStaff] = useState<any>(null);
  const [tab, setTab] = useState<'dashboard' | 'agenda' | 'equipo' | 'resumen'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
const [pushLoading, setPushLoading] = useState(false);

  async function load() {
    setLoading(true);
    setMsg('');
    const q = `from=${from}&to=${to}`;
    const resBookings = await fetch('/api/staff/bookings?' + q);
    if (resBookings.status === 401) {
      location.href = '/staff/login';
      return;
    }
    const dataBookings = await resBookings.json();
    setBookings(Array.isArray(dataBookings.bookings) ? dataBookings.bookings : []);
    setStaff(dataBookings.staff || null);

    const resSummary = await fetch('/api/staff/summary?' + q);
    if (resSummary.status === 401) {
      location.href = '/staff/login';
      return;
    }
    const dataSummary = await resSummary.json();
    setSummary(dataSummary || null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);
async function handleActivatePush() {
  try {
    setPushLoading(true);
    setMsg('');
    await activatePushNotifications();
    setMsg('Notificaciones activadas en este dispositivo.');
  } catch (error: any) {
    setMsg(error?.message || 'No se pudieron activar las notificaciones.');
  } finally {
    setPushLoading(false);
  }
}

  const mine = useMemo(() => bookings.filter((b) => Number(b.staffId) === Number(staff?.id)), [bookings, staff]);
  const others = useMemo(() => bookings.filter((b) => Number(b.staffId) !== Number(staff?.id)), [bookings, staff]);

  const todayMine = mine.filter((b) => String(b.startTime || '').slice(0, 10) === today());
  const todayAmount = todayMine
    .filter((b) => b.status === 'completed')
    .reduce((acc, b) => acc + Number(b.price || b.servicePrice || 0), 0);

  async function cancelBooking(id: number) {
    const reason = prompt('Motivo de cancelaciÃ³n (opcional):') || '';
    if (!confirm('Â¿Seguro que quieres cancelar esta cita?')) return;
    await postJson('/api/staff/cancel-booking', { id, reason });
    setMsg('Cita cancelada correctamente.');
    await load();
  }

  async function completeBooking(id: number) {
    if (!confirm('Â¿Marcar esta cita como realizada?')) return;
    await postJson('/api/staff/complete-booking', { id });
    setMsg('Cita marcada como realizada.');
    await load();
  }

  async function rescheduleBooking(id: number) {
    const value = prompt('Nueva fecha y hora en formato: 2026-06-18 17:30');
    if (!value) return;
    const normalized = value.trim().replace(' ', 'T');
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) {
      alert('Formato no vÃ¡lido. Usa por ejemplo: 2026-06-18 17:30');
      return;
    }
    await postJson('/api/staff/reschedule-booking', { id, newStartTime: d.toISOString() });
    setMsg('Cita cambiada correctamente.');
    await load();
  }

  const nav = [
    ['dashboard', 'Dashboard'],
    ['agenda', 'Mis citas'],
    ['equipo', 'Agenda equipo'],
    ['resumen', 'Resumen econÃ³mico'],
  ] as const;

  function BookingCard({ b, own }: { b: any; own: boolean }) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-bold text-[#3b2b25]">{fmtDate(b.startTime)} Â· {fmtTime(b.startTime)} - {fmtTime(b.endTime)}</p>
            <p className="mt-1 text-lg font-semibold text-[#8a5a42]">{b.clientName || 'Cliente'} Â· {b.serviceName || 'Servicio'}</p>
            <p className="text-sm text-gray-500">{own ? b.clientPhone : b.staffName}{b.notes ? ` Â· ${b.notes}` : ''}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-[#f4e4dc] text-[#8a5a42]'}`}>
            {b.status === 'completed' ? 'realizada' : b.status || 'confirmed'}
          </span>
        </div>

        {own && (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button onClick={() => rescheduleBooking(b.id)} className="rounded-xl border border-[#d8b7a0] px-3 py-2 text-sm font-semibold text-[#8a5a42]">
              Cambiar
            </button>
            <button onClick={() => cancelBooking(b.id)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">
              Cancelar
            </button>
            <button onClick={() => completeBooking(b.id)} className="rounded-xl bg-[#a66f54] px-3 py-2 text-sm font-semibold text-white">
              Realizada
            </button>
<a
  href={`/staff/checkout?bookingId=${b.id}`}
  className="rounded-xl bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white"
>
  Cobrar
</a>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8eee8] text-[#3b2b25]">
      <div className="min-h-screen md:flex">
        <aside className="bg-white/95 p-4 shadow-sm md:w-64 md:shrink-0 md:p-6">
          <div className="flex items-center justify-between gap-3 md:block">
            <div>
              <h1 className="text-2xl font-bold text-[#8a5a42]">Gema Estudio</h1>
              <p className="mt-1 text-sm text-gray-500">Panel trabajadora</p>
            </div>
            <a href="/" className="rounded-xl bg-[#f8eee8] px-3 py-2 text-sm font-semibold text-[#8a5a42] md:hidden">Web</a>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f8eee8] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a6755b]">SesiÃ³n</p>
            <p className="mt-1 text-lg font-semibold text-[#8a5a42]">{staff?.name || 'Trabajadora'}</p>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 md:mt-8 md:block md:space-y-2 md:overflow-visible">
            {nav.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-left font-medium md:block md:w-full ${tab === key ? 'bg-[#a66f54] text-white' : 'bg-white hover:bg-[#f4e4dc]'}`}
              >
                {label}
              </button>
            ))}
            <a href="/" className="hidden rounded-xl px-4 py-3 font-medium hover:bg-[#f4e4dc] md:block">Ver web</a>
            <a href="/staff/login" className="rounded-xl px-4 py-3 font-medium text-red-600 hover:bg-[#f4e4dc]">Salir</a>
          </nav>
        </aside>

        <section className="flex-1 p-4 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#8a5a42] md:text-4xl">Agenda de {staff?.name || ''}</h2>
              <p className="mt-1 text-sm text-gray-600 md:text-base">Gestiona tus citas, coordina con compaÃ±eras y revisa tus servicios realizados.</p>
            </div>
            <div className="flex flex-wrap gap-2">
  <button
    onClick={handleActivatePush}
    disabled={pushLoading}
    className="rounded-xl bg-white px-5 py-3 font-semibold text-[#8a5a42] shadow disabled:opacity-60"
  >
    {pushLoading ? 'Activando...' : 'Activar notificaciones'}
  </button>

  <a href="/admin" className="hidden rounded-xl bg-white px-5 py-3 font-semibold text-[#8a5a42] shadow md:inline-block">
    Ir a admin
  </a>
  <a
  href="/staff/new-booking"
  className="rounded-xl bg-[#a66f54] px-5 py-3 font-semibold text-white shadow"
>
  + Nueva cita
</a>
<a
  href="/staff"
  className="rounded-xl bg-white px-5 py-3 font-semibold text-[#8a5a42] shadow"
>
  Agenda
</a>
</div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border bg-white p-3" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border bg-white p-3" />
            <button onClick={load} className="rounded-xl bg-[#a66f54] px-5 py-3 font-semibold text-white">Actualizar</button>
          </div>

          {msg && <div className="mt-4 rounded-2xl bg-white p-4 text-[#8a5a42] shadow-sm">{msg}</div>}

          {loading ? (
            <div className="mt-8 rounded-3xl bg-white p-6 shadow">Cargando agenda...</div>
          ) : (
            <>
              {tab === 'dashboard' && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Mis citas hoy</p><p className="mt-2 text-3xl font-bold text-[#8a5a42]">{todayMine.length}</p></div>
                  <div className="rounded-3xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Mis citas periodo</p><p className="mt-2 text-3xl font-bold text-[#8a5a42]">{mine.length}</p></div>
                  <div className="rounded-3xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Realizado hoy</p><p className="mt-2 text-3xl font-bold text-[#8a5a42]">{money(todayAmount)}</p></div>
                  <div className="rounded-3xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Realizado periodo</p><p className="mt-2 text-3xl font-bold text-[#8a5a42]">{money(summary?.totalAmount)}</p></div>
                </div>
              )}

              {tab === 'agenda' && (
                <div className="mt-8">
                  <h3 className="mb-4 text-2xl font-bold text-[#8a5a42]">Mis citas</h3>
                  <div className="grid gap-4">{mine.length ? mine.map((b) => <BookingCard key={b.id} b={b} own />) : <div className="rounded-3xl bg-white p-6 shadow">No tienes citas en este periodo.</div>}</div>
                </div>
              )}

              {tab === 'equipo' && (
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-2xl font-bold text-[#8a5a42]">Mis citas</h3>
                    <div className="grid gap-4">{mine.map((b) => <BookingCard key={b.id} b={b} own />)}</div>
                  </div>
                  <div>
                    <h3 className="mb-4 text-2xl font-bold text-[#8a5a42]">Citas de compaÃ±eras</h3>
                    <div className="grid gap-4">{others.map((b) => <BookingCard key={b.id} b={b} own={false} />)}</div>
                  </div>
                </div>
              )}

              {tab === 'resumen' && (
                <div className="mt-8 rounded-3xl bg-white p-5 shadow">
                  <h3 className="text-2xl font-bold text-[#8a5a42]">Resumen economico de {staff?.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Solo cuenta citas marcadas como realizadas.</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#f8eee8] p-4"><p className="text-sm text-gray-500">Citas realizadas</p><p className="text-3xl font-bold text-[#8a5a42]">{summary?.totalBookings || 0}</p></div>
                    <div className="rounded-2xl bg-[#f8eee8] p-4"><p className="text-sm text-gray-500">Importe realizado</p><p className="text-3xl font-bold text-[#8a5a42]">{money(summary?.totalAmount)}</p></div>
                    <div className="rounded-2xl bg-[#f8eee8] p-4"><p className="text-sm text-gray-500">Periodo</p><p className="text-lg font-semibold text-[#8a5a42]">{from} a {to}</p></div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

