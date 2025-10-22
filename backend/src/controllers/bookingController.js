import { db } from '../db/index.js';
import { bookings, trips } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// @desc    Get all bookings for a trip
// @route   GET /api/bookings/trip/:tripId
export const getBookingsByTrip = async (req, res) => {
  try {
    // Verify trip belongs to user
    const trip = await db.query.trips.findFirst({
      where: and(
        eq(trips.id, parseInt(req.params.tripId)),
        eq(trips.user_id, req.user.id)
      )
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const tripBookings = await db.query.bookings.findMany({
      where: eq(bookings.trip_id, parseInt(req.params.tripId)),
      orderBy: (bookings, { desc }) => [desc(bookings.created_at)],
    });

    res.status(200).json({
      success: true,
      count: tripBookings.length,
      data: { bookings: tripBookings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { trip_id, service_type, service_name, amount, status, booking_date } = req.body;

    if (!trip_id || !service_type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide trip_id, service_type, and amount'
      });
    }

    // Verify trip belongs to user
    const trip = await db.query.trips.findFirst({
      where: and(
        eq(trips.id, trip_id),
        eq(trips.user_id, req.user.id)
      )
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const [newBooking] = await db.insert(bookings).values({
      trip_id,
      service_type,
      service_name: service_name || null,
      amount,
      status: status || 'pending',
      booking_date: booking_date || new Date(),
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: newBooking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
export const updateBooking = async (req, res) => {
  try {
    const { status, service_name, amount } = req.body;

    // Verify booking exists and belongs to user's trip
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, parseInt(req.params.id)),
      with: {
        trip: true
      }
    });

    if (!booking || booking.trip.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (service_name) updateData.service_name = service_name;
    if (amount !== undefined) updateData.amount = amount;

    const [updatedBooking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, parseInt(req.params.id)))
      .returning();

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  try {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, parseInt(req.params.id)),
      with: {
        trip: true
      }
    });

    if (!booking || booking.trip.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await db.delete(bookings).where(eq(bookings.id, parseInt(req.params.id)));

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};