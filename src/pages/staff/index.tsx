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
  return `${Number(value || 0).toFixed(2)} €`;
}

export default function StaffPanel() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [bookings, setBookings] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [staff, setStaff] = useState<any>(null);
  const [tab, setTab] = useState<'dashboard' | 'agenda' | 'equipo' | 'resumen'>('dashboard');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
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
    setSummary(Array.isArray(dataSummary) ? dataSummary : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [from, to]);

  const mine = useMemo(() => bookings.filter((b) => Number(b.staffId) === Number(staff?.id)), [bookings, staff]);
  const others = useMemo(() => bookings.filter((b) => Number(b.staffId) !== Number(staff?.id)), [bookings, staff]);
  const mySummary = summary.find((s) => Number(s.id) === Number(staff?.id));
  const totalEquipo = summary.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);

  const todayBookings = bookings.filter((b) => String(b.startTime || '').slice(0, 10) === today());
  const todayMine = todayBookings.filter((b) => Number(b.staffId) === Number(staff?.id));
  const todayAmount = todayMine.reduce((acc, b) => acc + Number(b.servicePrice || 0), 0);

  const nav = [
    ['dashboard', 'Dashboard'],
    ['agenda', 'Agenda'],
    ['equipo', 'Agenda equipo'],
    ['resumen', 'Resumen económico'],
  ] as const;

  return (
    <main className="min-h-screen bg-[#f8eee8] text-[#3b2b25]">
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 bg-white/90 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#8a5a42]">Gema Estudio</h1>
          <p className="mt-1 text-sm text-gray-500">Panel trabajadora</p>
          <div className="mt-6 rounded-2xl bg-[#f8eee8] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a6755b]">Sesión</p>
            <p className="mt-1 text-lg font-semibold text-[#8a5a42]">{staff?.name || 'Trabajadora'}</p>
          </div>
          <nav className="mt-8 space-y-2">
            {nav.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`block w-full rounded-xl px-4 py-3 text-left font-medium ${tab === key ? 'bg-[#a66f54] text-white' : 'hover:bg-[#f4e4dc]'}`}
              >
                {label}
              </button>
            ))}
            <a href="/" className="block rounded-xl px-4 py-3 font-medium hover:bg-[#f4e4dc]">Ver web</a>
            <a href="/staff/login" className="block rounded-xl px-4 py-3 font-medium text-red-600 hover:bg-[#f4e4dc]">Salir</a>
          </nav>
        </aside>

        <section className="flex-1 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold text-[#8a5a42]">Agenda de {staff?.name || ''}</h2>
              <p className="mt-1 text-gray-600">Citas propias, coordinación con compañeras y resumen económico.</p>
            </div>
            <a href="/admin" className="rounded-xl bg-white px-5 py-3 font-semibold text-[#8a5a42] shadow">Ir a admin</a>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border bg-white p-3" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border bg-white p-3" />
            <button onClick={load} className="rounded-xl bg-[#a66f54] px-5 py-3 font-semibold text-white">Actualizar</button>
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl bg-white p-6 shadow">Cargando agenda...</div>
          ) : (
            <>
              {tab === 'dashboard' && (
                <div className="mt-8 space-y-8">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card title="Mis citas" value={mine.length} />
                    <Card title="Citas hoy" value={todayMine.length} />
                    <Card title="Facturación periodo" value={money(mySummary?.totalAmount)} />
                    <Card title="Facturación hoy" value={money(todayAmount)} />
                  </div>
                  <Panel title="Próximas citas">
                    <BookingList bookings={mine.slice(0, 8)} showStaff={false} />
                  </Panel>
                </div>
              )}

              {tab === 'agenda' && (
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <Panel title="Mis citas">
                    <BookingList bookings={mine} showStaff={false} />
                  </Panel>
                  <Panel title="Citas de compañeras">
                    <BookingList bookings={others} showStaff />
                  </Panel>
                </div>
              )}

              {tab === 'equipo' && (
                <div className="mt-8">
                  <Panel title="Agenda completa del equipo">
                    <BookingList bookings={bookings} showStaff />
                  </Panel>
                </div>
              )}

              {tab === 'resumen' && (
                <div className="mt-8">
                  <Panel title="Resumen económico por trabajadora">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b text-sm text-gray-500">
                          <th className="py-3">Trabajadora</th>
                          <th>Citas</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.map((s) => (
                          <tr key={s.id} className="border-b">
                            <td className="py-3 font-semibold">{s.name}</td>
                            <td>{s.totalBookings}</td>
                            <td>{money(s.totalAmount)}</td>
                          </tr>
                        ))}
                        <tr className="font-bold text-[#8a5a42]">
                          <td className="py-4">TOTAL EQUIPO</td>
                          <td>{summary.reduce((acc, s) => acc + Number(s.totalBookings || 0), 0)}</td>
                          <td>{money(totalEquipo)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </Panel>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-[#8a5a42]">{value}</p>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: any }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <h3 className="mb-4 text-2xl font-bold text-[#8a5a42]">{title}</h3>
      {children}
    </section>
  );
}

function BookingList({ bookings, showStaff }: { bookings: any[]; showStaff: boolean }) {
  if (!bookings.length) return <p className="text-gray-500">No hay citas en el periodo seleccionado.</p>;
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <article key={b.id} className="rounded-2xl border border-[#ead6cc] bg-[#fffaf7] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[#3b2b25]">{fmtDate(b.startTime)} · {fmtTime(b.startTime)} - {fmtTime(b.endTime)}</p>
              <p className="mt-1">{b.clientName || 'Cliente'} · {b.serviceName || 'Servicio'}</p>
              <p className="text-sm text-gray-500">{b.clientPhone || ''} {b.notes ? `· ${b.notes}` : ''}</p>
            </div>
            <div className="text-right">
              {showStaff && <p className="font-semibold text-[#8a5a42]">{b.staffName || 'Sin asignar'}</p>}
              <p className="text-sm text-gray-500">{money(b.servicePrice)}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
