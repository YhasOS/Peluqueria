import Head from 'next/head';
import Link from 'next/link';
import { ReactNode } from 'react';

const salonName = 'Gema Estudio de Belleza';
const phone = '647 067 368';
const email = 'gemasalonbelleza@gmail.com';
const address = 'Calle Velero, 29750 Mezquitilla (Algarrobo Costa), Málaga';

type Props = {
  title?: string;
  children: ReactNode;
};

export default function Layout({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fffaf6_0,#f5ebe4_42%,#ead8cf_100%)] text-text font-sans">
      <Head>
        <title>{title ? `${title} | ${salonName}` : salonName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Gema Estudio de Belleza en Mezquitilla, Algarrobo Costa. Peluquería, color, mechas, estética, manicura, pedicura y tratamientos capilares con reserva online." />
      </Head>

      <div className="hidden border-b border-white/70 bg-rosebar text-sm text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex flex-wrap items-center gap-6">
            <a href="tel:+34647067368" className="hover:underline">☎ {phone}</a>
            <a href={`mailto:${email}`} className="hover:underline">✉ {email}</a>
            <span>📍 {address}</span>
          </div>
          <a href="https://wa.me/34647067368" target="_blank" rel="noreferrer" className="font-semibold hover:underline">WhatsApp</a>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="font-script text-4xl leading-none text-accent-dark md:text-5xl">Gema</span>
            <span className="hidden border-l border-accent/40 pl-3 text-xs uppercase tracking-[0.28em] text-gray-600 sm:block">Estudio de Belleza</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold text-gray-700 sm:gap-3 sm:text-base">
            <Link href="/" className="rounded-full px-3 py-2 hover:bg-primary-light hover:text-accent">Inicio</Link>
            <Link href="/services" className="rounded-full px-3 py-2 hover:bg-primary-light hover:text-accent">Servicios</Link>
            <Link href="/#sobre" className="hidden rounded-full px-3 py-2 hover:bg-primary-light hover:text-accent md:inline-flex">Sobre nosotros</Link>
            <Link href="/#contacto" className="hidden rounded-full px-3 py-2 hover:bg-primary-light hover:text-accent md:inline-flex">Contacto</Link>
            <Link href="/services" className="rounded-full bg-accent px-4 py-2 text-white shadow-soft hover:bg-accent-dark">Reservar</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="mt-12 border-t border-white/70 bg-white/80 py-8 text-sm text-gray-700">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="font-script text-4xl text-accent-dark">Gema</p>
            <p className="mt-1 uppercase tracking-[0.25em] text-xs text-gray-500">Estudio de Belleza</p>
            <p className="mt-4 max-w-md">Especialistas en color, cuidado del cabello, estética y belleza personalizada en Mezquitilla.</p>
          </div>
          <div>
            <p className="font-bold text-accent-dark">Contacto</p>
            <p className="mt-3">{phone}</p>
            <p>{email}</p>
            <p>{address}</p>
          </div>
          <div>
            <p className="font-bold text-accent-dark">Reserva online</p>
            <p className="mt-3">Elige servicio, fecha y hora disponible desde cualquier dispositivo.</p>
            <Link href="/services" className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 font-bold text-white">Reservar cita</Link>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-primary px-4 pt-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {salonName}. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
