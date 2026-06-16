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
  SELECT 
    b.*,
    b."professionalId" as "staffId",
    s."name" as "serviceName",
    s."price" as "servicePrice",
    p."name" as "staffName"
  FROM "Booking" b
  LEFT JOIN "Service" s ON s.id = b."serviceId"
  LEFT JOIN "Professional" p ON p.id = b."professionalId"
  WHERE b."startTime" >= $1 
    AND b."startTime" <= $2 
    AND COALESCE(b."status", 'confirmed') <> 'cancelled'
  ORDER BY b."startTime" ASC
`, start, end);

  return res.status(200).json({ staff, bookings: rows });
}
