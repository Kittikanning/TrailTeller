import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
let openaiClient = null;
let geminiClient = null;

// Initialize OpenAI
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Initialize Gemini
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ==================== OpenAI Functions ====================

const generateTripWithOpenAI = async (destination, budget, dates, travelers, preferences) => {
  if (!openaiClient) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `You are a professional travel planner. Generate a detailed trip plan with the following information:

Destination: ${destination}
Budget: ฿${budget}
Travel Dates: ${dates}
Number of Travelers: ${travelers}
Preferences: ${JSON.stringify(preferences || {})}

Please provide a JSON response with this structure:
{
  "flight": {
    "from": "Bangkok",
    "to": "${destination}",
    "airline": "suggested airline",
    "cost": estimated_cost,
    "duration": "flight duration"
  },
  "accommodation": {
    "name": "hotel name",
    "rating": rating_number,
    "nights": number_of_nights,
    "cost": estimated_cost
  },
  "activities": [
    {
      "day": 1,
      "time": "9:00 AM",
      "title": "activity name",
      "description": "activity description",
      "location": "location",
      "cost": estimated_cost
    }
  ],
  "food": {
    "daily_budget": estimated_daily_food_cost,
    "recommendations": ["restaurant suggestions"]
  },
  "tips": ["travel tips"],
  "totalCost": total_estimated_cost
}

Make sure the total cost is within the budget of ฿${budget}.`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional travel planner that provides detailed, realistic trip plans. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate trip with OpenAI: ' + error.message);
  }
};

// ==================== Gemini Functions ====================

const generateTripWithGemini = async (destination, budget, dates, travelers, preferences) => {
  if (!geminiClient) {
    throw new Error('Gemini API key not configured');
  }

  const model = geminiClient.getGenerativeModel({ 
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' 
  });

  const prompt = `You are a professional travel planner. Generate a detailed trip plan in JSON format:

Destination: ${destination}
Budget: ฿${budget}
Travel Dates: ${dates}
Number of Travelers: ${travelers}
Preferences: ${JSON.stringify(preferences || {})}

Provide a JSON response with flight details, accommodation, daily activities with costs, food recommendations, and tips. Ensure total cost is within budget.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (Gemini sometimes wraps it in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid JSON response from Gemini');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate trip with Gemini: ' + error.message);
  }
};

// ==================== Destination Suggestions ====================

const suggestDestinationsWithAI = async (budget, preferences, travelers) => {
  const provider = process.env.AI_PROVIDER || 'mock';

  const prompt = `Suggest 5 travel destinations based on:
Budget: ฿${budget}
Preferences: ${JSON.stringify(preferences)}
Travelers: ${travelers}

Return JSON array with: name, country, reason, estimated_cost, best_season, score (0-10)`;

  try {
    if (provider === 'openai' && openaiClient) {
      const completion = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a travel expert. Respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      return response.suggestions || response.destinations || [];
    } else if (provider === 'gemini' && geminiClient) {
      const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.suggestions || parsed.destinations || [];
      }
    }

    // Fallback to mock
    return null;
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return null;
  }
};

// ==================== AI Chat ====================

const chatWithAI = async (message, conversationHistory = []) => {
  const provider = process.env.AI_PROVIDER || 'mock';

  const systemPrompt = 'You are a helpful travel assistant. Provide concise, practical travel advice.';

  try {
    if (provider === 'openai' && openaiClient) {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const completion = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content;
    } else if (provider === 'gemini' && geminiClient) {
      const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
      const chat = model.startChat({
        history: conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      });

      const result = await chat.sendMessage(message);
      return (await result.response).text();
    }

    return null;
  } catch (error) {
    console.error('AI Chat Error:', error);
    return null;
  }
};

// ==================== Main AI Service ====================

export const aiService = {
  // Generate trip plan
  generateTrip: async (destination, budget, dates, travelers, preferences) => {
    const provider = process.env.AI_PROVIDER || 'mock';

    try {
      if (provider === 'openai' && openaiClient) {
        return await generateTripWithOpenAI(destination, budget, dates, travelers, preferences);
      } else if (provider === 'gemini' && geminiClient) {
        return await generateTripWithGemini(destination, budget, dates, travelers, preferences);
      } else {
        // Return null to use mock data
        return null;
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      return null; // Fallback to mock
    }
  },

  // Suggest destinations
  suggestDestinations: async (budget, preferences, travelers) => {
    return await suggestDestinationsWithAI(budget, preferences, travelers);
  },

  // Chat assistant
  chat: async (message, history) => {
    return await chatWithAI(message, history);
  },

  // Check if AI is available
  isAvailable: () => {
    const provider = process.env.AI_PROVIDER || 'mock';
    
    if (provider === 'openai') {
      return !!openaiClient && !!process.env.OPENAI_API_KEY;
    } else if (provider === 'gemini') {
      return !!geminiClient && !!process.env.GEMINI_API_KEY;
    }
    
    return false;
  },

  // Get current provider
  getProvider: () => {
    return process.env.AI_PROVIDER || 'mock';
  }
};