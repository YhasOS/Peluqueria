import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type ErrorResponse = { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const customerId = req.query.customerId ? Number(req.query.customerId) : null;
      const where = customerId ? `WHERE cb."customerId" = $1` : '';
      const params = customerId ? [customerId] : [];
      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          cb.*,
          c.name AS "customerName",
          c.email AS "customerEmail",
          c.phone AS "customerPhone",
          bt.name AS "bonusName",
          bt.sessions AS "bonusSessions",
          bt.price AS "bonusPrice",
          bt."discountPercent" AS "discountPercent",
          COALESCE(
            json_agg(
              json_build_object('id', s.id, 'name', s.name)
              ORDER BY s.name
            ) FILTER (WHERE s.id IS NOT NULL),
            '[]'
          ) AS services
        FROM "CustomerBonus" cb
        JOIN "Customer" c ON c.id = cb."customerId"
        JOIN "BonusType" bt ON bt.id = cb."bonusTypeId"
        LEFT JOIN "BonusService" bs ON bs."bonusTypeId" = bt.id
        LEFT JOIN "Service" s ON s.id = bs."serviceId"
        ${where}
        GROUP BY cb.id, c.id, bt.id
        ORDER BY cb."createdAt" DESC
      `, ...params);
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { customerId, bonusTypeId, expiryDate } = req.body || {};
      const parsedCustomerId = Number(customerId);
      const parsedBonusTypeId = Number(bonusTypeId);

      if (!parsedCustomerId || !parsedBonusTypeId) {
        return res.status(400).json({ error: 'Selecciona cliente y tipo de bono.' } satisfies ErrorResponse);
      }

      const created = await prisma.$transaction(async (tx) => {
        const bonusRows = await tx.$queryRaw<any[]>`
          SELECT id, sessions
          FROM "BonusType"
          WHERE id = ${parsedBonusTypeId} AND active = TRUE
          LIMIT 1
        `;
        const bonus = bonusRows[0];
        if (!bonus) throw new Error('El bono no existe o está inactivo.');

        const result = await tx.$queryRaw<any[]>`
          INSERT INTO "CustomerBonus" ("customerId", "bonusTypeId", "initialSessions", "remainingSessions", "purchaseDate", "expiryDate", active, "createdAt", "updatedAt")
          VALUES (${parsedCustomerId}, ${parsedBonusTypeId}, ${Number(bonus.sessions)}, ${Number(bonus.sessions)}, NOW(), ${expiryDate ? new Date(expiryDate) : null}, TRUE, NOW(), NOW())
          RETURNING *
        `;
        return result[0];
      });

      return res.status(201).json(created);
    }

    if (req.method === 'PATCH') {
      const { id, active } = req.body || {};
      const customerBonusId = Number(id);
      if (!customerBonusId) return res.status(400).json({ error: 'Bono de cliente no válido.' } satisfies ErrorResponse);
      await prisma.$executeRaw`
        UPDATE "CustomerBonus"
        SET active = ${Boolean(active)}, "updatedAt" = NOW()
        WHERE id = ${customerBonusId}
      `;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error('CUSTOMER BONUSES ERROR:', error);
    return res.status(500).json({ error: error?.message || 'Error interno gestionando bonos de clientes.' });
  }
}
