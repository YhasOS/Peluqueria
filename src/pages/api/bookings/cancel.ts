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
  const reason = String(req.body?.reason || 'Cancelada por clienta');

  if (!id) return res.status(400).json({ error: 'Falta la cita.' });
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

  const start = new Date(rows[0].startTime);
  if (start.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Para cancelar con menos de 24 horas, contacta por WhatsApp.' });
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "Booking" SET "status"='cancelled', "cancelReason"=$1, "cancelledAt"=NOW() WHERE id=$2`,
    reason,
    id
  );
await sendPushToProfessional(rows[0].professionalId, {
  title: 'Cita cancelada',
  body: `${rows[0].clientName || 'Una clienta'} ha cancelado su cita.`,
  url: '/staff',
});
  return res.status(200).json({ ok: true });
}
