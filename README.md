# Sort My Scene — Event Ticket Booking

Simple full-stack app for booking event tickets with seat selection. Users can browse events, pick seats from a grid, reserve them (held for 10 min), and then confirm the booking. Built with MongoDB, Express, React (Vite), and Node.

---

## How to Run

You'll need Node.js (v16+) and MongoDB running locally on port 27017 (or an Atlas URI).

### Backend

```bash
cd backend
npm install
```

There's already a `.env` file with defaults. If you're using Atlas or a different setup, update `MONGO_URI` in there.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sortmyscene
JWT_SECRET=super_secret_jwt_token_key_123
```

Seed the DB with some sample events:

```bash
npm run seed
```

Then start the server:

```bash
npm run dev
```

Runs on `http://localhost:5000`.

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`.

---

## Tech Used

**Backend:** Node + Express, MongoDB with Mongoose, JWT for auth, bcryptjs for password hashing

**Frontend:** React (via Vite), React Router for navigation, Axios for API calls, Tailwind CSS + custom styling for the UI

---

## How I Handled Double Booking

This was the trickiest part. I went with atomic conditional updates instead of MongoDB transactions — mainly because transactions need a replica set and won't work on a plain local MongoDB install, which felt unreliable for a take-home assignment.

The idea is pretty straightforward:

When someone tries to reserve a seat, the update query has a filter that only matches seats where the status is `available` (or `reserved` but the reservation already expired). MongoDB locks the document during the write, so if two people try to grab the same seat at the exact same time, only one of them will actually get the `modifiedCount` back as 1.

```javascript
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
```

After the update, I check if `modifiedCount` matches how many seats were requested. If it doesn't — meaning some seats got snatched by another user — I roll back whatever did get modified and return an error. This way you never end up with a partial reservation.

For expired reservations, two things handle cleanup:
- On read (when loading the event page), any seat whose `reservedUntil` is in the past just gets returned as `available`
- MongoDB's TTL index on the Reservation collection auto-deletes expired docs in the background

I also wrote a concurrency test (`npm run test`) that fires two reservation attempts at the same seat in parallel and checks that only one goes through.

---

## Assumptions & Notes

- Users need to register and log in before they can reserve/book. JWT token gets stored in localStorage and sent with every request.
- If a user makes a new reservation for an event they already have an active reservation on, the old one gets cleared automatically. Didn't want to deal with users accidentally locking up seats they forgot about.
- The countdown timer on the frontend uses the server's `expiresAt` timestamp (not a local 10-min countdown), so it stays accurate regardless of when the page loaded.
- Seat prices are hardcoded at $240 on the frontend — didn't add a price field to the schema since that wasn't in the requirements, but it would be easy to add.

---

## Project Structure

```
backend/
  controllers/     — route handlers (auth, events, bookings)
  middleware/       — JWT auth middleware
  models/           — Mongoose schemas (Event, Seat, Reservation, User)
  routes/           — Express route definitions
  tests/            — concurrency test for double booking
  seed.js           — populates DB with sample data
  server.js         — entry point

frontend/
  src/
    components/     — reusable UI (SeatGrid, Timer, Navbar, etc.)
    context/        — AuthContext for managing login state
    pages/          — main views (Events list, Event detail, Login, Register)
```
