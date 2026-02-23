import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { walletAPI } from '../services/api';
import { Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap, Receipt, History } from 'lucide-react';
import Confetti from 'react-confetti';

export default function Wallet() {
  const { user, getMe } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

const LPU_LOGO = "/logo192.png";
  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const res = await walletAPI.getTransactions();
      setTransactions(res.data.transactions);
    } catch (e) { console.log(e); }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await walletAPI.addMoney(parseFloat(amount));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setAmount('');
      await getMe();
      await loadData();
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-28 relative font-sans overflow-x-hidden">
      {showConfetti && <Confetti numberOfPieces={150} recycle={false} gravity={0.3} colors={['#3b82f6', '#ffffff']} />}
      
      {/* Width restricted to 600px on desktop for professional feel */}
      <div className="max-w-[320px] md:max-w-[600px] mx-auto relative z-10 pt-6">
        <header className="text-center mb-8 flex flex-col items-center">
           <motion.img src={LPU_LOGO} className="h-10 md:h-12 brightness-150 mix-blend-screen mb-3" alt="LPU" />
           <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase underline underline-offset-8 decoration-blue-500/20">Coin<span className="text-blue-500">Vault</span></h1>
        </header>

        {/* Balance Card - Compact */}
        <motion.div className="bg-slate-900 border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-8 group shadow-black/80 text-center">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[70px]" />
          <div className="relative z-10">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20">Nexus Reserve</span>
                <ShieldCheck className="text-white/20" size={20} />
             </div>
             <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1 italic">Current Coin</p>
             <motion.h2 key={user?.walletBalance} className="text-4xl md:text-6xl font-black flex items-center justify-center gap-2 tracking-tighter">
               {user?.walletBalance} <span className="text-lg font-light opacity-50 text-slate-500 italic lowercase tracking-tight"></span>
             </motion.h2>
          </div>
        </motion.div>

        {/* Minting Form - Compact */}
        <motion.form onSubmit={handleMint} className="flex flex-col gap-3 mb-10 bg-slate-900/40 p-5 rounded-[2rem] border border-white/5 shadow-2xl">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-3">Enter Value (INR to COIN)</p>
          <div className="relative">
            <Zap className="absolute left-4 top-4 text-amber-500 animate-pulse" size={18} />
            <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full bg-slate-950 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-xl font-black text-white" placeholder="00.00" />
          </div>
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
             {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Plus size={14}/>Add Coin</>}
          </motion.button>
        </motion.form>

        {/* Transaction History - Refined */}
        <div className="space-y-3 pb-10">
           <div className="flex items-center gap-2 px-3 mb-3">
              <History size={14} className="text-slate-600" />
              <h3 className="text-[9px] font-black text-slate-600 tracking-[0.2em] uppercase italic">Transmission History</h3>
           </div>
           <AnimatePresence>
             {transactions.map((t, i) => (
               <motion.div key={t._id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900/40 border border-white/5 p-4 rounded-[2rem] flex justify-between items-center hover:bg-white/5 transition-all shadow-md">
                  <div className="flex items-center gap-3">
                     <div className={`p-2.5 rounded-xl ${t.type === 'DEBIT' ? 'bg-red-500/10 text-red-500 border-red-500/10' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'}`}>
                        {t.type === 'DEBIT' ? <ArrowUpRight size={16}/> : <ArrowDownLeft size={16}/>}
                     </div>
                     <div><p className="text-[11px] font-black uppercase tracking-tight">{t.toMerchantId?.name || 'SELF'}</p><p className="text-[8px] text-slate-600 font-bold uppercase">{new Date(t.createdAt).toDateString()}</p></div>
                  </div>
                  <p className={`text-sm font-black ${t.type === 'DEBIT' ? 'text-red-500' : 'text-emerald-400'}`}>{t.type === 'DEBIT' ? '-' : '+'}{t.amount}</p>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}