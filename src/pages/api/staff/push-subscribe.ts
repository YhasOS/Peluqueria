import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/v9-db';
import { STAFF_COOKIE } from '@/lib/v9-staff-auth';

type ErrorResponse = { error: string };

function getStaffFromCookie(req: NextApiRequest): { id: number; name?: string } | null {
  try {
    const raw = req.cookies[STAFF_COOKIE];
    if (!raw) return null;

    const decoded = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded);

    if (!parsed?.id) return null;

    return {
      id: Number(parsed.id),
      name: parsed.name ? String(parsed.name) : undefined,
    };
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const staff = getStaffFromCookie(req);
    const { subscription } = req.body || {};

    if (!staff?.id) {
      return res.status(401).json({ error: 'Sesión de trabajadora no válida' } satisfies ErrorResponse);
    }

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ error: 'Suscripción push no válida' } satisfies ErrorResponse);
    }

    await prisma.$executeRaw`
      INSERT INTO "PushSubscription" ("professionalId", endpoint, p256dh, auth, "createdAt", "updatedAt")
      VALUES (${staff.id}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth}, NOW(), NOW())
      ON CONFLICT (endpoint)
      DO UPDATE SET
        "professionalId" = EXCLUDED."professionalId",
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        "updatedAt" = NOW()
    `;

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error guardando notificación push' } satisfies ErrorResponse);
  }
}