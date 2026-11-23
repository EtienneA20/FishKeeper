-- Une espèce peut appartenir à plusieurs catégories (relation many-to-many).

-- CreateTable
CREATE TABLE "_SpeciesToSpeciesCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SpeciesToSpeciesCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Species" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SpeciesToSpeciesCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "SpeciesCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Reprise des données : chaque espèce garde sa catégorie actuelle.
INSERT INTO "_SpeciesToSpeciesCategory" ("A", "B") SELECT "id", "categoryId" FROM "Species";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Species" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "scientificName" TEXT,
    "description" TEXT,
    "imageURL" TEXT,
    "waterType" TEXT,
    "minTemperature" REAL,
    "maxTemperature" REAL,
    "minPh" REAL,
    "maxPh" REAL,
    "minGh" REAL,
    "maxGh" REAL,
    "minKh" REAL,
    "maxKh" REAL,
    "minVolume" REAL,
    "aggressiveness" TEXT,
    -- Contraintes CHECK de la migration init, recopiées à la main (Prisma ne les connaît pas).
    CONSTRAINT "Species_minTemperature_check" CHECK ("minTemperature" BETWEEN 0 AND 50),
    CONSTRAINT "Species_maxTemperature_check" CHECK ("maxTemperature" BETWEEN 0 AND 50),
    CONSTRAINT "Species_temperature_order_check" CHECK ("minTemperature" <= "maxTemperature"),
    CONSTRAINT "Species_minPh_check" CHECK ("minPh" BETWEEN 0 AND 14),
    CONSTRAINT "Species_maxPh_check" CHECK ("maxPh" BETWEEN 0 AND 14),
    CONSTRAINT "Species_ph_order_check" CHECK ("minPh" <= "maxPh"),
    CONSTRAINT "Species_minGh_check" CHECK ("minGh" >= 0),
    CONSTRAINT "Species_maxGh_check" CHECK ("maxGh" >= 0),
    CONSTRAINT "Species_gh_order_check" CHECK ("minGh" <= "maxGh"),
    CONSTRAINT "Species_minKh_check" CHECK ("minKh" >= 0),
    CONSTRAINT "Species_maxKh_check" CHECK ("maxKh" >= 0),
    CONSTRAINT "Species_kh_order_check" CHECK ("minKh" <= "maxKh"),
    CONSTRAINT "Species_minVolume_check" CHECK ("minVolume" >= 0)
);
INSERT INTO "new_Species" ("aggressiveness", "description", "id", "imageURL", "maxGh", "maxKh", "maxPh", "maxTemperature", "minGh", "minKh", "minPh", "minTemperature", "minVolume", "name", "scientificName", "waterType") SELECT "aggressiveness", "description", "id", "imageURL", "maxGh", "maxKh", "maxPh", "maxTemperature", "minGh", "minKh", "minPh", "minTemperature", "minVolume", "name", "scientificName", "waterType" FROM "Species";
DROP TABLE "Species";
ALTER TABLE "new_Species" RENAME TO "Species";
CREATE UNIQUE INDEX "Species_name_key" ON "Species"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_SpeciesToSpeciesCategory_AB_unique" ON "_SpeciesToSpeciesCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_SpeciesToSpeciesCategory_B_index" ON "_SpeciesToSpeciesCategory"("B");
