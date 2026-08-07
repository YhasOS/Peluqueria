import { addMinutes, isBefore, max } from 'date-fns';
import prisma from './prisma';
import type { Service, ServicePhase, BookingBlock } from '@prisma/client';

export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 19;

function parseHour(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const hour = Number(value.split(':')[0]);
  return Number.isFinite(hour) ? hour : fallback;
}

async function getSettings() {
  try {
    const rows = await (prisma as any).setting.findMany();
    const data: Record<string, string> = {};
    rows.forEach((r: any) => { data[r.key] = r.value; });
    return data;
  } catch {
    return {};
  }
}

/**
 * Compute available start times for a service on a given date for the given
 * professional. This naive implementation retrieves existing booking blocks
 * on the date and subtracts them from the day schedule. It then tests
 * whether the service phases fit into free windows. If `professionalId`
 * is undefined, the function considers any professional able to perform
 * the service (requires additional logic to filter by specialties).
 */
export async function getAvailableSlots(
  serviceId: number,
  date: Date,
  professionalId?: number
): Promise<Date[]> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { phases: true },
  });
  if (!service) return [];
  // Flatten service phases into durations and exclusivity flags
  const phases = service.phases.sort((a, b) => a.order - b.order);
  const totalDuration = phases.reduce((acc, p) => acc + p.duration, 0);
  const prep = service.preparationTime || 0;
  const requiredDuration = totalDuration + prep;

  const settings = await getSettings();
  const weekday = date.getDay();
  const closedDays = (settings.closedDays || '0').split(',').map((d) => Number(d.trim()));
  if (closedDays.includes(weekday)) return [];

  const openingHour = weekday === 6 ? parseHour(settings.saturdayOpeningHour, 9) : parseHour(settings.openingHour, OPENING_HOUR);
  const closingHour = weekday === 6 ? parseHour(settings.saturdayClosingHour, 14) : parseHour(settings.closingHour, CLOSING_HOUR);
  const slotMinutes = Number(settings.slotMinutes || 30) || 30;

  // Determine day boundaries
  const dayStart = new Date(date);
  dayStart.setHours(openingHour, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(closingHour, 0, 0, 0);

  // Fetch existing booking blocks for this professional or service
  const bookingBlocks: BookingBlock[] = await prisma.bookingBlock.findMany({
    where: {
      booking: {
        date: date,
        ...(professionalId ? { professionalId } : {}),
      },
    },
  });
  // Sort blocks by start time
  bookingBlocks.sort((a, b) => (a.start < b.start ? -1 : 1));

  // Build list of free intervals between bookings
  const freeIntervals: { start: Date; end: Date }[] = [];
  let currentStart = dayStart;
  for (const block of bookingBlocks) {
    if (isBefore(currentStart, block.start)) {
      freeIntervals.push({ start: new Date(currentStart), end: new Date(block.start) });
    }
    currentStart = max([currentStart, block.end]);
  }
  if (isBefore(currentStart, dayEnd)) {
    freeIntervals.push({ start: new Date(currentStart), end: dayEnd });
  }

  // For each free interval, test if the service fits, including exclusive
  // considerations. A more sophisticated scheduler would also ensure
  // compatibility with non-exclusive phases across bookings but this sample
  // keeps it simple.
  const availableSlots: Date[] = [];
  for (const interval of freeIntervals) {
    let slotStart = new Date(interval.start);
    while (addMinutes(slotStart, requiredDuration) <= interval.end) {
      // Check exclusive conflicts: ensure there are no blocks overlapping
      // phases marked as exclusive in other bookings during this slot.
      const conflict = bookingBlocks.some((block) => {
        // Only compare blocks marked exclusive. Non-exclusive blocks allow overlaps.
        if (!block.exclusive) return false;
        const slotEnd = addMinutes(slotStart, requiredDuration);
        return block.start < slotEnd && block.end > slotStart;
      });
      if (!conflict) {
        availableSlots.push(new Date(slotStart));
      }
      // Move forward by configured increments
      slotStart = addMinutes(slotStart, slotMinutes);
    }
  }
  return availableSlots;
}