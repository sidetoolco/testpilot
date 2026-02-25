import { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import TikTokShopHeader from './TikTokShopHeader';
import TikTokShopSidebar from './TikTokShopSidebar';

interface TikTokShopHeaderLayoutProps {
  children: React.ReactNode;
  searchTerm?: string;
}

export default function TikTokShopHeaderLayout({ children, searchTerm = '' }: TikTokShopHeaderLayoutProps) {
  const { sessionBeginTime, status } = useSessionStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateElapsedTime = () => {
      if (sessionBeginTime) {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionBeginTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        setError(null);
      } else {
        setError('Session has not started.');
      }
    };

    calculateElapsedTime();
    const timer = setInterval(calculateElapsedTime, 1000);

    return () => clearInterval(timer);
  }, [sessionBeginTime]);

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 bg-[#00A67E] shadow-md flex flex-wrap justify-between items-center z-50">
        <div className="flex items-center flex-grow sm:flex-grow-0 p-4">
          <div className="bg-white p-1 rounded-lg">
            <img src="/assets/images/testPilot-black.png" alt="TestPilot" className="h-8" />
          </div>
          <span className="text-lg font-bold ml-2">Shopping Simulator</span>
        </div>
        <div className="text-sm flex-grow sm:flex-grow-0 text-center sm:text-right p-4">
          {error ? (
            <span className="text-red-800">{error}</span>
          ) : (
            `${capitalizeFirstLetter(status)} - ${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`
          )}
        </div>
      </div>

      <div className="flex pt-[60px]">
        <TikTokShopSidebar />
        <div className="flex-1 pl-56 min-h-screen bg-gray-50">
          <TikTokShopHeader searchTerm={searchTerm} />
          <main className="max-w-5xl mx-auto py-6">{children}</main>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
