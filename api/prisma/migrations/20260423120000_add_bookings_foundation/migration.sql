-- Add missing Item columns from the current schema baseline
ALTER TABLE "Item" ADD COLUMN "description" TEXT NOT NULL DEFAULT 'No description provided yet.';

ALTER TABLE "Item" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'General';

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resourceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Booking_resourceId_startsAt_endsAt_idx" ON "Booking"("resourceId", "startsAt", "endsAt");