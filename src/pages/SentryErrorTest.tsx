import * as Sentry from '@sentry/react';

const SentryErrorTest = () => {
  const triggerError = () => {
    throw new Error('Error de prueba en Sentry');
  };

  const triggerCustomError = () => {
    Sentry.captureException(new Error('Error personalizado en Sentry'));
  };

  const triggerMessage = () => {
    Sentry.captureMessage('Mensaje de prueba en Sentry', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba de Sentry</h1>
      <div className="flex flex-col gap-4">
        <button
          onClick={triggerError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Lanzar Error
        </button>
        <button
          onClick={triggerCustomError}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Error Personalizado
        </button>
        <button
          onClick={triggerMessage}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Enviar Mensaje
        </button>
      </div>
    </div>
  );
};

export default SentryErrorTest;
