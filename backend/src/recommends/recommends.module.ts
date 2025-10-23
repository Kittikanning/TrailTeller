import { Module } from '@nestjs/common';
import { RecommendsService } from './recommends.service';
import { RecommendsController } from './recommends.controller';
import { PrismaService } from 'src/core/prisma.service';

@Module({
  controllers: [RecommendsController],
  providers: [RecommendsService, PrismaService],
})
export class RecommendsModule {}
