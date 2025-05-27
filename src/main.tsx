import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/browser';
import App from './App';
import './index.css';

Sentry.init({
  dsn: "https://765ff27999bc8f1f5fb1e9d570aa7b2a@o4509390953316352.ingest.us.sentry.io/4509390963277824",
  integrations: [browserTracingIntegration()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
  sendDefaultPii: true
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);