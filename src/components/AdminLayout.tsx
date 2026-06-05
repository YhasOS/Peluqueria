import Head from 'next/head';
import Link from 'next/link';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';

type Props = {
  title?: string;
  children: ReactNode;
};

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'Agenda' },
  { href: '/admin/calendar', label: 'Vista diaria' },
  { href: '/admin/customers', label: 'Clientes' },
  { href: '/admin/services', label: 'Servicios' },
  { href: '/admin/professionals', label: 'Profesionales' },
  { href: '/admin/settings', label: 'Configuración' },
  { href: '/', label: 'Ver web' },
];

export default function AdminLayout({ title, children }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/admin/login') return;
    const hasCookie = document.cookie.includes('salon_admin_auth=');
    if (!hasCookie) router.replace('/admin/login');
  }, [router]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-primary-light text-text">
      <Head>
        <title>{title ? `${title} | Panel Admin` : 'Panel Admin'}</title>
      </Head>
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-white/90 shadow-md p-5">
          <h2 className="text-2xl font-bold text-accent mb-6">Gema Estudio</h2>
          <nav className="flex md:block gap-3 overflow-x-auto md:space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block whitespace-nowrap rounded-xl px-3 py-2 font-medium hover:bg-primary-light hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
            <button onClick={logout} className="block whitespace-nowrap rounded-xl px-3 py-2 text-left font-medium text-red-700 hover:bg-red-50">
              Salir
            </button>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
