import express from 'express';
import { body, validationResult } from 'express-validator';
import { eq, and } from 'drizzle-orm';
import db from '../db/index.js';
import { trips, activities, hotels, flights } from '../db/schema.js';
import geminiService from '../services/gemini.service.js';

const router = express.Router();

// Generate trip plan with AI
router.post('/generate', [
  body('destination').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('budget').isNumeric(),
  body('numberOfTravelers').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId;
    const { destination, startDate, endDate, budget, numberOfTravelers, preferences } = req.body;

    // Generate trip plan using Gemini AI
    const aiPlan = await geminiService.generateTripPlan({
      destination,
      startDate,
      endDate,
      budget,
      numberOfTravelers,
      preferences
    });

    // Create trip record
    const newTrip = await db.insert(trips).values({
      userId,
      title: `Trip to ${destination}`,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget,
      numberOfTravelers,
      status: 'planning',
      totalCost: aiPlan.totalEstimatedCost,
      aiGeneratedPlan: aiPlan
    }).returning();

    const tripId = newTrip[0].id;

    // Insert activities
    if (aiPlan.days && aiPlan.days.length > 0) {
      const activitiesData = [];
      aiPlan.days.forEach((day, dayIndex) => {
        day.activities?.forEach((activity, actIndex) => {
          activitiesData.push({
            tripId,
            name: activity.name,
            description: activity.description,
            location: activity.location,
            date: new Date(day.date),
            time: activity.time,
            duration: activity.duration,
            cost: activity.cost?.toString(),
            category: activity.category,
            order: actIndex,
            metadata: { dayNumber: dayIndex + 1 }
          });
        });
      });

      if (activitiesData.length > 0) {
        await db.insert(activities).values(activitiesData);
      }
    }

    // Insert hotels
    if (aiPlan.hotels && aiPlan.hotels.length > 0) {
      const hotelsData = aiPlan.hotels.map(hotel => ({
        tripId,
        name: hotel.name,
        location: hotel.location,
        checkIn: new Date(startDate),
        checkOut: new Date(endDate),
        pricePerNight: hotel.pricePerNight?.toString(),
        totalCost: hotel.totalCost?.toString(),
        starRating: hotel.starRating,
        metadata: { amenities: hotel.amenities || [] }
      }));

      await db.insert(hotels).values(hotelsData);
    }

    // Insert flights
    if (aiPlan.flights && aiPlan.flights.length > 0) {
      const flightsData = aiPlan.flights.map(flight => ({
        tripId,
        airline: flight.airline,
        departureAirport: flight.departure,
        arrivalAirport: flight.arrival,
        departureTime: new Date(flight.departureTime),
        arrivalTime: new Date(flight.arrivalTime),
        price: flight.price?.toString(),
        type: flight.type
      }));

      await db.insert(flights).values(flightsData);
    }

    res.status(201).json({
      message: 'Trip plan generated successfully',
      trip: newTrip[0],
      aiPlan
    });
  } catch (error) {
    console.error('Generate trip error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate trip plan' });
  }
});

// Get all user trips
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    
    const userTrips = await db.select().from(trips).where(eq(trips.userId, userId));

    res.json({ trips: userTrips });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to get trips' });
  }
});

// Get trip details
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = parseInt(req.params.id);

    const trip = await db.select().from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .limit(1);

    if (trip.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Get related activities
    const tripActivities = await db.select().from(activities)
      .where(eq(activities.tripId, tripId));

    // Get related hotels
    const tripHotels = await db.select().from(hotels)
      .where(eq(hotels.tripId, tripId));

    // Get related flights
    const tripFlights = await db.select().from(flights)
      .where(eq(flights.tripId, tripId));

    res.json({
      trip: trip[0],
      activities: tripActivities,
      hotels: tripHotels,
      flights: tripFlights
    });
  } catch (error) {
    console.error('Get trip details error:', error);
    res.status(500).json({ error: 'Failed to get trip details' });
  }
});

// Update trip
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = parseInt(req.params.id);
    const updates = req.body;

    // Verify ownership
    const trip = await db.select().from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .limit(1);

    if (trip.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Update trip
    const updatedTrip = await db.update(trips)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(trips.id, tripId))
      .returning();

    res.json({
      message: 'Trip updated successfully',
      trip: updatedTrip[0]
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = parseInt(req.params.id);

    // Verify ownership
    const trip = await db.select().from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .limit(1);

    if (trip.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Delete related data
    await db.delete(activities).where(eq(activities.tripId, tripId));
    await db.delete(hotels).where(eq(hotels.tripId, tripId));
    await db.delete(flights).where(eq(flights.tripId, tripId));
    
    // Delete trip
    await db.delete(trips).where(eq(trips.id, tripId));

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// Add activity to trip
router.post('/:id/activities', [
  body('name').notEmpty(),
  body('date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId;
    const tripId = parseInt(req.params.id);

    // Verify ownership
    const trip = await db.select().from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .limit(1);

    if (trip.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const newActivity = await db.insert(activities).values({
      tripId,
      ...req.body,
      date: new Date(req.body.date)
    }).returning();

    res.status(201).json({
      message: 'Activity added successfully',
      activity: newActivity[0]
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// Update activity
router.put('/:tripId/activities/:activityId', async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = parseInt(req.params.tripId);
    const activityId = parseInt(req.params.activityId);

    // Verify trip ownership
    const trip = await db.select().from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .limit(1);

    if (trip.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const updatedActivity = await db.update(activities)
      .set(req.body)
      .where(and(eq(activities.id, activityId), eq(activities.tripId, tripId)))
      .returning();

    if (updatedActivity.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({
      message: 'Activity updated successfully',
      activity: updatedActivity[0]
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Get destination recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const userPreferences = req.body;

    const recommendations = await geminiService.getDestinationRecommendations(userPreferences);

    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;
