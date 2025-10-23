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
import { RecommendsService } from './recommends.service';
import { Prisma, Recommendation } from 'generated/prisma';

@Controller('recommends')
export class RecommendsController {
  constructor(private readonly RecommendsService: RecommendsService) {}

  // GET /recommends?skip=0&take=10
  @Get()
  async getRecommends(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: number,
  ): Promise<Recommendation[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.RecommendsService.recommends({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      cursor: cursor ? { recommendation_id: cursor } : undefined,
    });
  }

  // GET /reccommends/:id
  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  async getRecommendation(
    @Param('id') id: number,
  ): Promise<Recommendation | null> {
    return await this.RecommendsService.recommendation({
      recommendation_id: Number(id),
    });
  }

  // POST /recommends
  @Post()
  async createRecommendation(
    @Body() data: Prisma.RecommendationCreateInput,
  ): Promise<Recommendation> {
    return await this.RecommendsService.createRecommendation(data);
  }

  // PATCH /recommends/:id
  @Patch(':id')
  async updateRecommendation(
    @Param('id') id: number,
    @Body() data: Prisma.RecommendationUpdateInput,
  ): Promise<Recommendation> {
    return this.RecommendsService.updateRecommendation({
      where: { recommendation_id: Number(id) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });
  }

  // DELETE /precommends/:id
  @Delete(':id')
  async deleteRecommendation(@Param('id') id: number): Promise<Recommendation> {
    return this.RecommendsService.deleteRecommendation({
      recommendation_id: Number(id),
    });
  }
}
