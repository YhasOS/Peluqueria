import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Customer = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type Service = {
  id: number;
  name: string;
  price: number;
  priceLabel?: string | null;
  totalDuration: number;
};

type Professional = {
  id: number;
  name: string;
  active?: boolean;
};

type Slot = {
  value: string;
  label: string;
};

type CreatedBooking = {
  id: number;
  clientName: string;
  clientPhone?: string | null;
  clientEmail: string;
  startTime: string;
  service?: { name: string };
  professional?: { name: string };
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function whatsappPhone(value: string) {
  const digits = normalizePhone(value);
  if (!digits) return '';
  if (digits.startsWith('34')) return digits;
  return digits.length === 9 ? `34${digits}` : digits;
}

async function getJson(url: string) {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'No se pudieron cargar los datos.');
  }
  return data;
}

export default function NewStaffBookingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<CreatedBooking | null>(null);

  useEffect(() => {
    Promise.all([
      getJson('/api/customers'),
      getJson('/api/services'),
      getJson('/api/professionals'),
    ])
      .then(([customerData, serviceData, professionalData]) => {
        setCustomers(Array.isArray(customerData) ? customerData : []);
        setServices(Array.isArray(serviceData) ? serviceData : []);
        setProfessionals(
          Array.isArray(professionalData)
            ? professionalData.filter((item: Professional) => item.active !== false)
            : []
        );
      })
      .catch((err) => setError(err?.message || 'No se pudieron cargar los datos.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = useMemo(() => {
    const search = customerSearch.trim().toLowerCase();
    if (!search) return customers.slice(0, 25);

    return customers
      .filter((customer) =>
        [customer.name, customer.email || '', customer.phone || '']
          .join(' ')
          .toLowerCase()
          .includes(search)
      )
      .slice(0, 25);
  }, [customers, customerSearch]);

  const selectedService = services.find((service) => String(service.id) === serviceId);
  const selectedProfessional = professionals.find(
    (professional) => String(professional.id) === professionalId
  );

  useEffect(() => {
    setSlots([]);
    setStartTime('');

    if (!serviceId || !professionalId || !date) return;

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        setError('');
        // Si es una fecha pasada, permitir registrar cualquier hora
const selectedDate = new Date(`${date}T00:00:00`);
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

if (selectedDate < todayDate) {
  const historicalSlots: { value: string; label: string }[] = [];

  for (let hour = 9; hour < 19; hour++) {
    for (const minute of [0, 30]) {
      const slotDate = new Date(`${date}T00:00:00`);
      slotDate.setHours(hour, minute, 0, 0);

      historicalSlots.push({
        value: slotDate.toISOString(),
        label: slotDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
  }

  setSlots(historicalSlots);
  return;
}
        const query = new URLSearchParams({
          serviceId,
          professionalId,
          date,
        });
        const data = await getJson(`/api/slots?${query.toString()}`);
        setSlots(
          Array.isArray(data)
            ? data.map((value: string) => ({
                value,
                label: new Date(value).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }))
            : []
        );
      } catch (err: any) {
        setError(err?.message || 'No se pudieron cargar los horarios.');
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [serviceId, professionalId, date]);

  function selectCustomer(customer: Customer) {
    setCustomerId(String(customer.id));
    setClientName(customer.name || '');
    setClientPhone(customer.phone || '');
    setClientEmail(customer.email || '');
    setCustomerSearch(customer.name || '');
  }

  function clearCustomer() {
    setCustomerId('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setCustomerSearch('');
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (!clientName.trim() || !clientPhone.trim()) {
      setError('Nombre y teléfono son obligatorios.');
      return;
    }

    if (!serviceId || !professionalId || !date || !startTime) {
      setError('Selecciona servicio, profesional, fecha y hora.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/staff/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId ? Number(customerId) : null,
          name: clientName.trim(),
          phone: clientPhone.trim(),
          email: clientEmail.trim() || null,
          serviceId: Number(serviceId),
          professionalId: Number(professionalId),
          date,
          startTime,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = '/staff/login';
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo crear la cita.');
      }

      setCreated(data);
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear la cita.');
    } finally {
      setSaving(false);
    }
  }

  const whatsappUrl = useMemo(() => {
    if (!created?.clientPhone) return '';
    const number = whatsappPhone(created.clientPhone);
    if (!number) return '';

    const when = new Date(created.startTime).toLocaleString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = [
      `Hola ${created.clientName} 😊`,
      '',
      'Tu cita ha quedado reservada:',
      `📅 ${when}`,
      `💇 ${created.service?.name || selectedService?.name || 'Servicio'}`,
      `👩 ${created.professional?.name || selectedProfessional?.name || 'Profesional'}`,
      '',
      'Gema Estudio de Belleza',
    ].join('\n');

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }, [created, selectedProfessional?.name, selectedService?.name]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8eee8] p-4 text-[#3b2b25] md:p-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow">Cargando…</div>
      </main>
    );
  }

  if (created) {
    return (
      <main className="min-h-screen bg-[#f8eee8] p-4 text-[#3b2b25] md:p-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow md:p-8">
          <div className="rounded-2xl bg-green-100 p-4 font-semibold text-green-800">
            Cita creada correctamente.
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#8a5a42]">Resumen</h1>
          <div className="mt-5 space-y-2 rounded-2xl bg-[#f8eee8] p-5">
            <p><strong>Cliente:</strong> {created.clientName}</p>
            <p><strong>Teléfono:</strong> {created.clientPhone || '—'}</p>
            <p><strong>Servicio:</strong> {created.service?.name || selectedService?.name}</p>
            <p><strong>Profesional:</strong> {created.professional?.name || selectedProfessional?.name}</p>
            <p>
              <strong>Fecha:</strong>{' '}
              {new Date(created.startTime).toLocaleString('es-ES', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-[#a66f54] px-4 py-3 font-semibold text-[#8a5a42]"
            >
              Otra cita
            </button>
            <Link
              href="/staff"
              className="rounded-xl bg-[#f4e4dc] px-4 py-3 text-center font-semibold text-[#8a5a42]"
            >
              Ver agenda
            </Link>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-green-500 px-4 py-3 text-center font-semibold text-white"
              >
                Confirmar por WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8eee8] p-4 text-[#3b2b25] md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#8a5a42] md:text-4xl">Nueva cita</h1>
            <p className="mt-1 text-gray-600">Crear una cita para una clienta desde el panel de trabajadoras.</p>
          </div>
          <Link
            href="/staff"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-[#8a5a42] shadow"
          >
            Volver
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl bg-red-100 p-4 text-red-700">{error}</div>
        ) : null}

        <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-5 shadow md:p-6">
            <h2 className="text-xl font-bold text-[#8a5a42]">1. Clienta</h2>

            <label className="mt-4 block text-sm font-semibold">Buscar clienta</label>
            <input
              value={customerSearch}
              onChange={(event) => {
                setCustomerSearch(event.target.value);
                if (customerId) clearCustomer();
              }}
              placeholder="Nombre, teléfono o email"
              className="mt-1 w-full rounded-xl border p-3"
            />

            {customerSearch && !customerId ? (
              <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border bg-white">
                {filteredCustomers.length ? (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => selectCustomer(customer)}
                      className="block w-full border-b px-4 py-3 text-left last:border-b-0 hover:bg-[#f8eee8]"
                    >
                      <span className="block font-semibold">{customer.name}</span>
                      <span className="block text-sm text-gray-500">
                        {[customer.phone, customer.email].filter(Boolean).join(' · ')}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-sm text-gray-500">
                    No existe. Completa los datos para crearla.
                  </p>
                )}
              </div>
            ) : null}

            {customerId ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-green-50 p-3">
                <span className="font-semibold text-green-800">Clienta seleccionada</span>
                <button type="button" onClick={clearCustomer} className="text-sm text-red-600">
                  Cambiar
                </button>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <input
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Nombre y apellidos"
                required
                className="rounded-xl border p-3"
              />
              <input
                value={clientPhone}
                onChange={(event) => setClientPhone(event.target.value)}
                placeholder="Teléfono"
                required
                className="rounded-xl border p-3"
              />
              <input
                value={clientEmail}
                onChange={(event) => setClientEmail(event.target.value)}
                placeholder="Email opcional"
                type="email"
                className="rounded-xl border p-3"
              />
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Notas"
                rows={3}
                className="rounded-xl border p-3"
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow md:p-6">
            <h2 className="text-xl font-bold text-[#8a5a42]">2. Cita</h2>

            <div className="mt-4 grid gap-4">
              <label>
                <span className="text-sm font-semibold">Servicio</span>
                <select
                  value={serviceId}
                  onChange={(event) => setServiceId(event.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border bg-white p-3"
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · {service.priceLabel || `${Number(service.price).toFixed(2)} €`}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-semibold">Profesional</span>
                <select
                  value={professionalId}
                  onChange={(event) => setProfessionalId(event.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border bg-white p-3"
                >
                  <option value="">Seleccionar profesional</option>
                  {professionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-semibold">Fecha</span>
                <input
  type="date"
  value={date}
  onChange={(event) => setDate(event.target.value)}
  required
  className="mt-1 w-full rounded-xl border bg-white p-3"
/>
              </label>

              <label>
                <span className="text-sm font-semibold">Hora disponible</span>
                <select
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                  disabled={!serviceId || !professionalId || !date || loadingSlots}
                  className="mt-1 w-full rounded-xl border bg-white p-3 disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingSlots ? 'Cargando horarios…' : 'Seleccionar hora'}
                  </option>
                  {slots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </label>

              {!loadingSlots && serviceId && professionalId && date && slots.length === 0 ? (
                <div className="rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">
                  No hay horas disponibles para esa combinación.
                </div>
              ) : null}

              {selectedService ? (
                <div className="rounded-xl bg-[#f8eee8] p-4 text-sm">
                  <p><strong>Servicio:</strong> {selectedService.name}</p>
                  <p><strong>Duración:</strong> {selectedService.totalDuration} minutos</p>
                  <p>
                    <strong>Precio:</strong>{' '}
                    {selectedService.priceLabel || `${Number(selectedService.price).toFixed(2)} €`}
                  </p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#a66f54] px-5 py-4 text-lg font-bold text-white disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Crear cita'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
