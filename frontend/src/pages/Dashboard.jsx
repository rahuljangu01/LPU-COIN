import React, { useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { walletAPI } from '../services/api'; 
import { Link } from 'react-router-dom';
import { 
  QrCode, Zap, ShieldCheck, Utensils, Wallet, TrendingUp, 
  ArrowUpRight, ArrowDownLeft, Star, ChevronRight, CheckCircle2, Receipt, Clock 
} from 'lucide-react'; 
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  const { user, getMe } = useContext(AuthContext);
  const [isFlipped, setIsFlipped] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);

  const LPU_LOGO = "/logo192.png";

  const syncData = useCallback(async () => {
    try {
      const res = await walletAPI.getTransactions();
      const allTrans = res.data.transactions;
      setTransactions(allTrans.slice(0, 8)); // 8 transactions for better flow
      const points = allTrans.slice(0, 10).reverse().map((t, i) => ({ point: i + 1, val: t.amount }));
      setGraphData(points.length > 0 ? points : [{point:1, val:0}, {point:2, val:0}]);
      await getMe(); 
    } catch (e) { console.error("Sync Failed"); }
    finally { setLoading(false); }
  }, [getMe]);

  useEffect(() => { syncData(); }, [syncData]);

  if (!user || loading) return <div className="h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-black animate-pulse text-[10px] tracking-[0.5em]">SYSTEM BOOTING...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-28 font-sans overflow-x-hidden">
      <div className="max-w-[340px] md:max-w-[750px] mx-auto px-4 pt-6">
        
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center mb-6 bg-slate-900/40 p-3 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-xl">
          <Link to="/profile" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 border-2 border-blue-600 shadow-lg">
              <img src={user.profileImage} className="w-full h-full rounded-full object-cover" alt="P" />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-tight">{user.name}</h2>
              <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1"><Star size={8} className="text-blue-500" fill="currentColor"/> Verified Node</p>
            </div>
          </Link>
          <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
            <Zap size={14} className="text-amber-400 animate-pulse" />
          </div>
        </motion.div>

        {/* 3D IDENTITY CARD */}
        <div className="perspective-1000 mb-6 h-48 md:h-56" onClick={() => setIsFlipped(!isFlipped)}>
          <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, type: "spring" }} className="w-full h-full relative preserve-3d cursor-pointer">
            <div className="absolute inset-0 w-full h-full backface-hidden glass-panel p-6 flex flex-col justify-between overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
               <div className="flex justify-between items-start">
                  <img src={LPU_LOGO} className="h-6 md:h-8 brightness-125" alt="LPU" />
                  <CheckCircle2 size={16} className="text-emerald-500" />
               </div>
               <div>
                  <motion.h1 key={user.walletBalance} className="text-4xl md:text-5xl font-black glow-text tracking-tighter leading-none">
                    {user.walletBalance}<span className="text-xs text-slate-600 ml-2 italic uppercase">LP</span>
                  </motion.h1>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">NEXUS ID: {user.collegeId}</p>
               </div>
               <div className="flex justify-between items-end border-t border-white/5 pt-3 text-[7px] font-black text-slate-600 uppercase">
                  <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-blue-500"/> PROTOCOL ACTIVE</span>
                  <span className="animate-pulse text-blue-500 italic font-bold">TAP FLIP</span>
               </div>
            </div>
            <div style={{ transform: "rotateY(180deg)" }} className="absolute inset-0 w-full h-full backface-hidden rounded-[2.5rem] flex flex-col items-center justify-center bg-white border-[10px] border-slate-900 shadow-2xl">
              <QrCode size={90} className="text-slate-900" />
              <p className="text-slate-900 text-[8px] font-black mt-3 uppercase tracking-widest">ENCRYPTED KEY</p>
            </div>
          </motion.div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link to="/qr-scanner" className="flex items-center justify-center gap-2 bg-white text-black font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"><QrCode size={16} /> Pay</Link>
          <Link to="/wallet" className="flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"><Wallet size={16} /> Top-Up</Link>
        </div>

        {/* Feature: Mess */}
        <Link to="/mess-menu" className="block mb-8 group">
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[2.5rem] flex items-center justify-between group-hover:bg-emerald-500/10 transition-all shadow-lg shadow-black/20">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner"><Utensils size={20} /></div>
               <div><p className="text-[11px] font-black text-white uppercase italic tracking-widest leading-none">Mess Feed</p><p className="text-[7px] text-emerald-500/50 font-bold uppercase mt-1">Live Updates</p></div>
            </div>
            <ChevronRight size={14} className="text-slate-700 group-hover:text-emerald-500 transition-all" />
          </div>
        </Link>

        {/* --- DYNAMIC FLOW & LOGS (2 Column Layout on Desktop) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* Capital Flow Card */}
          <div className="flex flex-col">
             <div className="flex items-center gap-2 mb-4 ml-2">
                <TrendingUp size={14} className="text-blue-500" />
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Asset Momentum</h3>
             </div>
             <div className="glass-panel p-5 border border-white/5 bg-slate-900/40 shadow-2xl rounded-[2.5rem] h-[220px] relative overflow-hidden">
                <div className="absolute top-4 right-6 text-[8px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 animate-pulse">SYNCED</div>
                <div className="h-[150px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData}>
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '9px' }} />
                      <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSpent)" animationDuration={2000} />
                      <defs><linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Transmission Ledger */}
          <div className="flex flex-col">
             <div className="flex items-center gap-2 mb-4 ml-2">
                <History size={14} className="text-slate-500" />
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Ledger Registry</h3>
             </div>
             <div className="space-y-3">
               <AnimatePresence mode='popLayout'>
                 {transactions.length > 0 ? transactions.map((t, i) => (
                   <motion.div key={t._id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass-panel p-4 rounded-3xl flex justify-between items-center border border-white/5 bg-slate-900/30 hover:bg-slate-800/50 transition-all shadow-md group">
                      <div className="flex items-center gap-3">
                         <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 ${t.type === 'DEBIT' ? 'bg-red-500/10 text-red-500 border-red-500/10' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'}`}>
                            {t.type === 'DEBIT' ? <ArrowUpRight size={16}/> : <ArrowDownLeft size={16}/>}
                         </div>
                         <div>
                            <p className="text-[10px] font-black tracking-tight uppercase truncate max-w-[100px] leading-none mb-1">{t.type === 'DEBIT' ? (t.toMerchantId?.name || "Payment") : "Capital Topup"}</p>
                            <p className="text-[7px] font-bold text-slate-600 uppercase flex items-center gap-1"><Clock size={8}/> {new Date(t.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <p className={`font-black text-xs ${t.type === 'DEBIT' ? 'text-red-500' : 'text-emerald-400'}`}>{t.type === 'DEBIT' ? '-' : '+'}{t.amount}</p>
                   </motion.div>
                 )) : (
                   <div className="text-center py-10 opacity-20 border border-dashed border-white/10 rounded-[2.5rem]"><Receipt size={30} className="mx-auto mb-2" /><p className="text-[8px] font-black uppercase">No registry activity</p></div>
                 )}
               </AnimatePresence>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Icon for History
const History = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);