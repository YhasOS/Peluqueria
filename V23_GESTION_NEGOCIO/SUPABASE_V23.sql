-- V23 - Email opcional, varios servicios por cita e histórico/estadísticas
-- Ejecutar UNA VEZ en Supabase > SQL Editor antes de desplegar V23.

BEGIN;

ALTER TABLE "Customer" ALTER COLUMN email DROP NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "clientEmail" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "BookingService" (
  id SERIAL PRIMARY KEY,
  "bookingId" INTEGER NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  "serviceId" INTEGER NOT NULL REFERENCES "Service"(id),
  position INTEGER NOT NULL DEFAULT 0,
  price DOUBLE PRECISION NOT NULL,
  duration INTEGER NOT NULL,
  CONSTRAINT "BookingService_bookingId_serviceId_key" UNIQUE ("bookingId", "serviceId")
);

CREATE INDEX IF NOT EXISTS "BookingService_bookingId_idx" ON "BookingService"("bookingId");
CREATE INDEX IF NOT EXISTS "BookingService_serviceId_idx" ON "BookingService"("serviceId");

-- Todas las citas antiguas pasan a tener su servicio principal también en BookingService.
INSERT INTO "BookingService" ("bookingId", "serviceId", position, price, duration)
SELECT b.id, b."serviceId", 0, s.price, s."totalDuration"
FROM "Booking" b
JOIN "Service" s ON s.id = b."serviceId"
ON CONFLICT ("bookingId", "serviceId") DO NOTHING;

COMMIT;
