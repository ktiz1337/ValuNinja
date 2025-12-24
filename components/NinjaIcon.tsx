import React from 'react';

interface NinjaIconProps {
  className?: string;
}

export const NinjaIcon: React.FC<NinjaIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Head shape / Hood */}
      <path d="M12 2C7.03 2 3 6.03 3 11c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9z" />
      {/* Mask opening */}
      <path d="M7 11c0-1.5 2-3 5-3s5 1.5 5 3" />
      {/* Eyes */}
      <path d="M9 13h.01" strokeWidth="3" />
      <path d="M15 13h.01" strokeWidth="3" />
      {/* Headband tie (optional styling) */}
      <path d="M21 11l-2-2" />
      <path d="M3 11l2-2" />
    </svg>
  );
};