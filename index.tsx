
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("[ShipFast] Application initializing...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("[ShipFast] Critical Error: Could not find root element to mount to.");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("[ShipFast] React tree mounted successfully.");
} catch (error) {
  console.error("[ShipFast] Failed to mount application:", error);
}
