import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Camera, Check, IdCard, Phone, Mail, User as UserIcon, ShieldAlert, Loader2, KeyRound, ArrowRightCircle } from 'lucide-react';

export default function Profile() {
  const { user, getMe } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
  
  const [formData, setFormData] = useState({
    profileImage: ""
  });

  // Sync Global User Data - Warning Fixed!
  useEffect(() => {
    if (user) {
      setFormData({ profileImage: user.profileImage || "" });
    }
  }, [user]);

  const updatePhoto = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setLoading(true);
        try {
          await authAPI.updateMe({ profileImage: reader.result });
          await getMe();
          alert("Photo Synchronized! ✅");
        } catch (err) { alert("Upload Failed"); }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePassChange = async () => {
    if (passData.new !== passData.confirm) return alert("Keys do not match!");
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passData.current, newPassword: passData.new });
      alert("Encryption Keys Rotated! ✅");
      setShowPassModal(false);
    } catch (err) { alert(err.response?.data?.message || "Auth Error"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 relative overflow-hidden">
      <div className="max-w-md mx-auto pt-10 relative z-10">
        <h1 className="text-3xl font-black italic tracking-tighter mb-10 text-center uppercase">Identity <span className="text-blue-500">Vault</span></h1>

        <div className="glass-panel p-8 rounded-[3.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <input type="file" ref={fileInputRef} onChange={updatePhoto} className="hidden" accept="image/*" />
              <div className="w-36 h-36 rounded-[3rem] border-4 border-blue-500/30 p-1 bg-[#020617] shadow-2xl overflow-hidden">
                {formData.profileImage ? (
                  <img src={formData.profileImage} className="w-full h-full object-cover rounded-[2.5rem]" alt="Profile" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400"><UserIcon size={48}/></div>
                )}
              </div>
              <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-blue-600 p-4 rounded-3xl border-4 border-[#020617] text-white shadow-xl hover:scale-110 transition-transform"><Camera size={18}/></button>
            </div>
            <h2 className="text-2xl font-black mt-6 uppercase tracking-tighter italic">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-2 text-emerald-400">
               <ShieldAlert size={14} /> {/* Used here! */}
               <span className="text-[9px] font-black uppercase tracking-widest">Secure Profile Session</span>
            </div>
          </div>

          <div className="space-y-4">
             {[
               { label: 'Campus Reg ID', val: user?.collegeId, icon: <IdCard size={18}/> },
               { label: 'Verified Phone', val: user?.phoneNumber, icon: <Phone size={18}/> },
               { label: 'Primary Email', val: user?.email, icon: <Mail size={18}/> }
             ].map(item => (
               <div key={item.label} className="bg-black/30 p-5 rounded-3xl border border-white/5 flex items-center gap-4 opacity-70">
                  <div className="text-slate-600">{item.icon}</div>
                  <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1 tracking-widest">{item.label}</p><p className="text-sm font-bold text-blue-400">{item.val || "N/A"}</p></div>
               </div>
             ))}

             <div className="bg-slate-800/40 p-5 rounded-3xl border border-blue-500/20 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                   <div className="text-blue-500 bg-blue-500/10 p-2 rounded-xl border border-blue-500/20"><KeyRound size={18} /></div>
                   <div><p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Access Key</p><p className="text-xs font-bold tracking-[0.5em] text-slate-400">••••••••</p></div>
                </div>
                <button onClick={() => setShowPassModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-90"><ArrowRightCircle size={20}/></button>
             </div>
          </div>
        </div>

        {showPassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-950 border border-white/10 p-10 rounded-[3rem] w-full max-w-sm shadow-2xl relative">
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500"><KeyRound size={32} /></div>
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">Rotate Keys</h3>
              </div>
              <div className="space-y-4">
                 <input type="password" placeholder="CURRENT KEY" onChange={(e)=>setPassData({...passData, current: e.target.value})} className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold uppercase tracking-widest text-center" />
                 <input type="password" placeholder="NEW KEY" onChange={(e)=>setPassData({...passData, new: e.target.value})} className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold uppercase tracking-widest text-center" />
                 <input type="password" placeholder="CONFIRM NEW KEY" onChange={(e)=>setPassData({...passData, confirm: e.target.value})} className="w-full bg-slate-900 border border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold uppercase tracking-widest text-center" />
                 <button onClick={handlePassChange} className="w-full bg-blue-600 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={16}/> : <><Check size={16}/> Commit Updates</>} {/* Check & Loader2 used here! */}
                 </button>
                 <button onClick={() => setShowPassModal(false)} className="w-full text-slate-500 font-black text-[9px] uppercase tracking-widest mt-2 hover:text-white transition-colors">Abort Security Update</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}