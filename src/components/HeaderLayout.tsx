import React, { useState, useEffect } from 'react';
import HeaderBar from './HeaderBar';

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
            <HeaderBar elapsedTime={elapsedTime} />
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default HeaderLayout; 