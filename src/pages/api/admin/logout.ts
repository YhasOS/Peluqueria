import type { NextApiRequest, NextApiResponse } from 'next';
import { ADMIN_COOKIE } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.status(200).json({ ok: true });
}
