
import type { ConnectionState } from '../types';

interface StatusIndicatorProps {
  connectionState: ConnectionState;
  errorMessage?: string;
}

export function StatusIndicator({ connectionState, errorMessage }: StatusIndicatorProps) {
  if (connectionState === 'error') {
    return (
      <div className="text-red-600 font-medium text-sm flex items-center bg-red-50 px-3 py-1 rounded-full border border-red-100" title={errorMessage}>
        ⚠️ {errorMessage || 'An error occurred'}
      </div>
    );
  }

  const getStatusText = () => {
    switch (connectionState) {
      case 'idle': return 'Ready to listen';
      case 'connecting': return 'Connecting...';
      case 'listening': return '● Listening';
      default: return '';
    }
  };

  return (
    <div className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300
      ${connectionState === 'listening' ? 'text-red-500 animate-pulse' : 'text-gray-500'}
    `}>
      {getStatusText()}
    </div>
  );
}
