import { db } from '../db/index.js';
import { trips, destinations, bookings } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { aiService } from './services/aiService.js';

// Mock AI Response (Fallback เมื่อไม่มี API Key)
const generateMockTripPlan = (destination, budget, dates, travelers) => {
  const [startDate, endDate] = dates.split(' to ');
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  const flightCost = Math.floor(budget * 0.35);
  const hotelCost = Math.floor(budget * 0.40);
  const activityCost = Math.floor(budget * 0.20);
  const foodCost = Math.floor(budget * 0.05);

  return {
    destination,
    dates,
    budget,
    travelers,
    duration,
    
    flight: {
      from: 'Bangkok (BKK)',
      to: destination,
      airline: 'Thai Airways',
      cost: flightCost,
      duration: '11h 30m'
    },

    accommodation: {
      name: `${destination} Grand Hotel`,
      rating: 4,
      nights: duration - 1,
      cost: hotelCost
    },

    activities: generateMockActivities(duration, activityCost, destination),

    food: {
      daily_budget: Math.floor(foodCost / duration),
      recommendations: ['Local restaurants', 'Street food', 'Hotel dining']
    },

    tips: [
      'Book flights 2-3 months in advance',
      'Try local street food',
      'Use public transportation',
      'Download offline maps'
    ],

    totalCost: flightCost + hotelCost + activityCost + foodCost
  };
};

const generateMockActivities = (days, budget, destination) => {
  const activities = [
    { title: 'City Walking Tour', category: 'culture', base_cost: 500 },
    { title: 'Museum Visit', category: 'culture', base_cost: 300 },
    { title: 'Beach Day', category: 'beach', base_cost: 0 },
    { title: 'Local Market Tour', category: 'culture', base_cost: 200 },
    { title: 'Food Tour', category: 'food', base_cost: 800 },
    { title: 'Boat Cruise', category: 'adventure', base_cost: 1000 },
    { title: 'Shopping Tour', category: 'shopping', base_cost: 500 },
    { title: 'Spa & Massage', category: 'wellness', base_cost: 600 }
  ];

  const selected = [];
  const perDay = Math.min(3, Math.floor(activities.length / days));
  const costPerActivity = Math.floor(budget / (days * perDay));

  for (let day = 1; day <= days; day++) {
    const dayActivities = activities
      .sort(() => 0.5 - Math.random())
      .slice(0, perDay)
      .map((activity, index) => ({
        day,
        time: ['9:00 AM', '2:00 PM', '6:00 PM'][index],
        title: activity.title,
        description: `Experience ${activity.title} in ${destination}`,
        location: `${destination} ${activity.category} District`,
        cost: Math.min(activity.base_cost, costPerActivity)
      }));

    selected.push(...dayActivities);
  }

  return selected;
};

// @desc    Generate AI trip plan
// @route   POST /api/ai/generate
// @access  Private
export const generateTrip = async (req, res) => {
  try {
    const { destination_name, budget, dates, travelers, preferences } = req.body;

    if (!destination_name || !budget || !dates) {
      return res.status(400).json({
        success: false,
        message: 'Please provide destination, budget, and dates'
      });
    }

    // Check if destination exists
    let destination = await db.query.destinations.findFirst({
      where: eq(destinations.name, destination_name)
    });

    if (!destination) {
      [destination] = await db.insert(destinations).values({
        name: destination_name,
        location: destination_name,
        category: preferences?.category || 'city',
        avg_cost: budget,
        description: `Popular destination: ${destination_name}`,
        image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'
      }).returning();
    }

    // Try to generate with AI first
    console.log(`🤖 Generating trip with ${aiService.getProvider()}...`);
    let aiPlan = await aiService.generateTrip(
      destination_name, 
      parseFloat(budget), 
      dates, 
      parseInt(travelers) || 1, 
      preferences
    );

    // Fallback to mock if AI fails
    if (!aiPlan) {
      console.log('⚠️ AI unavailable, using mock data');
      aiPlan = generateMockTripPlan(destination_name, parseFloat(budget), dates, parseInt(travelers) || 1);
    }

    // Create trip in database
    const [newTrip] = await db.insert(trips).values({
      user_id: req.user.id,
      destination_id: destination.id,
      dates: dates,
      budget: budget,
      status: 'planning'
    }).returning();

    // Create bookings
    const bookingsToCreate = [
      {
        trip_id: newTrip.id,
        service_type: 'flight',
        service_name: `${aiPlan.flight.from} → ${aiPlan.flight.to} (${aiPlan.flight.airline})`,
        amount: aiPlan.flight.cost,
        status: 'pending'
      },
      {
        trip_id: newTrip.id,
        service_type: 'hotel',
        service_name: aiPlan.accommodation.name,
        amount: aiPlan.accommodation.cost,
        status: 'pending'
      }
    ];

    // Add activity bookings
    if (aiPlan.activities) {
      for (const activity of aiPlan.activities) {
        bookingsToCreate.push({
          trip_id: newTrip.id,
          service_type: 'activity',
          service_name: `${activity.title} - Day ${activity.day}`,
          amount: activity.cost || 0,
          status: 'pending'
        });
      }
    }

    await db.insert(bookings).values(bookingsToCreate);

    // Get complete trip
    const completeTrip = await db.query.trips.findFirst({
      where: eq(trips.id, newTrip.id),
      with: {
        destination: true,
        bookings: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'AI trip plan generated successfully',
      ai_provider: aiService.getProvider(),
      data: {
        trip: completeTrip,
        plan: {
          ...aiPlan,
          trip_id: newTrip.id
        }
      }
    });

  } catch (error) {
    console.error('Generate trip error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get AI destination suggestions
// @route   POST /api/ai/suggest
// @access  Private
export const suggestDestinations = async (req, res) => {
  try {
    const { budget, preferences, travelers } = req.body;

    // Try AI first
    let suggestions = await aiService.suggestDestinations(budget, preferences, travelers);

    // Fallback to database
    if (!suggestions) {
      const allDestinations = await db.query.destinations.findMany();
      
      suggestions = allDestinations
        .map(dest => ({
          name: dest.name,
          country: dest.location,
          category: dest.category,
          estimated_cost: dest.avg_cost,
          score: (Math.random() * 3 + 7).toFixed(2), // 7-10 score
          reason: `Great ${dest.category} destination within your budget`,
          best_season: 'Year-round'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }

    res.status(200).json({
      success: true,
      ai_provider: aiService.getProvider(),
      count: suggestions.length,
      data: { suggestions }
    });

  } catch (error) {
    console.error('Suggest destinations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    AI chat assistant
// @route   POST /api/ai/chat
// @access  Private
export const aiChat = async (req, res) => {
  try {
    const { message, conversation_history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // Try AI first
    let aiResponse = await aiService.chat(message, conversation_history || []);

    // Fallback responses
    if (!aiResponse) {
      const mockResponses = {
        budget: "Based on typical budgets, I recommend allocating 35% for flights, 40% for accommodation, 20% for activities, and 5% for food.",
        destination: "Popular destinations include Bali, Tokyo, Paris, and Maldives. What's your budget range?",
        activities: "I can suggest cultural tours, beach activities, adventure sports, and food experiences. What interests you?",
        default: "I'm here to help plan your trip! Ask me about destinations, budgets, or activities."
      };

      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('budget') || lowerMessage.includes('cost')) {
        aiResponse = mockResponses.budget;
      } else if (lowerMessage.includes('destination') || lowerMessage.includes('where')) {
        aiResponse = mockResponses.destination;
      } else if (lowerMessage.includes('activity') || lowerMessage.includes('do')) {
        aiResponse = mockResponses.activities;
      } else {
        aiResponse = mockResponses.default;
      }
    }

    res.status(200).json({
      success: true,
      ai_provider: aiService.getProvider(),
      data: {
        message,
        response: aiResponse,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get AI status
// @route   GET /api/ai/status
// @access  Private
export const getAIStatus = async (req, res) => {
  try {
    const provider = aiService.getProvider();
    const isAvailable = aiService.isAvailable();

    res.status(200).json({
      success: true,
      data: {
        provider,
        available: isAvailable,
        status: isAvailable ? 'connected' : 'using mock data',
        features: {
          trip_generation: true,
          destination_suggestions: true,
          chat_assistant: true,
          trip_optimization: true
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export optimizeTrip ถ้ามี (เหมือนเดิม)
export const optimizeTrip = async (req, res) => {
  // ... (โค้ดเดิม)
};