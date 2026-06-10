-- ==========================================================
-- GEMA ESTUDIO DE BELLEZA - V8 APP DE CLIENTAS / PWA
-- Ejecutar en Supabase si no tienes Customer/Setting creadas.
-- No borra citas ni servicios existentes.
-- ==========================================================

ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "priceLabel" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'confirmed';

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "phone" TEXT,
  "notes" TEXT,
  "colorFormula" TEXT,
  "allergies" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Setting" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT UNIQUE NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Booking_clientEmail_idx" ON "Booking" ("clientEmail");
CREATE INDEX IF NOT EXISTS "Booking_clientPhone_idx" ON "Booking" ("clientPhone");
CREATE INDEX IF NOT EXISTS "Booking_startTime_idx" ON "Booking" ("startTime");

INSERT INTO "Setting" ("key","value") VALUES
('businessName','Gema Estudio de Belleza'),
('businessEmail','info@gemaestudiodebelleza.es'),
('whatsappPhone','647067368'),
('openingHour','09:30'),
('closingHour','19:00'),
('saturdayOpeningHour','09:00'),
('saturdayClosingHour','14:00'),
('slotMinutes','30'),
('closedDays','0')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now();
