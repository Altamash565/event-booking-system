require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Seat = require('./models/Seat');
const Reservation = require('./models/Reservation');

const sampleEvents = [
  {
    name: 'Coldplay Live in Mumbai',
    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    venue: 'D.Y. Patil Stadium, Mumbai',
    totalSeats: 48
  },
  {
    name: 'Sunburn Festival Goa',
    dateTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    venue: 'Vagator Beach, Goa',
    totalSeats: 60
  },
  {
    name: 'Arijit Singh Symphony Delhi',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    venue: 'Jawaharlal Nehru Stadium, Delhi',
    totalSeats: 40
  }
];

const seedDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sortmyscene';
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding.');

    // Clear existing data
    await Event.deleteMany({});
    await Seat.deleteMany({});
    await Reservation.deleteMany({});
    console.log('Cleared existing events, seats, and reservations.');

    for (const eventData of sampleEvents) {
      // Create Event
      const event = new Event(eventData);
      await event.save();
      console.log(`Created Event: ${event.name}`);

      // Create Seats for the Event
      const seats = [];
      for (let i = 1; i <= event.totalSeats; i++) {
        seats.push({
          eventId: event._id,
          seatNumber: i,
          status: 'available'
        });
      }
      await Seat.insertMany(seats);
      console.log(`Generated ${event.totalSeats} seats for event ${event.name}`);
    }

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDB();
