import Layout from '@/components/Layout';
import Link from 'next/link';

const serviceAreas = [
  { title: 'Peluquería', text: 'Cortes, lavados, peinados y acabados personalizados.', icon: '✂️' },
  { title: 'Color & Mechas', text: 'Color completo, baño de color, matiz, mechas y babylights.', icon: '✨' },
  { title: 'Tratamientos', text: 'Hidratación, nutrición, recuperación capilar y alisados.', icon: '🌿' },
  { title: 'Estética', text: 'Cejas, depilación, higiene facial, manicura y pedicura.', icon: '♡' },
];

const values = [
  'Asesoramiento personalizado',
  'Especialistas en color y cuidado del cabello',
  'Ambiente cercano y acogedor',
  'Reserva online sencilla',
];

export default function Home() {
  return (
    <Layout title="Inicio">
      <section className="overflow-hidden rounded-[2.4rem] border border-white/80 bg-white/80 shadow-soft">
        <div className="grid items-center gap-0 md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-8 md:p-14">
            <p className="font-serif text-sm uppercase tracking-[0.35em] text-accent">Mezquitilla · Algarrobo Costa</p>
            <h1 className="mt-5 font-serif text-5xl leading-tight text-accent-dark md:text-7xl">
              <span className="font-script text-7xl md:text-8xl">Tu belleza,</span><br />nuestra pasión
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-700">
              En Gema Estudio de Belleza cuidamos de ti con servicios personalizados, productos de calidad y una atención cercana para realzar tu esencia.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/services" className="rounded-full bg-accent px-7 py-3 text-center font-bold text-white shadow-soft transition hover:bg-accent-dark">
                Reserva tu cita
              </Link>
              <Link href="/services" className="rounded-full border border-accent px-7 py-3 text-center font-bold text-accent transition hover:bg-primary">
                Ver servicios
              </Link>
            </div>
          </div>
          <div className="relative h-[430px] md:h-[560px]">
            <img src="/images/gema-fachada.jpg" alt="Fachada de Gema Estudio de Belleza" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/20 to-transparent md:bg-gradient-to-l" />
            <div className="absolute bottom-6 left-6 rounded-3xl bg-white/85 p-5 shadow-soft backdrop-blur md:left-auto md:right-6">
              <p className="font-script text-4xl text-accent-dark">Gema</p>
              <p className="uppercase tracking-[0.25em] text-xs text-gray-600">Estudio de Belleza</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 rounded-[2rem] bg-white/70 p-5 shadow-soft md:grid-cols-4">
        {values.map((value) => (
          <div key={value} className="rounded-2xl border border-primary bg-white/80 p-5 text-center font-semibold text-accent-dark">{value}</div>
        ))}
      </section>

      <section className="mt-12 text-center" id="servicios">
        <p className="font-script text-5xl text-accent">Nuestros</p>
        <h2 className="font-serif text-4xl text-accent-dark">servicios</h2>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">Cada cabello es único, y así lo trabajamos. Descubre todo lo que podemos hacer por ti.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {serviceAreas.map((item) => (
            <Link key={item.title} href="/services" className="group rounded-[1.8rem] border border-white/80 bg-white/90 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-primary-light text-3xl">{item.icon}</div>
              <h3 className="mt-5 font-serif text-2xl text-accent-dark">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
              <span className="mt-5 inline-flex rounded-full border border-accent px-4 py-2 text-sm font-bold text-accent group-hover:bg-accent group-hover:text-white">Ver servicios</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="sobre" className="mt-14 overflow-hidden rounded-[2.2rem] bg-white/85 shadow-soft">
        <div className="grid items-center md:grid-cols-[0.9fr_1.1fr]">
          <div className="p-8 md:p-12">
            <p className="font-script text-5xl text-accent">Sobre nosotros</p>
            <h2 className="mt-1 font-serif text-4xl text-accent-dark">Cuidamos tu piel, realzamos tu esencia</h2>
            <p className="mt-5 leading-8 text-gray-700">
              En Gema Estudio de Belleza trabajamos con pasión para ofrecer servicios de peluquería y estética personalizados. Nuestro objetivo es resaltar tu belleza natural mediante asesoramiento profesional, productos de calidad y una atención cercana.
            </p>
            <p className="mt-4 font-serif text-2xl text-accent-dark">Cada cabello es único, y así lo trabajamos.</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <img src="/images/gema-cartel.jpg" alt="Cartel de Gema Estudio de Belleza" className="h-80 w-full rounded-[1.6rem] object-cover shadow-soft" />
            <img src="/images/gema-servicios-estetica.jpg" alt="Servicios de estética Gema" className="h-80 w-full rounded-[1.6rem] object-cover object-top shadow-soft" />
          </div>
        </div>
      </section>

      <section className="mt-14 rounded-[2rem] bg-primary-light p-8 shadow-soft md:p-12">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="font-script text-5xl text-accent">Reserva tu cita</p>
            <p className="mt-3 text-gray-700">Tu tiempo es importante. Elige servicio, fecha y hora disponible y confirma tu reserva online.</p>
          </div>
          <Link href="/services" className="rounded-full bg-accent px-8 py-4 text-center font-bold text-white shadow-soft hover:bg-accent-dark">Reservar ahora</Link>
        </div>
      </section>

      <section id="contacto" className="mt-14 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-soft">
          <p className="font-script text-5xl text-accent">Contacto</p>
          <h2 className="font-serif text-3xl text-accent-dark">Estamos en Mezquitilla</h2>
          <div className="mt-6 space-y-4 text-gray-700">
            <p><strong>Teléfono / WhatsApp:</strong><br /><a className="text-accent font-bold" href="https://wa.me/34647067368" target="_blank" rel="noreferrer">647 067 368</a></p>
            <p><strong>Email:</strong><br /><a className="text-accent font-bold" href="mailto:gemasalonbelleza@gmail.com">gemasalonbelleza@gmail.com</a></p>
            <p><strong>Dirección:</strong><br />Calle Velero, 29750 Mezquitilla<br />Algarrobo Costa, Málaga</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] bg-white/90 p-3 shadow-soft">
          <iframe
            title="Mapa Gema Estudio de Belleza"
            src="https://www.google.com/maps?q=Calle%20Velero%2029750%20Mezquitilla%20Algarrobo%20Costa%20M%C3%A1laga&output=embed"
            className="h-[360px] w-full rounded-[1.6rem] border-0"
            loading="lazy"
          />
        </div>
      </section>
    </Layout>
  );
}
