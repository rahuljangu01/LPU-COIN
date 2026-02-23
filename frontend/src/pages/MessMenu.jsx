import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { messAPI } from '../services/api';
import { Utensils, Clock, MapPin, Coffee, Sun, Moon, ChevronRight, RefreshCw } from 'lucide-react';

export default function MessMenu() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState('All');

  useEffect(() => {
    const fetchMeals = async () => {
        try {
            const res = await messAPI.getMeals();
            setMeals(res.data.meals);
        } catch (e) { console.error("Sync Error"); }
        setLoading(false);
    };
    fetchMeals();
  }, []);

  const hostels = ['All', ...new Set(meals.map(m => m.hostelName))];
  const filteredMeals = selectedHostel === 'All' ? meals : meals.filter(m => m.hostelName === selectedHostel);

  const getMealStyle = (type) => {
    switch(type.toLowerCase()) {
      case 'breakfast': return { icon: <Coffee size={12}/>, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
      case 'lunch': return { icon: <Sun size={12}/>, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
      case 'dinner': return { icon: <Moon size={12}/>, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };
      default: return { icon: <Utensils size={12}/>, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 pb-28 font-sans overflow-x-hidden">
      <div className="max-w-[320px] md:max-w-[650px] mx-auto relative z-10">
        
        <header className="flex flex-col items-center mb-6">
           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 mb-3 shadow-xl">
              <Utensils size={24} />
           </motion.div>
           <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">
              Campus <span className="text-emerald-500 text-not-italic">Live Feed</span>
           </h1>
           <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 italic opacity-60">Nutrition Registry</p>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2 justify-start md:justify-center">
           {hostels.map((h) => (
             <button
               key={h}
               onClick={() => setSelectedHostel(h)}
               className={`px-4 py-2 rounded-xl whitespace-nowrap font-black text-[9px] uppercase tracking-widest transition-all border ${
                 selectedHostel === h ? "bg-emerald-600 border-emerald-400 text-white" : "bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300"
               }`}
             >
               {h}
             </button>
           ))}
        </div>

        <div className="relative">
          {loading ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-emerald-500"><RefreshCw size={24} /></motion.div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Syncing...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={selectedHostel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                {filteredMeals.map((meal, i) => {
                  const style = getMealStyle(meal.mealType);
                  return (
                    <motion.div key={meal._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-panel p-5 rounded-[2rem] border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1 text-left">
                           <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${style.border} ${style.bg} ${style.color} w-fit shadow-md`}>
                              {style.icon}
                              <span className="text-[8px] font-black uppercase tracking-widest">{meal.mealType}</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[8px] uppercase pl-1">
                              <MapPin size={8} className="text-emerald-500" /> {meal.hostelName}
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-mono text-slate-600 uppercase font-black">{new Date(meal.date).toLocaleDateString([], {day:'2-digit', month:'short'})}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                           <p className="text-xs text-slate-200 font-bold leading-relaxed tracking-tight italic">"{meal.items}"</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}