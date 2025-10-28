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
import { BooksService } from './books.service';
import { Prisma, Booking } from 'generated/prisma';

@Controller('books')
export class BooksController {
  constructor(private readonly BooksService: BooksService) {}

  // GET /books?skip=0&take=10
  @Get()
  async getBooks(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: number,
  ): Promise<Booking[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return await this.BooksService.books({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  // GET /books/:id
  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  async getBooking(@Param('id') id: number): Promise<Booking | null> {
    return await this.BooksService.booking({
      id: Number(id),
    });
  }

  // POST /books
  @Post()
  async createBooking(
    @Body() data: Prisma.BookingCreateInput,
  ): Promise<Booking> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.BooksService.createBooking(data);
  }

  // PATCH /books/:id
  @Patch(':id')
  async updateBooking(
    @Param('id') id: number,
    @Body() data: Prisma.BookingUpdateInput,
  ): Promise<Booking> {
    return this.BooksService.updateBooking({
      where: { id: Number(id) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });
  }

  // DELETE /books/:id
  @Delete(':id')
  async deleteBooking(@Param('id') id: number): Promise<Booking> {
    return this.BooksService.deleteBooking({ id: Number(id) });
  }
}
