-- Ejecutar en Supabase SQL Editor si necesitas crear la base desde cero.
-- No incluye contraseñas ni datos sensibles.

CREATE TABLE IF NOT EXISTS "Category" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "Service" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "totalDuration" INTEGER NOT NULL,
  "preparationTime" INTEGER,
  "exclusive" BOOLEAN NOT NULL,
  "categoryId" INTEGER NOT NULL REFERENCES "Category"("id")
);

CREATE TABLE IF NOT EXISTS "ServicePhase" (
  "id" SERIAL PRIMARY KEY,
  "serviceId" INTEGER NOT NULL REFERENCES "Service"("id") ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "duration" INTEGER NOT NULL,
  "exclusive" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "Professional" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "bio" TEXT,
  "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[]
);

CREATE TABLE IF NOT EXISTS "Resource" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "Booking" (
  "id" SERIAL PRIMARY KEY,
  "clientName" TEXT NOT NULL,
  "clientEmail" TEXT NOT NULL,
  "clientPhone" TEXT,
  "notes" TEXT,
  "date" TIMESTAMP NOT NULL,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  "serviceId" INTEGER NOT NULL REFERENCES "Service"("id"),
  "professionalId" INTEGER REFERENCES "Professional"("id"),
  "resourceId" INTEGER REFERENCES "Resource"("id")
);

CREATE TABLE IF NOT EXISTS "BookingBlock" (
  "id" SERIAL PRIMARY KEY,
  "bookingId" INTEGER NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
  "start" TIMESTAMP NOT NULL,
  "end" TIMESTAMP NOT NULL,
  "exclusive" BOOLEAN NOT NULL
);

-- Datos iniciales. Si ya los tienes, puedes saltarte esta parte.
INSERT INTO "Category" ("name","description")
SELECT * FROM (VALUES
('Peluquería','Servicios de peluquería'),
('Coloración','Color y mechas'),
('Estética','Tratamientos estéticos')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM "Category");

INSERT INTO "Professional" ("name","bio","specialties")
SELECT * FROM (VALUES
('María','Especialista en corte, peinado y coloración', ARRAY['Peluquería','Coloración']::TEXT[]),
('Laura','Especialista en mechas y tratamientos capilares', ARRAY['Coloración','Tratamientos']::TEXT[]),
('Ana','Especialista en estética, manicura y pedicura', ARRAY['Estética','Manicura']::TEXT[])
) AS v(name, bio, specialties)
WHERE NOT EXISTS (SELECT 1 FROM "Professional");

INSERT INTO "Resource" ("name","description")
SELECT * FROM (VALUES
('Tocador 1','Puesto principal'),
('Tocador 2','Puesto secundario'),
('Cabina estética','Cabina para estética y manicura')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM "Resource");

INSERT INTO "Service" ("name","description","price","totalDuration","exclusive","categoryId")
SELECT * FROM (VALUES
('Corte Mujer','Corte y acabado',25,45,true,1),
('Corte Hombre','Corte masculino',15,30,true,1),
('Lavar y Peinar','Lavado y peinado',18,30,true,1),
('Tinte Raíz','Coloración raíz',45,90,true,2),
('Mechas','Mechas completas',75,150,true,2),
('Manicura','Manicura semipermanente',25,60,true,3)
) AS v(name, description, price, totalDuration, exclusive, categoryId)
WHERE NOT EXISTS (SELECT 1 FROM "Service");

INSERT INTO "ServicePhase" ("serviceId","order","name","duration","exclusive")
SELECT * FROM (VALUES
(1,1,'Servicio completo',45,true),
(2,1,'Servicio completo',30,true),
(3,1,'Servicio completo',30,true),
(4,1,'Aplicación tinte',30,true),
(4,2,'Tiempo de exposición',30,false),
(4,3,'Lavado y peinado',30,true),
(5,1,'Aplicación mechas',60,true),
(5,2,'Tiempo de exposición',45,false),
(5,3,'Lavado y acabado',45,true),
(6,1,'Servicio completo',60,true)
) AS v(serviceId, ord, name, duration, exclusive)
WHERE NOT EXISTS (SELECT 1 FROM "ServicePhase");
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
