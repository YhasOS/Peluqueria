-- ==========================================================
-- GEMA ESTUDIO DE BELLEZA - SERVICIOS DEFINITIVOS V7
-- Ejecutar en Supabase > SQL Editor > New query > Run
-- IMPORTANTE: este script limpia servicios y citas de prueba.
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

DELETE FROM "BookingBlock";
DELETE FROM "Booking";
DELETE FROM "ServicePhase";
DELETE FROM "Service";
DELETE FROM "Category";
DELETE FROM "Professional";
DELETE FROM "Resource";

ALTER SEQUENCE IF EXISTS "Category_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "Service_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "ServicePhase_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "Professional_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "Resource_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "Booking_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "BookingBlock_id_seq" RESTART WITH 1;

INSERT INTO "Category" ("name", "description") VALUES
('Corte','Servicios de corte'),
('Peinados','Servicios de peinados'),
('Color','Servicios de color'),
('Mechas','Servicios de mechas'),
('Pack mechas balayage','Servicios de pack mechas balayage'),
('Servicios especiales','Servicios de servicios especiales'),
('Tratamientos','Servicios de tratamientos'),
('Otros servicios','Servicios de otros servicios'),
('Belleza & Estética','Servicios de belleza & estética'),
('Manos & Pies','Servicios de manos & pies');

INSERT INTO "Service" ("name","description","price","priceLabel","totalDuration","exclusive","categoryId")
SELECT v.name, v.description, v.price, v.priceLabel, v.duration, true, c.id
FROM (VALUES
('Corte','Corte personalizado con asesoramiento según rostro, cabello y estilo.',16,'16€ - 20€',35,'Corte'),
('Corte + peinado','Corte con acabado y peinado personalizado.',26,'desde 26€ - 28€',60,'Corte'),
('Corte caballero','Corte de caballero y acabado.',10,'10€',30,'Corte'),
('Corte infantil','Corte infantil hasta 5 años.',6,'6€',25,'Corte'),
('Peinado corto','Peinado para cabello corto.',10,'10€ - 12€',30,'Peinados'),
('Peinado medio','Peinado para media melena.',15,'15€ - 18€',40,'Peinados'),
('Peinado largo','Peinado para cabello largo.',20,'20€ - 25€',50,'Peinados'),
('Difusor','Secado con difusor para rizos y ondas.',8,'8€ - 12€',30,'Peinados'),
('Lavado de cabeza','Lavado con productos adecuados al tipo de cabello.',6,'6€ - 12€',20,'Peinados'),
('Color sin peinado','Servicio de coloración sin peinado incluido.',23,'23€ - 28€',75,'Color'),
('Color raíz + peinado','Color de raíz con peinado final.',35,'35€',90,'Color'),
('Color completo','Color completo con diagnóstico de tono.',38,'38€ - 43€',105,'Color'),
('Corte con color','Complemento de corte al realizar servicio de color.',10,'+10€',30,'Color'),
('Matiz','Matización para corregir o personalizar tonos.',16,'16€',45,'Color'),
('Mechas clásicas','Mechas clásicas según cantidad de producto.',60,'desde 60€',135,'Mechas'),
('Mechas e iluminación','Mechas e iluminación para aportar luz al cabello.',68,'68€ - 90€',150,'Mechas'),
('Pack mechas balayage','Pack completo de mechas balayage. Incluye corte, protección plex, matizador y corrección de color.',120,'desde 120€ - 130€',210,'Pack mechas balayage'),
('Transición a canas','Servicio especial para transición progresiva a canas. Requiere diagnóstico previo.',0,'Consultar',120,'Servicios especiales'),
('Cambio de look','Servicio personalizado para cambio de imagen. Requiere diagnóstico previo.',0,'Consultar',120,'Servicios especiales'),
('Tratamiento plex reconstrucción','Tratamiento reparador plex para reconstrucción del cabello sensibilizado.',50,'50€',75,'Tratamientos'),
('Hidratación y nutrición','Tratamiento de hidratación y nutrición para aportar suavidad y brillo.',35,'35€',60,'Tratamientos'),
('Colágeno','Tratamiento exprés de colágeno.',3,'3€ - 6€',15,'Tratamientos'),
('Mascarilla','Tratamiento exprés con mascarilla adaptada al cabello.',3,'3€ - 6€',15,'Tratamientos'),
('Ampollas minerales','Ampolla mineral como complemento del servicio.',4,'4€',10,'Tratamientos'),
('Ampollas anticaída','Ampolla anticaída como complemento del servicio.',5,'5€',10,'Tratamientos'),
('Alisados','Servicio de alisado según producto y diagnóstico.',60,'desde 60€',180,'Otros servicios'),
('Permanente','Servicio de permanente para aportar forma y volumen.',60,'desde 60€',150,'Otros servicios'),
('Teñido de pestañas','Teñido de pestañas para intensificar la mirada.',11,'11€',25,'Belleza & Estética'),
('Cejas','Depilación y limpieza de cejas.',5,'5€',15,'Belleza & Estética'),
('Teñido de cejas','Teñido de cejas para intensificar la mirada.',10,'10€',20,'Belleza & Estética'),
('Labio superior','Depilación de labio superior.',3,'3€',10,'Belleza & Estética'),
('Axilas','Depilación de axilas.',8,'8€',15,'Belleza & Estética'),
('Depilación de brazos','Depilación de brazos.',16,'16€',30,'Belleza & Estética'),
('Ingles normal','Depilación de ingles normal.',4,'4€',15,'Belleza & Estética'),
('Brasileña','Depilación brasileña.',15,'15€',30,'Belleza & Estética'),
('Medias piernas','Depilación de medias piernas.',16,'16€',30,'Belleza & Estética'),
('Piernas enteras','Depilación de piernas enteras.',25,'25€',45,'Belleza & Estética'),
('Limpieza facial','Higiene facial para limpiar, renovar e hidratar la piel.',35,'35€',60,'Belleza & Estética'),
('Mascarilla de oro','Tratamiento facial con mascarilla de oro.',25,'25€',45,'Belleza & Estética'),
('Manicura','Manicura y cuidado básico de manos.',16,'16€',45,'Manos & Pies'),
('Manicura con refuerzo','Manicura con refuerzo.',19,'19€',60,'Manos & Pies'),
('Pedicura','Pedicura y cuidado de pies.',20,'20€',60,'Manos & Pies'),
('Pedicura semipermanente','Pedicura semipermanente.',25,'25€',75,'Manos & Pies')
) AS v(name, description, price, priceLabel, duration, categoryName)
JOIN "Category" c ON c.name = v.categoryName;

INSERT INTO "ServicePhase" ("serviceId","order","name","duration","exclusive")
SELECT id, 1, 'Servicio completo', "totalDuration", true FROM "Service";

DELETE FROM "ServicePhase" WHERE "serviceId" IN (
  SELECT id FROM "Service" WHERE name IN ('Color sin peinado','Color raíz + peinado','Color completo','Mechas clásicas','Mechas e iluminación','Pack mechas balayage','Alisados','Permanente')
);

INSERT INTO "ServicePhase" ("serviceId","order","name","duration","exclusive")
SELECT s.id, v.ord, v.phase, v.duration, v.exclusive
FROM "Service" s
JOIN (VALUES
('Color sin peinado',1,'Aplicación de color',30,true),
('Color sin peinado',2,'Tiempo de exposición',30,false),
('Color sin peinado',3,'Lavado',15,true),
('Color raíz + peinado',1,'Aplicación raíz',30,true),
('Color raíz + peinado',2,'Tiempo de exposición',30,false),
('Color raíz + peinado',3,'Lavado y peinado',30,true),
('Color completo',1,'Aplicación de color',40,true),
('Color completo',2,'Tiempo de exposición',35,false),
('Color completo',3,'Lavado y acabado',30,true),
('Mechas clásicas',1,'Aplicación de mechas',65,true),
('Mechas clásicas',2,'Tiempo de exposición',40,false),
('Mechas clásicas',3,'Lavado, matiz y acabado',30,true),
('Mechas e iluminación',1,'Aplicación de iluminación',75,true),
('Mechas e iluminación',2,'Tiempo de exposición',40,false),
('Mechas e iluminación',3,'Lavado, matiz y acabado',35,true),
('Pack mechas balayage',1,'Diagnóstico, corte y aplicación',95,true),
('Pack mechas balayage',2,'Tiempo de exposición',50,false),
('Pack mechas balayage',3,'Protección plex, matizador y corrección',65,true),
('Alisados',1,'Preparación y aplicación',70,true),
('Alisados',2,'Tiempo de actuación',45,false),
('Alisados',3,'Sellado y acabado',65,true),
('Permanente',1,'Preparación y montaje',60,true),
('Permanente',2,'Tiempo de actuación',45,false),
('Permanente',3,'Neutralizado y acabado',45,true)
) AS v(serviceName, ord, phase, duration, exclusive) ON s.name = v.serviceName;

INSERT INTO "Professional" ("name","bio","specialties") VALUES
('Gema','Especialista en color, corte y cuidado del cabello.', ARRAY['Corte','Peinados','Color','Mechas','Pack mechas balayage','Tratamientos','Otros servicios']::TEXT[]),
('Profesional estética','Servicios de estética, depilación, manicura, pedicura y tratamientos faciales.', ARRAY['Belleza & Estética','Manos & Pies']::TEXT[])
ON CONFLICT DO NOTHING;

INSERT INTO "Resource" ("name","description") VALUES
('Puesto peluquería','Tocador principal de peluquería'),
('Lavacabezas','Zona de lavado y tratamientos capilares'),
('Zona estética','Espacio para estética, depilación, manos y pies')
ON CONFLICT DO NOTHING;

INSERT INTO "Setting" ("key","value") VALUES
('businessName','Gema Estudio de Belleza'),
('whatsappPhone','647067368'),
('openingHour','09:30'),
('closingHour','19:00'),
('saturdayOpeningHour','09:00'),
('saturdayClosingHour','14:00'),
('slotMinutes','30'),
('closedDays','0')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now();
