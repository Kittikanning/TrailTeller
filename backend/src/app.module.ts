import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HotelModule } from './hotel/hotel.module';

@Module({
  imports: [UsersModule, HotelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
