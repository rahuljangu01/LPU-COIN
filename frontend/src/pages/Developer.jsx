import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Mail, Phone, Github, Linkedin, Code2, Cpu, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

export default function Developer() {
  const details = [
    { icon: <GraduationCap size={16}/>, label: "Education", value: "MCA Candidate", sub: "Lovely Professional University" },
    { icon: <MapPin size={16}/>, label: "Origin", value: "Jaipur, Rajasthan", sub: "India" },
    { icon: <Code2 size={16}/>, label: "Tech", value: "Full Stack Dev", sub: "MERN & AI Node" },
    { icon: <Mail size={16}/>, label: "Secure Email", value: "rahuljangu01@gmail.com", sub: "Official Link" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-28 font-sans overflow-x-hidden">
      {/* Desktop Narrow Layout restricted to 600px */}
      <div className="max-w-[320px] md:max-w-[600px] mx-auto pt-6">
        
        {/* Header Section - Compact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[3rem] border border-white/10 bg-slate-900/40 shadow-2xl mb-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-[2.5rem] border-4 border-blue-500/30 p-1 bg-[#020617] shadow-2xl overflow-hidden">
                 <img src="/rahul.png" alt="Rahul" className="w-full h-full object-cover rounded-[2.2rem]" />
              </div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -bottom-1 -right-1 bg-blue-600 p-2 rounded-xl border-4 border-[#020617] shadow-xl">
                <Cpu size={14} className="text-white" />
              </motion.div>
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
              RAHUL <span className="text-blue-500">JANGU</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 italic flex items-center gap-2 justify-center">
              <Code2 size={12} className="text-blue-500" /> Lead Architect
            </p>
            <div className="flex gap-4 mt-6">
               <a href="https://github.com/rahuljangu01" target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600 transition-all active:scale-90"><Github size={18}/></a>
               <a href="https://www.linkedin.com/in/rahuljangu/" target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600 transition-all active:scale-90"><Linkedin size={18}/></a>
            </div>
        </motion.div>

        {/* Info Grid - 2 Columns on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {details.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-panel p-4 rounded-2xl border border-white/5 bg-slate-900/20 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
              <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/10 shadow-inner">
                {item.icon}
              </div>
              <div>
                <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest mb-0.5 font-mono">{item.label}</p>
                <p className="text-xs font-black text-white uppercase italic tracking-tight leading-none">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Personnel Mission - Compact */}
        <div className="glass-panel p-6 rounded-[2.5rem] border border-white/5 bg-slate-900/20 shadow-xl mb-8">
           <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 flex items-center gap-2 italic">
             <Sparkles size={12} className="text-blue-500" /> Mission
           </h3>
           <p className="text-sm font-black text-slate-300 italic tracking-tight leading-relaxed">
             "Building <span className="text-blue-500 font-bold">digital economies</span> through secure biometric authentication systems."
           </p>
        </div>

        <button onClick={() => window.history.back()} className="w-full text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] hover:text-blue-500 transition-all flex items-center justify-center gap-2">
            <ChevronRight size={14} className="rotate-180" /> Back to System Ledger
        </button>

      </div>
    </div>
  );
}