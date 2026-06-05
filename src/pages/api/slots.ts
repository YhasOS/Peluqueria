import type { NextApiRequest, NextApiResponse } from 'next';
import { getAvailableSlots } from '@/lib/schedule';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { serviceId, date, professionalId } = req.query;
  const id = Number(serviceId);
  if (isNaN(id) || !date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const selectedDate = new Date(date);
  const slots = await getAvailableSlots(id, selectedDate, professionalId ? Number(professionalId) : undefined);
  res.status(200).json(slots.map((d) => d.toISOString()));
}