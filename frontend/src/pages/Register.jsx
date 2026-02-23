import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import { AuthContext } from '../context/AuthContext';
import { 
  User, Mail, Lock, UserPlus, Phone, IdCard, Camera, 
  CheckCircle2, Loader2, Sparkles, AlertTriangle, 
  ShieldCheck, ChevronRight, ScanFace 
} from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', collegeId: '', phoneNumber: '' });
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  const videoRef = useRef();
  const { register, loading: apiLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // LPU Official Logo Link
  const LPU_LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Lovely_Professional_University_logo.png/600px-Lovely_Professional_University_logo.png";

  // AI मॉडल्स को लोड करना
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        setStatus({ type: 'success', msg: 'AI SYSTEMS ONLINE ✅' });
      } catch (e) {
        setStatus({ type: 'error', msg: 'AI LINK FAILED' });
      }
    };
    loadModels();
  }, []);

  // ऑटो-स्कैनिंग लॉजिक
  useEffect(() => {
    let interval;
    let stream;
    const startScanner = async () => {
      if (step === 2 && modelsLoaded) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          if (videoRef.current) videoRef.current.srcObject = stream;
          interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              const detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
              if (detection) {
                clearInterval(interval);
                const descriptorArray = Array.from(detection.descriptor);
                setFaceDescriptor(descriptorArray);
                setStatus({ type: 'success', msg: 'IDENTITY SECURED ✅' });
                if (stream) stream.getTracks().forEach(track => track.stop());
                setTimeout(() => handleFinalSubmit(descriptorArray), 1500);
              }
            }
          }, 1000);
        } catch (err) { setStatus({ type: 'error', msg: 'CAMERA ERROR' }); }
      }
    };
    startScanner();
    return () => { clearInterval(interval); if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [step, modelsLoaded]);

  const handleFinalSubmit = async (descriptor) => {
    try {
      await register(formData.name, formData.email, formData.password, formData.role, formData.collegeId, formData.phoneNumber, descriptor);
      navigate('/');
    } catch (err) {
      setStatus({ type: 'error', msg: 'ENROLLMENT FAILED' });
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#020617_100%)] opacity-40" />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          // --- STEP 1: ENROLLMENT FORM ---
          <motion.div 
            key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} 
            className="relative z-10 w-full max-w-xl glass-panel p-8 md:p-12 rounded-[3.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-3xl shadow-2xl"
          >
            
             {/* LPU Branding Header (Same as Login) */}
             <div className="text-center mb-10 flex flex-col items-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-4 group">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/40 transition-all duration-700" />
                  <img 
                    src={LPU_LOGO} 
                    alt="LPU" 
                    className="h-16 w-auto relative z-10 brightness-150 mix-blend-screen drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                  />
                </motion.div>
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center justify-center gap-2">
                   LPU <Sparkles className="text-emerald-500" size={20} /> <span className="text-emerald-500 text-not-italic">Enrollment</span>
                </h2>
                <p className="text-slate-500 text-[9px] font-bold tracking-[0.4em] uppercase mt-2 italic">Secure Student Identity Onboarding</p>
             </div>

             {status.msg && (
               <div className={`p-4 rounded-2xl mb-8 text-center text-[10px] font-black uppercase border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                 <AlertTriangle size={14} className="inline mr-2" /> {status.msg}
               </div>
             )}

             <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative group">
                  <User className="absolute left-4 top-4 text-slate-600 group-focus-within:text-emerald-500" size={16}/>
                  <input required className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-white transition-all uppercase placeholder:text-slate-800" placeholder="FULL NAME" onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                </div>

                <div className="relative group">
                  <IdCard className="absolute left-4 top-4 text-slate-600 group-focus-within:text-emerald-500" size={16}/>
                  <input required className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-white font-mono placeholder:text-slate-800" placeholder="REG ID" onChange={(e)=>setFormData({...formData, collegeId: e.target.value})} />
                </div>

                <div className="relative group">
                  <Phone className="absolute left-4 top-4 text-slate-600 group-focus-within:text-emerald-500" size={16}/>
                  <input required className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-white placeholder:text-slate-800" placeholder="PHONE" onChange={(e)=>setFormData({...formData, phoneNumber: e.target.value})} />
                </div>

                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-4 text-slate-600" size={16}/>
                  <select className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-[10px] font-black text-white appearance-none uppercase cursor-pointer" onChange={(e)=>setFormData({...formData, role: e.target.value})}>
                    <option value="user">STUDENT</option>
                    <option value="merchant">VENDOR</option>
                  </select>
                </div>

                <div className="md:col-span-2 relative group">
                  <Mail className="absolute left-4 top-4 text-slate-600 group-focus-within:text-emerald-500" size={16}/>
                  <input required type="email" className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-white transition-all placeholder:text-slate-800" placeholder="CAMPUS EMAIL" onChange={(e)=>setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="md:col-span-2 relative group">
                  <Lock className="absolute left-4 top-4 text-slate-600 group-focus-within:text-emerald-500" size={16}/>
                  <input required type="password" className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-white transition-all placeholder:text-slate-800" placeholder="CREATE SECURITY KEY" onChange={(e)=>setFormData({...formData, password: e.target.value})} />
                </div>
                
                <motion.button 
                  type="submit"
                  whileHover={modelsLoaded ? { scale: 1.02 } : {}} whileTap={modelsLoaded ? { scale: 0.98 } : {}}
                  className={`md:col-span-2 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 mt-4 transition-all ${modelsLoaded ? 'bg-blue-600 shadow-blue-500/20' : 'bg-slate-800 opacity-60'}`}
                >
                   {modelsLoaded ? "Initialize Biometric Forge" : <><Loader2 size={16} className="animate-spin" /> Syncing AI Systems...</>}
                   {modelsLoaded && <ChevronRight size={16}/>}
                </motion.button>
             </form>

             {/* Navigation to Login */}
             <p className="text-center mt-10 text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
                Exist in Ledger? <Link to="/login" className="text-emerald-500 hover:text-white transition-all underline underline-offset-8 decoration-emerald-500/30">Access Gateway</Link>
             </p>
          </motion.div>
        ) : (
          // --- STEP 2: BIOMETRIC SCANNER (Previously Shared) ---
          <motion.div 
            key="scan" initial={{ opacity: 0, scale: 0.9, x: 100 }} animate={{ opacity: 1, scale: 1, x: 0 }}
            className="relative z-10 w-full max-w-md glass-panel p-10 rounded-[4rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center shadow-2xl"
          >
            <h3 className="text-xl font-black italic tracking-[0.3em] mb-8 uppercase text-blue-400">Security <span className="text-white">Scan</span></h3>
            <div className="relative w-72 h-72 bg-black rounded-full border-4 border-slate-800 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] mb-10 mx-auto">
               {!faceDescriptor ? (
                 <>
                   <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1] grayscale" />
                   <motion.div animate={{ top: ['10%', '90%', '10%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_20px_#3b82f6] z-20" />
                   <div className="absolute inset-0 border-[40px] border-black/30 rounded-full pointer-events-none" />
                 </>
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-sm">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                    <p className="mt-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-400 animate-pulse">Signature Verified</p>
                 </div>
               )}
            </div>
            <div className={`p-5 rounded-2xl flex items-center justify-center gap-3 border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
               {status.type === 'loading' ? <Loader2 className="animate-spin" size={16}/> : <ScanFace size={16}/>}
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{status.msg}</span>
            </div>
            {apiLoading && <div className="mt-6 flex flex-col items-center gap-2 animate-bounce"><Loader2 className="animate-spin text-emerald-500" size={24} /><p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Finalizing Enrollment...</p></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}