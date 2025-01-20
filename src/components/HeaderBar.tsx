import React from 'react';

interface HeaderBarProps {
  elapsedTime: number;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ elapsedTime }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-md flex justify-between items-center p-4 z-50">
      <div className="flex items-center">
        <img
          src="https://i.imghippo.com/files/QfED5977I.png"
          alt="TestPilot"
          className="h-8"
        />
        <span className="text-lg font-bold">Shopping Simulator</span>
      </div>
      <div className="text-sm">
        Instructions - {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
      </div>
    </div>
  );
};

export default HeaderBar; 