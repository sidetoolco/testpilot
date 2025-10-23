import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'left' | 'right'>('right');
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      
      // If the tooltip would extend beyond the right edge OR if we're in the right half of the screen, position it to the left
      // This prevents tooltips from going under other elements
      if (rect.right + 280 > windowWidth || rect.left > windowWidth / 2) {
        setPosition('left');
      } else {
        setPosition('right');
      }
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
        className={`text-gray-600 hover:text-gray-600 transition-colors ${className}`}
        aria-label="More information"
      >
        <Info className="h-5 w-5 pt-1" />
      </button>
      
      {isVisible && (
        <div 
          className={`absolute z-[9999] w-64 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 ${
            position === 'right' ? 'left-6' : 'right-6'
          }`}
        >
          <div 
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 top-3 ${
              position === 'right' ? '-left-1' : '-right-1'
            }`}
          />
          {content}
        </div>
      )}
    </div>
  );
};

