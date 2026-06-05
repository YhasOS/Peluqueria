import AdminLayout from '@/components/AdminLayout';
import { useEffect, useMemo, useState } from 'react';

interface Booking {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  notes?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  service: { name: string; price?: number; totalDuration?: number };
  professionalId?: number | null;
  professional?: { id?: number; name: string } | null;
  status?: string;
  resource?: { name: string } | null;
}

function dateInputToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES');
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dateInputToday());
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const queryUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedDate) {
      params.set('from', `${selectedDate}T00:00:00`);
      params.set('to', `${selectedDate}T23:59:59`);
    }
    if (search.trim()) params.set('search', search.trim());
    return `/api/bookings?${params.toString()}`;
  }, [selectedDate, search]);

  async function loadBookings() {
    setLoading(true);
    const res = await fetch(queryUrl);
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryUrl]);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/bookings?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { setMessage('Estado actualizado.'); loadBookings(); }
    else setMessage('No se pudo actualizar el estado.');
  }

  async function deleteBooking(id: number) {
    const ok = window.confirm('¿Seguro que quieres cancelar/eliminar esta cita?');
    if (!ok) return;
    const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Cita eliminada correctamente.');
      loadBookings();
    } else {
      setMessage('No se pudo eliminar la cita.');
    }
  }

  return (
    <AdminLayout title="Citas">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Agenda de citas</h1>
          <p className="mt-2 text-gray-600">Consulta, busca y cancela reservas.</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-gray-300 p-3"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente, email o teléfono"
            className="rounded-xl border border-gray-300 p-3 md:w-72"
          />
        </div>
      </div>

      {message && <div className="mb-4 rounded-xl bg-green-100 p-3 text-green-800">{message}</div>}

      <section className="rounded-2xl bg-white p-4 shadow">
        {loading ? (
          <p>Cargando agenda...</p>
        ) : bookings.length === 0 ? (
          <p>No hay citas para los filtros seleccionados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-primary-light text-left text-gray-600">
                  <th className="px-3 py-3">Fecha</th>
                  <th className="px-3 py-3">Hora</th>
                  <th className="px-3 py-3">Cliente</th>
                  <th className="px-3 py-3">Contacto</th>
                  <th className="px-3 py-3">Servicio</th>
                  <th className="px-3 py-3">Profesional</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Notas</th>
                  <th className="px-3 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="px-3 py-3">{formatDate(booking.startTime)}</td>
                    <td className="px-3 py-3 font-semibold">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</td>
                    <td className="px-3 py-3">{booking.clientName}</td>
                    <td className="px-3 py-3">
                      <div>{booking.clientPhone || 'Sin teléfono'}</div>
                      <div className="text-xs text-gray-500">{booking.clientEmail}</div>
                    </td>
                    <td className="px-3 py-3">{booking.service.name}</td>
                    <td className="px-3 py-3">{booking.professional?.name || 'Sin asignar'}</td>
                    <td className="px-3 py-3">
                      <select value={booking.status || 'confirmed'} onChange={(e) => updateStatus(booking.id, e.target.value)} className="rounded-lg border border-gray-300 p-2">
                        <option value="confirmed">Confirmada</option>
                        <option value="done">Realizada</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="no_show">No asistió</option>
                      </select>
                    </td>
                    <td className="px-3 py-3 max-w-xs truncate">{booking.notes || '—'}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`https://wa.me/${(booking.clientPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${booking.clientName}, te recordamos tu cita de ${booking.service.name} el ${formatDate(booking.startTime)} a las ${formatTime(booking.startTime)}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-green-200 px-3 py-2 text-green-700 hover:bg-green-50"
                        >WhatsApp</a>
                        <button onClick={() => deleteBooking(booking.id)} className="rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
