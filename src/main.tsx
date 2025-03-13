
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfill for localStorage if running in browser environment without it
if (typeof window !== 'undefined' && !window.localStorage) {
  const localStoragePolyfill: Storage = {
    _data: {},
    length: 0,
    clear(): void { this._data = {}; this.length = 0; },
    getItem(key: string): string | null { return this._data[key] || null; },
    key(index: number): string | null {
      const keys = Object.keys(this._data);
      return index < keys.length ? keys[index] : null;
    },
    removeItem(key: string): void { 
      delete this._data[key]; 
      this.length = Object.keys(this._data).length;
    },
    setItem(key: string, value: string): void { 
      this._data[key] = String(value); 
      this.length = Object.keys(this._data).length;
    }
  };
  
  (window as any).localStorage = localStoragePolyfill;
}

createRoot(document.getElementById("root")!).render(<App />);
