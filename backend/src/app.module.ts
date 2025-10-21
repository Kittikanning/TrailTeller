import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HotelController } from './hotel/hotel.controller';
import { HotelService } from './hotel/hotel.service';
import { HotelModule } from './hotel/hotel.module';

@Module({
  imports: [UsersModule, HotelModule],
  controllers: [AppController, HotelController],
  providers: [AppService, HotelService],
})
export class AppModule {}
