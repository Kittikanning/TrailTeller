import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { Prisma, Recommendation } from 'generated/prisma';
import { AiService } from 'src/ai/ai.service'; 

interface GenerateRecommendationsDto {
  user_id: number;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  preferences: string;
  trip_id?: number;
}

@Injectable()
export class RecommendsService {
  private readonly logger = new Logger(RecommendsService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService, 
  ) {}

  async generateRecommendations(dto: GenerateRecommendationsDto) {
    try {
      this.logger.log(`Generating AI recommendations for user ${dto.user_id}`);

      const aiPlan = await this.aiService.generateRecommendations({
        origin: dto.origin,
        destination: dto.destination,
        startDate: dto.startDate,
        endDate: dto.endDate,
        travelers: dto.travelers,
        budget: dto.budget,
        preferences: dto.preferences,
      });

      const savedRecommendations = await this.saveRecommendationsToDb(
        dto.user_id,
        dto.trip_id,
        dto.budget,
        aiPlan,
      );

      this.logger.log(`Saved ${savedRecommendations.length} recommendations to database`);

      return {
        success: true,
        message: 'AI recommendations generated successfully',
        data: {
          recommendations: aiPlan,
          savedCount: savedRecommendations.length,
          tripId: dto.trip_id,
        },
      };
    } catch (error) {
      this.logger.error('Error generating recommendations:', error.message);
      throw error;
    }
  }

  private async saveRecommendationsToDb(
    userId: number,
    tripId: number | undefined,
    budget: number,
    aiPlan: any,
  ) {
    const recommendations: Recommendation[] = [];

    try {
      // บันทึกโรงแรม
      for (const hotel of aiPlan.hotels) {
        const rec = await this.prisma.recommendation.create({
          data: {
            user_id: userId,
            trip_id: tripId,
            budget: budget,
            recommend_type: 'hotel',
            item_id: parseInt(hotel.id.replace(/\D/g, '')) || null,
            item_name: hotel.name,
            item_price: hotel.pricePerNight,
          },
        });
        recommendations.push(rec);
      }

      for (const flight of aiPlan.outboundFlights) {
        const rec = await this.prisma.recommendation.create({
          data: {
            user_id: userId,
            trip_id: tripId,
            budget: budget,
            recommend_type: 'flight',
            item_id: parseInt(flight.id.replace(/\D/g, '')) || null,
            item_name: `${flight.airline} ${flight.flightNumber} (ขาไป)`,
            item_price: flight.price,
          },
        });
        recommendations.push(rec);
      }

      for (const flight of aiPlan.returnFlights) {
        const rec = await this.prisma.recommendation.create({
          data: {
            user_id: userId,
            trip_id: tripId,
            budget: budget,
            recommend_type: 'flight',
            item_id: parseInt(flight.id.replace(/\D/g, '')) || null,
            item_name: `${flight.airline} ${flight.flightNumber} (ขากลับ)`,
            item_price: flight.price,
          },
        });
        recommendations.push(rec);
      }

      return recommendations;
    } catch (error) {
      this.logger.error('Error saving recommendations to database:', error.message);
      return recommendations;
    }
  }

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