-- Falla con un mensaje claro si hay tipos de comida fuera del enum.
DO $$
DECLARE invalidos text;
BEGIN
  SELECT string_agg(DISTINCT v, ', ') INTO invalidos FROM (
    SELECT tipo_comida AS v FROM receta
    UNION SELECT tipo_comida FROM entrada_calendario
  ) t WHERE v NOT IN ('Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena');
  IF invalidos IS NOT NULL THEN
    RAISE EXCEPTION 'tipo_comida con valores fuera del enum TipoComida: %', invalidos;
  END IF;
END $$;

CREATE TYPE "TipoComida" AS ENUM ('Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena');

ALTER TABLE "receta" ALTER COLUMN "tipo_comida" TYPE "TipoComida" USING "tipo_comida"::"TipoComida";
ALTER TABLE "entrada_calendario" ALTER COLUMN "tipo_comida" TYPE "TipoComida" USING "tipo_comida"::"TipoComida";
