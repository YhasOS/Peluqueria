import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

interface ServicePhase {
  id: number;
  name: string;
  duration: number;
  exclusive: boolean;
}

interface Service {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  priceLabel?: string | null;
  totalDuration: number;
  category?: { name: string } | null;
  phases?: ServicePhase[];
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Servicios">
      <h1 className="text-3xl font-bold text-accent mb-2">Servicios</h1>
      <p className="mb-6 text-gray-600">Listado de servicios cargados desde Supabase.</p>

      <section className="rounded-2xl bg-white p-4 shadow">
        {loading ? (
          <p>Cargando servicios...</p>
        ) : services.length === 0 ? (
          <p>No hay servicios configurados.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-2xl border border-primary p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-accent">{service.name}</h2>
                    <p className="text-sm text-gray-500">{service.category?.name || 'Sin categoría'}</p>
                  </div>
                  <div className="text-right font-bold">{service.priceLabel || `${service.price.toFixed(2)} €`}</div>
                </div>
                <p className="mt-3 text-sm">{service.description || 'Sin descripción'}</p>
                <p className="mt-2 text-sm font-semibold">Duración total: {service.totalDuration} min</p>
                {service.phases && service.phases.length > 0 && (
                  <div className="mt-4 rounded-xl bg-primary-light p-3 text-sm">
                    <p className="mb-2 font-semibold">Fases</p>
                    <ul className="space-y-1">
                      {service.phases.map((phase) => (
                        <li key={phase.id} className="flex justify-between gap-3">
                          <span>{phase.name}</span>
                          <span>{phase.duration} min {phase.exclusive ? '· exclusiva' : '· espera'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
