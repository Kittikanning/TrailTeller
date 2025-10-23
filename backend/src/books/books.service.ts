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

  async createBooking(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.prisma.booking.create({
      data,
    });
  }

  async updateBooking(params: {
    where: Prisma.BookingWhereUniqueInput;
    data: Prisma.BookingUpdateInput;
  }): Promise<Booking> {
    const { where, data } = params;
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
