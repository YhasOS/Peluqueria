import type { NextApiRequest, NextApiResponse } from 'next';
import { cleanEmail, cleanPhone, prisma } from '@/lib/v9-db';

export const CLIENT_COOKIE = 'gema_client_session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const email = cleanEmail(req.body?.email);
  const phone = cleanPhone(req.body?.phone);
  const code = String(req.body?.code || '').trim();
  if (!email || !phone || !code) return res.status(400).json({ error: 'Faltan datos.' });

  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id FROM "ClientAccessCode" WHERE "email"=$1 AND "phone"=$2 AND "code"=$3 AND "usedAt" IS NULL AND "expiresAt">NOW() ORDER BY id DESC LIMIT 1`,
    email,
    phone,
    code
  );

  if (!rows.length) return res.status(401).json({ error: 'Código incorrecto o caducado.' });

  await prisma.$executeRawUnsafe(`UPDATE "ClientAccessCode" SET "usedAt"=NOW() WHERE id=$1`, rows[0].id);
  const token = Buffer.from(JSON.stringify({ email, phone })).toString('base64url');
  res.setHeader('Set-Cookie', `${CLIENT_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
  return res.status(200).json({ ok: true });
}
