import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/v9-db';
import { getClientFromRequest } from '@/lib/v9-client-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const client = getClientFromRequest(req);
  if (!client) return res.status(401).json({ error: 'No autenticado' });

  const id = Number(req.body?.id);
  const newStart = new Date(req.body?.newStart);
  if (!id || isNaN(newStart.getTime())) return res.status(400).json({ error: 'Datos incorrectos.' });

  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "Booking" WHERE id=$1 AND lower("clientEmail")=$2 AND replace("clientPhone", ' ', '')=$3 LIMIT 1`, id, client.email, client.phone);
  if (!rows.length) return res.status(404).json({ error: 'Cita no encontrada.' });
  const booking = rows[0];
  const oldStart = new Date(booking.startTime);
  const oldEnd = new Date(booking.endTime);
  const duration = oldEnd.getTime() - oldStart.getTime();
  const newEnd = new Date(newStart.getTime() + duration);

  if (oldStart.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Para cambiar con menos de 24 horas, contacta por WhatsApp.' });
  }

  const conflicts = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id FROM "Booking"
    WHERE id<>$1 AND COALESCE("status", 'confirmed') <> 'cancelled'
      AND "staffId"=$2
      AND "startTime" < $4
      AND "endTime" > $3
    LIMIT 1
  `, id, booking.staffId, newStart, newEnd);

  if (conflicts.length) return res.status(409).json({ error: 'Ese hueco ya no está disponible.' });

  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "startTime"=$1, "endTime"=$2 WHERE id=$3`, newStart, newEnd, id);
  return res.status(200).json({ ok: true });
}
