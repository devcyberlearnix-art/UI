// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // ✅ Named import
import App from './App';
import './index.css';
import { initApiContract } from './api/contractApi';
import { refreshContractApiTree } from './api/contractApiTree';

initApiContract().then(() => {
  refreshContractApiTree();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);