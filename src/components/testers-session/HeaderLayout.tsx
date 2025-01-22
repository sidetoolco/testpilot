import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/useSessionStore';

interface HeaderLayoutProps {
    children: React.ReactNode;
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({ children }) => {
    const sessionBeginTime = useSessionStore(state => state.sessionBeginTime);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const calculateElapsedTime = () => {
            if (sessionBeginTime) {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - sessionBeginTime.getTime()) / 1000);
                setElapsedTime(elapsed);
                setError(null); // Clear any previous error
            } else {
                setError("Error: Session has not started.");
            }
        };

        calculateElapsedTime();
        const timer = setInterval(calculateElapsedTime, 1000);

        return () => clearInterval(timer);
    }, [sessionBeginTime]);

    return (
        <div>
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md flex justify-between items-center p-4 z-50">
                <div className="flex items-center">
                    <span className="text-lg font-bold">Shopping Simulator</span>
                </div>
                <div className="text-sm">
                    {error ? (
                        <span className="text-red-500">{error}</span>
                    ) : (
                        `Instructions - ${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`
                    )}
                </div>
            </div>
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default HeaderLayout; 