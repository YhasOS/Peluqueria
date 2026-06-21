import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type ErrorResponse = { error: string };

function normalizeBigInt(value: any): any {
  if (typeof value === 'bigint') return Number(value);
  if (Array.isArray(value)) return value.map(normalizeBigInt);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, normalizeBigInt(v)])
    );
  }
  return value;
}

function cleanServiceIds(input: any): number[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0))];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          bt.*,
          COALESCE(
            json_agg(
              json_build_object('id', s.id, 'name', s.name, 'price', s.price)
              ORDER BY s.name
            ) FILTER (WHERE s.id IS NOT NULL),
            '[]'
          ) AS services,
          COALESCE(active_counts.active_count, 0) AS "activeCustomerBonuses"
        FROM "BonusType" bt
        LEFT JOIN "BonusService" bs ON bs."bonusTypeId" = bt.id
        LEFT JOIN "Service" s ON s.id = bs."serviceId"
        LEFT JOIN (
          SELECT "bonusTypeId", COUNT(*) AS active_count
          FROM "CustomerBonus"
          WHERE active = TRUE AND "remainingSessions" > 0
          GROUP BY "bonusTypeId"
        ) active_counts ON active_counts."bonusTypeId" = bt.id
        GROUP BY bt.id, active_counts.active_count
        ORDER BY bt."createdAt" DESC
      `);

      return res.status(200).json(normalizeBigInt(rows));
    }

    if (req.method === 'POST') {
      const { name, sessions, price, discountPercent, serviceIds, active } = req.body || {};
      const cleanedServiceIds = cleanServiceIds(serviceIds);
      const parsedSessions = Number(sessions);
      const parsedPrice = Number(price);
      const parsedDiscount =
        discountPercent === '' || discountPercent === null || discountPercent === undefined
          ? null
          : Number(discountPercent);

      if (!name || !Number.isFinite(parsedSessions) || parsedSessions <= 0 || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Nombre, sesiones y precio son obligatorios.' } satisfies ErrorResponse);
      }

      if (cleanedServiceIds.length === 0) {
        return res.status(400).json({ error: 'Selecciona al menos un servicio aplicable.' } satisfies ErrorResponse);
      }

      const result = await prisma.$transaction(async (tx) => {
        const created = await tx.$queryRaw<any[]>`
          INSERT INTO "BonusType" (name, sessions, price, "discountPercent", active, "createdAt", "updatedAt")
          VALUES (${String(name)}, ${parsedSessions}, ${parsedPrice}, ${parsedDiscount}, ${active === false ? false : true}, NOW(), NOW())
          RETURNING *
        `;

        const bonusType = created[0];

        for (const serviceId of cleanedServiceIds) {
          await tx.$executeRaw`
            INSERT INTO "BonusService" ("bonusTypeId", "serviceId")
            VALUES (${bonusType.id}, ${serviceId})
            ON CONFLICT ("bonusTypeId", "serviceId") DO NOTHING
          `;
        }

        return bonusType;
      });

      return res.status(201).json(normalizeBigInt(result));
    }

    if (req.method === 'PATCH') {
      const { id, active } = req.body || {};
      const bonusTypeId = Number(id);

      if (!bonusTypeId) {
        return res.status(400).json({ error: 'Bono no válido.' } satisfies ErrorResponse);
      }

      const updated = await prisma.$queryRaw<any[]>`
        UPDATE "BonusType"
        SET active = ${Boolean(active)}, "updatedAt" = NOW()
        WHERE id = ${bonusTypeId}
        RETURNING *
      `;

      return res.status(200).json(normalizeBigInt(updated[0]));
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error('BONUS TYPES ERROR:', error);
    return res.status(500).json({
      error: 'Error interno gestionando bonos.',
      detail: error?.message || String(error),
    });
  }
}