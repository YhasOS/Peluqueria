import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendPushToProfessional } from '@/lib/push';

function cleanEmail(value: any) { return String(value || '').trim().toLowerCase(); }
function cleanPhone(value: any) { return String(value || '').replace(/\s+/g, '').trim(); }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const id = Number(req.body?.id);
  const email = cleanEmail(req.body?.email);
  const phone = cleanPhone(req.body?.phone);
  const newStart = new Date(req.body?.newStart);

  if (!id || isNaN(newStart.getTime())) return res.status(400).json({ error: 'Datos incorrectos.' });
  if (!email && !phone) return res.status(400).json({ error: 'Indica email o teléfono para validar la cita.' });

  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM "Booking"
     WHERE id=$1
       AND ($2='' OR lower(COALESCE("clientEmail",''))=$2)
       AND ($3='' OR replace(COALESCE("clientPhone",''), ' ', '')=$3)
     LIMIT 1`,
    id,
    email,
    phone
  );

  if (!rows.length) return res.status(404).json({ error: 'No hemos encontrado esa cita con tus datos.' });

  const booking = rows[0];
  const oldStart = new Date(booking.startTime);
  const oldEnd = new Date(booking.endTime);
  const duration = oldEnd.getTime() - oldStart.getTime();
  const newEnd = new Date(newStart.getTime() + duration);

  if (oldStart.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Para cambiar con menos de 24 horas, contacta por WhatsApp.' });
  }

  const professionalId = booking.professionalId || null;
  const conflicts = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id FROM "Booking"
     WHERE id<>$1
       AND COALESCE("status", 'confirmed') <> 'cancelled'
       AND (($2::int IS NULL AND "professionalId" IS NULL) OR "professionalId"=$2)
       AND "startTime" < $4
       AND "endTime" > $3
     LIMIT 1`,
    id,
    professionalId,
    newStart,
    newEnd
  );

  if (conflicts.length) return res.status(409).json({ error: 'Ese hueco ya no está disponible.' });

  await prisma.$executeRawUnsafe(
    `UPDATE "Booking" SET "startTime"=$1, "endTime"=$2, "updatedAt"=NOW() WHERE id=$3`,
    newStart,
    newEnd,
    id
  );
await sendPushToProfessional(professionalId, {
  title: 'Cita cambiada',
  body: `${booking.clientName || 'Una clienta'} ha cambiado su cita al ${newStart.toLocaleString('es-ES')}.`,
  url: '/staff',
});
  return res.status(200).json({ ok: true });
}
