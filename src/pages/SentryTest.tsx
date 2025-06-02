import * as Sentry from '@sentry/react';

const SentryTest: React.FC = () => {
  const handleClick = () => {
    Sentry.captureException(new Error('Sentry integration works!'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Trigger Sentry Error
      </button>
    </div>
  );
};

export default SentryTest;
