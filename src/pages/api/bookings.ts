import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { addMinutes } from 'date-fns';

type ErrorResponse = { error: string };

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { from, to, search } = req.query;
      const where: any = {};

      if (from || to) {
        where.startTime = {};
        if (typeof from === 'string' && from) where.startTime.gte = new Date(from);
        if (typeof to === 'string' && to) where.startTime.lte = new Date(to);
      }

      if (typeof search === 'string' && search.trim()) {
        where.OR = [
          { clientName: { contains: search.trim(), mode: 'insensitive' } },
          { clientEmail: { contains: search.trim(), mode: 'insensitive' } },
          { clientPhone: { contains: search.trim(), mode: 'insensitive' } },
        ];
      }

      const bookings = await prisma.booking.findMany({
        where,
        orderBy: { startTime: 'asc' },
        include: {
          service: { select: { name: true, price: true, totalDuration: true } },
          professional: { select: { id: true, name: true } },
          resource: { select: { name: true } },
        },
      });
      return res.status(200).json(bookings);
    }

    if (req.method === 'POST') {
      const { serviceId, date, startTime, name, email, phone, notes, professionalId, resourceId } = req.body;
      if (!serviceId || !date || !startTime || !name || !email) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' } satisfies ErrorResponse);
      }

      const service = await prisma.service.findUnique({
        where: { id: Number(serviceId) },
        include: { phases: true },
      });
      if (!service) return res.status(400).json({ error: 'Servicio no encontrado' } satisfies ErrorResponse);

      const start = new Date(startTime);
      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ error: 'Hora de inicio no válida' } satisfies ErrorResponse);
      }

      const phases = service.phases.sort((a, b) => a.order - b.order);
      const totalDuration = phases.reduce((acc, p) => acc + p.duration, 0) || service.totalDuration;
      const end = addMinutes(start, totalDuration + (service.preparationTime || 0));

      const existingBlocks = await prisma.bookingBlock.findMany({
        where: {
          booking: {
            date: new Date(date),
            ...(professionalId ? { professionalId: Number(professionalId) } : {}),
          },
        },
      });

      let cursor = new Date(start);
      for (const phase of phases) {
        const phaseStart = new Date(cursor);
        const phaseEnd = addMinutes(phaseStart, phase.duration);
        const hasConflict = existingBlocks.some((block) => {
          if (!phase.exclusive && !block.exclusive) return false;
          return overlap(phaseStart, phaseEnd, block.start, block.end);
        });
        if (hasConflict) {
          return res.status(409).json({ error: 'La hora seleccionada ya no está disponible. Elige otra hora.' } satisfies ErrorResponse);
        }
        cursor = phaseEnd;
      }

      // Crear o actualizar ficha de cliente para historial
      try {
        await (prisma as any).customer.upsert({
          where: { email: String(email) },
          update: { name: String(name), phone: phone ? String(phone) : null, notes: notes ? String(notes) : undefined },
          create: { name: String(name), email: String(email), phone: phone ? String(phone) : null, notes: notes ? String(notes) : null },
        });
      } catch (e) {
        // La tabla Customer puede no existir si aún no se ejecutó la actualización SQL. No bloqueamos la reserva.
      }

      const booking = await prisma.booking.create({
        data: {
          clientName: String(name),
          clientEmail: String(email),
          clientPhone: phone ? String(phone) : null,
          notes: notes ? String(notes) : null,
          date: new Date(date),
          startTime: start,
          endTime: end,
          service: { connect: { id: Number(serviceId) } },
          professional: professionalId ? { connect: { id: Number(professionalId) } } : undefined,
          resource: resourceId ? { connect: { id: Number(resourceId) } } : undefined,
        },
        include: { service: true, professional: true, resource: true },
      });

      cursor = new Date(start);
      for (const phase of phases) {
        const blockStart = new Date(cursor);
        const blockEnd = addMinutes(blockStart, phase.duration);
        await prisma.bookingBlock.create({
          data: {
            bookingId: booking.id,
            start: blockStart,
            end: blockEnd,
            exclusive: phase.exclusive,
          },
        });
        cursor = blockEnd;
      }

      return res.status(201).json(booking);
    }

    if (req.method === 'PATCH') {
      const id = Number(req.query.id);
      const { startTime, professionalId, status, notes } = req.body || {};
      if (!id) return res.status(400).json({ error: 'ID de cita no válido' } satisfies ErrorResponse);

      const current = await prisma.booking.findUnique({ where: { id }, include: { service: { include: { phases: true } } } });
      if (!current) return res.status(404).json({ error: 'Cita no encontrada' } satisfies ErrorResponse);

      const data: any = {};
      if (notes !== undefined) data.notes = notes ? String(notes) : null;
      if (status) data.status = String(status);
      if (professionalId !== undefined) data.professionalId = professionalId ? Number(professionalId) : null;

      if (startTime) {
        const start = new Date(startTime);
        const phases = current.service.phases.sort((a, b) => a.order - b.order);
        const totalDuration = phases.reduce((acc, p) => acc + p.duration, 0) || current.service.totalDuration;
        const end = addMinutes(start, totalDuration + (current.service.preparationTime || 0));
        const targetProfessionalId = professionalId !== undefined ? Number(professionalId) : current.professionalId;

        const existingBlocks = await prisma.bookingBlock.findMany({
          where: {
            bookingId: { not: id },
            booking: {
              date: new Date(start.toISOString().slice(0, 10)),
              ...(targetProfessionalId ? { professionalId: targetProfessionalId } : {}),
            },
          },
        });

        let cursor = new Date(start);
        for (const phase of phases) {
          const phaseStart = new Date(cursor);
          const phaseEnd = addMinutes(phaseStart, phase.duration);
          const hasConflict = existingBlocks.some((block) => {
            if (!phase.exclusive && !block.exclusive) return false;
            return overlap(phaseStart, phaseEnd, block.start, block.end);
          });
          if (hasConflict) return res.status(409).json({ error: 'La nueva hora se solapa con otra cita.' } satisfies ErrorResponse);
          cursor = phaseEnd;
        }

        data.date = new Date(start.toISOString().slice(0, 10));
        data.startTime = start;
        data.endTime = end;

        await prisma.bookingBlock.deleteMany({ where: { bookingId: id } });
        cursor = new Date(start);
        for (const phase of phases) {
          const blockStart = new Date(cursor);
          const blockEnd = addMinutes(blockStart, phase.duration);
          await prisma.bookingBlock.create({ data: { bookingId: id, start: blockStart, end: blockEnd, exclusive: phase.exclusive } });
          cursor = blockEnd;
        }
      }

      const updated = await prisma.booking.update({ where: { id }, data, include: { service: true, professional: true, resource: true } });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query.id);
      if (!id) return res.status(400).json({ error: 'ID de cita no válido' } satisfies ErrorResponse);
      await prisma.bookingBlock.deleteMany({ where: { bookingId: id } });
      await prisma.booking.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' } satisfies ErrorResponse);
  }
}
