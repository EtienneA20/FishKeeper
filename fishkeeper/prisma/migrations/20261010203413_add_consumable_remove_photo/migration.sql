/*
  Warnings:

  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Photo";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Consumable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "quantity" REAL,
    "unit" TEXT,
    "purchasedAt" DATETIME,
    "expiresAt" DATETIME,
    "notes" TEXT,
    "imageURL" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aquariumId" TEXT NOT NULL,
    CONSTRAINT "Consumable_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Consumable_aquariumId_type_idx" ON "Consumable"("aquariumId", "type");
