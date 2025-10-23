import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { Prisma, Hotel } from 'generated/prisma';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async hotel(
    hotelWhereUniqueInput: Prisma.HotelWhereUniqueInput,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ): Promise<Hotel | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: hotelWhereUniqueInput,
    });
  }

  async hotels(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.HotelWhereUniqueInput;
    where?: Prisma.HotelWhereInput;
    orderBy?: Prisma.HotelOrderByWithRelationInput;
  }): Promise<Hotel[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { skip, take, cursor, where, orderBy } = params;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.findMany({
      skip,
      take,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      cursor,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      orderBy,
    });
  }

  async createHotel(data: Prisma.HotelCreateInput): Promise<Hotel> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });
  }

  async updateHotel(params: {
    where: Prisma.HotelWhereUniqueInput;
    data: Prisma.HotelUpdateInput;
  }): Promise<Hotel> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { where, data } = params;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.update({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
    });
  }

  async deleteHotel(where: Prisma.HotelWhereUniqueInput): Promise<Hotel> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.delete({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
    });
  }
}
