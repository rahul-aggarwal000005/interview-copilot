import React, { useState, useEffect } from 'react';
import type { ConnectionState } from '../types';

interface RecordingTimerProps {
  connectionState: ConnectionState;
}

export function RecordingTimer({ connectionState }: RecordingTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (connectionState === 'listening') {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (connectionState === 'idle' || connectionState === 'error') {
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [connectionState]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="text-2xl font-mono font-medium text-gray-700 tracking-wider">
      {formatTime(seconds)}
    </div>
  );
}
