import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import { authAPI } from '../services/api'; 
import { AuthContext } from '../context/AuthContext';
import { 
  Lock, Mail, User, ShieldCheck, ChevronRight, Fingerprint, 
  Loader2, AlertTriangle, CheckCircle2, Hash, 
  Phone, IdCard, Sparkles, ScanFace, RefreshCw, X, Store, GraduationCap 
} from 'lucide-react';

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const [regStep, setRegStep] = useState(1); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', collegeId: '', phoneNumber: '', otp: '' });
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ type: '', msg: '' });
  
  const videoRef = useRef();
  const streamRef = useRef(null);
  const { login, register, forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const LPU_LOGO = "/logo192.png";

  useEffect(() => {
    const loadModels = async () => {
      try {
        const URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(URL), 
          faceapi.nets.faceLandmark68Net.loadFromUri(URL), 
          faceapi.nets.faceRecognitionNet.loadFromUri(URL)
        ]);
        setModelsLoaded(true);
      } catch (e) { console.log("AI Offline"); }
    };
    loadModels();
  }, []);

  const handleLoginAttempt = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.email === 'admin@lpu.in' && formData.password === 'Admin123') {
       try {
         await login(formData.email, formData.password);
         navigate('/admin'); return;
       } catch (err) { setError("ADMIN ACCESS DENIED"); return; }
    }
    handleBiometricAuth();
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setResetStatus({ type: 'loading', msg: 'Verifying...' });
    try {
      await forgotPassword(resetEmail);
      setResetStatus({ type: 'success', msg: 'Key Sent! ✅' });
      setTimeout(() => setShowForgotModal(false), 2000);
    } catch (err) { setResetStatus({ type: 'error', msg: 'Not Found' }); }
  };

  // --- 🚀 ULTIMATE MOBILE LOOP SCANNING FIX ---
  const handleBiometricAuth = async () => {
    if (!modelsLoaded) return alert("AI Systems Initializing...");
    setIsScanning(true);
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Scanning Logic
      let attempts = 0;
      const maxAttempts = 30; // 15-20 seconds window

      const scanInterval = setInterval(async () => {
        if (!videoRef.current) return;
        attempts++;

        const detection = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }) // Low confidence threshold for mobile
        ).withFaceLandmarks().withFaceDescriptor();

        if (detection) {
          clearInterval(scanInterval); // Face milte hi loop band
          if (isLogin) {
            try {
              const res = await authAPI.getFaceData(formData.email);
              const storedDescriptor = new Float32Array(res.data.faceDescriptor);
              const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);
              
              if (distance < 0.6) { 
                await login(formData.email, formData.password); 
                stopCamera(); navigate('/'); 
              } else { 
                setError("IDENTITY MISMATCH"); stopCamera(); 
              }
            } catch (err) {
              setError("ACCOUNT NOT FOUND"); stopCamera();
            }
          } else {
            setFaceDescriptor(Array.from(detection.descriptor));
            stopCamera(); setRegStep(3);
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(scanInterval);
          setError("TIMEOUT: NO FACE DETECTED");
          stopCamera();
        }
      }, 700); // Har 0.7 second mein retry

    } catch (err) { 
      setError("CAMERA ERROR: CHECK PERMISSIONS"); 
      setIsScanning(false); 
    }
  };

  const stopCamera = () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); setIsScanning(false); };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authAPI.sendOTP(formData.email);
      if (res.status === 200 || res.data.success) {
        setRegStep(2);
      }
    } catch (e) { 
      setError(e.response?.data?.message || "SYSTEM BUSY... RETRY IN 10s");
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#010409] flex items-center justify-center p-6 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Face Scan Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border border-blue-500/30 overflow-hidden shadow-2xl">
               <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
               <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-full h-[1px] bg-blue-400 shadow-[0_0_15px_blue]" />
               {/* --- Feedback Text --- */}
               <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <p className="text-[7px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">Detecting Face...</p>
               </div>
            </div>
            <h2 className="text-white font-black tracking-widest mt-6 uppercase text-[8px] animate-pulse italic">Verifying Identity...</h2>
            <button onClick={stopCamera} className="mt-8 text-slate-500 text-[8px] uppercase font-black tracking-widest border border-white/5 px-4 py-2 rounded-lg">Cancel Scan</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <div className="relative w-full max-w-[290px] md:max-w-[700px] md:h-[480px] bg-[#0d1117]/90 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col md:flex-row overflow-hidden z-10 shadow-black/90">
        
        <div className="md:hidden pt-8 pb-1 flex flex-col items-center justify-center">
           <img src={LPU_LOGO} className="h-5 mb-1 brightness-125" alt="LPU" />
           <h1 className="text-[9px] font-black italic text-white tracking-widest uppercase leading-none">LPU <span className="text-blue-500">COIN</span></h1>
        </div>

        {/* Sign In Side */}
        <div className={`w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center ${!isLogin && 'hidden md:flex'}`}>
            <h2 className="text-sm md:text-2xl font-black text-white italic uppercase mb-6 md:mb-8 tracking-tighter text-center md:text-left leading-none leading-none">Sign <span className="text-blue-500">In</span></h2>
            <form onSubmit={handleLoginAttempt} className="space-y-3 md:space-y-4">
              <div className="relative flex items-center bg-black/40 border border-white/5 md:border-white/10 rounded-lg md:rounded-xl focus-within:border-blue-500/40 transition-all group">
                <Mail className="absolute left-3 md:left-4 text-slate-700 group-focus-within:text-blue-500" size={12}/>
                <input required type="email" placeholder="Email Address" className="w-full bg-transparent p-2.5 md:p-3 pl-9 md:pl-10 text-[9px] md:text-[10px] font-bold text-white outline-none" onChange={(e)=>setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="relative flex items-center bg-black/40 border border-white/5 md:border-white/10 rounded-lg md:rounded-xl focus-within:border-blue-500/40 transition-all group">
                <Lock className="absolute left-3 md:left-4 text-slate-700 group-focus-within:text-blue-500" size={12}/>
                <input required type="password" placeholder="Security Key" className="w-full bg-transparent p-2.5 md:p-3 pl-9 md:pl-10 text-[9px] md:text-[10px] font-bold text-white outline-none" onChange={(e)=>setFormData({...formData, password: e.target.value})} />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 md:py-3.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all mt-1">Authorize Access</button>
            </form>
            <div className="mt-4 text-center md:text-left flex flex-col items-center md:items-start gap-3">
              <button onClick={() => setShowForgotModal(true)} className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase hover:text-blue-400">Forgot Password?</button>
              <div className="mt-6 md:hidden pt-4 border-t border-white/5 flex flex-col items-center">
                <button onClick={() => setIsLogin(false)} className="text-blue-500 text-[9px] font-black uppercase tracking-widest">Enroll New Node <ChevronRight size={10} className="inline ml-1"/></button>
              </div>
            </div>
        </div>

        {/* Sign Up Side */}
        <div className={`w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-[#0d1117] border-l border-white/5 ${isLogin && 'hidden md:flex'}`}>
            <h2 className="text-sm md:text-2xl font-black text-white italic uppercase mb-4 md:mb-6 text-emerald-500 text-center md:text-left leading-none">En <span className="text-white font-normal">Roll</span></h2>
            <AnimatePresence mode="wait">
              {regStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                   <div className="flex bg-black/40 p-0.5 md:p-1 rounded-lg md:rounded-xl border border-white/5 mb-2">
                      <button onClick={()=>setFormData({...formData, role:'user'})} className={`flex-1 py-1.5 md:py-2 text-[8px] md:text-[9px] font-black uppercase rounded-md md:rounded-lg transition-all ${formData.role === 'user' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>Student</button>
                      <button onClick={()=>setFormData({...formData, role:'merchant'})} className={`flex-1 py-1.5 md:py-2 text-[8px] md:text-[9px] font-black uppercase rounded-md md:rounded-lg transition-all ${formData.role === 'merchant' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>Vendor</button>
                   </div>
                   <form onSubmit={handleSendOTP} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input required placeholder="Full Name" className="bg-black/20 p-2 md:p-2.5 text-[9px] rounded-lg border border-white/5 uppercase text-white outline-none" onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                      <input required placeholder="Reg ID" className="bg-black/20 p-2 md:p-2.5 text-[9px] rounded-lg border border-white/5 uppercase font-mono text-white outline-none" onChange={(e)=>setFormData({...formData, collegeId: e.target.value})} />
                      <input required placeholder="Mobile" className="bg-black/20 p-2.5 text-[9px] rounded-lg border border-white/5 text-white outline-none" onChange={(e)=>setFormData({...formData, phoneNumber: e.target.value})} />
                      <input required type="email" placeholder="Email" className="bg-black/20 p-2.5 text-[9px] rounded-lg border border-white/5 text-white outline-none" onChange={(e)=>setFormData({...formData, email: e.target.value})} />
                      <button className="md:col-span-2 w-full bg-emerald-600 py-2.5 md:py-3 rounded-lg md:rounded-xl text-white font-black text-[8px] md:text-[9px] uppercase tracking-widest shadow-emerald-900/10 mt-1 shadow-lg">Request OTP</button>
                   </form>
                   <button onClick={() => setIsLogin(true)} className="md:hidden w-full text-slate-700 text-[8px] font-black uppercase underline mt-2 text-center">Existing Node? Sign In</button>
                </motion.div>
              )}
              {regStep === 2 && (
                <motion.div key="step2" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-center py-2">
                   <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Enter Verification Code</p>
                   <input required maxLength="6" placeholder="000000" className="text-center text-3xl font-black tracking-[0.4em] text-emerald-400 bg-transparent border-b border-emerald-500/30 rounded-none w-full focus:ring-0 focus:border-emerald-500 outline-none" onChange={(e)=>setFormData({...formData, otp: e.target.value})} />
                   <button onClick={handleBiometricAuth} className="w-full bg-blue-600 py-3 rounded-lg text-white font-black text-[9px] uppercase tracking-widest shadow-lg">Verify & Scan Face</button>
                   <button onClick={() => setRegStep(1)} className="text-[8px] text-slate-600 font-black uppercase underline">Change Details</button>
                </motion.div>
              )}
              {regStep === 3 && (
                <motion.form key="step3" initial={{ y: 10 }} animate={{ y: 0 }} onSubmit={async (e)=>{ e.preventDefault(); await register(formData.name, formData.email, formData.password, formData.role, formData.collegeId, formData.phoneNumber, faceDescriptor, formData.otp); navigate('/'); }} className="space-y-3 py-2 text-center">
                   <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 flex items-center justify-center gap-3">
                      <CheckCircle2 className="text-emerald-500" size={18} />
                      <p className="text-[9px] font-black text-white uppercase tracking-tighter italic">Identity Secured</p>
                   </div>
                   <input required type="password" placeholder="Create Password" className="bg-black/30 p-2.5 text-[9px] rounded-lg border border-white/5 text-white w-full outline-none focus:border-emerald-500" onChange={(e)=>setFormData({...formData, password: e.target.value})} />
                   <button className="w-full bg-emerald-600 py-3 rounded-lg text-white font-black text-[9px] uppercase shadow-xl">Establish Nexus Node</button>
                </motion.form>
              )}
            </AnimatePresence>
        </div>

        {/* Desktop Slider Overlay */}
        <motion.div animate={{ x: isLogin ? '100%' : '0%' }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="hidden md:flex absolute top-0 left-0 w-1/2 h-full z-50 bg-[#0d1117] border-x border-[#30363d] flex flex-col items-center justify-center p-8 text-center shadow-2xl shadow-black">
           <motion.img animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} src={LPU_LOGO} className="w-20 h-auto mb-6 mix-blend-screen drop-shadow-xl" />
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">LPU <span className="text-blue-500 font-normal">COIN</span></h1>
           <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.5em] mt-3 italic text-center leading-none">Campus Payment System</p>
           <button onClick={() => {setIsLogin(!isLogin); setRegStep(1); setError('');}} className="mt-10 px-8 py-3 border-2 border-white/5 rounded-full font-black text-[8px] uppercase text-white hover:border-blue-500/50 hover:bg-blue-600/5 transition-all active:scale-95 shadow-xl shadow-blue-500/10">
              {isLogin ? "Enroll Node" : "Access Hub"}
           </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-10 bg-black/95 backdrop-blur-md text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0d1117] border border-white/5 p-6 rounded-[2rem] w-full max-w-[240px] shadow-2xl">
              <Mail size={20} className="mx-auto mb-3 text-blue-500 opacity-60" />
              <h3 className="text-[9px] font-black uppercase text-white mb-4 italic tracking-widest tracking-tighter">System Recovery</h3>
              <input type="email" placeholder="Email Address" className="bg-black/40 p-2.5 text-[9px] rounded-lg border border-white/10 text-white text-center w-full mb-4 outline-none focus:border-blue-500 tracking-[0.1em]" onChange={(e) => setResetEmail(e.target.value)} />
              <button onClick={handleForgotRequest} className="w-full bg-blue-600 py-2.5 rounded-lg text-white font-black text-[8px] uppercase tracking-widest shadow-lg">Request Key</button>
              <button onClick={() => setShowForgotModal(false)} className="mt-4 text-[7px] text-slate-700 font-black uppercase tracking-widest">Abort Protocol</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {error && <div className="fixed bottom-0 left-0 w-full bg-red-600 text-white text-[8px] font-black uppercase py-1.5 text-center tracking-[0.3em] shadow-lg">{error}</div>}
    </div>
  );
}