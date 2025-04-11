// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './ErrorBoundaries';
import { BrowserRouter } from 'react-router-dom'; 
import 'leaflet/dist/leaflet.css';
// ⬅️ import BrowserRouter

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter> 
    
    {/* ⬅️ wrap App in Router */}
    <ErrorBoundary><App /></ErrorBoundary>
      
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
