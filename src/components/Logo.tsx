import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 512 512" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Circles - Concentric and bottom-aligned */}
      <circle cx="256" cy="256" r="256" fill="#FF6600"/>
      <circle cx="256" cy="280" r="225" fill="#FF8533"/>
      <circle cx="256" cy="305" r="190" fill="#FFA366"/>
      
      {/* White Character Shape */}
      <path d="M256 210C180 210 120 270 120 345C120 400 155 445 205 465L256 505L307 465C357 445 392 400 392 345C392 270 332 210 256 210Z" fill="white"/>
      
      {/* Eyes */}
      <circle cx="215" cy="340" r="22" fill="black"/>
      <circle cx="297" cy="340" r="22" fill="black"/>
    </svg>
  </div>
);
