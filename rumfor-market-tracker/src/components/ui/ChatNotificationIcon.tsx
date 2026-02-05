import React from 'react';

export const ChatNotificationIcon: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="relative inline-flex items-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 drop-shadow-md -scale-x-100"
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
          className="absolute -top-2 -left-2 min-w-7 h-7 px-2 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md z-[60]"
          style={{ backgroundColor: '#E67E22' }}
        >
          {count}
        </div>
      )}
    </div>
  );
};

export default ChatNotificationIcon;
