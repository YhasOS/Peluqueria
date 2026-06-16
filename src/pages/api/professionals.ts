import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/v9-db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const professionals = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, name, email, phone, username, role, active, color
    FROM "Professional"
    ORDER BY name ASC
  `);

  return res.status(200).json(
    professionals.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email || '',
      phone: p.phone || '',
      username: p.username || '',
      role: p.role || 'staff',
      active: p.active !== false,
      color: p.color || '#C79A7B',
      bio: '',
      specialties: [],
    }))
  );
}
