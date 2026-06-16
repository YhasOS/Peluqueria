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
    if (req.method !== 'GET') return res.status(405).end();

    const staffId = getStaffId(req);
    if (!staffId) return res.status(401).json({ error: 'No autorizado' });

    const from = String(req.query.from || new Date().toISOString().slice(0, 10));
    const to = String(req.query.to || from);

    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T23:59:59`);

    const staff = await prisma.professional.findUnique({
      where: { id: staffId },
      select: { id: true, name: true, username: true },
    });

    if (!staff) return res.status(401).json({ error: 'Trabajadora no encontrada' });

    const bookings = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        b.id,
        b."clientName",
        b."clientPhone",
        b."clientEmail",
        b.notes,
        b."startTime",
        b."endTime",
        b."professionalId" as "staffId",
        p.name as "staffName",
        s.name as "serviceName",
        s.price as "servicePrice",
        COALESCE(b.price, s.price, 0) as "price",
        COALESCE(b.status, 'confirmed') as "status"
      FROM "Booking" b
      LEFT JOIN "Professional" p ON p.id = b."professionalId"
      LEFT JOIN "Service" s ON s.id = b."serviceId"
      WHERE b."startTime" >= $1
        AND b."startTime" <= $2
        AND COALESCE(b.status, 'confirmed') <> 'cancelled'
      ORDER BY b."startTime" ASC
      `,
      start,
      end
    );

    return res.status(200).json({ staff, bookings });
  } catch (error: any) {
    console.error('STAFF BOOKINGS ERROR:', error);
    return res.status(500).json({
      error: 'Error cargando agenda',
      detail: error?.message || String(error),
    });
  }
}