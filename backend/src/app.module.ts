import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HotelModule } from './hotel/hotel.module';
import { BookingModule } from './booking/booking.module';
import { TripModule } from './trip/trip.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { PaymentModule } from './payment/payment.module';
import { BookingModule } from './booking/booking.module';
import { ActivityModule } from './activity/activity.module';
import { HotelModule } from './hotel/hotel.module';
import { TripModule } from './trip/trip.module';

@Module({
  imports: [UsersModule, HotelModule, BookingModule, TripModule, ActivityModule, PaymentModule, RecommendationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
