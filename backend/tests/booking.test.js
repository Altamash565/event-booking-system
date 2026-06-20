require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sortmyscene_test';

async function runTest() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to test database.');

    // Clear test data
    await Event.deleteMany({});
    await Seat.deleteMany({});
    await User.deleteMany({});

    // Create a test event
    const event = new Event({
      name: 'Test Concurrency Event',
      dateTime: new Date(),
      venue: 'Test Venue',
      totalSeats: 5
    });
    await event.save();

    // Create seats
    const seats = [];
    for (let i = 1; i <= 5; i++) {
      seats.push({ eventId: event._id, seatNumber: i, status: 'available' });
    }
    await Seat.insertMany(seats);

    // Create two test users
    const userA = new User({ username: 'usera', email: 'usera@test.com', password: 'password123' });
    const userB = new User({ username: 'userb', email: 'userb@test.com', password: 'password123' });
    await userA.save();
    await userB.save();

    console.log('Created test event, seats, and users.');
    console.log('Simulating concurrent reservation for Seat 3...');

    const seatNumberToReserve = 3;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    // Prepare two concurrent reservation updates
    // They both try to reserve seat 3 for the same event.
    const reservePromiseA = Seat.updateMany(
      {
        eventId: event._id,
        seatNumber: seatNumberToReserve,
        $or: [
          { status: 'available' },
          { status: 'reserved', reservedUntil: { $lt: now } }
        ]
      },
      {
        $set: {
          status: 'reserved',
          reservedUntil: expiresAt,
          reservedBy: userA._id
        }
      }
    );

    const reservePromiseB = Seat.updateMany(
      {
        eventId: event._id,
        seatNumber: seatNumberToReserve,
        $or: [
          { status: 'available' },
          { status: 'reserved', reservedUntil: { $lt: now } }
        ]
      },
      {
        $set: {
          status: 'reserved',
          reservedUntil: expiresAt,
          reservedBy: userB._id
        }
      }
    );

    // Execute them in parallel
    const [resultA, resultB] = await Promise.all([reservePromiseA, reservePromiseB]);

    console.log(`User A modify result: modifiedCount = ${resultA.modifiedCount}`);
    console.log(`User B modify result: modifiedCount = ${resultB.modifiedCount}`);

    // Verify only one succeeded
    const totalModified = resultA.modifiedCount + resultB.modifiedCount;
    if (totalModified !== 1) {
      throw new Error(`Concurrency Test FAILED! Expected 1 seat to be modified, but got ${totalModified}`);
    }

    const reservedSeat = await Seat.findOne({ eventId: event._id, seatNumber: seatNumberToReserve });
    console.log(`Seat 3 final state in DB: status = '${reservedSeat.status}', reservedBy = '${reservedSeat.reservedBy}'`);

    const expectedWinnerId = resultA.modifiedCount === 1 ? userA._id : userB._id;
    if (!reservedSeat.reservedBy.equals(expectedWinnerId)) {
      throw new Error('Concurrency Test FAILED! Winner user ID does not match database reservation owner.');
    }

    console.log('\n=======================================');
    console.log('CONCURRENCY TEST PASSED SUCCESSFULLY!');
    console.log('Double booking prevented by atomic update filters.');
    console.log('=======================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

runTest();
