import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

interface Professional {
  id: number;
  name: string;
  bio?: string | null;
  specialties: string[];
}

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/professionals')
      .then((res) => res.json())
      .then((data) => setProfessionals(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Profesionales">
      <h1 className="text-3xl font-bold text-accent mb-2">Profesionales</h1>
      <p className="mb-6 text-gray-600">Equipo disponible para asignar citas.</p>

      <section className="rounded-2xl bg-white p-4 shadow">
        {loading ? (
          <p>Cargando profesionales...</p>
        ) : professionals.length === 0 ? (
          <p>No hay profesionales configurados.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {professionals.map((professional) => (
              <article key={professional.id} className="rounded-2xl border border-primary p-5">
                <h2 className="text-xl font-bold text-accent">{professional.name}</h2>
                <p className="mt-2 text-sm text-gray-600">{professional.bio || 'Sin biografía configurada'}</p>
                {professional.specialties.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {professional.specialties.map((item) => (
                      <span key={item} className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium">
                        {item}
                      </span>
                    ))}
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
