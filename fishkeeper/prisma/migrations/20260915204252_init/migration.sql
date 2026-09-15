-- CreateTable
CREATE TABLE "Aquarium" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aquarium_pkey" PRIMARY KEY ("id")
);
