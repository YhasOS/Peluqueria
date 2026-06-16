import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/v9-db';
import { getClientFromRequest } from '@/lib/v9-client-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const client = getClientFromRequest(req);
  if (!client) return res.status(401).json({ error: 'No autenticado' });
  const id = Number(req.body?.id);
  const reason = String(req.body?.reason || 'Cancelada por clienta');
  if (!id) return res.status(400).json({ error: 'Falta cita.' });

  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "Booking" WHERE id=$1 AND lower("clientEmail")=$2 AND replace("clientPhone", ' ', '')=$3 LIMIT 1`, id, client.email, client.phone);
  if (!rows.length) return res.status(404).json({ error: 'Cita no encontrada.' });

  const start = new Date(rows[0].startTime);
  if (start.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Para cancelar con menos de 24 horas, contacta por WhatsApp.' });
  }

  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "status"='cancelled', "cancelReason"=$1, "cancelledAt"=NOW() WHERE id=$2`, reason, id);
  return res.status(200).json({ ok: true });
}
