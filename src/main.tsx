
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfill for localStorage if running in browser environment without it
if (typeof window !== 'undefined' && !window.localStorage) {
  window.localStorage = {
    _data: {},
    setItem: function(id, val) { this._data[id] = String(val); },
    getItem: function(id) { return this._data[id] || null; },
    removeItem: function(id) { delete this._data[id]; },
    clear: function() { this._data = {}; }
  };
}

createRoot(document.getElementById("root")!).render(<App />);
