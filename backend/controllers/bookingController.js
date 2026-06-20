const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');

exports.reserveSeats = async (req, res) => {
  const { eventId, seatNumbers } = req.body;
  const userId = req.user.id;

  try {
    if (!eventId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: 'Event ID and an array of seat numbers are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    // 1. Release any existing active reservations for this user for the same event
    const existingReservations = await Reservation.find({ userId, eventId });
    for (const reservation of existingReservations) {
      await Seat.updateMany(
        {
          eventId,
          seatNumber: { $in: reservation.seatNumbers },
          status: 'reserved',
          reservedBy: userId
        },
        {
          status: 'available',
          $unset: { reservedUntil: 1, reservedBy: 1 }
        }
      );
      await reservation.deleteOne();
    }

    // 2. Perform atomic reservation
    // Try to update all the specified seats to 'reserved' only if they are 'available'
    // or if they are 'reserved' but the reservation has expired.
    const updateResult = await Seat.updateMany(
      {
        eventId,
        seatNumber: { $in: seatNumbers },
        $or: [
          { status: 'available' },
          { status: 'reserved', reservedUntil: { $lt: now } }
        ]
      },
      {
        $set: {
          status: 'reserved',
          reservedUntil: expiresAt,
          reservedBy: userId
        }
      }
    );

    // 3. Verify if all requested seats were successfully reserved
    if (updateResult.modifiedCount !== seatNumbers.length) {
      // Rollback: Revert the seats we did manage to update (if any)
      await Seat.updateMany(
        {
          eventId,
          seatNumber: { $in: seatNumbers },
          status: 'reserved',
          reservedBy: userId
        },
        {
          $set: { status: 'available' },
          $unset: { reservedUntil: 1, reservedBy: 1 }
        }
      );

      return res.status(400).json({
        message: 'One or more of the selected seats are no longer available. Please select different seats.'
      });
    }

    // 4. Create the Reservation document
    const reservation = new Reservation({
      userId,
      eventId,
      seatNumbers,
      expiresAt
    });
    await reservation.save();

    res.status(200).json({
      message: 'Seats reserved successfully for 10 minutes',
      reservation: {
        id: reservation._id,
        eventId,
        seatNumbers,
        expiresAt
      }
    });
  } catch (err) {
    console.error('Error reserving seats:', err);
    res.status(500).json({ message: 'Server error during reservation' });
  }
};

exports.confirmBooking = async (req, res) => {
  const { eventId, seatNumbers } = req.body;
  const userId = req.user.id;

  try {
    if (!eventId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: 'Event ID and seat numbers are required' });
    }

    const now = new Date();

    // 1. Verify if an active (non-expired) reservation exists for this user and these exact seats
    const reservation = await Reservation.findOne({
      userId,
      eventId,
      expiresAt: { $gt: now }
    });

    if (!reservation) {
      return res.status(400).json({
        message: 'Your reservation has expired or does not exist. Please reserve the seats again.'
      });
    }

    // Double check seat list matches
    const seatMatch = seatNumbers.length === reservation.seatNumbers.length &&
      seatNumbers.every(num => reservation.seatNumbers.includes(num));

    if (!seatMatch) {
      return res.status(400).json({ message: 'Requested seats do not match your current reservation' });
    }

    // 2. Atomically mark the seats as booked
    const updateResult = await Seat.updateMany(
      {
        eventId,
        seatNumber: { $in: seatNumbers },
        status: 'reserved',
        reservedBy: userId
      },
      {
        $set: { status: 'booked' },
        $unset: { reservedUntil: 1, reservedBy: 1 }
      }
    );

    if (updateResult.modifiedCount !== seatNumbers.length) {
      return res.status(400).json({
        message: 'Booking failed. Seats could not be locked. Please try reserving again.'
      });
    }

    // 3. Delete the reservation document
    await reservation.deleteOne();

    res.status(200).json({
      message: 'Booking confirmed successfully!'
    });
  } catch (err) {
    console.error('Error confirming booking:', err);
    res.status(500).json({ message: 'Server error during booking' });
  }
};
