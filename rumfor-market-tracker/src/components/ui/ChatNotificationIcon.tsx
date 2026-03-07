import React from 'react';

export const ChatNotificationIcon: React.FC<{ count: number; size?: 'sm' | 'md' | 'lg' }> = ({ count, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-[32px] h-[30px]',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  };

  const badgeClasses = {
    sm: 'min-w-5 h-5 px-1.5 text-xs',
    md: 'min-w-5 h-5 px-1.5 text-xs',
    lg: 'min-w-5 h-5 px-1.5 text-xs',
  };

  return (
    <div className="relative inline-flex items-center">
      <svg
        viewBox="0 0 34 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizeClasses[size]}
      >
        <path
          d="M2 0h30a2 2 0 0 1 2 2v19a2 2 0 0 1-2 2H10L2 31V2a2 2 0 0 1 2-2z"
          fill="#FFFFFF"
        />
      </svg>
      
      {count > 0 && (
        <div
          className={`absolute -top-1 -left-1 ${badgeClasses[size]} text-white rounded-full flex items-center justify-center font-semibold shadow-md leading-none`}
          style={{ backgroundColor: '#F4A00A' }}
        >
          {count}
        </div>
      )}
    </div>
  );
};

export default ChatNotificationIcon;
