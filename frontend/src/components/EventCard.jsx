import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.dateTime).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const eventTime = new Date(event.dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Link to={`/events/${event._id}`} className="block no-underline group">
      <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            {event.totalSeats} seats
          </span>
          <span className="text-xs text-muted-foreground">{eventTime}</span>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {event.name}
          </h3>
          <p className="text-sm text-muted-foreground">📍 {event.venue}</p>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">📅 {eventDate}</span>
          <span className="text-sm font-medium text-primary group-hover:underline">
            Book Now →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
