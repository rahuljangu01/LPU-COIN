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

  const NavLink = ({ to, label, icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className="relative px-4 py-2 group">
        {isActive && (
          <motion.div layoutId="nav-pill" className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_15px_#3b82f666]" />
        )}
        <span className={`relative z-10 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
          {icon} {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* --- TOP NAVBAR (Fixed) --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="responsive-container flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
             <motion.img whileHover={{ rotate: -10 }} src={LPU_LOGO} className="h-8 md:h-10 w-auto brightness-150 mix-blend-screen shadow-2xl" alt="LPU" />
             <span className="text-lg md:text-xl font-black text-white tracking-tighter uppercase italic">LPU <span className="text-blue-500">COIN</span></span>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                 {isUser ? (
                   <>
                     <NavLink to="/wallet" label="Wallet" icon={<Wallet size={12}/>} />
                     <NavLink to="/qr-scanner" label="Scanner" icon={<QrCode size={12}/>} />
                   </>
                 ) : (
                   <div className="text-emerald-500 flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      Terminal Active
                   </div>
                 )}
                 {user.role === 'admin' && <NavLink to="/admin" label="Command" icon={<ShieldCheck size={12}/>} />}
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 border-l border-white/10 pl-4 md:pl-6">
                <Link to="/developer" className="p-2 text-slate-500 hover:text-blue-500 transition-colors"><Code2 size={18}/></Link>
                <Link to="/profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-blue-500 p-0.5 overflow-hidden">
                   <img src={user.profileImage} className="w-full h-full rounded-full object-cover" alt="U" />
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="text-red-500/70 hover:text-red-500 transition-transform"><LogOut size={18} /></button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* --- BOTTOM TAB BAR (Fixed Bottom) --- */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#0d1117]/95 backdrop-blur-2xl border-t border-white/5 px-6 py-3 flex justify-between items-end pb-6">
          <MobileTab to="/" icon={<Home size={22}/>} label="Home" active={location.pathname === '/'} />
          {isUser ? (
            <>
              <MobileTab to="/wallet" icon={<Wallet size={22}/>} label="Wallet" active={location.pathname === '/wallet'} />
              <div className="relative -top-6">
                 <Link to="/qr-scanner" className="bg-blue-600 p-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] border-4 border-[#020617] text-white flex items-center justify-center">
                    <QrCode size={28} />
                 </Link>
              </div>
              <MobileTab to="/mess-menu" icon={<Utensils size={22}/>} label="Mess" active={location.pathname === '/mess-menu'} />
            </>
          ) : (
            <MobileTab to={user.role === 'admin' ? "/admin" : "/"} icon={<LayoutDashboard size={22}/>} label="Terminal" active={location.pathname === '/admin'} />
          )}
          <MobileTab to="/profile" icon={<UserIcon size={22}/>} label="Vault" active={location.pathname === '/profile'} />
        </div>
      )}

      {/* Logout Modal... (same logic as yours) */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }} className="bg-slate-950 border border-white/10 p-10 rounded-[3rem] max-w-xs w-full shadow-2xl text-center">
              <AlertCircle size={40} className="text-red-500 mx-auto mb-6" />
              <h3 className="text-xl font-black text-white mb-2 uppercase italic">Log Out?</h3>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 bg-slate-900 rounded-2xl text-white font-black text-[10px] uppercase">Cancel</button>
                <button onClick={handleLogout} className="flex-1 py-4 bg-red-600 rounded-2xl text-white font-black text-[10px] uppercase shadow-lg shadow-red-600/20">Exit</button>
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
    <Link to={to} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-500 scale-110' : 'text-slate-500'}`}>
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest leading-none">{label}</span>
    </Link>
  );
}