import { useEffect, useState } from "react";

interface LoadingStateProps {
  message?: string;
  showProgress?: boolean;
}

export function LoadingState({
  message = "Loading...",
  showProgress = false,
}: LoadingStateProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          // Increment by a random amount between 1 and 10
          const increment = Math.floor(Math.random() * 10) + 1;
          // Never reach 100
          return Math.min(prev + increment, 99);
        });
      }, 500); // Update every 500ms

      return () => clearInterval(interval);
    }
  }, [showProgress]);

  return (
    <div className="flex flex-col items-center justify-center h-64">
      {showProgress ? (
        <div className="w-48">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1 text-center">{progress}%</p>
        </div>
      ) : (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mb-4"></div>
      )}
      <p className="text-gray-600 mb-2">{message}</p>
    </div>
  );
}
