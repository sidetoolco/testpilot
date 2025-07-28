interface CreditIconProps {
  className?: string;
  size?: number;
}

export function CreditIcon({ className = "", size = 24 }: CreditIconProps) {
  return (
    <svg 
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circle with 3px border */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke="currentColor"
        strokeWidth="3"
      />
      
      {/* "tp" text */}
      <text 
        x="52" 
        y="63" 
        textAnchor="middle" 
        fontSize="50" 
        fontWeight="bold" 
        fill="currentColor"
        fontFamily="Arial, sans-serif"
      >
        tp
      </text>
    </svg>
  );
} 