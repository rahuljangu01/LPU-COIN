import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext'; // यूजर डेटा के लिए
import { messAPI } from '../services/api';
import { 
  Plus, Trash2, Utensils, Clock, Calendar, 
  ShieldCheck, Info, History, Home 
} from 'lucide-react';

export default function MessManagement() {
  const { user } = useContext(AuthContext); // लॉगिन यूजर (जैसे BH4) को यहाँ से लेंगे
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // hostelName को हमने user.name पर लॉक कर दिया है
  const [formData, setFormData] = useState({ 
    hostelName: user?.name || '', 
    mealType: 'Breakfast', 
    items: '' 
  });

  // पक्का करें कि अगर यूजर लोड होने में टाइम ले तो नाम अपडेट हो जाए
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, hostelName: user.name }));
      loadMeals();
    }
  }, [user]);

  const loadMeals = async () => {
    try {
      const res = await messAPI.getMeals();
      // सिर्फ वही मील दिखाएँ जो इस मर्चेंट के हॉस्टल के हैं
      const myMeals = res.data.meals.filter(m => m.hostelName === user?.name);
      setMeals(myMeals);
    } catch (e) {
      console.error("Failed to sync meals");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await messAPI.addMeal(formData);
      setFormData({ ...formData, items: '' });
      await loadMeals();
      alert("Menu Updated Successfully! ✅");
    } catch (err) {
      alert("Failed to publish menu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Remove this meal?")) {
      try {
        await messAPI.deleteMeal(id);
        loadMeals();
      } catch (e) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-24 font-sans">
      <div className="max-w-xl mx-auto">
        
        {/* Header Section */}
        <header className="flex items-center justify-between mb-10 bg-emerald-950/20 p-6 rounded-[2.5rem] border border-emerald-500/20 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg border border-emerald-500/30">
                 <Utensils size={30} />
              </div>
              <div>
                 <h1 className="text-xl font-black uppercase italic tracking-tighter">Mess <span className="text-emerald-500 text-not-italic">Control</span></h1>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inventory Management v1.0</p>
              </div>
           </div>
           <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase tracking-tighter">
              <ShieldCheck size={12} />
              Admin: {user?.name}
           </div>
        </header>

        {/* Input Form Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 mb-12 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Info size={100}/></div>
           
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus size={14} className="text-emerald-500" /> New Menu Entry
           </h3>

           <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                 {/* HOSTEL SECTOR - अब यह चुनने के बजाय खुद दिखेगा */}
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 ml-2 uppercase">Hostel Sector</label>
                    <div className="w-full bg-slate-800/50 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-400">
                       <Home size={16} />
                       <span className="text-sm font-black uppercase tracking-widest">{user?.name || "Loading..."}</span>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 ml-2 uppercase">Meal Timing</label>
                    <div className="relative">
                       <Clock className="absolute right-4 top-4 text-slate-600" size={16} />
                       <select className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none text-xs font-bold text-white appearance-none cursor-pointer hover:border-emerald-500/50 transition-colors" value={formData.mealType} onChange={(e)=>setFormData({...formData, mealType: e.target.value})}>
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-500 ml-2 uppercase">Food Items Description</label>
                 <textarea 
                    required 
                    value={formData.items} 
                    onChange={(e)=>setFormData({...formData, items: e.target.value})} 
                    className="w-full bg-black/40 border border-white/5 p-5 rounded-[2rem] outline-none text-sm font-bold h-32 focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-slate-800" 
                    placeholder="Enter today's specials..." 
                 />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[2rem] text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all"
              >
                {loading ? "AUTHORIZING..." : "Publish to Dashboard"}
              </motion.button>
           </form>
        </motion.div>

        {/* Live List Registry */}
        <div className="space-y-6 px-2">
           <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-2 mb-2 italic">
              <History size={14} className="text-emerald-500" />
              Your Active Menu Feed
           </h3>
           
           <AnimatePresence mode='popLayout'>
              {meals.map((m, i) => (
                <motion.div 
                  key={m._id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel p-6 rounded-[2.5rem] border border-white/5 flex justify-between items-center bg-slate-900/40 group hover:border-emerald-500/20 transition-all shadow-lg"
                >
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{m.hostelName}</p>
                         <div className="w-1 h-1 bg-slate-700 rounded-full" />
                         <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                            <Clock size={10} /> {m.mealType}
                         </p>
                      </div>
                      <p className="font-black text-sm text-slate-200">{m.items}</p>
                      <div className="flex items-center gap-4 mt-3">
                         <p className="text-[8px] text-slate-600 font-bold uppercase flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                            <Calendar size={10}/> {new Date(m.date).toLocaleDateString()}
                         </p>
                      </div>
                   </div>
                   <motion.button 
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                     onClick={() => handleDelete(m._id)} 
                     className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-500/10"
                   >
                      <Trash2 size={20}/>
                   </motion.button>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}