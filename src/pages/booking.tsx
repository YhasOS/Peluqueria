import Layout from '@/components/Layout';
import BookingForm from '@/components/BookingForm';

export default function BookingPage() {
  return (
    <Layout title="Reservar cita">
      <h1 className="text-3xl font-bold text-accent mb-4">Reserva tu cita</h1>
      <BookingForm />
    </Layout>
  );
}