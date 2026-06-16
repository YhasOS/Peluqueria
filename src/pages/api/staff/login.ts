import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

const STAFF_COOKIE = 'gema_staff_auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body || {};

  const user = String(username || '').trim().toLowerCase();
  const pass = String(password || '').trim();

  if (!user || !pass) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const professional = await prisma.professional.findFirst({
  where: {
    username: user,
    password: pass,
    active: true,
  },
});

if (!professional) {
  return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
}

const payload = Buffer.from(JSON.stringify({
  id: professional.id,
  username: professional.username,
  name: professional.name,
}), 'utf8').toString('base64url');

res.setHeader(
  'Set-Cookie',
  `${STAFF_COOKIE}=${payload}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
);

  return res.status(200).json({
    ok: true,
    professional: {
      id: professional.id,
      name: professional.name,
      username: professional.username,
    },
  });
}