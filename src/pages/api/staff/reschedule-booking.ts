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
    const newStart = new Date(String(req.body?.newStartTime || ''));
    if (!id || Number.isNaN(newStart.getTime())) return res.status(400).json({ error: 'Datos no válidos' });

    const booking = await prisma.booking.findFirst({ where: { id, professionalId: staffId } });
    if (!booking) return res.status(403).json({ error: 'Solo puedes cambiar tus propias citas' });

    const oldStart = new Date(booking.startTime as any);
    const oldEnd = new Date(booking.endTime as any);
    const duration = Math.max(15, Math.round((oldEnd.getTime() - oldStart.getTime()) / 60000));
    const newEnd = new Date(newStart.getTime() + duration * 60000);

    await prisma.booking.update({
      where: { id },
      data: {
        startTime: newStart,
        endTime: newEnd,
        status: 'confirmed',
      },
    });

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "BookingChangeLog" ("bookingId","action","oldStartTime","oldEndTime","newStartTime","newEndTime","changedBy","createdAt")
         VALUES ($1,'rescheduled',$2,$3,$4,$5,'staff',NOW())`,
        id,
        oldStart,
        oldEnd,
        newStart,
        newEnd
      );
    } catch {}

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('STAFF RESCHEDULE ERROR:', error);
    return res.status(500).json({ error: 'Error cambiando cita', detail: error?.message || String(error) });
  }
}
