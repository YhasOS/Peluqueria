-- Limpieza de profesionales duplicados por nombre en la tabla Professional.
-- Conserva el ID más bajo para no romper reservas ya existentes.

DELETE FROM "Professional" p
USING "Professional" p2
WHERE lower(trim(p."name")) = lower(trim(p2."name"))
  AND p."id" > p2."id";
