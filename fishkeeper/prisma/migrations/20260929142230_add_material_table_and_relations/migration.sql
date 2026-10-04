/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Aquarium` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Aquarium` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `AquariumSpecies` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "aquariumId" TEXT,
    CONSTRAINT "Material_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Material_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Aquarium" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "dimension" JSONB,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Aquarium_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Aquarium" ("dimension", "id", "name", "ownerId", "volume") SELECT "dimension", "id", "name", "ownerId", "volume" FROM "Aquarium";
DROP TABLE "Aquarium";
ALTER TABLE "new_Aquarium" RENAME TO "Aquarium";
CREATE INDEX "Aquarium_ownerId_idx" ON "Aquarium"("ownerId");
CREATE TABLE "new_AquariumSpecies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "aquariumId" TEXT NOT NULL,
    "specieId" TEXT NOT NULL,
    CONSTRAINT "AquariumSpecies_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AquariumSpecies_specieId_fkey" FOREIGN KEY ("specieId") REFERENCES "Specie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AquariumSpecies" ("aquariumId", "id", "notes", "quantity", "specieId") SELECT "aquariumId", "id", "notes", "quantity", "specieId" FROM "AquariumSpecies";
DROP TABLE "AquariumSpecies";
ALTER TABLE "new_AquariumSpecies" RENAME TO "AquariumSpecies";
CREATE UNIQUE INDEX "AquariumSpecies_aquariumId_specieId_key" ON "AquariumSpecies"("aquariumId", "specieId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL
);
INSERT INTO "new_User" ("email", "id", "name") SELECT "email", "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
