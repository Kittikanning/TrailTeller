/*
  Warnings:

  - Added the required column `trip_id` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Hotel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "trip_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "guest_id" DROP NOT NULL,
ALTER COLUMN "room_id" DROP NOT NULL,
ALTER COLUMN "check_in_date" DROP DEFAULT,
ALTER COLUMN "check_out_date" DROP DEFAULT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateTable
CREATE TABLE "Activity" (
    "activities_id" SERIAL NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "activity_booking_id" INTEGER,
    "guest_id" INTEGER,
    "activity_name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "schedule" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "booking_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("activities_id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "booking_id" SERIAL NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "service_type" TEXT NOT NULL,
    "booking_reference" INTEGER NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "service_start" TIMESTAMP(3) NOT NULL,
    "service_end" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "recommendation_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "destination_id" INTEGER,
    "trip_id" INTEGER,
    "budget" INTEGER NOT NULL,
    "recommend_type" TEXT NOT NULL,
    "item_id" INTEGER,
    "item_name" TEXT NOT NULL,
    "item_price" INTEGER NOT NULL,
    "recommendation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("recommendation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_booking_id_key" ON "Payment"("booking_id");
