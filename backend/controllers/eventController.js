const Event = require('../models/Event');
const Seat = require('../models/Seat');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ dateTime: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Fetch seats
    const seats = await Seat.find({ eventId: event._id }).sort({ seatNumber: 1 });
    const now = new Date();

    // Map seats to return logical status (expired reservations show as 'available')
    const mappedSeats = seats.map(seat => {
      let status = seat.status;
      // If reserved but past expiresAt, it's logically available
      if (status === 'reserved' && seat.reservedUntil && seat.reservedUntil < now) {
        status = 'available';
      }
      return {
        _id: seat._id,
        eventId: seat.eventId,
        seatNumber: seat.seatNumber,
        status,
        reservedUntil: seat.reservedUntil,
        reservedBy: seat.reservedBy
      };
    });

    res.json({
      event,
      seats: mappedSeats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching event details' });
  }
};
