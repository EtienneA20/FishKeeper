-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "departement" TEXT,
    "imageURL" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Aquarium" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "grossVolume" REAL NOT NULL,
    "netVolume" REAL NOT NULL,
    "waterType" TEXT NOT NULL DEFAULT 'FRESH_SOFT',
    "biotope" TEXT,
    "startedAt" DATETIME,
    "dimension" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Aquarium_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Aquarium_grossVolume_check" CHECK ("grossVolume" > 0),
    CONSTRAINT "Aquarium_netVolume_check" CHECK ("netVolume" > 0),
    CONSTRAINT "Aquarium_netVolume_lte_gross_check" CHECK ("netVolume" <= "grossVolume")
);

-- CreateTable
CREATE TABLE "WaterMeasurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" REAL,
    "ph" REAL,
    "no2" REAL,
    "no3" REAL,
    "nh4" REAL,
    "gh" REAL,
    "kh" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aquariumId" TEXT NOT NULL,
    CONSTRAINT "WaterMeasurement_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaterMeasurement_temperature_check" CHECK ("temperature" BETWEEN 0 AND 50),
    CONSTRAINT "WaterMeasurement_ph_check" CHECK ("ph" BETWEEN 0 AND 14),
    CONSTRAINT "WaterMeasurement_no2_check" CHECK ("no2" >= 0),
    CONSTRAINT "WaterMeasurement_no3_check" CHECK ("no3" >= 0),
    CONSTRAINT "WaterMeasurement_nh4_check" CHECK ("nh4" >= 0),
    CONSTRAINT "WaterMeasurement_gh_check" CHECK ("gh" >= 0),
    CONSTRAINT "WaterMeasurement_kh_check" CHECK ("kh" >= 0)
);

-- CreateTable
CREATE TABLE "TargetRange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parameter" TEXT NOT NULL,
    "warningMin" REAL,
    "warningMax" REAL,
    "dangerMin" REAL NOT NULL,
    "dangerMax" REAL NOT NULL,
    "isAutoCalculated" BOOLEAN NOT NULL DEFAULT true,
    "aquariumId" TEXT NOT NULL,
    CONSTRAINT "TargetRange_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TargetRange_danger_order_check" CHECK ("dangerMin" <= "dangerMax"),
    CONSTRAINT "TargetRange_warning_order_check" CHECK ("warningMin" <= "warningMax"),
    CONSTRAINT "TargetRange_warningMin_in_danger_check" CHECK ("warningMin" < "dangerMin"),
    CONSTRAINT "TargetRange_warningMax_in_danger_check" CHECK ("warningMax" < "dangerMax")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parameter" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "targetLimit" REAL NOT NULL,
    "direction" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
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
CREATE TABLE "Species" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "scientificName" TEXT,
    "categoryId" TEXT NOT NULL,
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
    CONSTRAINT "Species_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SpeciesCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
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

-- CreateTable
CREATE TABLE "SpeciesCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "AquariumPopulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "introducedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "size" REAL,
    "weight" REAL,
    "imageURL" TEXT,
    "aquariumId" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,
    CONSTRAINT "AquariumPopulation_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AquariumPopulation_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AquariumPopulation_size_check" CHECK ("size" >= 0),
    CONSTRAINT "AquariumPopulation_weight_check" CHECK ("weight" >= 0)
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "performedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waterVolume" REAL,
    "waterPercent" REAL,
    "notes" TEXT,
    "aquariumId" TEXT NOT NULL,
    "taskId" TEXT,
    CONSTRAINT "MaintenanceLog_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MaintenanceTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceLog_waterVolume_check" CHECK ("waterVolume" >= 0),
    CONSTRAINT "MaintenanceLog_waterPercent_check" CHECK ("waterPercent" BETWEEN 0 AND 100)
);

-- CreateTable
CREATE TABLE "MaintenanceTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "nextDueAt" DATETIME NOT NULL,
    "lastDoneAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aquariumId" TEXT NOT NULL,
    CONSTRAINT "MaintenanceTask_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceTask_interval_check" CHECK ("interval" >= 1)
);

-- CreateTable
CREATE TABLE "MaintenanceTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "waterPercent" REAL,
    "description" TEXT,
    CONSTRAINT "MaintenanceTemplate_interval_check" CHECK ("interval" >= 1),
    CONSTRAINT "MaintenanceTemplate_waterPercent_check" CHECK ("waterPercent" BETWEEN 0 AND 100)
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WORKING',
    "purchasedAt" DATETIME,
    "maintenanceInterval" INTEGER,
    "lastMaintainedAt" DATETIME,
    "notes" TEXT,
    "imageURL" TEXT,
    "aquariumId" TEXT NOT NULL,
    CONSTRAINT "Equipment_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Equipment_maintenanceInterval_check" CHECK ("maintenanceInterval" > 0)
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "takenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "aquariumId" TEXT NOT NULL,
    CONSTRAINT "Photo_aquariumId_fkey" FOREIGN KEY ("aquariumId") REFERENCES "Aquarium" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" DATETIME,
    "userId" TEXT NOT NULL,
    "alertId" TEXT,
    "taskId" TEXT,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MaintenanceTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CategoryIncompatibilities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CategoryIncompatibilities_A_fkey" FOREIGN KEY ("A") REFERENCES "SpeciesCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CategoryIncompatibilities_B_fkey" FOREIGN KEY ("B") REFERENCES "SpeciesCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Aquarium_ownerId_idx" ON "Aquarium"("ownerId");

-- CreateIndex
CREATE INDEX "WaterMeasurement_aquariumId_measuredAt_idx" ON "WaterMeasurement"("aquariumId", "measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "TargetRange_aquariumId_parameter_key" ON "TargetRange"("aquariumId", "parameter");

-- CreateIndex
CREATE INDEX "Alert_aquariumId_resolved_idx" ON "Alert"("aquariumId", "resolved");

-- CreateIndex
CREATE UNIQUE INDEX "Species_name_key" ON "Species"("name");

-- CreateIndex
CREATE INDEX "Species_categoryId_idx" ON "Species"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SpeciesCategory_name_key" ON "SpeciesCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AquariumPopulation_aquariumId_speciesId_key" ON "AquariumPopulation"("aquariumId", "speciesId");

-- CreateIndex
CREATE INDEX "MaintenanceLog_aquariumId_performedAt_idx" ON "MaintenanceLog"("aquariumId", "performedAt");

-- CreateIndex
CREATE INDEX "MaintenanceTask_aquariumId_nextDueAt_idx" ON "MaintenanceTask"("aquariumId", "nextDueAt");

-- CreateIndex
CREATE INDEX "Equipment_aquariumId_idx" ON "Equipment"("aquariumId");

-- CreateIndex
CREATE INDEX "Photo_aquariumId_takenAt_idx" ON "Photo"("aquariumId", "takenAt");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryIncompatibilities_AB_unique" ON "_CategoryIncompatibilities"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryIncompatibilities_B_index" ON "_CategoryIncompatibilities"("B");