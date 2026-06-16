import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma, cleanEmail, cleanPhone } from '@/lib/v9-db';
import { sendMail } from '@/lib/v9-mail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const email = cleanEmail(req.body?.email);
  const phone = cleanPhone(req.body?.phone);
  if (!email || !phone) return res.status(400).json({ error: 'Indica email y teléfono.' });

  const found = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id FROM "Booking" WHERE lower("clientEmail")=$1 AND replace("clientPhone", ' ', '')=$2 LIMIT 1`,
    email,
    phone
  );

  if (!found.length) {
    return res.status(404).json({ error: 'No encontramos citas con ese email y teléfono. Revisa los datos o crea una reserva nueva.' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.$executeRawUnsafe(
    `INSERT INTO "ClientAccessCode" ("email", "phone", "code", "expiresAt") VALUES ($1, $2, $3, $4)`,
    email,
    phone,
    code,
    expires
  );

  await sendMail(email, 'Tu código de acceso - Gema Estudio de Belleza', `
    <p>Hola,</p>
    <p>Tu código para acceder a tus citas es:</p>
    <h2>${code}</h2>
    <p>Caduca en 15 minutos.</p>
  `);

  return res.status(200).json({ ok: true, message: 'Te hemos enviado un código al email.' });
}
