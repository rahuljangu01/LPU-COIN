import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Store, TrendingUp, Landmark, 
  ShieldCheck, ArrowRight, Search, Filter, Activity,
  Check, X, Trash2, Info, CreditCard, Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [activeView, setActiveView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItem, setSelectedItem] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const dash = await adminAPI.getDashboard();
      setStats(dash.data.dashboard);
      const u = await adminAPI.getAllUsers();
      setUsers(u.data.users);
      const s = await adminAPI.getSettlementRequests();
      setSettlements(s.data.requests);
    } catch (e) { console.error("Sync Error"); }
  };

  const handleApprove = async (id) => {
    if(!window.confirm("Authorize Payout?")) return;
    setLoadingAction(true);
    try {
      await adminAPI.approveSettlement(id);
      loadAll();
    } catch (e) { alert("Failed"); }
    setLoadingAction(false);
  };

  const handleReject = async (id) => {
    const reason = prompt("Reason:");
    if(!reason) return;
    setLoadingAction(true);
    try {
      await adminAPI.rejectSettlement(id, reason);
      loadAll();
    } catch (e) { alert("Failed"); }
    setLoadingAction(false);
  };

  const openUserDetail = (user) => {
    setSelectedItem(user);
    setIsModalOpen(true);
  };

  let displayData = users;
  if (activeView === 'users') displayData = users.filter(u => u.role === 'user');
  else if (activeView === 'merchants') displayData = users.filter(u => u.role === 'merchant');
  else if (activeView === 'settlements') displayData = settlements;

  if (searchTerm) {
    displayData = displayData.filter(item => (item.name || item.merchantId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }

  if (!stats) return <div className="h-screen bg-[#010409] flex items-center justify-center"><Activity className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#010409] text-white p-4 md:p-10 relative overflow-hidden font-sans">
      
      {/* Container restricted to 1000px for Desktop for better focus */}
      <div className="max-w-[400px] md:max-w-[1000px] mx-auto relative z-10 pt-4">
        
        {/* --- HEADER (Compact) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic flex items-center gap-2 leading-none">
              <ShieldCheck className="text-blue-500" size={24} /> Command <span className="text-blue-500">Center</span>
            </h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-1 opacity-60">LPU System Oversight</p>
          </div>
          
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-1 flex items-center w-full md:w-64">
            <Search className="ml-2 text-slate-500" size={14} />
            <input type="text" placeholder="Search Identity..." className="bg-transparent p-2 text-[10px] font-bold outline-none w-full text-white" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* --- STAT CARDS (Compact sizing) --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          <StatCard label="Citizens" value={stats.totalUsers} icon={<Users size={16}/>} active={activeView === 'users'} onClick={() => setActiveView('users')} color="blue" />
          <StatCard label="Vendors" value={stats.totalMerchants} icon={<Store size={16}/>} active={activeView === 'merchants'} onClick={() => setActiveView('merchants')} color="emerald" />
          <StatCard label="Traffic" value={stats.totalTransactions} icon={<Activity size={16}/>} active={activeView === 'all'} onClick={() => setActiveView('all')} color="purple" />
          <StatCard label="Payouts" value={stats.pendingSettlements} icon={<Landmark size={16}/>} active={activeView === 'settlements'} onClick={() => setActiveView('settlements')} color="amber" />
        </div>

        {/* --- TABLE (Tight spacing) --- */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#0d1117]/80 backdrop-blur-xl rounded-[2rem] border border-[#30363d] overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-[#30363d] flex justify-between items-center bg-gradient-to-r from-blue-500/5 to-transparent">
            <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400 font-mono italic">
              <Filter size={14} className="text-blue-500" /> Registry Database
            </h2>
            <div className="text-[8px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {displayData.length} RECORDS
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#010409] text-[8px] uppercase font-black text-slate-500 tracking-widest border-b border-[#30363d]">
                <tr>
                  <th className="p-4">Identity Node</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Capital</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {displayData.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-500/5 transition-all group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-[#30363d] flex items-center justify-center font-black text-blue-500 text-[10px] uppercase">
                          {(item.name || item.merchantId?.name)?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-black tracking-tight leading-none mb-1">{item.name || item.merchantId?.name}</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase truncate max-w-[120px]">{item.email || item.merchantId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                        item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        item.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {item.role || item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-0.5 font-black text-slate-200 text-xs tracking-tight">
                        {item.walletBalance || item.amount} <span className="text-[8px] text-slate-600 italic">COIN</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {activeView === 'settlements' ? (
                        item.status === 'PENDING' ? (
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => handleApprove(item._id)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/20"><Check size={14}/></button>
                            <button onClick={() => handleReject(item._id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-500/20"><X size={14}/></button>
                          </div>
                        ) : (
                          <div className="text-[7px] font-black text-slate-600 uppercase italic">
                            {new Date(item.approvedAt || item.updatedAt).toLocaleDateString()}
                          </div>
                        )
                      ) : (
                        <button onClick={() => openUserDetail(item)} className="p-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-500 transition-all">
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* --- MODAL (Compact) --- */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0d1117] border border-[#30363d] p-8 rounded-[2.5rem] w-full max-w-[320px] shadow-2xl relative text-center">
               <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-600 hover:text-white"><X size={18}/></button>
               <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 text-blue-500 shadow-inner"><Users size={28} /></div>
               <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1 leading-none">{selectedItem.name}</h3>
               <p className="text-[8px] text-blue-500 font-black uppercase tracking-widest italic mb-6">Security Registry Record</p>
               <div className="space-y-3 mb-8">
                  <DetailRow label="CAMPUS ID" value={selectedItem.collegeId} />
                  <DetailRow label="BALANCE" value={`${selectedItem.walletBalance} LP`} />
               </div>
               <button onClick={() => setIsModalOpen(false)} className="w-full bg-[#1c2128] text-slate-300 py-3.5 rounded-xl font-black text-[9px] uppercase border border-[#30363d] hover:bg-slate-700 transition-all">Close Entry</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ label, value, icon, active, onClick, color }) {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  };
  return (
    <div onClick={onClick} className={`p-5 rounded-[1.8rem] border cursor-pointer transition-all duration-300 relative overflow-hidden group ${active ? 'bg-[#161b22] border-blue-500 ring-1 ring-blue-500/20' : 'bg-[#0d1117] border-[#30363d] hover:border-slate-500'}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110 ${colors[color]}`}>{icon}</div>
      <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] mb-0.5 italic">{label}</p>
      <h2 className="text-2xl font-black tracking-tighter text-white">{value}</h2>
      {active && <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="bg-black/30 p-3.5 rounded-xl border border-[#30363d] text-left">
      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs font-bold text-slate-200 uppercase">{value || "N/A"}</p>
    </div>
  );
}