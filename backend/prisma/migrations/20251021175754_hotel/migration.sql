-- CreateTable
CREATE TABLE "Hotel" (
    "hotel_id" SERIAL NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "room_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "check_in_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number_of_guests" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "img" BYTEA,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("hotel_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_name_key" ON "Hotel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_address_key" ON "Hotel"("address");
