-- AlterTable
ALTER TABLE "Aquarium" ADD COLUMN "dimension" JSONB;
ADD CONSTRAINT "check_dimension_schema"
CHECK (
  dimension IS NULL OR (
    -- 1. Vérifie la présence de toutes les clés requises
    dimension ? 'length' AND
    dimension ? 'width' AND
    dimension ? 'height' AND
    dimension ? 'unit' AND
    
    -- 2. Vérifie les types de données (numbers pour les dimensions, string pour l'unité)
    jsonb_typeof(dimension->'length') = 'number' AND
    jsonb_typeof(dimension->'width') = 'number' AND
    jsonb_typeof(dimension->'height') = 'number' AND
    jsonb_typeof(dimension->'unit') = 'string' AND

    -- 3. Restreint les valeurs autorisées pour l'unité (ex: cm, inch, mm)
    dimension->>'unit' IN ('cm', 'inch', 'mm')
  )
);
