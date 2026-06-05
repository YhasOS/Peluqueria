import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const customers = await (prisma as any).customer.findMany({
        where: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        } : undefined,
        orderBy: { updatedAt: 'desc' },
        take: 100,
      });
      return res.status(200).json(customers);
    }

    if (req.method === 'POST') {
      const { name, email, phone, notes, colorFormula, allergies } = req.body || {};
      if (!name || !email) return res.status(400).json({ error: 'Nombre y email son obligatorios' });
      const customer = await (prisma as any).customer.upsert({
        where: { email: String(email) },
        update: { name, phone: phone || null, notes: notes || null, colorFormula: colorFormula || null, allergies: allergies || null },
        create: { name, email, phone: phone || null, notes: notes || null, colorFormula: colorFormula || null, allergies: allergies || null },
      });
      return res.status(200).json(customer);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor. Ejecuta SUPABASE_UPGRADE.sql si falta la tabla Customer.' });
  }
}
