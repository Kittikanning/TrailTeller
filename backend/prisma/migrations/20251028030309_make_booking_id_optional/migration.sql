/*
  Warnings:

  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `booking_id` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Payment_booking_id_key";

-- DropIndex
DROP INDEX "public"."User_email_key";

-- AlterTable
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_pkey",
DROP COLUMN "booking_id",
ADD COLUMN     "budget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "destination" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "origin" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "preferences" TEXT,
ADD COLUMN     "travelers" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "trip_id" SET DATA TYPE BIGINT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "booking_reference" DROP NOT NULL,
ALTER COLUMN "booking_reference" SET DATA TYPE BIGINT,
ALTER COLUMN "booking_date" DROP NOT NULL,
ALTER COLUMN "booking_date" DROP DEFAULT,
ALTER COLUMN "service_start" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "service_end" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL,
ADD CONSTRAINT "Booking_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "booking_id",
DROP COLUMN "created_at",
DROP COLUMN "payment_date",
DROP COLUMN "payment_method",
DROP COLUMN "payment_status",
DROP COLUMN "updated_at",
ADD COLUMN     "bookingId" INTEGER,
ADD COLUMN     "checkIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "checkOut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dailyActivities" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "destination" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "flightPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hotelName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hotelPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nights" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "outboundFlight" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "paymentStatus" TEXT,
ADD COLUMN     "returnFlight" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "todoList" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
