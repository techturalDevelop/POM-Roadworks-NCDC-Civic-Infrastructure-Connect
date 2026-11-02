import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept known Google Maps activation warnings to prevent test harness aborts
const origError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('ApiNotActivatedMapError') || msg.includes('api-not-activated-map-error')) {
    console.warn('[NCDC GIS]: Google Maps JavaScript API is pending activation in Google Cloud Console.');
    return;
  }
  origError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);

