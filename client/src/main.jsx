import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import './styles/glass.css';
import App from './App.jsx';

// SVG-filter refraction inside backdrop-filter only renders correctly in Chromium.
const isChromium = !!window.chrome && /Chrome|Chromium|Edg\//.test(navigator.userAgent);
if (isChromium) document.documentElement.classList.add('has-refraction');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
