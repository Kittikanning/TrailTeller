/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class HotelService {
  private prisma = new PrismaService();

  // สร้าง hotel
  async createHotel(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.create({ data });
  }

  // ดึงข้อมูล hotel ทั้งหมด
  async getAllHotel() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.findMany();
  }

  // ดึง hotel ตาม id
  async getHotelById(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.findUnique({ where: { hotel_id: id } });
  }

  // อัพเดท hotel
  async updateHotel(id: number, data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.update({ where: { hotel_id: id }, data });
  }
  // ลบ hotel
  async deleteHotel(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.hotel.delete({ where: { hotel_id: id } });
  }
}
