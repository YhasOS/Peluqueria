import Link from 'next/link';

type Service = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  priceLabel?: string | null;
  totalDuration: number;
  category: { name: string };
};

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex h-full flex-col justify-between overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/95 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-accent-dark">
            {service.category?.name || 'Servicio'}
          </span>
          <span className="text-sm font-semibold text-gray-500">{service.totalDuration} min</span>
        </div>
        <h3 className="font-serif text-2xl text-accent-dark">{service.name}</h3>
        <p className="mt-3 min-h-[56px] text-sm leading-6 text-gray-600">{service.description}</p>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-primary bg-primary-light/60 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Precio</p>
          <span className="text-2xl font-extrabold text-gray-900">{service.priceLabel || `${service.price.toFixed(2)}€`}</span>
        </div>
        <Link href={`/booking?serviceId=${service.id}`} className="rounded-full bg-accent px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-accent-dark">
          Reservar
        </Link>
      </div>
    </article>
  );
}
