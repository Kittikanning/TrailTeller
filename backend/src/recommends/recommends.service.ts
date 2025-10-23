import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { Prisma, Recommendation } from 'generated/prisma';

@Injectable()
export class RecommendsService {
  constructor(private prisma: PrismaService) {}

  async recommendation(
    recommendationtWhereUniqueInput: Prisma.RecommendationWhereUniqueInput,
  ): Promise<Recommendation | null> {
    return await this.prisma.recommendation.findUnique({
      where: recommendationtWhereUniqueInput,
    });
  }

  async recommends(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RecommendationWhereUniqueInput;
    where?: Prisma.RecommendationWhereInput;
    orderBy?: Prisma.RecommendationOrderByWithRelationInput;
  }): Promise<Recommendation[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.recommendation.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createRecommendation(
    data: Prisma.RecommendationCreateInput,
  ): Promise<Recommendation> {
    return this.prisma.recommendation.create({
      data,
    });
  }

  async updateRecommendation(params: {
    where: Prisma.RecommendationWhereUniqueInput;
    data: Prisma.RecommendationUpdateInput;
  }): Promise<Recommendation> {
    const { where, data } = params;
    return this.prisma.recommendation.update({
      data,
      where,
    });
  }

  async deleteRecommendation(
    where: Prisma.RecommendationWhereUniqueInput,
  ): Promise<Recommendation> {
    return this.prisma.recommendation.delete({
      where,
    });
  }
}
