import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/v9-db';
import { getClientFromRequest } from '@/lib/v9-client-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = getClientFromRequest(req);
  if (!client) return res.status(401).json({ error: 'No autenticado' });

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT b.*, s."name" as "serviceName", st."name" as "staffName"
    FROM "Booking" b
    LEFT JOIN "Service" s ON s.id=b."serviceId"
    LEFT JOIN "Staff" st ON st.id=b."staffId"
    WHERE lower(b."clientEmail")=$1 AND replace(b."clientPhone", ' ', '')=$2
    ORDER BY b."startTime" DESC
  `, client.email, client.phone);

  return res.status(200).json(rows);
}
