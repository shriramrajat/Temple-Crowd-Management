/**
 * Browser Polyfills
 * 
 * Provides Node.js global variables in the browser environment
 */

// Polyfill for global variable
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

// Polyfill for process.env in browser
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {},
  };
}

export {};
