import React, { useState, useEffect } from 'react';

const Timer = ({ expiresAt, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(expiresAt).getTime() - new Date().getTime();
    if (difference <= 0) {
      return 0;
    }
    return Math.floor(difference / 1000);
  }

  useEffect(() => {
    // Reset timer when expiresAt changes
    setTimeLeft(calculateTimeLeft());
  }, [expiresAt]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeout) {
        onTimeout();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          if (onTimeout) {
            onTimeout();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeout]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft < 60;

  return (
    <div 
      className={`countdown-timer flex items-center justify-center gap-2 p-3.5 border text-sm font-medium transition-colors select-none ${
        isWarning 
          ? 'bg-destructive/10 border-destructive/30 text-destructive' 
          : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
      }`}
    >
      <span className="timer-icon text-base">⏳</span>
      <span className="timer-label">Time remaining to confirm booking:</span>
      <span className="timer-value font-bold">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;
