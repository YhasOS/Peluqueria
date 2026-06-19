import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Service { id: number; name: string; price: number; priceLabel?: string | null; totalDuration: number; description?: string | null; }
interface Professional { id: number; name: string; phone?: string | null; }
interface SlotOption { value: string; label: string; }
interface BookingResult {
  id: number;
  clientName: string;
  clientPhone?: string | null;
  startTime: string;
  service?: { name: string };
  professional?: { id: number; name: string; phone?: string | null } | null;
}

export default function BookingForm() {
  const router = useRouter();
  const { serviceId } = router.query;
  const [service, setService] = useState<Service | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [businessWhatsapp, setBusinessWhatsapp] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (serviceId) fetch(`/api/services/${serviceId}`).then((res) => res.json()).then((data) => setService(data));
    fetch('/api/professionals').then(r => r.json()).then(d => setProfessionals(Array.isArray(d) ? d : []));
    fetch('/api/settings').then(r => r.json()).then(d => setBusinessWhatsapp(d.whatsappPhone || ''));
  }, [serviceId]);

  async function fetchSlots(selectedDate: string, profId = professionalId) {
    if (!serviceId || !selectedDate) return;
    setLoadingSlots(true); setSlots([]); setSelectedSlot(''); setError('');
    const params = new URLSearchParams({ serviceId: String(serviceId), date: selectedDate });
    if (profId) params.set('professionalId', profId);
    const res = await fetch(`/api/slots?${params.toString()}`);
    const data = await res.json();
    const options = Array.isArray(data) ? data.map((iso: string) => ({ value: iso, label: new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) })) : [];
    setSlots(options); setLoadingSlots(false);
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => { const value = e.target.value; setDate(value); fetchSlots(value); };
  const handleProfessionalChange = (e: React.ChangeEvent<HTMLSelectElement>) => { const value = e.target.value; setProfessionalId(value); if (date) fetchSlots(date, value); };
  const selectedProfessional = professionals.find((p) => String(p.id) === professionalId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!serviceId || !date || !selectedSlot) return;
	if (!professionalId) {
  setError('Selecciona una profesional para poder asignar correctamente la cita.');
  return;
}
    const res = await fetch('/api/bookings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: Number(serviceId), date, startTime: selectedSlot, name: form.name, email: form.email, phone: form.phone, notes: form.notes, professionalId: professionalId ? Number(professionalId) : undefined }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      if (form.email) localStorage.setItem('gema_customer_email', form.email);
      if (form.phone) localStorage.setItem('gema_customer_phone', form.phone);
      setBooking(data); setSubmitted(true);
    }
    else { setError(data?.error || 'No se ha podido crear la reserva.'); fetchSlots(date); }
  };

  const whatsappUrl = (() => {
    if (!submitted || !booking || !service) return '';
    const when = new Date(booking.startTime).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    const professionalName = booking.professional?.name || selectedProfessional?.name || 'la profesional';
const text = `Hola ${professionalName}, soy ${booking.clientName}. He reservado ${service.name} para el ${when}.`;
const phone = (booking.professional?.phone || selectedProfessional?.phone || businessWhatsapp).replace(/\D/g, '');
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  })();

  if (!serviceId) {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white/90 p-8 text-center shadow-soft">
        <h2 className="text-2xl font-bold text-accent-dark">Primero elige un servicio</h2>
        <p className="mt-3 text-gray-600">Para calcular la duración y las horas disponibles, selecciona el tratamiento que quieres reservar.</p>
        <a href="/services" className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 font-bold text-white shadow-soft hover:bg-accent-dark">Ver servicios</a>
      </div>
    );
  }

  if (!service) return <div className="mx-auto max-w-2xl rounded-[2rem] bg-white/80 p-8 shadow-soft">Cargando servicio...</div>;

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-soft">
      <h2 className="mb-2 text-3xl font-extrabold text-accent-dark">Reserva para {service.name}</h2>
      <p className="mb-6 text-sm text-gray-600">Duración aproximada: {service.totalDuration} min · Precio: {service.priceLabel || `${service.price.toFixed(2)}€`}</p>
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-green-100 p-4 text-green-800">Su cita ha sido reservada correctamente.</div>
          {booking && <div className="rounded-xl bg-primary-light p-4 text-sm"><p><strong>Servicio:</strong> {service.name}</p><p><strong>Fecha y hora:</strong> {new Date(booking.startTime).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</p><p><strong>Cliente:</strong> {booking.clientName}</p></div>}
          <div className="grid gap-3 sm:grid-cols-3"><a href="/services" className="rounded-full border border-accent px-4 py-3 text-center font-bold text-accent">Nueva reserva</a><Link href="/mi-cuenta" className="rounded-full border border-accent bg-primary-light px-4 py-3 text-center font-bold text-accent-dark">Ver mis citas</Link><a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full bg-accent px-4 py-3 text-center font-bold text-white">Avisar por WhatsApp</a></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-red-100 p-3 text-red-700">{error}</div>}
          <div><label className="block text-sm font-medium mb-1">Fecha</label><input type="date" value={date} onChange={handleDateChange} className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-primary" required /></div>
          <div>
  <label className="block text-sm font-medium mb-1">Profesional</label>

  <select
    value={professionalId}
    onChange={handleProfessionalChange}
    required
    className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-primary"
  >
    <option value="">Selecciona profesional</option>
    {professionals.map((p) => (
      <option key={p.id} value={p.id}>
        {p.name}
      </option>
    ))}
  </select>
</div>
          {date && <div><label className="block text-sm font-medium mb-1">Hora</label>{loadingSlots ? <p>Cargando disponibilidad...</p> : slots.length === 0 ? <p className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">No hay horarios disponibles para ese día.</p> : <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-primary" required><option value="">Seleccione una hora</option>{slots.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}</select>}</div>}
          <div><label className="block text-sm font-medium mb-1">Nombre</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-primary" required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-primary" required /></div>
          <div><label className="block text-sm font-medium mb-1">Teléfono</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Notas</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-white p-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-primary" rows={3} /></div>
          <button type="submit" className="w-full rounded-full bg-accent py-3 font-bold text-white shadow-soft hover:bg-accent-dark">Confirmar cita</button>
        </form>
      )}
    </div>
  );
}
