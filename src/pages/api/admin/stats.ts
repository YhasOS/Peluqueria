import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const [totalBookings, todayBookings, services, professionals, nextBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { startTime: { gte: startOfToday(), lte: endOfToday() } } }),
    prisma.service.count(),
    prisma.professional.count(),
    prisma.booking.findMany({
      where: { startTime: { gte: new Date() } },
      orderBy: { startTime: 'asc' },
      take: 5,
      include: { service: { select: { name: true } }, professional: { select: { name: true } } },
    }),
  ]);

  res.status(200).json({ totalBookings, todayBookings, services, professionals, nextBookings });
}
