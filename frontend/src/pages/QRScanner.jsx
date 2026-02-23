import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { walletAPI, authAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, X, Loader2, Image as ImageIcon, Landmark, Zap, RefreshCw } from 'lucide-react';
import Confetti from 'react-confetti';

export default function QRScanner() {
  const { getMe } = useContext(AuthContext);
  const [merchant, setMerchant] = useState({ id: '', name: '' });
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState(null);

  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Initialize Scanner Instance on Mount
  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }
    startScanner();
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleResult = async (data) => {
    try {
      setStatus({ type: 'loading', msg: 'SYNCING NODE...' });
      
      // Stop scanner if it was running
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      setIsScanning(false);

      let id = data.trim().replace(/['"]+/g, '');
      try { 
        const parsed = JSON.parse(data); 
        id = parsed.merchantId || parsed.id || id; 
      } catch(e) {}

      setMerchant(prev => ({ ...prev, id: id }));
      const res = await authAPI.getMerchantInfo(id);
      setMerchant({ id, name: res.data.merchant.name });
      setStatus({ type: 'success', msg: 'LINK READY ✅' });
    } catch (e) {
      setStatus({ type: 'error', msg: 'RETRY SCAN' });
      setTimeout(startScanner, 2000);
    }
  };

  const startScanner = async () => {
    try {
      setScannedImage(null); 
      setIsScanning(true);
      setStatus({ type: '', msg: '' });

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 20, qrbox: { width: 180, height: 180 } },
        (text) => handleResult(text)
      );
    } catch (e) {
      setIsScanning(false);
      setStatus({ type: 'info', msg: 'CAMERA BLOCKED' });
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus({ type: 'loading', msg: 'DECRYPTING...' });
    
    try {
      // Create preview
      setScannedImage(URL.createObjectURL(file));

      // Stop camera if it was trying to start
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }

      const res = await scannerRef.current.scanFile(file, true);
      handleResult(res);
    } catch (e) { 
      setStatus({ type: 'error', msg: 'NO QR DETECTED' });
      setScannedImage(null);
    }
  };

  const onPay = async (e) => {
    e.preventDefault();
    if (!merchant.id || !amount) return;
    setStatus({ type: 'loading', msg: 'TRANSFERRING...' });
    try {
      await walletAPI.processPayment(merchant.id, parseFloat(amount));
      setShowSuccess(true);
      await getMe();
      setTimeout(() => navigate('/'), 2500);
    } catch (err) { 
      setStatus({ type: 'error', msg: err.response?.data?.message || 'FAILED' }); 
    }
  };

  return (
    <div className="h-[100dvh] bg-[#020617] text-white p-4 flex flex-col items-center justify-center font-sans overflow-hidden">
      {showSuccess && <Confetti numberOfPieces={100} recycle={false} gravity={0.3} />}
      
      <div className="w-full max-w-[300px] md:max-w-[380px] relative">
        <header className="text-center mb-4">
           <h1 className="text-xs font-black tracking-[0.4em] text-slate-600 uppercase italic">LPU <span className="text-blue-500 font-normal">Secure Pay</span></h1>
        </header>

        {/* --- SCANNER FRAME --- */}
        <div 
          onClick={() => !isScanning && fileInputRef.current.click()} // Pure box ko clickable banaya
          className={`relative mb-4 bg-black rounded-[2.5rem] overflow-hidden border-2 border-white/5 shadow-2xl aspect-square max-w-[240px] mx-auto cursor-pointer group`}
        >
          <div id="reader" className="w-full h-full"></div>
          
          {/* Status Overlay (Jab camera off ho ya upload karna ho) */}
          {!isScanning && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md z-10">
                {scannedImage && <img src={scannedImage} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" alt="snapshot" />}
                <div className="relative z-20 flex flex-col items-center p-4 text-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 mb-2 shadow-lg group-hover:scale-110 transition-transform">
                       {merchant.id ? <Landmark size={24}/> : <ImageIcon size={24}/>}
                    </div>
                    <h3 className="font-black uppercase text-[10px] text-white leading-tight mb-2 tracking-widest">
                       {merchant.name || "Upload from Gallery"}
                    </h3>
                    {!merchant.id && <p className="text-[7px] text-slate-500 mb-4 uppercase">Click box to select file</p>}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); startScanner(); }} 
                      className="flex items-center gap-2 text-[7px] font-black text-blue-500 uppercase border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                       <RefreshCw size={8}/> Try Camera
                    </button>
                </div>
             </div>
          )}

          {/* Scanning Animation */}
          {isScanning && (
             <div className="absolute inset-0 z-30 pointer-events-none">
                <div className="absolute inset-0 border-[35px] border-[#020617]/80"></div>
                <div className="absolute inset-[35px] border border-blue-500/30 rounded-lg overflow-hidden">
                   <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-[1px] bg-blue-400 shadow-[0_0_15px_blue]" />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }} 
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase border border-white/10 active:scale-95"
                >
                  <ImageIcon size={10}/> Gallery
                </button>
             </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
        </div>

        {/* --- FORM SECTION --- */}
        <form onSubmit={onPay} className="glass-panel p-5 rounded-[2rem] border border-white/5 space-y-4 bg-slate-900/30 shadow-2xl">
          <AnimatePresence mode="wait">
            {status.msg && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-center font-black text-[7px] tracking-widest uppercase p-2 rounded-lg border ${status.type === 'error' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-blue-400 border-blue-500/20 bg-blue-500/5'}`}>
                {status.type === 'loading' ? <Loader2 className="animate-spin inline mr-1" size={8}/> : null} {status.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Asset Value (LP)</p>
             <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-4xl font-black text-white text-center outline-none focus:scale-105 transition-transform" required />
          </div>

          <button 
            type="submit"
            disabled={!merchant.id || status.type === 'loading'}
            className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all ${merchant.id ? 'bg-blue-600 text-white active:scale-95' : 'bg-slate-800 text-slate-500 opacity-50'}`}>
             Authorize Pay <Zap size={12} fill="currentColor"/>
          </button>
        </form>

        <button onClick={() => navigate('/')} className="w-full mt-6 text-slate-700 font-black text-[8px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:text-white transition-colors">
            <X size={10}/> Disconnect
        </button>
      </div>

      <style>{`
        #reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 2rem !important; }
        #reader { border: none !important; }
      `}</style>
    </div>
  );
}