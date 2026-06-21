import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

const STAFF_COOKIE = 'gema_staff_auth';

function getStaffId(req: NextApiRequest): number | null {
  const raw = req.cookies?.[STAFF_COOKIE];
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const id = Number(data.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    const staffId = getStaffId(req);
    if (!staffId) return res.status(401).json({ error: 'No autorizado' });

    const id = Number(req.body?.id);
    if (!id) return res.status(400).json({ error: 'Cita no válida' });

    const booking = await prisma.booking.findFirst({
      where: { id, professionalId: staffId },
      include: { service: { select: { id: true, name: true } } },
    });
    if (!booking) return res.status(403).json({ error: 'Solo puedes marcar como realizadas tus propias citas' });

    const result = await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: 'completed' },
      });

      const customers = await tx.$queryRaw<any[]>`
        SELECT id
        FROM "Customer"
        WHERE lower(email) = lower(${booking.clientEmail})
        LIMIT 1
      `;

      const customer = customers[0];
      if (!customer?.id) {
        return { bonusConsumed: false, reason: 'Cliente sin ficha' };
      }

      const matchingBonuses = await tx.$queryRaw<any[]>`
        SELECT
          cb.id,
          cb."remainingSessions",
          bt.name AS "bonusName"
        FROM "CustomerBonus" cb
        JOIN "BonusType" bt ON bt.id = cb."bonusTypeId"
        JOIN "BonusService" bs ON bs."bonusTypeId" = bt.id
        WHERE cb."customerId" = ${Number(customer.id)}
          AND bs."serviceId" = ${booking.serviceId}
          AND cb.active = TRUE
          AND bt.active = TRUE
          AND cb."remainingSessions" > 0
          AND (cb."expiryDate" IS NULL OR cb."expiryDate" >= NOW())
          AND NOT EXISTS (
            SELECT 1 FROM "BonusUsage" bu WHERE bu."bookingId" = ${id}
          )
        ORDER BY cb."expiryDate" ASC NULLS LAST, cb."purchaseDate" ASC, cb.id ASC
        LIMIT 1
      `;

      const bonus = matchingBonuses[0];
      if (!bonus?.id) {
        return { bonusConsumed: false, reason: 'Sin bono aplicable' };
      }

      await tx.$executeRaw`
        UPDATE "CustomerBonus"
        SET "remainingSessions" = "remainingSessions" - 1,
            "updatedAt" = NOW()
        WHERE id = ${Number(bonus.id)}
          AND "remainingSessions" > 0
      `;

      await tx.$executeRaw`
        INSERT INTO "BonusUsage" ("customerBonusId", "bookingId", "serviceId", "usedByProfessionalId", "usedAt", notes)
        VALUES (${Number(bonus.id)}, ${id}, ${booking.serviceId}, ${staffId}, NOW(), ${`Cita realizada: ${booking.service?.name || 'Servicio'}`})
        ON CONFLICT ("bookingId") DO NOTHING
      `;

      return {
        bonusConsumed: true,
        bonusName: String(bonus.bonusName || 'Bono'),
        remainingSessions: Number(bonus.remainingSessions) - 1,
      };
    });

    return res.status(200).json({ ok: true, ...result });
  } catch (error: any) {
    console.error('STAFF COMPLETE ERROR:', error);
    return res.status(500).json({ error: 'Error marcando cita como realizada', detail: error?.message || String(error) });
  }
}
