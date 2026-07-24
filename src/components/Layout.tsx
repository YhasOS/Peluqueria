import Head from 'next/head';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';

const salonName = 'Gema Estudio de Belleza';
const phone = '647 067 368';
const email = 'info@gemaestudiodebelleza.es';
const address = 'Calle Velero, 29750 Mezquitilla (Algarrobo Costa), Málaga';
const whatsappUrl = 'https://wa.me/34647067368?text=Hola%20Gema%2C%20me%20gustar%C3%ADa%20pedir%20informaci%C3%B3n%20o%20reservar%20una%20cita.';

type Props = { title?: string; children: ReactNode };

function Monogram({ small = false }: { small?: boolean }) {
  return (
    <span className={`relative inline-flex items-center justify-center rounded-full border border-accent/40 bg-secondary shadow-soft ${small ? 'h-12 w-12' : 'h-20 w-20'}`}>
      <span className={`font-serif leading-none text-accent-dark ${small ? 'text-2xl' : 'text-5xl'}`}>G</span>
      <span className={`-ml-2 mt-2 font-serif leading-none text-accent ${small ? 'text-xl' : 'text-4xl'}`}>E</span>
      <span className="absolute -right-2 -top-2 text-accent/70">✦</span>
    </span>
  );
}

export default function Layout({ title, children }: Props) {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => null);
    const handler = (event: any) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function installApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fffdf9_0,#f7eee8_38%,#ead7cd_100%)] text-text font-sans">
      <Head>
        <title>{title ? `${title} | ${salonName}` : salonName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Gema Estudio de Belleza en Mezquitilla, Algarrobo Costa. Especialistas en color, cuidado del cabello, peluquería, estética y reserva online." />
        <meta name="theme-color" content="#c9a992" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Gema Belleza" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta property="og:title" content="Gema Estudio de Belleza" />
        <meta property="og:description" content="Especialistas en color y cuidado del cabello en Mezquitilla, Algarrobo Costa." />
        <meta property="og:image" content="/images/gema-fachada.jpg" />
      </Head>

      <div className="hidden border-b border-white/70 bg-rosebar text-sm text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex flex-wrap items-center gap-6">
            <a href="tel:+34647067368" className="hover:underline">☎ {phone}</a>
            <a href={`mailto:${email}`} className="hover:underline">✉ {email}</a>
            <span>📍 {address}</span>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="font-semibold hover:underline">WhatsApp</a>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-white/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <Monogram small />
            <span>
              <span className="block font-script text-3xl leading-none text-accent-dark md:text-4xl">Gema</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-gray-600">Estudio de Belleza</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold text-gray-700 sm:gap-3 sm:text-base">
            <Link href="/" className="rounded-full px-3 py-2 hover:bg-primary-light hover:text-accent">Inicio</Link>
            <Link href="/services" className="rounded-full px-3 py-2 hover:bg-primary-light hover:text-accent">Servicios</Link>
            <Link href="/mi-cuenta" className="rounded-full px-3 py-2 hover:bg-primary-light hover:text-accent">Mi cuenta</Link>
            <Link href="/#contacto" className="hidden rounded-full px-3 py-2 hover:bg-primary-light hover:text-accent md:inline-flex">Contacto</Link>
            <Link href="/services" className="rounded-full bg-accent px-4 py-2 text-white shadow-soft hover:bg-accent-dark">Reservar</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>

      {canInstall && (
        <button onClick={installApp} className="fixed bottom-20 right-5 z-40 rounded-full bg-accent-dark px-5 py-3 text-sm font-extrabold text-white shadow-2xl hover:scale-105">
          Instalar app
        </button>
      )}

      <a href={whatsappUrl} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-extrabold text-white shadow-2xl transition hover:scale-105" aria-label="Contactar por WhatsApp">
        <span className="text-lg">☘</span> WhatsApp
      </a>

      <footer className="mt-12 border-t border-white/70 bg-white/85 py-8 text-sm text-gray-700">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3"><Monogram small /><div><p className="font-script text-4xl text-accent-dark">Gema</p><p className="uppercase tracking-[0.25em] text-xs text-gray-500">Estudio de Belleza</p></div></div>
            <p className="mt-4 max-w-md">Especialistas en color, cuidado del cabello, estética y belleza personalizada en Mezquitilla.</p>
          </div>
          <div>
            <p className="font-bold text-accent-dark">Contacto</p>
            <p className="mt-3">{phone}</p><p>{email}</p><p>{address}</p>
          </div>
          <div>
            <p className="font-bold text-accent-dark">App de clientas</p>
            <p className="mt-3">Instala la web como aplicación y consulta tus próximas citas, historial y tratamientos.</p>
            <Link href="/mi-cuenta" className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 font-bold text-white">Mi cuenta</Link>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold text-[#8a5a42]">
            Profesionales
            </h3>

          <p className="mb-3 text-sm text-gray-600">
            Gestiona tu agenda, crea citas y consulta las reservas.
          </p>

          <a
            href="/staff/login"
            className="mt-5 inline-flex rounded-full bg-accent px-5 py-2 font-bold text-white hover:opacity-90 transition"
          >
            Acceder
          </a>
        </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-primary px-4 pt-5 text-center text-xs text-gray-500">© {new Date().getFullYear()} {salonName}. Todos los derechos reservados. · Aviso legal · Política de privacidad</div>
      </footer>
    </div>
  );
}
