import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HotelsModule } from './hotels/hotels.module';
import { ActivitiesModule } from './activities/activities.module';
import { BooksModule } from './books/books.module';
import { PaymentsModule } from './payments/payments.module';
import { RecommendsModule } from './recommends/recommends.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    UsersModule,
    ActivitiesModule,
    HotelsModule,
    BooksModule,
    PaymentsModule,
    RecommendsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}