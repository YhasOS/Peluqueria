import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
  const phoneRaw = typeof req.query.phone === 'string' ? req.query.phone.trim() : '';
  const phoneDigits = phoneRaw.replace(/\D/g, '');
  if (!email && !phoneDigits) return res.status(400).json({ error: 'Introduce email o teléfono' });

  const where: any = { OR: [] };
  if (email) where.OR.push({ clientEmail: { equals: email, mode: 'insensitive' } });
  if (phoneDigits) where.OR.push({ clientPhone: { contains: phoneDigits.slice(-6) } });

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { startTime: 'desc' },
    include: {
      service: { select: { name: true, priceLabel: true, totalDuration: true, category: { select: { name: true } } } },
      professional: { select: { name: true } },
    },
  });

  const customer = email ? await (prisma as any).customer.findUnique({ where: { email } }).catch(() => null) : null;
  const now = new Date();
  return res.status(200).json({
    customer,
    upcoming: bookings.filter((b) => new Date(b.startTime) >= now).sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
    past: bookings.filter((b) => new Date(b.startTime) < now),
  });
}
