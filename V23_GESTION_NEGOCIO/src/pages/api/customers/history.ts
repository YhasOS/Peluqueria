import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'Clienta no válida.' });

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return res.status(404).json({ error: 'Clienta no encontrada.' });

    const identity: any[] = [];
    if (customer.email) identity.push({ clientEmail: customer.email });
    if (customer.phone) identity.push({ clientPhone: customer.phone });
    if (!identity.length) identity.push({ clientName: customer.name });

    const bookings = await prisma.booking.findMany({
      where: { OR: identity },
      orderBy: { startTime: 'desc' },
      include: {
        professional: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true } },
        bookingServices: {
          orderBy: { position: 'asc' },
          include: { service: { select: { id: true, name: true } } },
        },
      },
    });

    const completed = bookings.filter(b => ['completed', 'done'].includes(String(b.status)));
    const grouped = new Map<number, { serviceId: number; name: string; count: number; amount: number }>();
    for (const booking of completed) {
      const rows = booking.bookingServices.length
        ? booking.bookingServices.map(bs => ({ id: bs.serviceId, name: bs.service.name, price: bs.price }))
        : [{ id: booking.service.id, name: booking.service.name, price: booking.service.price }];
      for (const row of rows) {
        const current = grouped.get(row.id) || { serviceId: row.id, name: row.name, count: 0, amount: 0 };
        current.count += 1;
        current.amount += Number(row.price || 0);
        grouped.set(row.id, current);
      }
    }

    return res.status(200).json({
      customer,
      bookings,
      summary: Array.from(grouped.values()).sort((a, b) => b.count - a.count),
      totalVisits: completed.length,
      totalServices: Array.from(grouped.values()).reduce((a, b) => a + b.count, 0),
      totalAmount: Array.from(grouped.values()).reduce((a, b) => a + b.amount, 0),
    });
  } catch (error: any) {
    console.error('CUSTOMER HISTORY ERROR', error);
    return res.status(500).json({ error: 'No se pudo cargar el histórico.', detail: error?.message || String(error) });
  }
}
