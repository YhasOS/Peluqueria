import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

function clean(value: any) {
  const text = String(value || '').trim();
  return text || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const customers = await prisma.customer.findMany({
        where: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        } : undefined,
        orderBy: { updatedAt: 'desc' },
        take: 200,
      });
      return res.status(200).json(customers);
    }

    if (req.method === 'POST') {
      const { id, name, email, phone, notes, colorFormula, allergies } = req.body || {};
      const customerName = clean(name);
      const customerEmail = clean(email)?.toLowerCase() || null;
      const customerPhone = clean(phone);
      if (!customerName) return res.status(400).json({ error: 'El nombre es obligatorio.' });

      const data = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        notes: clean(notes),
        colorFormula: clean(colorFormula),
        allergies: clean(allergies),
      };

      if (id) {
        const customer = await prisma.customer.update({ where: { id: Number(id) }, data });
        return res.status(200).json(customer);
      }

      let existing = null;
      if (customerEmail) existing = await prisma.customer.findUnique({ where: { email: customerEmail } });
      if (!existing && customerPhone) existing = await prisma.customer.findFirst({ where: { phone: customerPhone } });

      const customer = existing
        ? await prisma.customer.update({ where: { id: existing.id }, data })
        : await prisma.customer.create({ data });

      return res.status(200).json(customer);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
  } catch (error: any) {
    console.error('CUSTOMERS ERROR', error);
    if (String(error?.code) === 'P2002') return res.status(409).json({ error: 'Ya existe una clienta con ese email.' });
    return res.status(500).json({ error: 'Error interno gestionando clientas.', detail: error?.message || String(error) });
  }
}
