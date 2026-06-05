-- Actualización v3: login, agenda visual, clientes, configuración, WhatsApp y estados de cita.
-- Ejecutar en Supabase > SQL Editor > New query > Run.

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'confirmed';

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT,
  "notes" TEXT,
  "colorFormula" TEXT,
  "allergies" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Setting" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO "Setting" ("key", "value") VALUES
('businessName', 'Salón Belleza'),
('whatsappPhone', ''),
('openingHour', '09:00'),
('closingHour', '19:00'),
('saturdayOpeningHour', '09:00'),
('saturdayClosingHour', '14:00'),
('slotMinutes', '30'),
('closedDays', '0')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Customer" ("name", "email", "phone", "notes")
SELECT DISTINCT ON ("clientEmail") "clientName", "clientEmail", "clientPhone", "notes"
FROM "Booking"
WHERE "clientEmail" IS NOT NULL
ON CONFLICT ("email") DO NOTHING;
