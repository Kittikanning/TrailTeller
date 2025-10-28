import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { Prisma, Hotel } from 'generated/prisma';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly HotelsService: HotelsService) {}

  // GET /hotels?skip=0&take=10
  @Get()
  async getHotels(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: number,
  ): Promise<Hotel[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.HotelsService.hotels({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      cursor: cursor ? { hotel_id: cursor } : undefined,
    });
  }

  // GET /hotels/:id
  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  async getHotel(@Param('id') id: number): Promise<Hotel | null> {
    return await this.HotelsService.hotel({ hotel_id: Number(id) });
  }

  // POST /hotels
  @Post()
  async createHotel(@Body() data: Prisma.HotelCreateInput): Promise<Hotel> {
    return this.HotelsService.createHotel(data);
  }

  // PATCH /hotels/:id
  @Patch(':id')
  async updateHotel(
    @Param('id') id: number,
    @Body() data: Prisma.HotelUpdateInput,
  ): Promise<Hotel> {
    return this.HotelsService.updateHotel({
      where: { hotel_id: Number(id) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });
  }

  // DELETE /hotels/:id
  @Delete(':id')
  async deleteHotel(@Param('id') id: number): Promise<Hotel> {
    return this.HotelsService.deleteHotel({ hotel_id: Number(id) });
  }
}
