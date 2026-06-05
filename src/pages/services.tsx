import Layout from '@/components/Layout';
import ServiceCard from '@/components/ServiceCard';
import { useEffect, useMemo, useState } from 'react';

interface Service {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  priceLabel?: string | null;
  totalDuration: number;
  category: { name: string };
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(services.map((s) => s.category?.name).filter(Boolean)))], [services]);
  const filtered = activeCategory === 'Todos' ? services : services.filter((s) => s.category?.name === activeCategory);

  return (
    <Layout title="Servicios">
      <section className="mb-8 overflow-hidden rounded-[2.2rem] bg-white/85 shadow-soft">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_0.5fr]">
          <div className="p-8 md:p-12">
            <p className="font-script text-5xl text-accent">Carta de servicios</p>
            <h1 className="mt-2 font-serif text-4xl text-accent-dark md:text-5xl">Encuentra el servicio perfecto para ti</h1>
            <p className="mt-4 max-w-3xl text-gray-600">
              Los precios con rango se mantienen porque pueden variar según longitud, cantidad de producto, técnica y diagnóstico profesional.
            </p>
          </div>
          <img src="/images/gema-tarifa-completa.jpg" alt="Carta de precios Gema" className="h-64 w-full object-cover object-top md:h-full" />
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl bg-white/80 p-8 shadow-soft">Cargando servicios...</div>
      ) : (
        <>
          <div className="mb-7 flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition ${activeCategory === category ? 'bg-accent text-white shadow-soft' : 'bg-white text-gray-600 hover:bg-primary-light hover:text-accent'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
        </>
      )}
    </Layout>
  );
}
