import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg 
        viewBox="0 0 100 100" 
        width={size} 
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow for sticker effect */}
        <g transform="translate(2, 3)" opacity="0.08">
          <path d="M20 45 L60 25 Q85 25 85 50 Q85 75 60 75 L20 55 H15 V45 Z" fill="black" />
          <path d="M38 65 L43 85 H58 L52 65" fill="black" />
        </g>

        {/* Megaphone Main Body (Navy Blue) */}
        <g fill="currentColor">
          {/* Handle */}
          <path d="M40 65 L44 82 H55 L50 65" />
          {/* Main Cone */}
          <path d="M22 45 L60 27 V73 L22 55 H17 V45 H22" />
          {/* Mouthpiece */}
          <path d="M60 27 Q83 27 83 50 Q83 73 60 73 V27" />
          {/* Decorative Detail */}
          <circle cx="32" cy="50" r="4" fill="white" opacity="0.2" />
        </g>

        {/* Sound Waves */}
        <g stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" opacity="0.6">
          <path d="M82 32 L92 22" />
          <path d="M88 50 L98 50" />
          <path d="M82 68 L92 78" />
        </g>
      </svg>
    </div>
  );
}
