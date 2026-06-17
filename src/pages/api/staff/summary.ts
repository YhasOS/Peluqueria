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
    if (!staffId) return res.status(401).json({ error: 'No autenticado' });

    const from = String(req.query.from || new Date().toISOString().slice(0, 10));
    const to = String(req.query.to || from);
    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T23:59:59`);

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `
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
        AND COALESCE(b.status, 'confirmed') = 'completed'
      LEFT JOIN "Service" s ON s.id = b."serviceId"
      WHERE p.id = $3
      GROUP BY p.id, p.name
      LIMIT 1
      `,
      start,
      end,
      staffId
    );

    return res.status(200).json(rows[0] || { id: staffId, name: '', totalBookings: 0, totalAmount: 0 });
  } catch (error: any) {
    console.error('STAFF SUMMARY ERROR:', error);
    return res.status(500).json({ error: 'Error cargando resumen', detail: error?.message || String(error) });
  }
}
