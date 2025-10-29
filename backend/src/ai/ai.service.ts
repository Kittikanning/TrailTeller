import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

interface TravelPlanInput {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  preferences: string;
}

interface Hotel {
  id: string;
  name: string;
  rating: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
  location: string;
}

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
}

interface DailyActivity {
  day: number;
  date: string;
  activities: string[];
}

interface TravelPlan {
  hotels: Hotel[];
  outboundFlights: Flight[];
  returnFlights: Flight[];
  todoList: string[];
  dailyActivities: DailyActivity[];
  totalEstimate: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      this.logger.warn('ANTHROPIC_API_KEY not found. AI features will be disabled.');
      this.logger.warn('Add ANTHROPIC_API_KEY to your .env file to enable AI recommendations');
    } else {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
      });
      this.logger.log('AI Service initialized with Claude API');
    }
  }

  /**
   * Generate travel recommendations using Claude AI
   */
  async generateRecommendations(input: TravelPlanInput): Promise<TravelPlan> {
    if (!this.anthropic) {
      this.logger.warn('Using mock data (AI disabled)');
      return this.generateMockRecommendations(input);
    }

    try {
      this.logger.log(`Generating AI recommendations for ${input.destination}`);

      const prompt = this.buildPrompt(input);
      
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const aiResponse = JSON.parse(jsonMatch[0]);
      this.logger.log('AI recommendations generated successfully');

      return aiResponse;
    } catch (error) {
      this.logger.error('Error generating AI recommendations:', error.message);
      this.logger.warn('Falling back to mock data');
      return this.generateMockRecommendations(input);
    }
  }

  /**
   * Build prompt for Claude AI
   */
  private buildPrompt(input: TravelPlanInput): string {
    const nights = this.calculateNights(input.startDate, input.endDate);

    return `คุณเป็นผู้เชี่ยวชาญด้านการวางแผนท่องเที่ยวในประเทศไทย กรุณาสร้างแผนการเดินทางที่สมบูรณ์แบบและละเอียดสำหรับ:

จุดเริ่มต้น: ${input.origin}
ปลายทาง: ${input.destination}
วันที่เดินทาง: ${input.startDate} ถึง ${input.endDate} (${nights} คืน)
จำนวนผู้เดินทาง: ${input.travelers} คน
งบประมาณทั้งหมด: ${input.budget.toLocaleString()} บาท
ความชอบ: ${input.preferences}

กรุณาสร้างแผนการเดินทางในรูปแบบ JSON ที่มีโครงสร้างดังนี้:

{
  "hotels": [
    {
      "id": "h1",
      "name": "ชื่อโรงแรม",
      "rating": 4.5,
      "pricePerNight": ราคาต่อคืน (ตัวเลข),
      "image": "/placeholder.svg?height=200&width=300",
      "amenities": ["Wi-Fi ฟรี", "สระว่ายน้ำ", "ฟิตเนส"],
      "location": "ตำแหน่งที่ตั้ง"
    }
  ],
  "outboundFlights": [
    {
      "id": "f1",
      "airline": "สายการบิน",
      "flightNumber": "TG301",
      "departure": "${input.origin}",
      "arrival": "${input.destination}",
      "departureTime": "08:00",
      "arrivalTime": "10:30",
      "duration": "2ชม 30นาที",
      "price": ราคา (ตัวเลข)
    }
  ],
  "returnFlights": [
    {
      "id": "f4",
      "airline": "สายการบิน",
      "flightNumber": "TG302",
      "departure": "${input.destination}",
      "arrival": "${input.origin}",
      "departureTime": "18:00",
      "arrivalTime": "20:30",
      "duration": "2ชม 30นาที",
      "price": ราคา (ตัวเลข)
    }
  ],
  "todoList": [
    "เช็คอินโรงแรม",
    "เที่ยวชมสถานที่สำคัญ",
    "ลิ้มลองอาหารท้องถิ่น"
  ],
  "dailyActivities": [
    {
      "day": 1,
      "date": "วันที่ในรูปแบบ '28 ตุลาคม 2568'",
      "activities": [
        "กิจกรรมเช้า - รายละเอียดสถานที่และคำแนะนำ",
        "กิจกรรมบ่าย - รายละเอียดสถานที่และคำแนะนำ",
        "กิจกรรมเย็น - รายละเอียดสถานที่และคำแนะนำ"
      ]
    }
  ],
  "totalEstimate": ${input.budget}
}

เกณฑ์การแนะนำ:
- แนะนำโรงแรม 3 แห่ง ในราคาที่แตกต่างกัน (50%, 40%, 30% ของงบประมาณที่พัก)
- แนะนำเที่ยวบินไป-กลับ อย่างละ 3 ตัวเลือก (แพง, กลาง, ประหยัด)
- สร้างกิจกรรมรายวันที่ละเอียด พร้อมชื่อสถานที่จริงและคำอธิบาย
- ราคาต้องสมเหตุสมผลและไม่เกินงบประมาณทั้งหมด
- การแบ่งงบประมาณ: เที่ยวบิน 35%, โรงแรม 50%, กิจกรรม 15%

สำคัญ: ตอบกลับเป็น JSON เท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม`;
  }

  /**
   * Calculate number of nights between dates
   */
  private calculateNights(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Generate mock recommendations (fallback when AI is unavailable)
   */
  private generateMockRecommendations(input: TravelPlanInput): TravelPlan {
    const nights = this.calculateNights(input.startDate, input.endDate);
    const flightBudget = input.budget * 0.35;
    const hotelBudget = input.budget * 0.5;

    return {
      hotels: [
        {
          id: 'h1',
          name: `${input.destination} Grand Hotel`,
          rating: 4.5,
          pricePerNight: Math.floor((hotelBudget / nights / input.travelers) * 0.9),
          image: `/placeholder.svg?height=200&width=300`,
          amenities: ['Wi-Fi ฟรี', 'สระว่ายน้ำ', 'ฟิตเนส', 'ร้านอาหาร'],
          location: `ใจกลาง${input.destination}`,
        },
        {
          id: 'h2',
          name: `${input.destination} Beach Resort`,
          rating: 4.8,
          pricePerNight: Math.floor(hotelBudget / nights / input.travelers),
          image: `/placeholder.svg?height=200&width=300`,
          amenities: ['Wi-Fi ฟรี', 'สระว่ายน้ำ', 'ชายหาดส่วนตัว', 'สปา'],
          location: `ชายหาด${input.destination}`,
        },
        {
          id: 'h3',
          name: `${input.destination} Boutique Hotel`,
          rating: 4.3,
          pricePerNight: Math.floor((hotelBudget / nights / input.travelers) * 0.7),
          image: `/placeholder.svg?height=200&width=300`,
          amenities: ['Wi-Fi ฟรี', 'คาเฟ่', 'ห้องสมุด'],
          location: `ย่านเก่า${input.destination}`,
        },
      ],
      outboundFlights: [
        {
          id: 'f1',
          airline: 'Thai Airways',
          flightNumber: 'TG301',
          departure: input.origin,
          arrival: input.destination,
          departureTime: '08:00',
          arrivalTime: '10:30',
          duration: '2ชม 30นาที',
          price: Math.floor((flightBudget / 2) * 0.9),
        },
        {
          id: 'f2',
          airline: 'Bangkok Airways',
          flightNumber: 'PG201',
          departure: input.origin,
          arrival: input.destination,
          departureTime: '13:00',
          arrivalTime: '15:30',
          duration: '2ชม 30นาที',
          price: Math.floor((flightBudget / 2) * 0.8),
        },
        {
          id: 'f3',
          airline: 'AirAsia',
          flightNumber: 'FD401',
          departure: input.origin,
          arrival: input.destination,
          departureTime: '06:00',
          arrivalTime: '08:30',
          duration: '2ชม 30นาที',
          price: Math.floor((flightBudget / 2) * 0.7),
        },
      ],
      returnFlights: [
        {
          id: 'f4',
          airline: 'Thai Airways',
          flightNumber: 'TG302',
          departure: input.destination,
          arrival: input.origin,
          departureTime: '18:00',
          arrivalTime: '20:30',
          duration: '2ชม 30นาที',
          price: Math.floor((flightBudget / 2) * 0.9),
        },
        {
          id: 'f5',
          airline: 'Bangkok Airways',
          flightNumber: 'PG202',
          departure: input.destination,
          arrival: input.origin,
          departureTime: '16:00',
          arrivalTime: '18:30',
          duration: '2ชม 30นาที',
          price: Math.floor((flightBudget / 2) * 0.8),
        },
        {
          id: 'f6',
          airline: 'AirAsia',
          flightNumber: 'FD402',
          departure: input.destination,
          arrival: input.origin,
          departureTime: '20:00',
          arrivalTime: '22:30',
          duration: '2ชม 30นาที',
          price: Math.floor((flightBudget / 2) * 0.7),
        },
      ],
      todoList: [
        `เช็คอินโรงแรมที่ ${input.destination}`,
        `เที่ยวชมสถานที่สำคัญใน${input.destination}`,
        'ลิ้มลองอาหารท้องถิ่น',
        'ช้อปปิ้งของฝาก',
        'ถ่ายรูปที่จุดชมวิว',
      ],
      dailyActivities: this.generateMockDailyActivities(input, nights),
      totalEstimate: input.budget,
    };
  }

  /**
   * Generate mock daily activities
   */
  private generateMockDailyActivities(
    input: TravelPlanInput,
    nights: number,
  ): DailyActivity[] {
    const activities: DailyActivity[] = [];
    const start = new Date(input.startDate);

    for (let i = 0; i <= nights; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);

      activities.push({
        day: i + 1,
        date: currentDate.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        activities: [
          `เช้า: เที่ยวชมสถานที่สำคัญใน${input.destination}`,
          `บ่าย: ลิ้มลองอาหารท้องถิ่น`,
          `เย็น: ช้อปปิ้งและพักผ่อน`,
        ],
      });
    }

    return activities;
  }
}