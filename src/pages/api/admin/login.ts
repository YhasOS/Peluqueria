import type { NextApiRequest, NextApiResponse } from 'next';
import { ADMIN_COOKIE, getAdminPassword } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password } = req.body || {};
  if (String(password || '') !== getAdminPassword()) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=${getAdminPassword()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
  return res.status(200).json({ ok: true });
}
