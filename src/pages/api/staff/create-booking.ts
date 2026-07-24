import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { addMinutes } from 'date-fns';
import { sendPushToProfessional } from '@/lib/push';

const STAFF_COOKIE = 'gema_staff_auth';

function getStaffId(req: NextApiRequest): number | null {
  const raw = req.cookies?.[STAFF_COOKIE];
  if (!raw) return null;

  try {
    const data = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const id = Number(data.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

function cleanPhone(value: unknown) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function internalEmail(phone: string) {
  const normalized = phone.replace(/\D/g, '') || Date.now().toString();
  return `staff-${normalized}@gema.local`;
}

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const staffId = getStaffId(req);
    if (!staffId) {
      return res.status(401).json({ error: 'Sesión de trabajadora no válida.' });
    }

    const {
      customerId,
      name,
      phone,
      email,
      serviceId,
      professionalId,
      date,
      startTime,
      notes,
    } = req.body || {};

    const clientName = String(name || '').trim();
    const clientPhone = cleanPhone(phone);
    const selectedServiceId = Number(serviceId);
    const selectedProfessionalId = Number(professionalId);

    if (
      !clientName ||
      !clientPhone ||
      !selectedServiceId ||
      !selectedProfessionalId ||
      !date ||
      !startTime
    ) {
      return res.status(400).json({
        error: 'Nombre, teléfono, servicio, profesional, fecha y hora son obligatorios.',
      });
    }

    const [staff, professional, service] = await Promise.all([
      prisma.professional.findUnique({
        where: { id: staffId },
        select: { id: true, active: true },
      }),
      prisma.professional.findUnique({
        where: { id: selectedProfessionalId },
        select: { id: true, name: true, active: true },
      }),
      prisma.service.findUnique({
        where: { id: selectedServiceId },
        include: { phases: true },
      }),
    ]);

    if (!staff?.active) {
      return res.status(401).json({ error: 'Trabajadora no autorizada.' });
    }

    if (!professional?.active) {
      return res.status(400).json({ error: 'La profesional seleccionada no está activa.' });
    }

    if (!service) {
      return res.status(400).json({ error: 'Servicio no encontrado.' });
    }

    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ error: 'La hora seleccionada no es válida.' });
    }

    const phases = [...service.phases].sort((a, b) => a.order - b.order);
    const totalDuration =
      phases.reduce((total, phase) => total + phase.duration, 0) || service.totalDuration;
    const end = addMinutes(start, totalDuration + (service.preparationTime || 0));

    const existingBlocks = await prisma.bookingBlock.findMany({
      where: {
        booking: {
          professionalId: selectedProfessionalId,
          status: { not: 'cancelled' },
          startTime: {
            gte: new Date(`${String(date)}T00:00:00`),
            lte: new Date(`${String(date)}T23:59:59`),
          },
        },
      },
    });

    if (phases.length) {
      let cursor = new Date(start);

      for (const phase of phases) {
        const phaseStart = new Date(cursor);
        const phaseEnd = addMinutes(phaseStart, phase.duration);

        const conflict = existingBlocks.some((block) => {
          if (!phase.exclusive && !block.exclusive) return false;
          return overlap(phaseStart, phaseEnd, block.start, block.end);
        });

        if (conflict) {
          return res.status(409).json({
            error: 'Ese horario acaba de ocuparse. Selecciona otro.',
          });
        }

        cursor = phaseEnd;
      }
    } else {
      const conflict = await prisma.booking.findFirst({
        where: {
          professionalId: selectedProfessionalId,
          status: { not: 'cancelled' },
          startTime: { lt: end },
          endTime: { gt: start },
        },
        select: { id: true },
      });

      if (conflict) {
        return res.status(409).json({
          error: 'Ese horario acaba de ocuparse. Selecciona otro.',
        });
      }
    }

    let customer: any = null;

    if (customerId) {
      customer = await (prisma as any).customer.findUnique({
        where: { id: Number(customerId) },
      });
    }

    if (!customer) {
      customer = await (prisma as any).customer.findFirst({
        where: {
          OR: [
            { phone: clientPhone },
            ...(email ? [{ email: String(email).trim().toLowerCase() }] : []),
          ],
        },
      });
    }

    const clientEmail =
      String(email || customer?.email || internalEmail(clientPhone))
        .trim()
        .toLowerCase();

    customer = await (prisma as any).customer.upsert({
      where: { email: clientEmail },
      update: {
        name: clientName,
        phone: clientPhone,
        notes: notes ? String(notes) : customer?.notes || null,
      },
      create: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        notes: notes ? String(notes) : null,
      },
    });

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          clientName,
          clientEmail,
          clientPhone,
          notes: notes ? String(notes) : null,
          date: new Date(String(date)),
          startTime: start,
          endTime: end,
          service: { connect: { id: selectedServiceId } },
          professional: { connect: { id: selectedProfessionalId } },
        },
        include: {
          service: true,
          professional: true,
        },
      });

      if (phases.length) {
        let cursor = new Date(start);

        for (const phase of phases) {
          const blockStart = new Date(cursor);
          const blockEnd = addMinutes(blockStart, phase.duration);

          await tx.bookingBlock.create({
            data: {
              bookingId: created.id,
              start: blockStart,
              end: blockEnd,
              exclusive: phase.exclusive,
            },
          });

          cursor = blockEnd;
        }
      } else {
        await tx.bookingBlock.create({
          data: {
            bookingId: created.id,
            start,
            end,
            exclusive: true,
          },
        });
      }

      return created;
    });

    await sendPushToProfessional(booking.professionalId, {
      title: 'Nueva cita creada',
      body: `${booking.clientName} · ${booking.service.name} · ${booking.startTime.toLocaleString(
        'es-ES'
      )}`,
      url: '/staff',
    }).catch((error) => {
      console.error('STAFF CREATE BOOKING PUSH ERROR:', error);
    });

    return res.status(201).json(booking);
  } catch (error: any) {
    console.error('STAFF CREATE BOOKING ERROR:', error);
    return res.status(500).json({
      error: 'No se pudo crear la cita.',
      detail: error?.message || String(error),
    });
  }
}
