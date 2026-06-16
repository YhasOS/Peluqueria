-- V9 Gema Estudio de Belleza: clientas, trabajadoras, cambios/cancelaciones y resumen económico

CREATE TABLE IF NOT EXISTS "Staff" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "username" TEXT UNIQUE NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'staff',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO "Staff" ("name", "username", "role")
VALUES
('Gema', 'gema', 'admin_staff'),
('Trabajadora', 'trabajadora', 'staff')
ON CONFLICT ("username") DO NOTHING;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "staffId" INTEGER REFERENCES "Staff"("id");
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'confirmed';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "rescheduledFromId" INTEGER;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "finalPrice" NUMERIC(10,2);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;

-- Asignar Gema por defecto a reservas sin trabajadora
UPDATE "Booking"
SET "staffId" = (SELECT "id" FROM "Staff" WHERE "username"='gema' LIMIT 1)
WHERE "staffId" IS NULL;

CREATE TABLE IF NOT EXISTS "ClientAccessCode" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "usedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_client_access_email_phone" ON "ClientAccessCode" ("email", "phone");
CREATE INDEX IF NOT EXISTS "idx_booking_client_lookup" ON "Booking" ("clientEmail", "clientPhone");
CREATE INDEX IF NOT EXISTS "idx_booking_staff_time" ON "Booking" ("staffId", "startTime", "endTime");
CREATE INDEX IF NOT EXISTS "idx_booking_status" ON "Booking" ("status");
