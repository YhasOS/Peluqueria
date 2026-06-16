import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/v9-db';
import { getStaffFromRequest } from '@/lib/v9-staff-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getStaffFromRequest(req);
  if (!session) return res.status(401).json({ error: 'No autenticado' });

  const from = String(req.query.from || new Date().toISOString().slice(0, 10));
  const to = String(req.query.to || from);
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T23:59:59`);

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      p.id,
      p.name,
      COUNT(b.id)::int as "totalBookings",
      COALESCE(SUM(COALESCE(b.price, s.price, 0)), 0)::float as "totalAmount"
    FROM "Professional" p
    LEFT JOIN "Booking" b
      ON b."professionalId" = p.id
      AND b."startTime" >= $1
      AND b."startTime" <= $2
      AND COALESCE(b.status, 'confirmed') <> 'cancelled'
    LEFT JOIN "Service" s ON s.id = b."serviceId"
    WHERE COALESCE(p.active, true) = true
    GROUP BY p.id, p.name
    ORDER BY p.name ASC
  `, start, end);

  return res.status(200).json(rows);
}
