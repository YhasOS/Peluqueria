import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const rows = await prisma.professional.findMany({ orderBy: { name: 'asc' } });

  // Evita que aparezcan profesionales repetidos en el desplegable.
  // Conserva el primer registro de cada nombre, para no romper reservas existentes.
  const seen = new Set<string>();
  const professionals = rows.filter((p: any) => {
    const key = String(p.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return res.status(200).json(professionals);
}
