import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

const STAFF_COOKIE = 'gema_staff_auth';

function staffId(req: NextApiRequest): number | null {
  const raw = req.cookies?.[STAFF_COOKIE];
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const id = Number(data.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!staffId(req)) return res.status(401).json({ error: 'Sesión no válida.' });

  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ error: 'Cita no válida.' });

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: { select: { id: true, name: true, price: true } },
      professional: { select: { name: true } },
    },
  });

  if (!booking) return res.status(404).json({ error: 'Cita no encontrada.' });
  return res.status(200).json(booking);
}
