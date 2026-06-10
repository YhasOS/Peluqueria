import Layout from '@/components/Layout';
import Link from 'next/link';

const serviceAreas = [
  { title: 'Corte', text: 'Corte mujer, caballero, infantil y cambios de look con asesoramiento.', icon: '✂️' },
  { title: 'Peinados', text: 'Peinados para cabello corto, medio, largo, extra largo y difusor.', icon: '♨️' },
  { title: 'Color', text: 'Color completo, raíz, matiz, corte con color y diagnóstico de tono.', icon: '🎨' },
  { title: 'Mechas', text: 'Mechas clásicas, iluminación y pack balayage con tratamiento plex.', icon: '✦' },
  { title: 'Tratamientos', text: 'Plex reconstrucción, hidratación, nutrición, colágeno, mascarillas y ampollas.', icon: '🌿' },
  { title: 'Estética', text: 'Cejas, pestañas, depilación, manicura, pedicura y cuidado de manos y pies.', icon: '♡' },
];

const highlights = [
  'Especialista en color y cuidado del cabello',
  'Asesoramiento personalizado',
  'Ambiente cercano y acogedor',
  'Reserva online sencilla',
];

export default function Home() {
  return (
    <Layout title="Inicio">
      <section className="relative overflow-hidden rounded-[2.6rem] border border-white/80 bg-white/85 shadow-soft">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-[#f6e4d8]/80 blur-3xl" />
        <div className="grid items-center gap-0 md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10 p-8 md:p-14">
            <p className="font-serif text-sm uppercase tracking-[0.35em] text-accent">Mezquitilla · Algarrobo Costa</p>
            <div className="mt-7 inline-flex items-center gap-4 rounded-full border border-accent/25 bg-secondary/70 px-5 py-3 shadow-soft">
              <span className="font-serif text-4xl text-accent-dark">GE</span>
              <span className="text-xs uppercase tracking-[0.28em] text-gray-600">Gema Estudio de Belleza</span>
            </div>
            <h1 className="mt-7 font-serif text-5xl leading-tight text-accent-dark md:text-7xl">
              <span className="font-script text-7xl md:text-8xl">Tu belleza,</span><br />nuestra pasión
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-700">
              Especialistas en color y cuidado del cabello. En Gema Estudio de Belleza cuidamos tu cabello, realzamos tu esencia y te asesoramos de forma personalizada.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/services" className="rounded-full bg-accent px-7 py-3 text-center font-bold text-white shadow-soft transition hover:bg-accent-dark">
                Reserva tu cita
              </Link>
              <Link href="/services" className="rounded-full border border-accent px-7 py-3 text-center font-bold text-accent transition hover:bg-primary">
                Ver todos los servicios
              </Link>
            </div>
          </div>
          <div className="relative h-[430px] md:h-[620px]">
            <img src="/images/ge-branding-precios.png" alt="Imagen corporativa Gema Estudio de Belleza" className="h-full w-full object-cover object-left" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/15 to-transparent" />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 rounded-[2rem] bg-white/75 p-5 shadow-soft md:grid-cols-4">
        {highlights.map((value) => (
          <div key={value} className="rounded-2xl border border-primary bg-white/80 p-5 text-center font-semibold text-accent-dark">{value}</div>
        ))}
      </section>

      <section className="mt-14 text-center" id="servicios">
        <p className="font-script text-5xl text-accent">Nuestra carta</p>
        <h2 className="font-serif text-4xl text-accent-dark">Servicios de peluquería y estética</h2>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">Precios orientativos con rango cuando el trabajo puede variar según longitud, cantidad de producto o técnica. Si tienes dudas, consúltanos por WhatsApp antes de reservar.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
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

      <section className="mt-14 overflow-hidden rounded-[2.2rem] bg-white/90 shadow-soft">
        <div className="grid items-center md:grid-cols-[1fr_0.95fr]">
          <div className="p-8 md:p-12">
            <p className="font-script text-5xl text-accent">Servicios destacados</p>
            <h2 className="mt-1 font-serif text-4xl text-accent-dark">Color, mechas, tratamientos y cuidado completo</h2>
            <div className="mt-6 grid gap-4 text-gray-700 sm:grid-cols-2">
              <div className="rounded-2xl bg-primary-light p-5"><strong>Pack mechas balayage</strong><br />Desde 120€ - 130€. Incluye corte, protección plex, matizador y corrección de color.</div>
              <div className="rounded-2xl bg-primary-light p-5"><strong>Tratamiento plex reconstrucción</strong><br />Tratamiento reparador para cabellos sensibilizados.</div>
              <div className="rounded-2xl bg-primary-light p-5"><strong>Servicios especiales</strong><br />Transición a canas y cambio de look bajo consulta.</div>
              <div className="rounded-2xl bg-primary-light p-5"><strong>Mirada y estética</strong><br />Cejas, pestañas, depilación y manos y pies.</div>
            </div>
          </div>
          <img src="/images/gema-tarifa-final.jpg" alt="Carta final de servicios Gema" className="h-[620px] w-full object-cover object-top" />
        </div>
      </section>

      <section id="sobre" className="mt-14 overflow-hidden rounded-[2.2rem] bg-white/85 shadow-soft">
        <div className="grid items-center md:grid-cols-[0.9fr_1.1fr]">
          <div className="p-8 md:p-12">
            <p className="font-script text-5xl text-accent">Sobre Gema</p>
            <h2 className="mt-1 font-serif text-4xl text-accent-dark">Cuidamos tu cabello, realzamos tu esencia</h2>
            <p className="mt-5 leading-8 text-gray-700">
              En Gema Estudio de Belleza trabajamos con pasión para ofrecer servicios de peluquería y estética personalizados. Nuestro objetivo es resaltar tu belleza natural mediante asesoramiento profesional, productos de calidad y una atención cercana.
            </p>
            <p className="mt-4 font-serif text-2xl text-accent-dark">Cada cabello es único, y así lo trabajamos.</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <img src="/images/gema-fachada.jpg" alt="Fachada de Gema Estudio de Belleza" className="h-80 w-full rounded-[1.6rem] object-cover shadow-soft" />
            <img src="/images/gema-cartel.jpg" alt="Cartel de Gema Estudio de Belleza" className="h-80 w-full rounded-[1.6rem] object-cover shadow-soft" />
          </div>
        </div>
      </section>

      <section className="mt-14 rounded-[2rem] bg-primary-light p-8 shadow-soft md:p-12">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="font-script text-5xl text-accent">Reserva tu cita</p>
            <p className="mt-3 text-gray-700">Elige servicio, fecha y hora disponible. Para servicios con precio variable, te confirmaremos el presupuesto final según diagnóstico.</p>
          </div>
          <Link href="/services" className="rounded-full bg-accent px-8 py-4 text-center font-bold text-white shadow-soft hover:bg-accent-dark">Reservar ahora</Link>
        </div>
      </section>


      <section className="mt-14 overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/90 shadow-soft">
        <div className="grid items-center md:grid-cols-[0.95fr_1.05fr]">
          <div className="p-8 md:p-12">
            <p className="font-script text-5xl text-accent">Tu app de belleza</p>
            <h2 className="mt-1 font-serif text-4xl text-accent-dark">Instala Gema en tu móvil</h2>
            <p className="mt-5 leading-8 text-gray-700">Desde la web podrás instalar la aplicación en tu móvil para reservar más rápido, consultar tus próximas citas, revisar servicios realizados y mantener tu historial de tratamientos.</p>
            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-primary-light p-4"><strong>Reservas guardadas</strong><br />Consulta fecha, hora, servicio y profesional.</div>
              <div className="rounded-2xl bg-primary-light p-4"><strong>Historial</strong><br />Revisa citas pasadas, notas y tratamientos.</div>
              <div className="rounded-2xl bg-primary-light p-4"><strong>Acceso rápido</strong><br />Instálala como app desde Chrome o Safari.</div>
              <div className="rounded-2xl bg-primary-light p-4"><strong>Nueva cita</strong><br />Reserva otra vez en pocos toques.</div>
            </div>
            <Link href="/mi-cuenta" className="mt-8 inline-flex rounded-full bg-accent px-7 py-3 font-bold text-white shadow-soft hover:bg-accent-dark">Abrir mi cuenta</Link>
          </div>
          <div className="bg-primary-light p-8 md:p-12">
            <div className="mx-auto max-w-sm rounded-[2rem] border border-accent/20 bg-white p-5 shadow-2xl">
              <div className="rounded-[1.5rem] bg-[radial-gradient(circle_at_top,#fffdf9,#ead7cd)] p-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-white font-serif text-4xl text-accent-dark">GE</div>
                <h3 className="mt-5 text-center font-serif text-2xl text-accent-dark">Gema Belleza</h3>
                <p className="mt-2 text-center text-sm text-gray-600">Tus citas, tratamientos y reservas siempre a mano.</p>
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-white/80 p-4 text-sm"><strong>Próxima cita</strong><br />Color raíz + peinado · 10:30</div>
                  <div className="rounded-2xl bg-white/80 p-4 text-sm"><strong>Último servicio</strong><br />Tratamiento plex reconstrucción</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="mt-14 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-soft">
          <p className="font-script text-5xl text-accent">Contacto</p>
          <h2 className="font-serif text-3xl text-accent-dark">Estamos en Mezquitilla</h2>
          <div className="mt-6 space-y-4 text-gray-700">
            <p><strong>Teléfono / WhatsApp:</strong><br /><a className="text-accent font-bold" href="https://wa.me/34647067368" target="_blank" rel="noreferrer">647 067 368</a></p>
            <p><strong>Email:</strong><br /><a className="text-accent font-bold" href="mailto:info@gemaestudiodebelleza.es">info@gemaestudiodebelleza.es</a></p>
            <p><strong>Dirección:</strong><br />Calle Velero, 29750 Mezquitilla<br />Algarrobo Costa, Málaga</p>
            <p><strong>Instagram:</strong><br />@gema.estudiobelleza</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] bg-white/90 p-3 shadow-soft">
          <iframe title="Mapa Gema Estudio de Belleza" src="https://www.google.com/maps?q=Calle%20Velero%2029750%20Mezquitilla%20Algarrobo%20Costa%20M%C3%A1laga&output=embed" className="h-full min-h-[360px] w-full rounded-[1.6rem] border-0" loading="lazy" />
        </div>
      </section>
    </Layout>
  );
}
