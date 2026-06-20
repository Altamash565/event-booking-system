import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SeatGrid from '../components/SeatGrid';
import Timer from '../components/Timer';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, API_URL } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  
  // Reservation state
  const [activeReservation, setActiveReservation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    return () => {};
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/events/${id}`);
      setEvent(res.data.event);
      setSeats(res.data.seats);
      setPageError('');
    } catch (err) {
      console.error('Error fetching event details:', err);
      setPageError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatNumber) => {
    if (activeReservation) return;

    setSelectedSeats(prevSelected => {
      if (prevSelected.includes(seatNumber)) {
        return prevSelected.filter(num => num !== seatNumber);
      } else {
        return [...prevSelected, seatNumber];
      }
    });
  };

  const handleReserve = async () => {
    if (!token) {
      toast.error('Please sign in to reserve seats.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat.');
      return;
    }

    setActionLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/reserve`, {
        eventId: id,
        seatNumbers: selectedSeats
      });
      
      setActiveReservation(res.data.reservation);
      toast.success(res.data.message || 'Seats reserved! Confirm within 10 minutes.');
      
      const detailsRes = await axios.get(`${API_URL}/events/${id}`);
      setSeats(detailsRes.data.seats);
    } catch (err) {
      console.error('Error reserving seats:', err);
      toast.error(err.response?.data?.message || 'Failed to reserve seats. Please try again.');
      fetchEventDetails();
      setSelectedSeats([]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!activeReservation) return;

    setActionLoading(true);

    try {
      const res = await axios.post(`${API_URL}/bookings`, {
        eventId: id,
        seatNumbers: activeReservation.seatNumbers
      });

      toast.success(res.data.message || 'Booking confirmed!');
      setActiveReservation(null);
      setSelectedSeats([]);
      
      const detailsRes = await axios.get(`${API_URL}/events/${id}`);
      setEvent(detailsRes.data.event);
      setSeats(detailsRes.data.seats);
    } catch (err) {
      console.error('Error booking seats:', err);
      toast.error(err.response?.data?.message || 'Booking failed.');
      setActiveReservation(null);
      setSelectedSeats([]);
      fetchEventDetails();
    } finally {
      setActionLoading(false);
    }
  };

  const handleTimeout = () => {
    toast.error('Reservation expired. Seats have been released.');
    setActiveReservation(null);
    setSelectedSeats([]);
    fetchEventDetails();
  };

  const handleCancelReservation = async () => {
    setActiveReservation(null);
    setSelectedSeats([]);
    fetchEventDetails();
    toast.success('Reservation cancelled.');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center gap-3 py-24 min-h-screen">
        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Loading event details...</p>
      </div>
    );
  }

  if (pageError && !event) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen gap-4">
        <p className="text-destructive text-sm">{pageError}</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/">← Back to Events</Link>
        </Button>
      </div>
    );
  }

  const eventDate = new Date(event.dateTime).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const eventTime = new Date(event.dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const currentSeats = activeReservation ? activeReservation.seatNumbers : selectedSeats;
  const seatCount = currentSeats.length;

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Back link + event info */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <Link to="/">← Back to Events</Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>📅 {eventDate} at {eventTime}</span>
            <span>📍 {event.venue}</span>
            <span>💺 {event.totalSeats} total seats</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Seat Grid (takes 2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Select Your Seats</h2>
              <SeatGrid 
                seats={seats}
                selectedSeats={currentSeats}
                onSeatClick={handleSeatClick}
              />
            </div>
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h2>
              
              {/* Selected seats list */}
              {seatCount === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center italic">
                  Click on seats to select them
                </p>
              ) : (
                <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
                  {currentSeats.map(seatId => (
                    <div key={seatId} className="flex justify-between items-center text-sm py-2 px-3 bg-secondary/20 rounded-md">
                      <span className="text-foreground font-medium">Seat {seatId}</span>
                      <span className="text-muted-foreground">$240</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{seatCount} seat{seatCount !== 1 ? 's' : ''}</span>
                  <span className="text-xl font-bold text-foreground">${seatCount * 240}.00</span>
                </div>
              </div>

              {/* Actions */}
              {activeReservation ? (
                <div className="flex flex-col gap-3">
                  <Timer expiresAt={activeReservation.expiresAt} onTimeout={handleTimeout} />
                  <button 
                    onClick={handleConfirmBooking}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white text-sm font-medium py-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                  <button 
                    onClick={handleCancelReservation}
                    disabled={actionLoading}
                    className="w-full text-sm text-muted-foreground border border-border py-2.5 rounded-md hover:bg-secondary/30 transition-colors"
                  >
                    Cancel Reservation
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleReserve}
                    disabled={seatCount === 0 || actionLoading}
                    className="w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Reserving...' : 'Reserve Seats'}
                  </button>
                  {!token && (
                    <p className="text-xs text-amber-500 text-center">
                      * You need to sign in to reserve seats
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EventDetail;
