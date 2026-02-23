import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Lock, Mail, ChevronRight, Fingerprint, Sparkles, 
  ScanFace, ShieldCheck, Loader2, AlertTriangle, X, RefreshCw 
} from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ type: '', msg: '' });

  const videoRef = useRef();
  const { login, forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  // Local Logo Path
  const LPU_LOGO = "/logo192.png";

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("AI Models Linked ✅");
      } catch (e) { console.error("AI Offline"); }
    };
    loadModels();
  }, []);

  const handleLoginProcess = async (e) => {
    e.preventDefault();
    setError('');
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const res = await axios.post('https://lpu-coin-backend.onrender.com/api/auth/get-face-data', { email: formData.email });

      const storedDescriptor = new Float32Array(res.data.faceDescriptor);

      setTimeout(async () => {
        const detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
        
        if (detection) {
          const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);
          if (distance < 0.6) {
            await login(formData.email, formData.password);
            stream.getTracks().forEach(track => track.stop());
            setIsScanning(false);
            navigate('/');
          } else {
            setError("IDENTITY MISMATCH");
            stopCamera(stream);
          }
        } else {
          setError("NO FACE DETECTED");
          stopCamera(stream);
        }
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "GATEWAY ERROR");
      setIsScanning(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setResetStatus({ type: 'loading', msg: 'Verifying...' });
    try {
      await forgotPassword(resetEmail);
      setResetStatus({ type: 'success', msg: 'Key Sent to Gmail! ✅' });
      setTimeout(() => { setShowForgotModal(false); setResetStatus({ type: '', msg: '' }); }, 3000);
    } catch (err) { setResetStatus({ type: 'error', msg: 'Email not registered' }); }
  };

  const stopCamera = (stream) => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setIsScanning(false);
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#010409] flex items-center justify-center p-6 overflow-hidden font-sans">
      
      {/* Face Scan Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center backdrop-blur-xl">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border border-blue-500/30 overflow-hidden shadow-2xl">
               <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
               <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-full h-1 bg-blue-400 shadow-[0_0_15px_blue]" />
            </div>
            <h2 className="text-white font-black tracking-widest mt-6 uppercase text-[8px] animate-pulse italic text-center">Authenticating Nexus Node...</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Login Card */}
      <div className="relative w-full max-w-[290px] md:max-w-[700px] md:h-[460px] bg-[#0d1117]/90 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col md:flex-row overflow-hidden z-10">
        
        {/* Mobile Header Branding */}
        <div className="md:hidden pt-8 pb-1 flex flex-col items-center justify-center">
           <img src={LPU_LOGO} className="h-5 mb-1 brightness-125" alt="LPU" />
           <h1 className="text-[9px] font-black italic text-white tracking-widest">LPU <span className="text-blue-500">COIN</span></h1>
        </div>

        {/* LEFT: Sign In Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <h2 className="text-sm md:text-2xl font-black text-white italic uppercase mb-6 md:mb-8 tracking-tighter text-center md:text-left">Sign <span className="text-blue-500">In</span></h2>
          <form onSubmit={handleLoginProcess} className="space-y-3 md:space-y-4">
            <div className="relative flex items-center bg-black/40 border border-white/5 md:border-white/10 rounded-lg md:rounded-xl focus-within:border-blue-500/40 transition-all group">
              <Mail className="absolute left-3 md:left-4 text-slate-700 group-focus-within:text-blue-500" size={12}/>
              <input type="email" required className="w-full bg-transparent p-2.5 md:p-3 pl-9 md:pl-10 text-[9px] md:text-[10px] font-bold text-white outline-none placeholder:text-slate-700" placeholder="Email Address" onChange={(e)=>setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="relative flex items-center bg-black/40 border border-white/5 md:border-white/10 rounded-lg md:rounded-xl focus-within:border-blue-500/40 transition-all group">
              <Lock className="absolute left-3 md:left-4 text-slate-700 group-focus-within:text-blue-500" size={12}/>
              <input type="password" required className="w-full bg-transparent p-2.5 md:p-3 pl-9 md:pl-10 text-[9px] md:text-[10px] font-bold text-white outline-none placeholder:text-slate-700" placeholder="Security Key" onChange={(e)=>setFormData({...formData, password: e.target.value})} />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 md:py-3.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] uppercase tracking-widest shadow-xl transition-all mt-1">Authorize Access</button>
          </form>
          <div className="mt-4 text-center md:text-left flex flex-col items-center md:items-start gap-3">
             <button onClick={() => setShowForgotModal(true)} className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase hover:text-blue-400 transition-colors underline underline-offset-2">Forgot Access Protocol?</button>
             <Link to="/register" className="md:hidden text-blue-500 text-[8px] font-black uppercase tracking-widest">Enroll New Node <ChevronRight size={10} className="inline"/></Link>
          </div>
        </div>

        {/* RIGHT: Desktop Branding Slider */}
        <div className="hidden md:flex w-1/2 h-full bg-[#0d1117] border-l border-white/5 flex-col items-center justify-center p-8 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full" />
           <motion.img animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} src={LPU_LOGO} className="w-20 h-auto mb-6 mix-blend-screen drop-shadow-xl" alt="LPU" />
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none relative z-10">LPU <span className="text-blue-500 font-normal">COIN</span></h1>
           <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.5em] mt-3 italic relative z-10">Campus Economy Node</p>
           <Link to="/register" className="mt-10 px-8 py-3 border-2 border-white/5 rounded-full font-black text-[8px] uppercase text-white hover:border-blue-500 transition-all active:scale-95 relative z-10">Enroll Node</Link>
        </div>
      </div>

      {/* Forgot Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-10 bg-black/95 backdrop-blur-md text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0d1117] border border-white/5 p-6 rounded-[2rem] w-full max-w-[240px] shadow-2xl">
              <Mail size={20} className="mx-auto mb-3 text-blue-500 opacity-60" />
              <h3 className="text-[9px] font-black uppercase text-white mb-4 italic tracking-widest tracking-tighter">System Recovery</h3>
              <input type="email" placeholder="Email Address" className="bg-black/40 p-2.5 text-[9px] rounded-lg border border-white/10 text-white text-center w-full mb-4 outline-none focus:border-blue-500" onChange={(e) => setResetEmail(e.target.value)} />
              {resetStatus.msg && <p className="text-[7px] text-blue-400 font-bold mb-3">{resetStatus.msg}</p>}
              <button onClick={handleForgotRequest} className="w-full bg-blue-600 py-2.5 rounded-lg text-white font-black text-[8px] uppercase tracking-widest shadow-lg">Request Key</button>
              <button onClick={() => setShowForgotModal(false)} className="mt-4 text-[7px] text-slate-700 font-black uppercase">Abort</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      {error && <div className="fixed bottom-0 left-0 w-full bg-red-600 text-white text-[8px] font-black uppercase py-1.5 text-center tracking-[0.3em]">{error}</div>}
    </div>
  );
}