-- AlterTable
ALTER TABLE "Establishment" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "trial_ends_at" TIMESTAMP(3),
ADD COLUMN     "whatsapp_api_key" TEXT,
ADD COLUMN     "whatsapp_api_url" TEXT,
ADD COLUMN     "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsapp_instance_name" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "BusinessHour" (
    "id" TEXT NOT NULL,
    "establishment_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TEXT NOT NULL DEFAULT '08:00',
    "close_time" TEXT NOT NULL DEFAULT '18:00',
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BusinessHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHour_establishment_id_day_of_week_key" ON "BusinessHour"("establishment_id", "day_of_week");

-- CreateIndex
CREATE INDEX "Appointment_tenant_id_date_time_idx" ON "Appointment"("tenant_id", "date_time");

-- CreateIndex
CREATE INDEX "Appointment_attendant_id_date_time_idx" ON "Appointment"("attendant_id", "date_time");

-- CreateIndex
CREATE INDEX "Appointment_tenant_id_attendant_id_status_idx" ON "Appointment"("tenant_id", "attendant_id", "status");

-- AddForeignKey
ALTER TABLE "BusinessHour" ADD CONSTRAINT "BusinessHour_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
