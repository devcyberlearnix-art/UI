import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './core/queryClient';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error("Root element #root not found in index.html");
} else {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}