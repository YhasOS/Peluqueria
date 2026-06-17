import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

const STAFF_COOKIE = 'gema_staff_auth';

function getStaffId(req: NextApiRequest): number | null {
  const raw = req.cookies?.[STAFF_COOKIE];
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const id = Number(data.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    const staffId = getStaffId(req);
    if (!staffId) return res.status(401).json({ error: 'No autorizado' });

    const id = Number(req.body?.id);
    if (!id) return res.status(400).json({ error: 'Cita no válida' });

    const booking = await prisma.booking.findFirst({ where: { id, professionalId: staffId } });
    if (!booking) return res.status(403).json({ error: 'Solo puedes marcar como realizadas tus propias citas' });

    await prisma.booking.update({
      where: { id },
      data: {
  status: 'completed',
},
    });

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('STAFF COMPLETE ERROR:', error);
    return res.status(500).json({ error: 'Error marcando cita como realizada', detail: error?.message || String(error) });
  }
}
