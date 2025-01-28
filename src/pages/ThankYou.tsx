import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYou: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = 'https://app.prolific.com/submissions/complete'; // Redirige a la URL externa
        }, 5000);

        return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-50 to-green-100">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-green-300 border-dashed rounded-full animate-spin"></div>
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-green-800">
                Thank you for completing our experience!
            </h1>
            <p className="mt-2 text-gray-700 text-lg">
                Redirecting in <span className="font-medium text-green-600">5 seconds</span>...
            </p>
        </div>

    );
};

export default ThankYou; 