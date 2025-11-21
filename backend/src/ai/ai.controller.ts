import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiService } from './ai.service';

class GenerateRecommendationsDto {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  preferences: string;
}

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/generate-recommendations
   * ทดสอบการสร้างคำแนะนำด้วย AI
   */
  @Post('generate-recommendations')
  async generateRecommendations(
    @Body() dto: GenerateRecommendationsDto,
  ) {
    try {
      this.logger.log(`Generating recommendations for ${dto.destination}`);
      
      const recommendations = await this.aiService.generateRecommendations(dto);
      
      return {
        success: true,
        message: 'Recommendations generated successfully',
        data: recommendations,
      };
    } catch (error) {
      this.logger.error('Error generating recommendations:', error.message);
      
      return {
        success: false,
        message: 'Failed to generate recommendations',
        error: error.message,
      };
    }
  }

  /**
   * POST /ai/test
   * ทดสอบว่า AI Service ทำงานหรือไม่
   */
  @Post('test')
  async testAi() {
    const testInput = {
      origin: 'กรุงเทพฯ',
      destination: 'ภูเก็ต',
      startDate: '2025-12-01',
      endDate: '2025-12-05',
      travelers: 2,
      budget: 30000,
      preferences: 'ชอบทะเล ชอบอาหารทะเล',
    };

    try {
      this.logger.log('Testing AI Service...');
      
      const result = await this.aiService.generateRecommendations(testInput);
      
      return {
        success: true,
        message: 'AI Service is working',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'AI Service test failed',
        error: error.message,
      };
    }
  }
}