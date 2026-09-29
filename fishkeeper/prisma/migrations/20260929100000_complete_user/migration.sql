-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "departement" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("id", "name", "email", "role", "departement", "password")
SELECT "id", "name", "email", 'USER', '', '' FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;