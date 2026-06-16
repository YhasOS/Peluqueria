import type { NextApiRequest } from 'next';

export const CLIENT_COOKIE = 'gema_client_session';

export function getClientFromRequest(req: NextApiRequest): { email: string; phone: string } | null {
  const raw = req.cookies?.[CLIENT_COOKIE];
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!data.email || !data.phone) return null;
    return { email: data.email, phone: data.phone };
  } catch {
    return null;
  }
}
