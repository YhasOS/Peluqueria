import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';

type Settings = { businessName: string; whatsappPhone: string; openingHour: string; closingHour: string; saturdayOpeningHour: string; saturdayClosingHour: string; slotMinutes: string | number; closedDays: string };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ businessName: '', whatsappPhone: '', openingHour: '09:00', closingHour: '19:00', saturdayOpeningHour: '09:00', saturdayClosingHour: '14:00', slotMinutes: 30, closedDays: '0' });
  const [message, setMessage] = useState('');
  useEffect(() => { fetch('/api/settings').then(r => r.json()).then(d => setSettings(d)); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    setMessage(res.ok ? 'Configuración guardada.' : 'No se pudo guardar. Ejecuta SUPABASE_UPGRADE.sql.');
  }
  function set<K extends keyof Settings>(key: K, value: Settings[K]) { setSettings({ ...settings, [key]: value }); }
  return (
    <AdminLayout title="Configuración">
      <h1 className="text-3xl font-bold text-accent">Configuración</h1>
      <p className="mt-2 text-gray-600">Horario, WhatsApp y datos básicos del salón.</p>
      {message && <div className="mt-5 rounded-xl bg-green-100 p-3 text-green-800">{message}</div>}
      <form onSubmit={save} className="mt-6 max-w-3xl rounded-2xl bg-white p-6 shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block"><span className="font-semibold">Nombre del negocio</span><input value={settings.businessName} onChange={e => set('businessName', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 p-3" /></label>
          <label className="block"><span className="font-semibold">WhatsApp negocio</span><input value={settings.whatsappPhone} onChange={e => set('whatsappPhone', e.target.value)} placeholder="34600111222" className="mt-1 w-full rounded-xl border border-gray-300 p-3" /></label>
          <label className="block"><span className="font-semibold">Apertura lunes-viernes</span><input type="time" value={settings.openingHour} onChange={e => set('openingHour', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 p-3" /></label>
          <label className="block"><span className="font-semibold">Cierre lunes-viernes</span><input type="time" value={settings.closingHour} onChange={e => set('closingHour', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 p-3" /></label>
          <label className="block"><span className="font-semibold">Apertura sábado</span><input type="time" value={settings.saturdayOpeningHour} onChange={e => set('saturdayOpeningHour', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 p-3" /></label>
          <label className="block"><span className="font-semibold">Cierre sábado</span><input type="time" value={settings.saturdayClosingHour} onChange={e => set('saturdayClosingHour', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 p-3" /></label>
          <label className="block"><span className="font-semibold">Intervalo de citas</span><select value={String(settings.slotMinutes)} onChange={e => set('slotMinutes', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 p-3"><option value="15">15 minutos</option><option value="30">30 minutos</option></select></label>
          <label className="block"><span className="font-semibold">Días cerrados</span><input value={settings.closedDays} onChange={e => set('closedDays', e.target.value)} placeholder="0 para domingo, 0,1 para domingo y lunes" className="mt-1 w-full rounded-xl border border-gray-300 p-3" /><span className="text-xs text-gray-500">0 domingo, 1 lunes, 2 martes...</span></label>
        </div>
        <button className="mt-6 rounded-xl bg-accent px-6 py-3 font-semibold text-white">Guardar configuración</button>
      </form>
    </AdminLayout>
  );
}
