import type { NextApiRequest } from 'next';

export const STAFF_COOKIE = 'gema_staff_auth';

export type StaffSession = {
  id: number;
  username?: string | null;
  name?: string | null;
};

export function getStaffFromRequest(req: NextApiRequest): StaffSession | null {
  const raw = req.cookies?.[STAFF_COOKIE];
  if (!raw) return null;

  // Compatibilidad: acepta cookie nueva en base64url y cookie antigua con solo el ID.
  const directId = Number(raw);
  if (Number.isFinite(directId) && directId > 0) return { id: directId };

  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const id = Number(data?.id);
    if (!Number.isFinite(id) || id <= 0) return null;
    return {
      id,
      username: data.username || null,
      name: data.name || null,
    };
  } catch {
    return null;
  }
}
