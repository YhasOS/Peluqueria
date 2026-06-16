import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/v9-db';
import { getStaffFromRequest } from '@/lib/v9-staff-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const staff = getStaffFromRequest(req);
  if (!staff) return res.status(401).json({ error: 'No autenticado' });
  const from = String(req.query.from || new Date().toISOString().slice(0,10));
  const to = String(req.query.to || from);
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T23:59:59`);

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT st."id", st."name",
      COUNT(b.id)::int as "totalBookings",
      COALESCE(SUM(COALESCE(b."finalPrice", s."price")),0)::float as "totalAmount"
    FROM "Staff" st
    LEFT JOIN "Booking" b ON b."staffId"=st.id AND b."startTime">=$1 AND b."startTime"<=$2 AND COALESCE(b."status", 'confirmed') <> 'cancelled'
    LEFT JOIN "Service" s ON s.id=b."serviceId"
    GROUP BY st.id, st."name"
    ORDER BY st."name"
  `, start, end);

  return res.status(200).json(rows);
}
