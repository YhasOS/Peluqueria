import type { NextApiRequest } from 'next';

export const STAFF_COOKIE = 'gema_staff_session';

export function getStaffFromRequest(req: NextApiRequest): { id: number; username: string; name: string } | null {
  const raw = req.cookies?.[STAFF_COOKIE];
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!data.id) return null;
    return data;
  } catch { return null; }
}
