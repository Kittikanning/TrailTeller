import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { Prisma, Booking } from 'generated/prisma';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async booking(
    bookingWhereUniqueInput: Prisma.BookingWhereUniqueInput,
  ): Promise<Booking | null> {
    return await this.prisma.booking.findUnique({
      where: bookingWhereUniqueInput,
    });
  }

  async books(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BookingWhereUniqueInput;
    where?: Prisma.BookingWhereInput;
    orderBy?: Prisma.BookingOrderByWithRelationInput;
  }): Promise<Booking[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.booking.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createBooking(data: Prisma.BookingCreateInput): Promise<any> {
    // ensure trip_id is only included when present, and convert to BigInt
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { trip_id, ...rest } = data as any;

    const booking = await this.prisma.booking.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...rest,
        ...(trip_id !== undefined && trip_id !== null
          ? { trip_id: BigInt(trip_id) }
          : {}),
        service_start: data.service_start
          ? new Date(data.service_start as any)
          : undefined, // แปลงเป็น Date
        service_end: data.service_end
          ? new Date(data.service_end as any)
          : undefined,
      },
    });

    // แปลง BigInt เป็น string เพื่อส่ง JSON
    return {
      ...booking,
      trip_id: booking.trip_id.toString(),
      booking_reference: booking.booking_reference?.toString(),
    };
  }

  async updateBooking(params: {
    where: Prisma.BookingWhereUniqueInput;
    data: Prisma.BookingUpdateInput;
  }): Promise<Booking> {
    const { where, data } = params;

    // แปลงวันที่ถ้ามี
    if (data.service_start) {
      data.service_start = new Date(data.service_start as unknown as string);
    }
    if (data.service_end) {
      data.service_end = new Date(data.service_end as unknown as string);
    }

    return this.prisma.booking.update({
      data,
      where,
    });
  }

  async deleteBooking(where: Prisma.BookingWhereUniqueInput): Promise<Booking> {
    return this.prisma.booking.delete({
      where,
    });
  }
}
