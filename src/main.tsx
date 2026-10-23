import L from 'leaflet';
if (typeof window !== 'undefined') {
  (window as any).L = L;
}
import 'leaflet.heat';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
