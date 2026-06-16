import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

interface Professional {
  id: number;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  color?: string;
}

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/professionals');
    const data = await res.json();
    setProfessionals(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminLayout title="Trabajadoras">
      <h1 className="mb-2 text-3xl font-bold text-accent">Trabajadoras</h1>
      <p className="mb-6 text-gray-600">Equipo disponible para asignar citas y acceder al panel de trabajadoras.</p>

      <section className="rounded-2xl bg-white p-4 shadow">
        {loading ? (
          <p>Cargando trabajadoras...</p>
        ) : professionals.length === 0 ? (
          <p>No hay trabajadoras configuradas.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {professionals.map((professional) => (
              <article key={professional.id} className="rounded-2xl border border-primary p-5">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: professional.color || '#C79A7B' }} />
                  <h2 className="text-xl font-bold text-accent">{professional.name}</h2>
                </div>
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <p><b>Usuario:</b> {professional.username || 'Sin usuario'}</p>
                  {professional.email && <p><b>Email:</b> {professional.email}</p>}
                  {professional.phone && <p><b>Teléfono:</b> {professional.phone}</p>}
                  <p><b>Estado:</b> {professional.active === false ? 'Inactiva' : 'Activa'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
