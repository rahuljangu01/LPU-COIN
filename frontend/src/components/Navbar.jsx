import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, User as UserIcon, AlertCircle, Wallet, 
  QrCode, LayoutDashboard, ShieldCheck, Code2, Home, Utensils 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const LPU_LOGO = "/logo192.png";
  const isUser = user?.role === 'user';
  const isAdmin = user?.role === 'admin';
  const isMerchant = user?.role === 'merchant';

  const NavLink = ({ to, label, icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className="relative px-3 py-1.5 group">
        {isActive && (
          <motion.div layoutId="nav-pill" className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_10px_#3b82f666]" />
        )}
        <span className={`relative z-10 flex items-center gap-2 text-[8px] font-black uppercase tracking-wider transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
          {icon} {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* --- TOP NAVBAR (Fixed Header) --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 p-3 md:p-4">
        <div className="responsive-container flex justify-between items-center px-2">
          <Link to="/" className="flex items-center gap-2.5 group">
             <motion.img whileHover={{ rotate: -5 }} src={LPU_LOGO} className="h-7 md:h-9 w-auto brightness-125 mix-blend-screen" alt="LPU" />
             <span className="text-sm md:text-lg font-black text-white tracking-tighter uppercase italic leading-none">
               LPU <span className="text-blue-500">COIN</span>
             </span>
          </Link>

          {user && (
            <div className="flex items-center gap-3 md:gap-5">
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                 {isUser ? (
                   <>
                     <NavLink to="/wallet" label="Wallet" icon={<Wallet size={12}/>} />
                     <NavLink to="/qr-scanner" label="Scanner" icon={<QrCode size={12}/>} />
                   </>
                 ) : (
                   <div className="text-emerald-500 flex items-center gap-2 px-4 py-1.5 text-[8px] font-black uppercase tracking-widest">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                      {isAdmin ? 'System Admin' : 'Vendor Terminal'}
                   </div>
                 )}
                 {isAdmin && <NavLink to="/admin" label="Command" icon={<ShieldCheck size={12}/>} />}
              </div>
              
              <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                <Link to="/developer" className="p-1.5 text-slate-500 hover:text-blue-500 transition-colors"><Code2 size={16}/></Link>
                <Link to="/profile" className={`w-8 h-8 rounded-full border-2 p-0.5 transition-all ${location.pathname === '/profile' ? 'border-blue-500' : 'border-white/10'}`}>
                   <img src={user.profileImage} className="w-full h-full rounded-full object-cover" alt="U" />
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="text-red-500/60 hover:text-red-500"><LogOut size={18} /></button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* --- BOTTOM TAB BAR (Fixed Bottom - Mobile Only) --- */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#0d1117]/95 backdrop-blur-2xl border-t border-white/5 px-6 py-2.5 flex justify-between items-end pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          
          {/* Home Button (Always available) */}
          <MobileTab to="/" icon={<Home size={20}/>} label="Home" active={location.pathname === '/'} />
          
          {isUser ? (
            <>
              <MobileTab to="/wallet" icon={<Wallet size={20}/>} label="Wallet" active={location.pathname === '/wallet'} />
              {/* Big Floating QR Button */}
              <div className="relative -top-5">
                 <Link to="/qr-scanner" className="bg-blue-600 p-3.5 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] border-4 border-[#020617] text-white flex items-center justify-center active:scale-90 transition-transform">
                    <QrCode size={26} />
                 </Link>
              </div>
              <MobileTab to="/mess-menu" icon={<Utensils size={20}/>} label="Mess" active={location.pathname === '/mess-menu'} />
            </>
          ) : (
            /* 🔥 Terminal Button Logic Fixed for Merchant/Admin */
            <MobileTab 
              to={isAdmin ? "/admin" : "/"} 
              icon={<LayoutDashboard size={20}/>} 
              label="Terminal" 
              active={isAdmin ? location.pathname === '/admin' : location.pathname === '/'} 
            />
          )}

          {/* Profile Button */}
          <MobileTab to="/profile" icon={<UserIcon size={20}/>} label="Vault" active={location.pathname === '/profile'} />
        </div>
      )}

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95 }} className="bg-slate-950 border border-white/10 p-8 rounded-[2.5rem] max-w-xs w-full shadow-2xl text-center">
              <AlertCircle size={32} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none mb-2">System Exit?</h3>
              <p className="text-slate-500 text-[8px] uppercase tracking-widest mb-6">Terminate secure node session?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-slate-900 border border-white/5 rounded-xl text-white font-black text-[9px] uppercase">Cancel</button>
                <button onClick={handleLogout} className="flex-1 py-3 bg-red-600 rounded-xl text-white font-black text-[9px] uppercase shadow-lg shadow-red-900/20">Log Out</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileTab({ to, icon, label, active }) {
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-blue-500 scale-110' : 'text-slate-600'}`}>
      <div className={`${active ? 'bg-blue-500/10 p-1.5 rounded-lg' : ''}`}>
        {icon}
      </div>
      <span className="text-[7px] font-black uppercase tracking-widest leading-none">{label}</span>
    </Link>
  );
}