import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) router.push('/admin');
    else setError('Contraseña incorrecta.');
  }

  return (
    <main className="min-h-screen bg-primary-light flex items-center justify-center p-4">
      <Head><title>Acceso administrador</title></Head>
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-accent">Salón Belleza</h1>
        <p className="mt-2 text-gray-600">Acceso al panel de administración.</p>
        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</div>}
        <label className="mt-6 block text-sm font-semibold">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 p-3"
          autoFocus
          required
        />
        <button className="mt-6 w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white hover:bg-accent/90" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="mt-4 text-xs text-gray-500">Contraseña inicial: admin123. Cámbiala en el archivo .env con ADMIN_PASSWORD.</p>
      </form>
    </main>
  );
}
