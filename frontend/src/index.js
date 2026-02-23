import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Router इम्पोर्ट करें
import './index.css';
import App from './App.jsx'; // ध्यान दें: यहाँ .jsx लिखना ज़रूरी है
import { AuthProvider } from './context/AuthContext'; // AuthProvider इम्पोर्ट करें

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);