// Browser polyfills - must load before any other scripts
if (typeof window !== 'undefined') {
  if (typeof window.global === 'undefined') {
    window.global = window;
  }
  if (typeof window.process === 'undefined') {
    window.process = { env: {} };
  }
  if (typeof window.Buffer === 'undefined') {
    window.Buffer = {};
  }
}
