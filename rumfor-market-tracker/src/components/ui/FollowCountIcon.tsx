import React from 'react';

export const FollowCountIcon: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="relative inline-flex items-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 drop-shadow-md -scale-x-100"
      >
        <path
          d="M24 43.35L6.45 27.65C3.22 24.72 1.5 20.94 1.5 17.1C1.5 10.35 6.55 5 13.3 5C17.1 5 20.75 7.2 23.15 10.35C23.45 10.8 23.85 11.15 24.3 11.4C24.75 11.65 25.25 11.78 25.75 11.78C26.25 11.78 26.75 11.65 27.2 11.4C27.65 11.15 28.05 10.8 28.35 10.35C30.75 7.2 34.4 5 38.2 5C44.95 5 50 10.35 50 17.1C50 20.94 48.28 24.72 45.05 27.65L27.4 43.35L24 43.35Z"
          fill="white"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {count > 0 && (
        <div 
          className="absolute -top-2 -left-2 min-w-8 h-8 px-2.5 text-white rounded-full flex items-center justify-center text-base font-semibold shadow-md"
          style={{ backgroundColor: '#E67E22' }}
        >
          {count}
        </div>
      )}
    </div>
  );
};

export default FollowCountIcon;
