import { Module } from '@nestjs/common';
import { RecommendsService } from './recommends.service';
import { RecommendsController } from './recommends.controller';
import { PrismaService } from 'src/core/prisma.service';
import { AiModule } from 'src/ai/ai.module'; 

@Module({
  imports: [AiModule],
  controllers: [RecommendsController],
  providers: [RecommendsService, PrismaService],
})
export class RecommendsModule {}