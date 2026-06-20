import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import EventCard from '../components/EventCard';

const Events = () => {
  const { API_URL } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upcoming Events</h1>
          <p className="text-muted-foreground">Browse and book seats for available events</p>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex flex-col justify-center items-center gap-3 py-20 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm">Loading events...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <p className="text-destructive text-sm">{error}</p>
            <button 
              onClick={fetchEvents} 
              className="text-sm border border-border px-4 py-2 rounded-md hover:bg-secondary/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-4xl">🎟️</span>
            <h3 className="text-lg font-semibold text-foreground">No Events Found</h3>
            <p className="text-muted-foreground text-sm">Check back later for upcoming events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Events;
