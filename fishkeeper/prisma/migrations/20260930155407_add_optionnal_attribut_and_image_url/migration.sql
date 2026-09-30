-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Aquarium" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "dimension" JSONB,
    "ownerId" TEXT,
    CONSTRAINT "Aquarium_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Aquarium" ("dimension", "id", "name", "ownerId", "volume") SELECT "dimension", "id", "name", "ownerId", "volume" FROM "Aquarium";
DROP TABLE "Aquarium";
ALTER TABLE "new_Aquarium" RENAME TO "Aquarium";
CREATE INDEX "Aquarium_ownerId_idx" ON "Aquarium"("ownerId");
CREATE TABLE "new_AquariumSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" INTEGER,
    "notes" TEXT,
    "aquariumId" TEXT,
    "specieId" TEXT,
    "imageURL" TEXT,
    CONSTRAINT "AquariumSpecies_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AquariumSpecies_specieId_fkey" FOREIGN KEY ("specieId") REFERENCES "Specie" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AquariumSpecies" ("aquariumId", "id", "name", "notes", "quantity", "specieId") SELECT "aquariumId", "id", "name", "notes", "quantity", "specieId" FROM "AquariumSpecies";
DROP TABLE "AquariumSpecies";
ALTER TABLE "new_AquariumSpecies" RENAME TO "AquariumSpecies";
CREATE UNIQUE INDEX "AquariumSpecies_aquariumId_specieId_key" ON "AquariumSpecies"("aquariumId", "specieId");
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" TEXT,
    "imageURL" TEXT
);
INSERT INTO "new_Category" ("id", "type", "value") SELECT "id", "type", "value" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_type_value_key" ON "Category"("type", "value");
CREATE TABLE "new_Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "number" INTEGER,
    "ownerId" TEXT,
    "aquariumId" TEXT,
    "imageURL" TEXT,
    CONSTRAINT "Material_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Material_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Material" ("aquariumId", "id", "name", "number", "ownerId") SELECT "aquariumId", "id", "name", "number", "ownerId" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
CREATE TABLE "new_Specie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "imageURL" TEXT
);
INSERT INTO "new_Specie" ("description", "id", "name", "type") SELECT "description", "id", "name", "type" FROM "Specie";
DROP TABLE "Specie";
ALTER TABLE "new_Specie" RENAME TO "Specie";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "departement" TEXT,
    "password" TEXT NOT NULL
);
INSERT INTO "new_User" ("departement", "email", "id", "name", "password", "role") SELECT "departement", "email", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_WaterMeasurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "temperature" REAL,
    "ph" REAL,
    "no2" REAL,
    "no3" REAL,
    "nh4" REAL,
    "gh" REAL,
    "kh" REAL,
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aquariumId" TEXT,
    CONSTRAINT "WaterMeasurement_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WaterMeasurement" ("aquariumId", "gh", "id", "kh", "measuredAt", "nh4", "no2", "no3", "ph", "temperature") SELECT "aquariumId", "gh", "id", "kh", "measuredAt", "nh4", "no2", "no3", "ph", "temperature" FROM "WaterMeasurement";
DROP TABLE "WaterMeasurement";
ALTER TABLE "new_WaterMeasurement" RENAME TO "WaterMeasurement";
CREATE INDEX "WaterMeasurement_aquariumId_measuredAt_idx" ON "WaterMeasurement"("aquariumId", "measuredAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
