import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateTripPlan(tripData) {
    const { destination, startDate, endDate, budget, numberOfTravelers, preferences } = tripData;
    
    const prompt = `
You are an expert travel planner AI. Generate a detailed travel itinerary with the following specifications:

Destination: ${destination}
Travel Dates: ${startDate} to ${endDate}
Budget: ${budget} THB
Number of Travelers: ${numberOfTravelers}
Preferences: ${JSON.stringify(preferences || {})}

Please provide a comprehensive travel plan in JSON format with:
1. Daily activities (with time, location, description, estimated cost)
2. Hotel recommendations (name, star rating, price per night, location)
3. Flight suggestions (airline, departure/arrival times, estimated price)
4. Budget breakdown by category
5. Travel tips and recommendations

Format your response as valid JSON with these keys:
{
  "summary": "brief trip overview",
  "totalEstimatedCost": number,
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "HH:MM",
          "name": "activity name",
          "location": "location",
          "description": "description",
          "duration": minutes,
          "cost": number,
          "category": "sightseeing/dining/adventure/etc"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "hotel name",
      "starRating": 4,
      "pricePerNight": number,
      "totalCost": number,
      "location": "location",
      "amenities": ["wifi", "pool"]
    }
  ],
  "flights": [
    {
      "type": "outbound/return",
      "airline": "airline name",
      "departure": "airport code",
      "arrival": "airport code",
      "departureTime": "YYYY-MM-DD HH:MM",
      "arrivalTime": "YYYY-MM-DD HH:MM",
      "price": number
    }
  ],
  "budgetBreakdown": {
    "flights": number,
    "hotels": number,
    "activities": number,
    "food": number,
    "transportation": number,
    "misc": number
  },
  "tips": ["tip 1", "tip 2"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error('Failed to generate trip plan with AI');
    }
  }

  async getDestinationRecommendations(userPreferences) {
    const { budget, interests, travelStyle, climate, duration } = userPreferences;
    
    const prompt = `
As a travel expert AI, recommend 5-10 destinations based on:

Budget: ${budget} THB
Interests: ${interests?.join(', ') || 'general tourism'}
Travel Style: ${travelStyle || 'moderate'}
Preferred Climate: ${climate || 'any'}
Trip Duration: ${duration} days

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "destination": "destination name",
      "country": "country",
      "score": 0-100,
      "reasoning": "why this destination fits",
      "estimatedCost": number,
      "highlights": ["highlight 1", "highlight 2"],
      "bestTimeToVisit": "season/months"
    }
  ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error('Failed to get destination recommendations');
    }
  }

  async optimizeBudget(tripData) {
    const prompt = `
Analyze and optimize this trip budget:
${JSON.stringify(tripData, null, 2)}

Provide budget optimization suggestions in JSON:
{
  "currentTotal": number,
  "optimizedTotal": number,
  "savings": number,
  "suggestions": [
    {
      "category": "flights/hotels/activities",
      "currentCost": number,
      "suggestedCost": number,
      "tip": "optimization tip"
    }
  ],
  "alternatives": ["alternative 1", "alternative 2"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error('Failed to optimize budget');
    }
  }

  async generateActivitySuggestions(destination, date, preferences) {
    const prompt = `
Suggest activities for ${destination} on ${date}.
User preferences: ${JSON.stringify(preferences)}

Return JSON format:
{
  "activities": [
    {
      "name": "activity name",
      "time": "suggested time",
      "duration": minutes,
      "cost": number,
      "description": "description",
      "category": "category"
    }
  ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error('Failed to generate activity suggestions');
    }
  }
}

export default new GeminiService();