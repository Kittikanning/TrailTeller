import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  // ✅ เพิ่มข้อมูลโรงแรม (มีหรือไม่มีรูปก็ได้)
  @Post()
  @UseInterceptors(FileInterceptor('img')) // รองรับการอัปโหลดรูป
  async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    const data = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      guest_id: Number(body.guest_id),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      room_id: body.room_id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      name: body.name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      address: body.address,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      cost: Number(body.cost),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      check_in_date: body.check_in_date
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, prettier/prettier
        ? new Date(body.check_in_date)
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      check_out_date: body.check_out_date
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        ? new Date(body.check_out_date)
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      number_of_guests: Number(body.number_of_guests),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      status: body.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      img: file ? file.buffer : null, // ✅ เก็บเป็น bytea
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.hotelService.createHotel(data);
  }

  //  ดึงโรงแรมทั้งหมด
  @Get()
  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.hotelService.getAllHotel();
  }

  //  ดึงโรงแรมตาม ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.hotelService.getHotelById(Number(id));
  }

  //  อัปเดตข้อมูลโรงแรม (ไม่บังคับรูป)
  @Put(':id')
  @Put(':id')
  @UseInterceptors(FileInterceptor('img'))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = {
      ...body,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      img: file ? file.buffer : undefined,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.hotelService.updateHotel(Number(id), data);
  }

  // ลบโรงแรม
  @Delete(':id')
  async remove(@Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.hotelService.deleteHotel(Number(id));
  }
}
