import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
// 1. Add this import:
import { EmployeeProvider } from './context/EmployeeContext';
import { BillingProvider } from './context/BillingContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EmployeeProvider>
          <BillingProvider>
            <App />
          </BillingProvider>
        </EmployeeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);