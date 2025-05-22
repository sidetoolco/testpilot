import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const { testId } = useLocation().state;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prevCountdown => prevCountdown - 1);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      // https://app.prolific.com/submissions/complete?cc=ABC123
      window.location.href = 'https://app.prolific.com/submissions/complete?cc=' + testId; // Redirige a la URL externa
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
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
        Redirecting in <span className="font-medium text-green-600">{countdown} seconds</span>...
      </p>
    </div>
  );
};

export default ThankYou;
