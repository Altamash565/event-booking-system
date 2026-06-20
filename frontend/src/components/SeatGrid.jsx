import React from 'react';

const SeatGrid = ({ seats, selectedSeats, onSeatClick }) => {
  const seatsPerRow = 10;
  const rows = [];
  
  for (let i = 0; i < seats.length; i += seatsPerRow) {
    rows.push(seats.slice(i, i + seatsPerRow));
  }

  const getSeatColor = (seat) => {
    if (seat.status === 'booked') return 'bg-red-500/20 border-red-500/30 text-red-400 cursor-not-allowed';
    if (seat.status === 'reserved') return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 cursor-not-allowed';
    if (selectedSeats.includes(seat.seatNumber)) return 'bg-primary border-primary text-primary-foreground';
    return 'bg-card border-border text-foreground hover:bg-secondary/50 cursor-pointer';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-card border border-border"></div>
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary border border-primary"></div>
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
          <span className="text-muted-foreground">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30"></div>
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>

      {/* Stage indicator */}
      <div className="w-full max-w-md mx-auto bg-card border border-border rounded-md py-3 text-center">
        <span className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Stage</span>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-1.5">
        {rows.map((row, rowIndex) => (
          <div className="flex items-center gap-1.5" key={`row-${rowIndex}`}>
            <span className="w-6 text-xs text-muted-foreground text-center font-medium">
              {String.fromCharCode(65 + rowIndex)}
            </span>
            <div className="flex gap-1.5">
              {row.map(seat => {
                const isClickable = seat.status === 'available';
                const isSelected = selectedSeats.includes(seat.seatNumber);

                return (
                  <button
                    key={seat._id}
                    className={`w-9 h-9 rounded border text-xs font-medium transition-all duration-150 ${getSeatColor(seat)}`}
                    onClick={() => isClickable && onSeatClick(seat.seatNumber)}
                    disabled={!isClickable && !isSelected}
                    title={`Seat ${seat.seatNumber} (${seat.status})`}
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-xs text-muted-foreground text-center font-medium">
              {String.fromCharCode(65 + rowIndex)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;
