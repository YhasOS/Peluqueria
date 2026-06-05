import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

const DEFAULT_SETTINGS = {
  businessName: 'Gema Estudio de Belleza',
  whatsappPhone: '647067368',
  openingHour: '09:00',
  closingHour: '19:00',
  saturdayOpeningHour: '09:00',
  saturdayClosingHour: '14:00',
  slotMinutes: 30,
  closedDays: '0',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const rows = await (prisma as any).setting.findMany();
      const data = { ...DEFAULT_SETTINGS } as any;
      rows.forEach((r: any) => { data[r.key] = r.value; });
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const entries = Object.keys(DEFAULT_SETTINGS).filter(k => body[k] !== undefined);
      for (const key of entries) {
        await (prisma as any).setting.upsert({ where: { key }, update: { value: String(body[key]) }, create: { key, value: String(body[key]) } });
      }
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno. Ejecuta SUPABASE_UPGRADE.sql si falta la tabla Setting.' });
  }
}
