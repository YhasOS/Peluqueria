import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type HealthResponse = {
  ok: boolean;
  database: 'connected' | 'error';
  services?: number;
  professionals?: number;
  responseTimeMs: number;
  timestamp: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  const startedAt = Date.now();

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', ['GET', 'HEAD']);
    return res.status(405).json({
      ok: false,
      database: 'error',
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      error: `Method ${req.method} Not Allowed`,
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    const [services, professionals] = await Promise.all([
      prisma.service.count(),
      prisma.professional.count({
        where: { active: true },
      }),
    ]);

    const payload: HealthResponse = {
      ok: true,
      database: 'connected',
      services,
      professionals,
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };

    res.setHeader('Cache-Control', 'no-store, max-age=0');

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    return res.status(200).json(payload);
  } catch (error: any) {
    console.error('HEALTH CHECK ERROR:', error);

    return res.status(503).json({
      ok: false,
      database: 'error',
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      error: error?.message || 'No se pudo conectar con la base de datos',
    });
  }
}
