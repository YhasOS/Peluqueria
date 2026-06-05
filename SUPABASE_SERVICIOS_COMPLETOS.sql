-- Servicios completos para Gema Salón Belleza.
-- Ejecutar en Supabase > SQL Editor > New query > Run.
-- Conserva tus reservas existentes y añade/actualiza carta de servicios.

INSERT INTO "Category" ("name", "description") VALUES
('Peluquería','Cortes, peinados y acabados'),
('Coloración','Tintes, baños de color, mechas y técnicas de color'),
('Tratamientos capilares','Hidratación, reparación, antiencrespado y cuidado del cuero cabelludo'),
('Estética facial','Tratamientos faciales y depilación facial'),
('Estética corporal','Depilación corporal y tratamientos de bienestar'),
('Manicura y pedicura','Cuidado de manos, pies y esmaltado'),
('Maquillaje y eventos','Servicios para eventos, novias e invitadas')
ON CONFLICT DO NOTHING;

-- Actualiza los 6 servicios iniciales si existen por id.
UPDATE "Service" SET "name"='Corte mujer', "description"='Corte personalizado, asesoramiento y acabado básico.', "price"=28, "totalDuration"=45, "exclusive"=true, "categoryId"=(SELECT id FROM "Category" WHERE name='Peluquería' LIMIT 1) WHERE id=1;
UPDATE "Service" SET "name"='Corte hombre', "description"='Corte masculino, perfilado y acabado.', "price"=17, "totalDuration"=30, "exclusive"=true, "categoryId"=(SELECT id FROM "Category" WHERE name='Peluquería' LIMIT 1) WHERE id=2;
UPDATE "Service" SET "name"='Lavar y peinar', "description"='Lavado, brushing o peinado adaptado al cabello.', "price"=20, "totalDuration"=30, "exclusive"=true, "categoryId"=(SELECT id FROM "Category" WHERE name='Peluquería' LIMIT 1) WHERE id=3;
UPDATE "Service" SET "name"='Tinte raíz', "description"='Coloración de raíz, exposición, lavado y peinado básico.', "price"=45, "totalDuration"=90, "exclusive"=true, "categoryId"=(SELECT id FROM "Category" WHERE name='Coloración' LIMIT 1) WHERE id=4;
UPDATE "Service" SET "name"='Mechas completas', "description"='Técnica de mechas completa con matiz y acabado.', "price"=85, "totalDuration"=150, "exclusive"=true, "categoryId"=(SELECT id FROM "Category" WHERE name='Coloración' LIMIT 1) WHERE id=5;
UPDATE "Service" SET "name"='Manicura semipermanente', "description"='Preparación de uña, esmaltado semipermanente e hidratación.', "price"=25, "totalDuration"=60, "exclusive"=true, "categoryId"=(SELECT id FROM "Category" WHERE name='Manicura y pedicura' LIMIT 1) WHERE id=6;

-- Añade servicios si no existen por nombre.
INSERT INTO "Service" ("name","description","price","totalDuration","exclusive","categoryId")
SELECT v.name, v.description, v.price, v.totalDuration, v.exclusive, c.id
FROM (VALUES
('Corte niña/niño','Corte infantil sencillo.',14,30,true,'Peluquería'),
('Corte flequillo','Repaso rápido de flequillo.',6,15,true,'Peluquería'),
('Peinado corto','Peinado para cabello corto.',18,30,true,'Peluquería'),
('Peinado media melena','Peinado para media melena.',24,45,true,'Peluquería'),
('Peinado largo','Peinado para cabello largo.',30,60,true,'Peluquería'),
('Recogido sencillo','Recogido natural para evento.',38,60,true,'Peluquería'),
('Recogido elaborado','Recogido trabajado para evento o ceremonia.',55,90,true,'Peluquería'),
('Tinte completo','Coloración completa con exposición, lavado y acabado.',58,120,true,'Coloración'),
('Baño de color','Color suave o refresco de tono.',38,75,true,'Coloración'),
('Matiz / toner','Matización de rubios, mechas o tonos no deseados.',25,45,true,'Coloración'),
('Balayage','Técnica balayage personalizada con matiz y acabado.',120,210,true,'Coloración'),
('Babylights','Mechas finas naturales con matiz y acabado.',110,210,true,'Coloración'),
('Mechas parciales','Mechas en zona superior o contorno.',65,120,true,'Coloración'),
('Decoloración global','Decoloración completa con diagnóstico previo.',95,180,true,'Coloración'),
('Tratamiento hidratación express','Hidratación rápida para brillo y suavidad.',22,30,true,'Tratamientos capilares'),
('Tratamiento reparación profunda','Tratamiento nutritivo para cabello dañado.',45,60,true,'Tratamientos capilares'),
('Tratamiento antiencrespado','Tratamiento disciplinante para controlar frizz.',80,120,true,'Tratamientos capilares'),
('Botox capilar','Tratamiento de relleno, brillo y suavidad.',70,90,true,'Tratamientos capilares'),
('Alisado orgánico','Servicio de alisado o reducción de volumen con diagnóstico.',160,240,true,'Tratamientos capilares'),
('Higiene facial básica','Limpieza facial básica con hidratación.',38,60,true,'Estética facial'),
('Higiene facial profunda','Limpieza facial profunda con extracción y mascarilla.',55,90,true,'Estética facial'),
('Tratamiento facial hidratante','Tratamiento facial hidratante y luminosidad.',48,60,true,'Estética facial'),
('Depilación cejas','Diseño y depilación de cejas.',8,15,true,'Estética facial'),
('Diseño de cejas','Diseño, medición y depilación de cejas.',15,30,true,'Estética facial'),
('Depilación labio superior','Depilación de labio superior.',6,15,true,'Estética facial'),
('Depilación axilas','Depilación corporal de axilas.',10,15,true,'Estética corporal'),
('Depilación medias piernas','Depilación de medias piernas.',18,30,true,'Estética corporal'),
('Depilación piernas completas','Depilación de piernas completas.',28,45,true,'Estética corporal'),
('Manicura básica','Limado, cutícula, hidratación y esmalte tradicional.',18,45,true,'Manicura y pedicura'),
('Retirada semipermanente','Retirada segura de esmaltado semipermanente.',10,20,true,'Manicura y pedicura'),
('Pedicura básica','Cuidado básico de pies y esmaltado tradicional.',25,45,true,'Manicura y pedicura'),
('Pedicura completa','Pedicura completa con durezas, exfoliación e hidratación.',38,75,true,'Manicura y pedicura'),
('Pedicura semipermanente','Pedicura con esmaltado semipermanente.',35,60,true,'Manicura y pedicura'),
('Maquillaje día','Maquillaje natural para día o evento sencillo.',35,45,true,'Maquillaje y eventos'),
('Maquillaje evento','Maquillaje completo para invitada o evento.',55,60,true,'Maquillaje y eventos'),
('Prueba novia','Prueba de maquillaje y asesoramiento para novia.',70,90,true,'Maquillaje y eventos'),
('Maquillaje novia','Maquillaje especial novia.',90,90,true,'Maquillaje y eventos')
) AS v(name, description, price, totalDuration, exclusive, categoryName)
JOIN "Category" c ON c.name = v.categoryName
WHERE NOT EXISTS (SELECT 1 FROM "Service" s WHERE lower(s.name) = lower(v.name));

-- Fases: añade fase única a servicios sin fases.
INSERT INTO "ServicePhase" ("serviceId","order","name","duration","exclusive")
SELECT s.id, 1, 'Servicio completo', s."totalDuration", true
FROM "Service" s
WHERE NOT EXISTS (SELECT 1 FROM "ServicePhase" sp WHERE sp."serviceId" = s.id);

-- Fases específicas de servicios con tiempos de exposición.
DELETE FROM "ServicePhase" WHERE "serviceId" IN (SELECT id FROM "Service" WHERE name IN ('Tinte raíz','Tinte completo','Mechas completas','Mechas parciales','Balayage','Babylights','Decoloración global','Alisado orgánico'));

INSERT INTO "ServicePhase" ("serviceId","order","name","duration","exclusive")
SELECT s.id, v.ord, v.phase, v.duration, v.exclusive
FROM "Service" s
JOIN (VALUES
('Tinte raíz',1,'Aplicación color',30,true),('Tinte raíz',2,'Tiempo de exposición',30,false),('Tinte raíz',3,'Lavado y acabado',30,true),
('Tinte completo',1,'Aplicación color',40,true),('Tinte completo',2,'Tiempo de exposición',35,false),('Tinte completo',3,'Lavado y acabado',45,true),
('Mechas completas',1,'Aplicación mechas',60,true),('Mechas completas',2,'Tiempo de exposición',45,false),('Mechas completas',3,'Matiz, lavado y acabado',45,true),
('Mechas parciales',1,'Aplicación mechas',45,true),('Mechas parciales',2,'Tiempo de exposición',35,false),('Mechas parciales',3,'Lavado y acabado',40,true),
('Balayage',1,'Aplicación técnica',90,true),('Balayage',2,'Tiempo de exposición',60,false),('Balayage',3,'Matiz, lavado y acabado',60,true),
('Babylights',1,'Aplicación técnica',90,true),('Babylights',2,'Tiempo de exposición',60,false),('Babylights',3,'Matiz, lavado y acabado',60,true),
('Decoloración global',1,'Aplicación decoloración',60,true),('Decoloración global',2,'Tiempo de exposición',60,false),('Decoloración global',3,'Matiz y acabado',60,true),
('Alisado orgánico',1,'Preparación y aplicación',90,true),('Alisado orgánico',2,'Tiempo de actuación',60,false),('Alisado orgánico',3,'Sellado y acabado',90,true)
) AS v(serviceName, ord, phase, duration, exclusive) ON s.name = v.serviceName;

-- Profesionales y recursos recomendados.
INSERT INTO "Professional" ("name","bio","specialties") VALUES
('Gema','Especialista en corte, coloración y asesoramiento personalizado.', ARRAY['Peluquería','Coloración','Tratamientos capilares']::TEXT[]),
('Marta','Especialista en peinados, manicura, pedicura y estética.', ARRAY['Peluquería','Manicura y pedicura','Estética facial']::TEXT[]),
('Lucía','Especialista en color avanzado, mechas y balayage.', ARRAY['Coloración','Tratamientos capilares']::TEXT[])
ON CONFLICT DO NOTHING;

INSERT INTO "Resource" ("name","description") VALUES
('Lavacabezas','Zona de lavado y tratamientos'),
('Mesa manicura','Puesto de manicura y esmaltado'),
('Cabina facial','Cabina para higiene facial y estética')
ON CONFLICT DO NOTHING;

UPDATE "Setting" SET "value"='Gema Salón Belleza' WHERE "key"='businessName';
