import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const serviceId = Number(id);
    if (Number.isNaN(serviceId)) {
      return res.status(400).json({ error: 'Servicio no válido' });
    }
    if (req.method === 'GET') {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { category: true, phases: { orderBy: { order: 'asc' } } },
      });
      if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.status(200).json(service);
    }
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se ha podido cargar el servicio' });
  }
}
