import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: number;
  clientName: string;
  startTime: string;
  service: { name: string };
  professional?: { name: string } | null;
}

interface Stats {
  totalBookings: number;
  todayBookings: number;
  services: number;
  professionals: number;
  nextBookings: Booking[];
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES');
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Panel de administración</h1>
          <p className="mt-2 text-gray-600">Resumen rápido de reservas, servicios y profesionales.</p>
        </div>
        <div className="flex gap-2"><Link href="/admin/reports" className="rounded-xl bg-white px-5 py-3 font-semibold text-accent shadow">Resumen negocio</Link><Link href="/admin/bookings" className="rounded-xl bg-accent px-5 py-3 font-semibold text-white shadow hover:bg-accent/90">Ver agenda</Link></div>
      </div>

      {loading || !stats ? (
        <p>Cargando panel...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Citas totales</p>
              <p className="mt-2 text-3xl font-bold text-accent">{stats.totalBookings}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Citas hoy</p>
              <p className="mt-2 text-3xl font-bold text-accent">{stats.todayBookings}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Servicios</p>
              <p className="mt-2 text-3xl font-bold text-accent">{stats.services}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Profesionales</p>
              <p className="mt-2 text-3xl font-bold text-accent">{stats.professionals}</p>
            </div>
          </div>

          <section className="mt-8 rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-xl font-bold text-accent">Próximas citas</h2>
            {stats.nextBookings.length === 0 ? (
              <p>No hay próximas citas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-2 pr-3">Fecha</th>
                      <th className="py-2 pr-3">Hora</th>
                      <th className="py-2 pr-3">Cliente</th>
                      <th className="py-2 pr-3">Servicio</th>
                      <th className="py-2 pr-3">Profesional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.nextBookings.map((booking) => (
                      <tr key={booking.id} className="border-b last:border-0">
                        <td className="py-3 pr-3">{formatDate(booking.startTime)}</td>
                        <td className="py-3 pr-3 font-semibold">{formatTime(booking.startTime)}</td>
                        <td className="py-3 pr-3">{booking.clientName}</td>
                        <td className="py-3 pr-3">{booking.service.name}</td>
                        <td className="py-3 pr-3">{booking.professional?.name ?? 'Sin asignar'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </AdminLayout>
  );
}
