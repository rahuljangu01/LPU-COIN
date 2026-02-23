import React, { useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { walletAPI } from '../services/api'; 
import { Link } from 'react-router-dom';
import { QrCode, Zap, ShieldCheck, Utensils, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Star, ChevronRight, CheckCircle2, Receipt } from 'lucide-react'; 
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';

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
      setTransactions(allTrans.slice(0, 5));
      const points = allTrans.slice(0, 10).reverse().map((t, i) => ({ point: i + 1, val: t.amount }));
      setGraphData(points.length > 0 ? points : [{point:1, val:0}, {point:2, val:0}]);
      await getMe(); 
    } catch (e) { console.error("Sync Failed"); }
    finally { setLoading(false); }
  }, [getMe]);

  useEffect(() => { syncData(); }, [syncData]);

  if (!user || loading) return <div className="h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-black animate-pulse tracking-widest text-xs">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-28 font-sans overflow-x-hidden">
      {/* Container restricted to 700px on desktop for that 75% zoom feel */}
      <div className="max-w-[400px] md:max-w-[700px] mx-auto px-5 pt-6">
        
        {/* Header Profile - Compact */}
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center mb-6 bg-slate-900/40 p-3 md:p-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
          <Link to="/profile" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 border-2 border-blue-500 shadow-lg">
              <img src={user.profileImage} className="w-full h-full rounded-full object-cover" alt="P" />
            </div>
            <div>
              <h2 className="text-[10px] md:text-[11px] font-black tracking-tight uppercase">{user.name}</h2>
              <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Star size={8} className="text-blue-500" fill="currentColor"/> Verified</p>
            </div>
          </Link>
          <div className="bg-blue-500/10 p-2 rounded-full border border-blue-500/20">
            <Zap size={14} className="text-amber-400 animate-pulse" />
          </div>
        </motion.div>

        {/* --- 3D IDENTITY CARD - Smaller scale --- */}
        <div className="perspective-1000 mb-6 h-48 md:h-52" onClick={() => setIsFlipped(!isFlipped)}>
          <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, type: "spring", stiffness: 150 }} className="w-full h-full relative preserve-3d cursor-pointer">
            <div className="absolute inset-0 w-full h-full backface-hidden glass-panel p-6 flex flex-col justify-between overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
               <div className="flex justify-between items-start">
                  <img src={LPU_LOGO} className="h-6 md:h-8 brightness-150 mix-blend-screen" alt="LPU" />
                  <CheckCircle2 size={14} className="text-emerald-500" />
               </div>
               <div>
                  <motion.h1 key={user.walletBalance} className="text-3xl md:text-4xl font-black glow-text tracking-tighter leading-none">
                    {user.walletBalance}<span className="text-[10px] md:text-xs text-slate-600 ml-2 italic uppercase">LPU Coins</span>
                  </motion.h1>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">ID: {user.collegeId}</p>
               </div>
               <div className="flex justify-between items-end border-t border-white/5 pt-3 text-[7px] font-black text-slate-500 uppercase">
                  <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-blue-500"/> SECURE</span>
                  <span className="animate-pulse text-blue-500">Tap Flip</span>
               </div>
            </div>
            <div style={{ transform: "rotateY(180deg)" }} className="absolute inset-0 w-full h-full backface-hidden rounded-[2rem] flex flex-col items-center justify-center bg-white border-[8px] border-slate-900 shadow-2xl">
              <QrCode size={80} className="text-slate-900" />
              <p className="text-slate-900 text-[8px] font-black mt-3 uppercase tracking-widest">ACCESS KEY</p>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons Grid - Small & Sharp */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link to="/qr-scanner" className="flex items-center justify-center gap-2 bg-white text-black font-black py-3.5 rounded-2xl text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"><QrCode size={16} /> Pay</Link>
          <Link to="/wallet" className="flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-3.5 rounded-2xl text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"><Wallet size={16} /> Top Up</Link>
        </div>

        {/* Feature: Mess Menu - Compact */}
        <Link to="/mess-menu" className="block mb-6 group">
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-[2rem] flex items-center justify-between group-hover:bg-emerald-500/10 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500"><Utensils size={20} /></div>
               <div><p className="text-[11px] font-black text-white uppercase italic tracking-widest leading-none">Mess Menu</p><p className="text-[7px] text-emerald-500/60 font-bold uppercase mt-1">Live Feed</p></div>
            </div>
            <ChevronRight size={14} className="text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        {/* Analytics & History in 2 Columns on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Capital Flow Graph - Shortened */}
          <div className="glass-panel p-5 border border-white/5 bg-slate-900/40 shadow-xl overflow-hidden h-[220px]">
             <h3 className="text-[8px] font-black tracking-widest uppercase text-slate-500 mb-4 flex items-center gap-2"><TrendingUp size={12} className="text-blue-500" /> Transaction flow</h3>
             <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData}>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                    <defs><linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                  </AreaChart>
                </ResponsiveContainer>
             </div>const LPU_LOGO = "/logo192.png";
          </div>

          {/* Ledger History - Compact List */}
          <div className="space-y-2.5">
             <h3 className="text-[8px] font-black tracking-[0.3em] text-slate-600 uppercase italic mb-3 ml-2">Transmission Logs</h3>
             <AnimatePresence mode='popLayout'>
               {transactions.length > 0 ? transactions.map((t, i) => (
                 <motion.div key={t._id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-panel p-3.5 rounded-2xl flex justify-between items-center border border-white/5 bg-slate-900/40 hover:bg-slate-800/60 transition-colors shadow-lg">
                    <div className="flex items-center gap-3">
                       <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${t.type === 'DEBIT' ? 'bg-red-500/10 text-red-500 border-red-500/10' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'}`}>
                          {t.type === 'DEBIT' ? <ArrowUpRight size={16}/> : <ArrowDownLeft size={16}/>}
                       </div>
                       <div>
                          <p className="text-[10px] font-black tracking-tight uppercase truncate max-w-[100px]">{t.type === 'DEBIT' ? (t.toMerchantId?.name || "PAYMENT") : "CREDIT"}</p>
                          <p className="text-[7px] font-bold text-slate-600 uppercase">{new Date(t.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <p className={`font-black text-xs ${t.type === 'DEBIT' ? 'text-red-500' : 'text-emerald-400'}`}>{t.type === 'DEBIT' ? '-' : '+'}{t.amount}</p>
                 </motion.div>
               )) : (
                 <div className="text-center py-6 opacity-20"><Receipt size={30} className="mx-auto mb-2" /><p className="text-[8px] font-black uppercase">Registry Empty</p></div>
               )}
             </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}