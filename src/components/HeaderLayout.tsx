import React, { useState, useEffect } from 'react';

interface HeaderLayoutProps {
    children: React.ReactNode;
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({ children }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div>
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md flex justify-between items-center p-4 z-50">
                <div className="flex items-center">

                    <span className="text-lg font-bold">Shopping Simulator</span>
                </div>
                <div className="text-sm">
                    Instructions - {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                </div>
            </div>
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default HeaderLayout; 