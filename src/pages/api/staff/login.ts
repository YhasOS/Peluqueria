import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/v9-db';

export const STAFF_COOKIE = 'gema_staff_session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const username = String(req.body?.username || '').toLowerCase().trim();
  const password = String(req.body?.password || '');
  const master = process.env.STAFF_MASTER_PASSWORD || 'GemaStaff2026!';
  if (!username || password !== master) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });

  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "Staff" WHERE "username"=$1 AND "active"=true LIMIT 1`, username);
  if (!rows.length) return res.status(401).json({ error: 'Trabajadora no encontrada.' });

  const token = Buffer.from(JSON.stringify({ id: rows[0].id, username: rows[0].username, name: rows[0].name })).toString('base64url');
  res.setHeader('Set-Cookie', `${STAFF_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
  return res.status(200).json({ ok: true });
}
