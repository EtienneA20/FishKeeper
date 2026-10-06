/*
  Warnings:

  - You are about to alter the column `dimension` on the `Aquarium` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Aquarium" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "dimension" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Aquarium_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Aquarium" ("createdAt", "dimension", "id", "name", "ownerId", "updatedAt", "volume") SELECT "createdAt", "dimension", "id", "name", "ownerId", "updatedAt", "volume" FROM "Aquarium";
DROP TABLE "Aquarium";
ALTER TABLE "new_Aquarium" RENAME TO "Aquarium";
CREATE INDEX "Aquarium_ownerId_idx" ON "Aquarium"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
