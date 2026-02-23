import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  // अगर टोकन नहीं है, तो लॉगिन पर भेजें और याद रखें कि वो कहाँ जाने की कोशिश कर रहा था
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // अगर यूजर डेटा अभी तक लोड नहीं हुआ (सिर्फ टोकन है), तो इंतज़ार करें (App.jsx इसे हैंडल करेगा)
  if (!user) return null;

  // अगर किसी पेज के लिए खास रोल चाहिए (जैसे Admin) और यूजर का रोल वो नहीं है
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}