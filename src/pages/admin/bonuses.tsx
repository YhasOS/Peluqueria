import AdminLayout from '@/components/AdminLayout';
import { useEffect, useMemo, useState } from 'react';

type Service = { id: number; name: string; price: number };
type Customer = { id: number; name: string; email: string; phone?: string | null };
type BonusType = {
  id: number;
  name: string;
  sessions: number;
  price: number;
  discountPercent?: number | null;
  active: boolean;
  services: Service[];
  activeCustomerBonuses?: number;
};
type CustomerBonus = {
  id: number;
  customerName: string;
  customerEmail: string;
  bonusName: string;
  initialSessions: number;
  remainingSessions: number;
  expiryDate?: string | null;
  active: boolean;
  services: { id: number; name: string }[];
};

function money(value: any) {
  return `${Number(value || 0).toFixed(2)} €`;
}

function percent(value: any) {
  if (value === null || value === undefined || value === '') return '—';
  return `${Number(value).toFixed(0)}%`;
}

export default function AdminBonusesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bonusTypes, setBonusTypes] = useState<BonusType[]>([]);
  const [customerBonuses, setCustomerBonuses] = useState<CustomerBonus[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [bonusForm, setBonusForm] = useState({
    name: '',
    sessions: '10',
    price: '',
    discountPercent: '',
    serviceIds: [] as number[],
  });

  const [assignForm, setAssignForm] = useState({
    customerId: '',
    bonusTypeId: '',
    expiryDate: '',
  });

  async function load() {
    setLoading(true);
    const [servicesData, customersData, bonusTypesData, customerBonusesData] = await Promise.all([
      fetch('/api/services').then((r) => r.json()).catch(() => []),
      fetch('/api/customers').then((r) => r.json()).catch(() => []),
      fetch('/api/bonus-types').then((r) => r.json()).catch(() => []),
      fetch('/api/customer-bonuses').then((r) => r.json()).catch(() => []),
    ]);
    setServices(Array.isArray(servicesData) ? servicesData : []);
    setCustomers(Array.isArray(customersData) ? customersData : []);
    setBonusTypes(Array.isArray(bonusTypesData) ? bonusTypesData : []);
    setCustomerBonuses(Array.isArray(customerBonusesData) ? customerBonusesData : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const selectedServices = useMemo(
    () => services.filter((s) => bonusForm.serviceIds.includes(s.id)),
    [services, bonusForm.serviceIds]
  );

  const referenceNormalPrice = useMemo(() => {
    if (selectedServices.length !== 1) return null;
    return selectedServices[0].price * Number(bonusForm.sessions || 0);
  }, [selectedServices, bonusForm.sessions]);

  const calculatedDiscount = useMemo(() => {
    if (!referenceNormalPrice || !Number(bonusForm.price)) return null;
    return Math.max(0, 100 - (Number(bonusForm.price) / referenceNormalPrice) * 100);
  }, [referenceNormalPrice, bonusForm.price]);

  function toggleService(id: number) {
    setBonusForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(id)
        ? current.serviceIds.filter((serviceId) => serviceId !== id)
        : [...current.serviceIds, id],
    }));
  }

  async function createBonus(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const discountPercent = bonusForm.discountPercent || (calculatedDiscount !== null ? calculatedDiscount.toFixed(0) : '');
    const res = await fetch('/api/bonus-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bonusForm, discountPercent }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || 'No se pudo crear el bono.');
      return;
    }
    setMessage('Bono creado correctamente.');
    setBonusForm({ name: '', sessions: '10', price: '', discountPercent: '', serviceIds: [] });
    await load();
  }

  async function assignBonus(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/customer-bonuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignForm),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || 'No se pudo asignar el bono.');
      return;
    }
    setMessage('Bono asignado correctamente a la clienta.');
    setAssignForm({ customerId: '', bonusTypeId: '', expiryDate: '' });
    await load();
  }

  async function toggleBonusType(id: number, active: boolean) {
    await fetch('/api/bonus-types', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    });
    await load();
  }

  async function toggleCustomerBonus(id: number, active: boolean) {
    await fetch('/api/customer-bonuses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    });
    await load();
  }

  return (
    <AdminLayout title="Bonos">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-accent">Bonos</h1>
        <p className="mt-2 text-gray-600">
          Crea bonos por sesiones, elige los servicios aplicables y asígnalos a clientas.
        </p>
      </div>

      {message && <div className="mb-4 rounded-xl bg-primary-light p-3 font-semibold text-accent-dark">{message}</div>}

      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow">Cargando bonos...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl bg-white p-5 shadow xl:col-span-1">
            <h2 className="mb-4 text-xl font-bold text-accent">Crear tipo de bono</h2>
            <form onSubmit={createBonus} className="space-y-3">
              <input value={bonusForm.name} onChange={(e) => setBonusForm({ ...bonusForm, name: e.target.value })} placeholder="Nombre del bono" className="w-full rounded-xl border border-gray-300 p-3" required />
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="number" min="1" value={bonusForm.sessions} onChange={(e) => setBonusForm({ ...bonusForm, sessions: e.target.value })} placeholder="Sesiones" className="w-full rounded-xl border border-gray-300 p-3" required />
                <input type="number" step="0.01" min="0" value={bonusForm.price} onChange={(e) => setBonusForm({ ...bonusForm, price: e.target.value })} placeholder="Precio bono" className="w-full rounded-xl border border-gray-300 p-3" required />
              </div>
              <input type="number" step="1" min="0" max="100" value={bonusForm.discountPercent} onChange={(e) => setBonusForm({ ...bonusForm, discountPercent: e.target.value })} placeholder={calculatedDiscount !== null ? `Descuento sugerido: ${calculatedDiscount.toFixed(0)}%` : 'Descuento % opcional'} className="w-full rounded-xl border border-gray-300 p-3" />

              <div className="rounded-xl border border-gray-100 p-3">
                <p className="mb-2 font-semibold text-accent">Servicios aplicables</p>
                <div className="max-h-64 space-y-2 overflow-auto pr-1">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-primary-light">
                      <input type="checkbox" checked={bonusForm.serviceIds.includes(service.id)} onChange={() => toggleService(service.id)} />
                      <span className="text-sm">{service.name} · {money(service.price)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {referenceNormalPrice !== null && (
                <div className="rounded-xl bg-primary-light p-3 text-sm text-accent-dark">
                  Precio normal orientativo: <strong>{money(referenceNormalPrice)}</strong>.{' '}
                  Ahorro estimado: <strong>{money(referenceNormalPrice - Number(bonusForm.price || 0))}</strong>.
                </div>
              )}

              <button className="w-full rounded-xl bg-accent px-4 py-3 font-bold text-white">Crear bono</button>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow xl:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-accent">Asignar bono a clienta</h2>
            <form onSubmit={assignBonus} className="mb-6 grid gap-3 lg:grid-cols-[1fr_1fr_180px_auto]">
              <select value={assignForm.customerId} onChange={(e) => setAssignForm({ ...assignForm, customerId: e.target.value })} className="rounded-xl border border-gray-300 p-3" required>
                <option value="">Cliente</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.email}</option>)}
              </select>
              <select value={assignForm.bonusTypeId} onChange={(e) => setAssignForm({ ...assignForm, bonusTypeId: e.target.value })} className="rounded-xl border border-gray-300 p-3" required>
                <option value="">Bono</option>
                {bonusTypes.filter((b) => b.active).map((bonus) => <option key={bonus.id} value={bonus.id}>{bonus.name} · {bonus.sessions} sesiones</option>)}
              </select>
              <input type="date" value={assignForm.expiryDate} onChange={(e) => setAssignForm({ ...assignForm, expiryDate: e.target.value })} className="rounded-xl border border-gray-300 p-3" title="Caducidad opcional" />
              <button className="rounded-xl bg-accent px-4 py-3 font-bold text-white">Asignar</button>
            </form>

            <h3 className="mb-3 font-bold text-accent">Tipos de bono</h3>
            <div className="mb-8 grid gap-3 md:grid-cols-2">
              {bonusTypes.length === 0 ? <p>No hay bonos creados.</p> : bonusTypes.map((bonus) => (
                <div key={bonus.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-accent">{bonus.name}</h4>
                      <p className="text-sm text-gray-600">{bonus.sessions} sesiones · {money(bonus.price)} · descuento {percent(bonus.discountPercent)}</p>
                      <p className="mt-1 text-xs text-gray-500">Servicios: {bonus.services?.map((s) => s.name).join(', ') || '—'}</p>
                    </div>
                    <button onClick={() => toggleBonusType(bonus.id, !bonus.active)} className={`rounded-full px-3 py-1 text-xs font-bold ${bonus.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {bonus.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mb-3 font-bold text-accent">Bonos de clientas</h3>
            <div className="space-y-3">
              {customerBonuses.length === 0 ? <p>No hay bonos asignados todavía.</p> : customerBonuses.map((bonus) => (
                <div key={bonus.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <h4 className="font-bold text-accent">{bonus.customerName}</h4>
                      <p className="text-sm text-gray-600">{bonus.bonusName}</p>
                      <p className="text-sm font-semibold text-accent-dark">Restantes: {bonus.remainingSessions}/{bonus.initialSessions}</p>
                      <p className="text-xs text-gray-500">Servicios: {bonus.services?.map((s) => s.name).join(', ') || '—'}{bonus.expiryDate ? ` · Caduca: ${new Date(bonus.expiryDate).toLocaleDateString('es-ES')}` : ''}</p>
                    </div>
                    <button onClick={() => toggleCustomerBonus(bonus.id, !bonus.active)} className={`rounded-full px-3 py-2 text-xs font-bold ${bonus.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {bonus.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
