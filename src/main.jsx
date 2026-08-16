import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';
import { initApiContract } from './api/contractApi';
import { refreshContractApiTree } from './api/contractApiTree';
import ErrorBoundary from './components/ErrorBoundary';

// --- GLOBAL PANIC HANDLER (Bypasses React entirely) ---
const rootEl = document.getElementById('root');
function showFatalError(message, stack) {
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding:2rem; font-family:sans-serif; color:#991b1b; background:#fef2f2; min-height:100vh;">
        <h1 style="font-size:1.5rem; font-weight:bold;">❌ FATAL ERROR DETECTED</h1>
        <div style="padding:1rem; background:#fee2e2; border-radius:0.5rem; margin-top:1rem;">
          <p style="font-weight:bold;">Error Message:</p>
          <p>${message || 'Unknown error'}</p>
        </div>
        <pre style="margin-top:1rem; white-space:pre-wrap; background:#fecaca; padding:1rem; border-radius:0.5rem; overflow-x:auto;">${stack || 'No stack trace available'}</pre>
        <button onclick="window.location.reload()" style="margin-top:1.5rem; padding:0.5rem 1rem; background:#dc2626; color:white; border:none; border-radius:0.25rem; font-weight:bold; cursor:pointer;">Reload</button>
      </div>
    `;
  }
}

// Catch all uncaught sync/async errors globally
window.addEventListener('error', (event) => {
  event.preventDefault();
  showFatalError(event.error?.message || event.message, event.error?.stack);
});
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  showFatalError(event.reason?.message || 'Unhandled Promise Rejection', event.reason?.stack);
});

// --- Initialize App ---
initApiContract()
  .then(() => { refreshContractApiTree(); })
  .catch(err => console.warn('API init failed gracefully:', err));

try {
  if (!rootEl) throw new Error("Root element #root not found in index.html");
  
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (syncError) {
  showFatalError(syncError.message, syncError.stack);
}