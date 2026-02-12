import React from 'react';

export const ChatNotificationIcon: React.FC<{ count: number; size?: 'sm' | 'md' | 'lg' }> = ({ count, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const badgeClasses = {
    sm: 'min-w-5 h-5 px-1.5 text-xs',
    md: 'min-w-6 h-6 px-1.5 text-xs',
    lg: 'min-w-7 h-7 px-2 text-sm',
  };

  return (
    <div className="relative inline-flex items-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} drop-shadow-md -scale-x-100`}
      >
        <path
          d="M8 11 C8 7.5 10.5 5 14 5 L34 5 C37.5 5 40 7.5 40 11 L40 27 C40 30.5 37.5 33 34 33 L16 33 L8 41 L8 11 Z"
          fill="white"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {count > 0 && (
        <div
          className={`absolute -top-1 -left-1 ${badgeClasses[size]} text-white rounded-full flex items-center justify-center font-semibold shadow-md z-[60]`}
          style={{ backgroundColor: '#E67E22' }}
        >
          {count}
        </div>
      )}
    </div>
  );
};

export default ChatNotificationIcon;
