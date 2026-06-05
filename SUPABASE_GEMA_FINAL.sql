-- ==========================================================
-- GEMA ESTUDIO DE BELLEZA - CONFIGURACIÓN FINAL
-- Ejecutar en Supabase > SQL Editor > New query > Run
--
-- IMPORTANTE: este script limpia servicios y citas de prueba
-- para dejar la web preparada con la carta definitiva.
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
('Peluquería','Lavado, cortes y servicios básicos de peluquería'),
('Peinados','Peinados según longitud y acabado'),
('Color & Mechas','Coloración, tintes, baños de color, matizadores y mechas'),
('Tratamientos capilares','Hidratación, nutrición, reparación, alisados y cuidado capilar'),
('Belleza & Estética','Depilación, cejas, faciales y estética básica'),
('Manos & Pies','Manicura, pedicura y cuidado de uñas');

INSERT INTO "Service" ("name","description","price","priceLabel","totalDuration","exclusive","categoryId")
SELECT v.name, v.description, v.price, v.priceLabel, v.duration, true, c.id
FROM (VALUES
('Lavado de cabeza','Lavado de cabeza con productos adecuados al tipo de cabello.',6,'6€ - 12€',20,'Peluquería'),
('Corte','Corte personalizado con asesoramiento según rostro y estilo.',16,'16€ - 20€',35,'Peluquería'),
('Corte sin peinado','Corte de cabello sin servicio de peinado.',16,'16€',30,'Peluquería'),
('Corte + peinado','Corte personalizado con acabado y peinado.',26,'desde 26€ - 28€',60,'Peluquería'),
('Corte caballero','Corte masculino, perfilado y acabado.',10,'10€',30,'Peluquería'),
('Corte infantil','Corte infantil hasta 5 años.',6,'6€',25,'Peluquería'),

('Peinado corto','Peinado para cabello corto.',10,'10€ - 13€',30,'Peinados'),
('Peinado medio','Peinado para media melena.',15,'15€ - 18€',40,'Peinados'),
('Peinado largo','Peinado para cabello largo.',20,'20€ - 25€',50,'Peinados'),
('Peinado extra largo','Peinado para cabello extra largo o con mayor elaboración.',28,'28€',60,'Peinados'),
('Difusor','Secado con difusor para rizos y ondas.',8,'8€ - 12€',30,'Peinados'),

('Color sin peinado','Servicio de coloración sin peinado incluido.',23,'23€',75,'Color & Mechas'),
('Color completo','Color completo con diagnóstico de tono.',28,'28€',90,'Color & Mechas'),
('Tinte','Aplicación de tinte según necesidad.',14,'14€',75,'Color & Mechas'),
('Agua oxigenada','Complemento técnico para trabajos de color.',2.5,'2,50€',10,'Color & Mechas'),
('Matizador','Matización para corregir o personalizar tonos.',16,'16€',45,'Color & Mechas'),
('Baño de color','Color suave para aportar brillo y refrescar tono.',19,'19€',60,'Color & Mechas'),
('Mechas tradicionales','Mechas tradicionales con diagnóstico previo.',45,'45€',120,'Color & Mechas'),
('Mechas iluminaciones','Mechas de iluminación para dar luz al cabello.',35,'35€',105,'Color & Mechas'),
('Retoque de mechas','Retoque de mechas en zonas necesarias.',20,'20€',75,'Color & Mechas'),
('Mechas contraste','Mechas de contraste para un resultado más marcado.',65,'65€',150,'Color & Mechas'),
('Baby light','Mechas finas y naturales tipo babylight.',90,'90€',180,'Color & Mechas'),

('Hidratante','Tratamiento hidratante para aportar suavidad y brillo.',15,'15€',30,'Tratamientos capilares'),
('Nutritivo','Tratamiento nutritivo para cabello seco o sensibilizado.',20,'20€',40,'Tratamientos capilares'),
('Tratamiento especial','Tratamiento capilar personalizado según diagnóstico.',35,'35€',60,'Tratamientos capilares'),
('Recuperador celular','Tratamiento reparador avanzado para cabello castigado.',50,'50€',75,'Tratamientos capilares'),
('Alisados','Servicio de alisado o reducción de volumen según diagnóstico.',60,'60€',180,'Tratamientos capilares'),
('Permanentes','Servicio de permanente para aportar forma y volumen.',50,'50€',150,'Tratamientos capilares'),
('Ampollas','Ampolla específica como complemento del servicio.',5,'5€',10,'Tratamientos capilares'),
('Colágeno extra','Complemento de colágeno para tratamiento capilar.',4,'4€',10,'Tratamientos capilares'),
('Mascarilla extra','Mascarilla extra adaptada al estado del cabello.',3,'3€',10,'Tratamientos capilares'),

('Cejas','Depilación y limpieza de cejas.',5,'5€',15,'Belleza & Estética'),
('Teñido de cejas','Teñido de cejas para intensificar la mirada.',10,'10€',20,'Belleza & Estética'),
('Teñido de cejas y pestañas','Teñido de cejas y pestañas para iluminar la mirada.',18,'18€',30,'Belleza & Estética'),
('Labio superior','Depilación de labio superior.',3,'3€',10,'Belleza & Estética'),
('Axilas','Depilación de axilas.',6,'6€',15,'Belleza & Estética'),
('Ingles normal','Depilación de ingles normal.',4,'4€',15,'Belleza & Estética'),
('Brasileña','Depilación brasileña.',15,'15€',30,'Belleza & Estética'),
('Medias piernas','Depilación de medias piernas.',12,'12€',30,'Belleza & Estética'),
('Piernas enteras','Depilación de piernas enteras.',20,'20€',45,'Belleza & Estética'),
('Limpieza facial','Higiene facial para limpiar, renovar e hidratar la piel.',35,'35€',60,'Belleza & Estética'),
('Mascarilla de oro','Tratamiento facial con mascarilla de oro.',25,'25€',45,'Belleza & Estética'),

('Manicura','Manicura y cuidado básico de manos.',16,'16€',45,'Manos & Pies'),
('Pedicura','Pedicura y cuidado de pies.',20,'20€',60,'Manos & Pies')
) AS v(name, description, price, priceLabel, duration, categoryName)
JOIN "Category" c ON c.name = v.categoryName;

-- Fase única para servicios sencillos
INSERT INTO "ServicePhase" ("serviceId","order","name","duration","exclusive")
SELECT id, 1, 'Servicio completo', "totalDuration", true FROM "Service";

-- Fases específicas para color y trabajos con tiempo de exposición
DELETE FROM "ServicePhase" WHERE "serviceId" IN (
  SELECT id FROM "Service" WHERE name IN ('Color sin peinado','Color completo','Tinte','Baño de color','Mechas tradicionales','Mechas iluminaciones','Retoque de mechas','Mechas contraste','Baby light','Alisados','Permanentes')
);

INSERT INTO "ServicePhase" ("serviceId","order","name","duration","exclusive")
SELECT s.id, v.ord, v.phase, v.duration, v.exclusive
FROM "Service" s
JOIN (VALUES
('Color sin peinado',1,'Aplicación de color',30,true),('Color sin peinado',2,'Tiempo de exposición',30,false),('Color sin peinado',3,'Lavado',15,true),
('Color completo',1,'Aplicación de color',35,true),('Color completo',2,'Tiempo de exposición',30,false),('Color completo',3,'Lavado y revisión',25,true),
('Tinte',1,'Aplicación de tinte',30,true),('Tinte',2,'Tiempo de exposición',30,false),('Tinte',3,'Lavado',15,true),
('Baño de color',1,'Aplicación baño de color',20,true),('Baño de color',2,'Tiempo de actuación',20,false),('Baño de color',3,'Lavado y acabado',20,true),
('Mechas tradicionales',1,'Aplicación de mechas',55,true),('Mechas tradicionales',2,'Tiempo de exposición',35,false),('Mechas tradicionales',3,'Lavado y matiz',30,true),
('Mechas iluminaciones',1,'Aplicación de iluminaciones',45,true),('Mechas iluminaciones',2,'Tiempo de exposición',30,false),('Mechas iluminaciones',3,'Lavado y acabado',30,true),
('Retoque de mechas',1,'Aplicación retoque',30,true),('Retoque de mechas',2,'Tiempo de exposición',25,false),('Retoque de mechas',3,'Lavado y acabado',20,true),
('Mechas contraste',1,'Aplicación técnica',70,true),('Mechas contraste',2,'Tiempo de exposición',40,false),('Mechas contraste',3,'Lavado y acabado',40,true),
('Baby light',1,'Aplicación babylight',85,true),('Baby light',2,'Tiempo de exposición',45,false),('Baby light',3,'Matiz y acabado',50,true),
('Alisados',1,'Preparación y aplicación',70,true),('Alisados',2,'Tiempo de actuación',45,false),('Alisados',3,'Sellado y acabado',65,true),
('Permanentes',1,'Preparación y montaje',60,true),('Permanentes',2,'Tiempo de actuación',45,false),('Permanentes',3,'Neutralizado y acabado',45,true)
) AS v(serviceName, ord, phase, duration, exclusive) ON s.name = v.serviceName;

INSERT INTO "Professional" ("name","bio","specialties") VALUES
('Gema','Especialista en color, corte y cuidado del cabello.', ARRAY['Peluquería','Peinados','Color & Mechas','Tratamientos capilares']::TEXT[]),
('Profesional estética','Servicios de estética, depilación, manicura, pedicura y tratamientos faciales.', ARRAY['Belleza & Estética','Manos & Pies']::TEXT[])
ON CONFLICT DO NOTHING;

INSERT INTO "Resource" ("name","description") VALUES
('Puesto peluquería','Tocador principal de peluquería'),
('Lavacabezas','Zona de lavado y tratamientos capilares'),
('Zona estética','Espacio para estética, manos y pies')
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
