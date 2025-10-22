import { db } from '../db/index.js';
import { recommendations, destinations } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// @desc    Get recommendations for user
// @route   GET /api/recommendations
export const getRecommendations = async (req, res) => {
  try {
    const userRecommendations = await db.query.recommendations.findMany({
      where: eq(recommendations.user_id, req.user.id),
      with: {
        destination: true,
        trip: true,
      },
      orderBy: (recommendations, { desc }) => [desc(recommendations.score)],
    });

    res.status(200).json({
      success: true,
      count: userRecommendations.length,
      data: { recommendations: userRecommendations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create recommendation
// @route   POST /api/recommendations
export const createRecommendation = async (req, res) => {
  try {
    const { trip_id, destination_id, score, reason } = req.body;

    if (!destination_id || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide destination_id and score'
      });
    }

    const [newRecommendation] = await db.insert(recommendations).values({
      user_id: req.user.id,
      trip_id: trip_id || null,
      destination_id,
      score,
      reason: reason || null,
    }).returning();

    // Get recommendation with destination
    const recommendationWithDetails = await db.query.recommendations.findFirst({
      where: eq(recommendations.id, newRecommendation.id),
      with: {
        destination: true,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Recommendation created successfully',
      data: { recommendation: recommendationWithDetails }
    });
  } catch (error) {
    console.error('Create recommendation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate AI recommendations (Mock)
// @route   POST /api/recommendations/generate
export const generateRecommendations = async (req, res) => {
  try {
    const { preferences, budget } = req.body;

    // Mock AI logic - In Sprint 2, replace with real AI
    const allDestinations = await db.query.destinations.findMany();
    
    const aiRecommendations = allDestinations
      .slice(0, 5)
      .map((dest, index) => ({
        destination_id: dest.id,
        score: (10 - index * 0.5).toFixed(2),
        reason: `Based on your ${preferences || 'preferences'} and budget of ${budget || 'your budget'}, this destination matches your criteria.`
      }));

    // Save recommendations
    const savedRecommendations = [];
    for (const rec of aiRecommendations) {
      const [saved] = await db.insert(recommendations).values({
        user_id: req.user.id,
        destination_id: rec.destination_id,
        score: rec.score,
        reason: rec.reason,
      }).returning();
      
      const withDetails = await db.query.recommendations.findFirst({
        where: eq(recommendations.id, saved.id),
        with: { destination: true }
      });
      
      savedRecommendations.push(withDetails);
    }

    res.status(201).json({
      success: true,
      message: 'Recommendations generated successfully',
      data: { recommendations: savedRecommendations }
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete recommendation
// @route   DELETE /api/recommendations/:id
export const deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await db.query.recommendations.findFirst({
      where: eq(recommendations.id, parseInt(req.params.id))
    });

    if (!recommendation || recommendation.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    await db.delete(recommendations).where(eq(recommendations.id, parseInt(req.params.id)));

    res.status(200).json({
      success: true,
      message: 'Recommendation deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};