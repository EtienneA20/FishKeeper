/*
  Warnings:

  - You are about to drop the column `type` on the `Aquarium` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Aquarium` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
*/

-- CreateTable
CREATE TABLE "WaterMeasurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "temperature" REAL NOT NULL CHECK ("temperature" >= 0),
    "ph" REAL NOT NULL CHECK ("ph" >= 0 AND "ph" <= 14),
    "no2" REAL NOT NULL CHECK ("no2" >= 0),
    "no3" REAL NOT NULL CHECK ("no3" >= 0),
    "nh4" REAL NOT NULL CHECK ("nh4" >= 0),
    "gh" REAL NOT NULL CHECK ("gh" >= 0),
    "kh" REAL NOT NULL CHECK ("kh" >= 0),
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aquariumId" TEXT NOT NULL,
    CONSTRAINT "WaterMeasurement_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TargetRange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parameter" TEXT NOT NULL,
    "min" REAL CHECK ("min" IS NULL OR "min" >= 0),
    "max" REAL CHECK ("max" IS NULL OR "max" >= 0),
    "aquariumId" TEXT NOT NULL,
    CONSTRAINT "TargetRange_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "check_target_range_min_max" CHECK ("min" IS NULL OR "max" IS NULL OR "min" <= "max")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parameter" TEXT NOT NULL,
    "value" REAL NOT NULL CHECK ("value" >= 0),
    "targetLimit" REAL NOT NULL CHECK ("targetLimit" >= 0),
    "type" TEXT NOT NULL,
    "triggeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "aquariumId" TEXT NOT NULL,
    "measurementId" INTEGER,
    "targetRangeId" TEXT,
    CONSTRAINT "Alert_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Alert_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "WaterMeasurement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Alert_targetRangeId_fkey" FOREIGN KEY ("targetRangeId") REFERENCES "TargetRange" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Specie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AquariumSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL CHECK ("quantity" >= 0),
    "notes" TEXT,
    "aquariumId" TEXT NOT NULL,
    "specieId" TEXT NOT NULL,
    CONSTRAINT "AquariumSpecies_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AquariumSpecies_specieId_fkey" FOREIGN KEY ("specieId") REFERENCES "Specie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "frequencyDays" INTEGER NOT NULL CHECK ("frequencyDays" > 0),
    "dueAt" DATETIME NOT NULL,
    "lastDoneAt" DATETIME,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aquariumId" TEXT NOT NULL,
    CONSTRAINT "MaintenanceTask_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CategoryToSpecie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CategoryToSpecie_A_fkey" FOREIGN KEY ("A") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CategoryToSpecie_B_fkey" FOREIGN KEY ("B") REFERENCES "Specie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Aquarium" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "volume" INTEGER NOT NULL CHECK ("volume" >= 0),
    "dimension" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Aquarium_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "check_dimension_schema" CHECK (
      "dimension" IS NULL OR (
        json_valid("dimension") = 1 AND
        json_extract("dimension", '$.length') IS NOT NULL AND
        json_extract("dimension", '$.width') IS NOT NULL AND
        json_extract("dimension", '$.height') IS NOT NULL AND
        json_extract("dimension", '$.unit') IN ('cm', 'inch', 'mm') AND
        json_extract("dimension", '$.length') >= 0 AND
        json_extract("dimension", '$.width') >= 0 AND
        json_extract("dimension", '$.height') >= 0
      )
    )
);

INSERT INTO "new_Aquarium" ("createdAt", "id", "name", "updatedAt", "volume") 
SELECT "createdAt", "id", "name", "updatedAt", "volume" FROM "Aquarium";

DROP TABLE "Aquarium";
ALTER TABLE "new_Aquarium" RENAME TO "Aquarium";
CREATE INDEX "Aquarium_ownerId_idx" ON "Aquarium"("ownerId");

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_User" ("email", "id", "name") 
SELECT "email", "id", "name" FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndexes
CREATE INDEX "WaterMeasurement_aquariumId_measuredAt_idx" ON "WaterMeasurement"("aquariumId", "measuredAt");
CREATE UNIQUE INDEX "TargetRange_aquariumId_parameter_key" ON "TargetRange"("aquariumId", "parameter");
CREATE INDEX "Alert_aquariumId_resolved_idx" ON "Alert"("aquariumId", "resolved");
CREATE UNIQUE INDEX "Category_type_value_key" ON "Category"("type", "value");
CREATE UNIQUE INDEX "AquariumSpecies_aquariumId_specieId_key" ON "AquariumSpecies"("aquariumId", "specieId");
CREATE INDEX "MaintenanceTask_aquariumId_dueAt_idx" ON "MaintenanceTask"("aquariumId", "dueAt");
CREATE UNIQUE INDEX "_CategoryToSpecie_AB_unique" ON "_CategoryToSpecie"("A", "B");
CREATE INDEX "_CategoryToSpecie_B_index" ON "_CategoryToSpecie"("B");