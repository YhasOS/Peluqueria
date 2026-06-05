import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const services = await prisma.service.findMany({
        orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
        include: {
          category: { select: { name: true } },
          phases: { orderBy: { order: 'asc' } },
        },
      });
      return res.status(200).json(services);
    }
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se han podido cargar los servicios' });
  }
}
