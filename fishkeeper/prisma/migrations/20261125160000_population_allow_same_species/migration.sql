-- Plusieurs individus d'une même espèce peuvent vivre dans le même aquarium :
-- la contrainte d'unicité (aquarium, espèce) est remplacée par deux index simples.

-- DropIndex
DROP INDEX "AquariumPopulation_aquariumId_speciesId_key";

-- CreateIndex
CREATE INDEX "AquariumPopulation_aquariumId_idx" ON "AquariumPopulation"("aquariumId");

-- CreateIndex
CREATE INDEX "AquariumPopulation_speciesId_idx" ON "AquariumPopulation"("speciesId");
