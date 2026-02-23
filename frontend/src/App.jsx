import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Components & Pages
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthContainer from './pages/AuthContainer';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import QRScanner from './pages/QRScanner';
import MerchantDashboard from './pages/MerchantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MessMenu from './pages/MessMenu';
import Profile from './pages/Profile';
import MessManagement from './pages/MessManagement';
import Developer from './pages/Developer';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="w-full"
  >
    {children}
  </motion.div>
);

export default function App() {
  const { token, user, getMe, logout } = useContext(AuthContext);
  const [isInitializing, setIsInitializing] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const initApp = async () => {
      if (token && !user) {
        try { await getMe(); } catch (err) { logout(); }
      }
      setIsInitializing(false);
    };
    initApp();
  }, [token, user, getMe, logout]);

  if (isInitializing) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center">
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-blue-500">
      {/* Navbar ab hamesha dikhega, chahe login ho ya dashboard */}
      <Navbar />
      
      {/* pt-[75px] ensures content starts below the fixed navbar */}
      <main className="pt-[75px] pb-[100px] md:pb-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            <Route path="/login" element={<PageTransition><AuthContainer /></PageTransition>} />
            <Route path="/register" element={<PageTransition><AuthContainer /></PageTransition>} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    {user?.role === 'admin' ? (
                      <AdminDashboard /> 
                    ) : user?.role === 'merchant' ? (
                      <MerchantDashboard />
                    ) : (
                      <Dashboard />
                    )}
                  </PageTransition>
                </ProtectedRoute>
              }
            />

            <Route path="/wallet" element={<ProtectedRoute requiredRole="user"><PageTransition><Wallet /></PageTransition></ProtectedRoute>} />
            <Route path="/qr-scanner" element={<ProtectedRoute requiredRole="user"><PageTransition><QRScanner /></PageTransition></ProtectedRoute>} />
            <Route path="/mess-menu" element={<ProtectedRoute><PageTransition><MessMenu /></PageTransition></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
            <Route path="/developer" element={<PageTransition><Developer /></PageTransition>} />
            <Route path="/mess-manage" element={<ProtectedRoute requiredRole="merchant"><PageTransition><MessManagement /></PageTransition></ProtectedRoute>} />
            <Route path="/merchant" element={<ProtectedRoute requiredRole="merchant"><PageTransition><MerchantDashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}