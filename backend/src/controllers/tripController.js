import { db } from '../db/index.js';
import { trips, destinations, bookings } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// @desc    Get all trips for user
// @route   GET /api/trips
export const getTrips = async (req, res) => {
  try {
    const userTrips = await db.query.trips.findMany({
      where: eq(trips.user_id, req.user.id),
      with: {
        destination: true,
        bookings: true,
      },
      orderBy: (trips, { desc }) => [desc(trips.created_at)],
    });

    res.status(200).json({
      success: true,
      count: userTrips.length,
      data: { trips: userTrips }
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
export const getTrip = async (req, res) => {
  try {
    const trip = await db.query.trips.findFirst({
      where: and(
        eq(trips.id, parseInt(req.params.id)),
        eq(trips.user_id, req.user.id)
      ),
      with: {
        destination: true,
        bookings: true,
      }
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { trip }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create trip
// @route   POST /api/trips
export const createTrip = async (req, res) => {
  try {
    const { destination_id, dates, budget, status } = req.body;

    if (!destination_id || !dates) {
      return res.status(400).json({
        success: false,
        message: 'Please provide destination and dates'
      });
    }

    const [newTrip] = await db.insert(trips).values({
      user_id: req.user.id,
      destination_id,
      dates,
      budget: budget || null,
      status: status || 'planning',
    }).returning();

    // Get trip with destination
    const tripWithDetails = await db.query.trips.findFirst({
      where: eq(trips.id, newTrip.id),
      with: {
        destination: true,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: { trip: tripWithDetails }
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
export const updateTrip = async (req, res) => {
  try {
    const { destination_id, dates, budget, status } = req.body;

    // Check if trip exists and belongs to user
    const existingTrip = await db.query.trips.findFirst({
      where: and(
        eq(trips.id, parseInt(req.params.id)),
        eq(trips.user_id, req.user.id)
      )
    });

    if (!existingTrip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const updateData = { updated_at: new Date() };
    if (destination_id) updateData.destination_id = destination_id;
    if (dates) updateData.dates = dates;
    if (budget !== undefined) updateData.budget = budget;
    if (status) updateData.status = status;

    const [updatedTrip] = await db
      .update(trips)
      .set(updateData)
      .where(eq(trips.id, parseInt(req.params.id)))
      .returning();

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: { trip: updatedTrip }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
export const deleteTrip = async (req, res) => {
  try {
    const existingTrip = await db.query.trips.findFirst({
      where: and(
        eq(trips.id, parseInt(req.params.id)),
        eq(trips.user_id, req.user.id)
      )
    });

    if (!existingTrip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    await db.delete(trips).where(eq(trips.id, parseInt(req.params.id)));

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all destinations
// @route   GET /api/trips/destinations
export const getDestinations = async (req, res) => {
  try {
    const allDestinations = await db.query.destinations.findMany({
      orderBy: (destinations, { asc }) => [asc(destinations.name)],
    });

    res.status(200).json({
      success: true,
      count: allDestinations.length,
      data: { destinations: allDestinations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};