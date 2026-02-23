import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { merchantAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  QrCode, Landmark, History, Clock, CheckCircle2, ShieldCheck, 
  Zap, Receipt, ArrowUpRight, TrendingUp, Wallet, Utensils, ChevronRight, Star
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';

export default function MerchantDashboard() {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isFlipped, setIsFlipped] = useState(false);

  const LPU_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Lovely_Professional_University_logo.png/600px-Lovely_Professional_University_logo.png";

  useEffect(() => { 
    loadDashboard(); 
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await merchantAPI.getDashboard();
      setDashboard(response.data);
    } catch (err) { 
      console.log("Terminal Sync Error"); 
    }
  };

  const handleGenerateQR = async () => {
    try {
      const response = await merchantAPI.generateQRCode();
      setQrCode(response.data);
    } catch (err) { 
      alert("QR Sync Failed"); 
    }
  };

  const handleRequestSettlement = async (e) => {
    e.preventDefault();
    if (!settlementAmount || settlementAmount <= 0) return;
    setLoading(true);
    try {
      await merchantAPI.requestSettlement(parseFloat(settlementAmount));
      setStatus({ type: 'success', msg: 'Settlement Authorized ✅' });
      setSettlementAmount('');
      loadDashboard();
      setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Insufficient Funds' });
    } finally { 
      setLoading(false); 
    }
  };

  if (!dashboard) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-black tracking-widest uppercase animate-pulse">
      Initializing Vendor Terminal...
    </div>
  );

  // Analytics Data from real transactions
  const chartData = dashboard.recentTransactions.slice(0, 7).reverse().map((t, i) => ({
    point: i + 1,
    val: t.amount
  }));

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-28 relative overflow-x-hidden font-sans">
      
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 pt-8">
        
        {/* Merchant Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-10 bg-emerald-950/20 p-4 rounded-[2.5rem] border border-emerald-500/20 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full p-0.5 border-2 border-emerald-500 shadow-lg">
                <img src={user?.profileImage} className="w-full h-full rounded-full object-cover" alt="Profile" />
             </div>
             <div>
                <h2 className="text-xs font-black tracking-tight uppercase">{user?.name}</h2>
                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                   <ShieldCheck size={10} /> Verified LPU Vendor
                </p>
             </div>
          </div>
          <div className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
             <Zap size={14} className="text-amber-400 animate-pulse" />
          </div>
        </motion.div>

        {/* MESS MENU MANAGEMENT BUTTON */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <Link to="/mess-manage" className="block group">
            <div className="bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 p-6 rounded-[2.5rem] flex items-center justify-between group-hover:bg-emerald-500/20 transition-all shadow-lg">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                     <Utensils size={28} />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Live Mess Control</h3>
                     <p className="text-[9px] text-emerald-500/60 font-bold uppercase">Update Daily Menu Feed</p>
                  </div>
               </div>
               <ChevronRight className="text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
            </div>
          </Link>
        </motion.div>

        {/* 3D BUSINESS IDENTITY CARD */}
        <div className="perspective-1000 mb-10 h-64" onClick={() => setIsFlipped(!isFlipped)}>
          <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.7, type: "spring", stiffness: 150 }} className="w-full h-full relative preserve-3d cursor-pointer">
            
            {/* Front Side: Revenue */}
            <div className="absolute inset-0 w-full h-full backface-hidden glass-panel rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-950 border border-emerald-500/20 shadow-2xl">
               <div className="flex justify-between items-start">
                  <img src={LPU_LOGO} className="h-10 w-auto brightness-150 mix-blend-screen drop-shadow-[0_0_10px_#10b981]" alt="LPU" />
                  <div className="text-right">
                     <p className="text-[8px] font-black text-emerald-400 tracking-[0.2em] uppercase">Business Capital</p>
                     <div className="flex items-center gap-1 justify-end text-[10px] font-mono text-emerald-400">
                        <Star size={10} fill="currentColor" /> <span>ELITE VENDOR</span>
                     </div>
                  </div>
               </div>
               <div>
                  <h1 className="text-6xl font-black glow-text tracking-tighter text-white">
                    {dashboard.merchant.walletBalance}<span className="text-lg font-medium text-slate-500 ml-2 italic"></span>
                  </h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic">Merchant ID: {user?.collegeId || "VNDR-Nexus"}</p>
               </div>
               <div className="flex justify-between items-end border-t border-white/5 pt-4 text-[8px] font-black text-slate-500 uppercase">
                  <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-emerald-500"/> Secure Terminal</span>
                  <span className="animate-pulse text-emerald-500">Tap to Show QR</span>
               </div>
            </div>

            {/* Back Side: QR Gateway */}
            <div style={{ transform: "rotateY(180deg)" }} className="absolute inset-0 w-full h-full backface-hidden rounded-[2.5rem] p-8 flex flex-col items-center justify-center bg-white border-[12px] border-slate-900 shadow-2xl">
              {qrCode ? (
                 <div className="flex flex-col items-center">
                    <div className="p-4 bg-white rounded-3xl border-2 border-slate-100 shadow-inner">
                       <img src={qrCode.qrCode} alt="Merchant QR" className="w-32 h-32" />
                    </div>
                    <p className="text-slate-900 text-[10px] font-black mt-4 uppercase tracking-widest">Student Scan Terminal</p>
                 </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); handleGenerateQR(); }} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg">Initialize QR</button>
              )}
            </div>
          </motion.div>
        </div>

        {/* REVENUE STATS GRID */}
        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-slate-900/40">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">Life-Time <ArrowUpRight size={10} className="text-emerald-500"/></p>
              <h4 className="text-lg font-black">{dashboard.merchant.totalReceived} <span className="text-[10px] text-slate-600">COIN</span></h4>
           </div>
           <div className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-slate-900/40">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Payouts</p>
              <h4 className="text-lg font-black text-amber-400">{dashboard.settlementRequests.filter(r => r.status === 'PENDING').length} <span className="text-[10px] text-slate-600">Req.</span></h4>
           </div>
        </div>

        {/* CASHOUT FORM (Fixed Double onChange) */}
        <div className="glass-panel p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 shadow-2xl mb-10">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Landmark size={14} className="text-emerald-500" /> Settle to Bank
           </h3>
           <form onSubmit={handleRequestSettlement} className="space-y-6">
              <AnimatePresence>
                 {status.msg && <motion.p initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className={`text-[10px] font-black p-4 rounded-2xl text-center border ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{status.msg}</motion.p>}
              </AnimatePresence>
              <div className="relative group">
                 <Wallet className="absolute left-4 top-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                 {/* FIX: Removed duplicate onChange and setAmount */}
                 <input 
                   type="number" 
                   value={settlementAmount} 
                   onChange={(e) => setSettlementAmount(e.target.value)}
                   className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white transition-all uppercase tracking-widest" 
                   placeholder="ENTER AMOUNT" 
                 />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} className="w-full bg-white text-black font-black py-5 rounded-[2rem] text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-500 hover:text-white transition-all">
                {loading ? "AUTHORIZING..." : "Initiate Cashout"}
              </motion.button>
           </form>
        </div>

        {/* SALES ANALYTICS GRAPH */}
        <div className="glass-panel rounded-[2.5rem] p-8 mb-10 border border-white/5 backdrop-blur-xl bg-slate-900/40 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 flex items-center gap-2">
               <TrendingUp size={14} className="text-emerald-500" /> Sales Momentum
            </h3>
            <div className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 animate-pulse">LIVE FEED</div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{point:1, val:0}, {point:2, val:0}]}>
                <XAxis dataKey="point" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }} itemStyle={{ color: '#10b981' }} labelStyle={{ display: 'none' }} />
                <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorGreen)" animationDuration={1500} />
                <defs><linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LIVE SALES REGISTRY */}
        <div className="space-y-4 px-2 pb-10">
           <h3 className="text-[9px] font-black tracking-[0.4em] text-slate-600 uppercase flex items-center gap-2 mb-6 italic font-mono">
              <History size={12} /> Transmission Logs
           </h3>
           <AnimatePresence mode='popLayout'>
             {dashboard.recentTransactions.length > 0 ? dashboard.recentTransactions.map((t, i) => (
               <motion.div key={t._id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-5 rounded-[2.5rem] flex justify-between items-center border border-white/5 bg-slate-900/40 mb-4 group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner group-hover:scale-110 transition-transform"><Receipt size={20}/></div>
                     <div className="overflow-hidden">
                        <p className="text-xs font-black tracking-tight uppercase truncate max-w-[150px]">Received LP Asset</p>
                        <p className="text-[8px] font-bold text-slate-600 tracking-widest uppercase italic">{new Date(t.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-400 text-base">+{t.amount}</p>
                    <div className="flex items-center justify-end gap-1 text-[7px] text-emerald-500 font-black uppercase">
                       <CheckCircle2 size={8} />
                       <span>SETTLED</span>
                    </div>
                  </div>
               </motion.div>
             )) : (
               <div className="text-center py-10 opacity-20 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-white/10"><Clock size={50} className="mx-auto mb-2" /><p className="font-black uppercase tracking-widest text-[10px]">No Registry Activity</p></div>
             )}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
}