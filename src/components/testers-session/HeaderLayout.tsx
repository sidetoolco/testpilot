import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import AmazonHeader from '../test-setup/preview/AmazonHeader';
import AmazonNavigation from '../test-setup/preview/AmazonNavigation';

interface HeaderLayoutProps {
    children: React.ReactNode;
}

const HeaderTesterSessionLayout: React.FC<HeaderLayoutProps> = ({ children }) => {
    const sessionBeginTime = useSessionStore(state => state.sessionBeginTime);
    const status = useSessionStore(state => state.status);
    const test = useSessionStore(state => state.test);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    useEffect(() => {
        const calculateElapsedTime = () => {
            if (sessionBeginTime) {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - sessionBeginTime.getTime()) / 1000);
                setElapsedTime(elapsed);
                setError(null); // Clear any previous error
            } else {
                setError("Session has not started.");
            }
        };

        calculateElapsedTime();
        const timer = setInterval(calculateElapsedTime, 1000);

        return () => clearInterval(timer);
    }, [sessionBeginTime]);

    useEffect(() => {
        document.title = `Shopping Simulator - ${capitalizeFirstLetter(status)}`;
    }, [status]);

    const handleClick = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <div>
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md flex flex-wrap justify-between items-center z-50">
                <div className="flex items-center flex-grow sm:flex-grow-0 p-4">
                    <div className="bg-white p-1">
                        <img
                            src="https://i.imghippo.com/files/QfED5977I.png"
                            alt="TestPilot"
                            className="h-8"
                        />
                    </div>
                    <span className="text-lg font-bold">Shopping Simulator</span>
                </div>
                <div className="text-sm flex-grow sm:flex-grow-0 text-center sm:text-right p-4">
                    {error ? (
                        <span className="text-red-500">{error}</span>
                    ) : (
                        `${capitalizeFirstLetter(status)} - ${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`
                    )}
                </div>
            </div>
            <div className="flex-grow sm:flex-grow-0 w-full " style={{ paddingTop: '60px' }} >
                <AmazonHeader searchTerm={test ? test.search_term : ''} />
                <div onClick={handleClick}>
                    <AmazonNavigation />
                </div>
            </div>

            {isModalVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg relative max-w-sm w-full">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
                        >
                            &times;
                        </button>
                        <div className="p-6">
                            <p className="text-center">
                                Navigation is disabled on these pages, please focus on our products.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default HeaderTesterSessionLayout; 