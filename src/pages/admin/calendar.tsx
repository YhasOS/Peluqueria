import AdminLayout from '@/components/AdminLayout';
import { useEffect, useMemo, useState } from 'react';

type Professional = { id: number; name: string };
type Booking = {
  id: number;
  clientName: string;
  clientPhone?: string | null;
  notes?: string | null;
  startTime: string;
  endTime: string;
  status?: string;
  service: { name: string };
  professionalId?: number | null;
  professional?: { id?: number; name: string } | null;
};

function todayInput() { return new Date().toISOString().slice(0, 10); }
function timeLabel(date: Date) { return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); }
function addMinutes(base: Date, mins: number) { return new Date(base.getTime() + mins * 60000); }
function hm(date: Date) { return date.toTimeString().slice(0, 5); }
function sameSlot(slot: Date, booking: Booking) {
  const s = new Date(booking.startTime);
  const e = new Date(booking.endTime);
  return slot >= s && slot < e;
}

export default function CalendarPage() {
  const [date, setDate] = useState(todayInput());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [message, setMessage] = useState('');

  const slots = useMemo(() => {
    const start = new Date(`${date}T09:00:00`);
    return Array.from({ length: 21 }, (_, i) => addMinutes(start, i * 30));
  }, [date]);

  async function load() {
    const [b, p] = await Promise.all([
      fetch(`/api/bookings?from=${date}T00:00:00&to=${date}T23:59:59`).then(r => r.json()),
      fetch('/api/professionals').then(r => r.json()),
    ]);
    setBookings(Array.isArray(b) ? b : []);
    setProfessionals(Array.isArray(p) ? p : []);
  }

  useEffect(() => { load(); }, [date]);

  function bookingFor(professionalId: number, slot: Date) {
    return bookings.find((b) => {
      const bProf = b.professionalId || b.professional?.id || professionals[0]?.id;
      return Number(bProf) === professionalId && sameSlot(slot, b);
    });
  }

  async function moveBooking(newSlot: Date, professionalId: number) {
    if (!selectedBookingId) return;
    const booking = bookings.find(b => String(b.id) === selectedBookingId);
    if (!booking) return;
    const ok = window.confirm(`¿Mover cita de ${booking.clientName} a ${timeLabel(newSlot)} con este profesional?`);
    if (!ok) return;
    const res = await fetch(`/api/bookings?id=${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime: `${date}T${hm(newSlot)}:00`, professionalId }),
    });
    setMessage(res.ok ? 'Cita movida correctamente.' : 'No se pudo mover la cita. Puede haber solape.');
    setSelectedBookingId('');
    await load();
  }

  return (
    <AdminLayout title="Vista diaria">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Vista diaria</h1>
          <p className="mt-2 text-gray-600">Agenda por profesional y franja horaria.</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-gray-300 p-3" />
          <select value={selectedBookingId} onChange={(e) => setSelectedBookingId(e.target.value)} className="rounded-xl border border-gray-300 p-3">
            <option value="">Seleccionar cita para mover</option>
            {bookings.map(b => <option key={b.id} value={b.id}>{timeLabel(new Date(b.startTime))} · {b.clientName} · {b.service.name}</option>)}
          </select>
        </div>
      </div>
      {message && <div className="mb-4 rounded-xl bg-green-100 p-3 text-green-800">{message}</div>}
      <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-primary-light p-3 text-left">Hora</th>
              {professionals.map((p) => <th key={p.id} className="bg-primary-light p-3 text-left">{p.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.toISOString()}>
                <td className="sticky left-0 z-10 border-t bg-white p-3 font-semibold">{timeLabel(slot)}</td>
                {professionals.map((p) => {
                  const b = bookingFor(p.id, slot);
                  return (
                    <td key={p.id} className="min-w-56 border-t p-2 align-top">
                      {b ? (
                        <div className="rounded-xl bg-accent/15 p-3 text-accent">
                          <div className="font-bold">{b.clientName}</div>
                          <div>{b.service?.name}</div>
                          <div className="text-xs text-gray-600">{timeLabel(new Date(b.startTime))} - {timeLabel(new Date(b.endTime))}</div>
                          {b.clientPhone && <div className="text-xs">{b.clientPhone}</div>}
                          {b.status && <div className="mt-1 inline-block rounded-full bg-white px-2 py-1 text-xs">{b.status}</div>}
                        </div>
                      ) : (
                        <button
                          disabled={!selectedBookingId}
                          onClick={() => moveBooking(slot, p.id)}
                          className="w-full rounded-xl border border-dashed border-gray-300 p-3 text-left text-gray-400 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {selectedBookingId ? 'Mover aquí' : 'Libre'}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
