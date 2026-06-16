-- V10 limpieza trabajadoras Gema Estudio de Belleza
-- Ejecutar en Supabase SQL Editor.

UPDATE "Professional"
SET name = 'Nadia', username = 'nadia', password = 'nadia123', role = 'staff', active = true, color = '#D8B7A0'
WHERE name IN ('Profesional estética', 'Nadia');

UPDATE "Professional"
SET username = 'gema', password = 'gema123', role = 'staff', active = true, color = '#C79A7B'
WHERE name = 'Gema';

DELETE FROM "Professional"
WHERE name = 'Trabajadora 2'
   OR username = 'trabajadora';

-- Garantizar que las reservas antiguas tienen estado visible.
UPDATE "Booking"
SET status = 'confirmed'
WHERE status IS NULL;
