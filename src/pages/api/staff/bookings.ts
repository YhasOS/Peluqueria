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

  const staffRows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, name, username, color
    FROM "Professional"
    WHERE id = $1 AND COALESCE(active, true) = true
    LIMIT 1
  `, session.id);

  const staff = staffRows[0];
  if (!staff) return res.status(401).json({ error: 'Sesión no válida' });

  const bookings = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      b.id,
      b."startTime",
      b."endTime",
      b."clientName",
      b."clientPhone",
      b."clientEmail",
      b.notes,
      COALESCE(b.status, 'confirmed') as status,
      b."professionalId" as "staffId",
      p.name as "staffName",
      p.color as "staffColor",
      s.name as "serviceName",
      s.category as "serviceCategory",
      s.duration as "serviceDuration",
      COALESCE(b.price, s.price, 0) as "servicePrice"
    FROM "Booking" b
    LEFT JOIN "Service" s ON s.id = b."serviceId"
    LEFT JOIN "Professional" p ON p.id = b."professionalId"
    WHERE b."startTime" >= $1
      AND b."startTime" <= $2
      AND COALESCE(b.status, 'confirmed') <> 'cancelled'
    ORDER BY b."startTime" ASC
  `, start, end);

  return res.status(200).json({ staff, bookings });
}
