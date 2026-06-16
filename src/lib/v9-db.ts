import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prismaV9?: PrismaClient };

export const prisma = globalForPrisma.prismaV9 || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaV9 = prisma;

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}

export function cleanPhone(phone: string) {
  return String(phone || '').replace(/\s+/g, '').trim();
}

export function cleanEmail(email: string) {
  return String(email || '').toLowerCase().trim();
}

export function parseDateOnly(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}
