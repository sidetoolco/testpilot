import { Toaster } from 'sonner';

export function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: '#1B1B1B',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
        },
        className: 'shadow-lg',
      }}
      closeButton
      richColors
    />
  );
}
