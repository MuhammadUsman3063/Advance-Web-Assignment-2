"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BellRing, VolumeX, Volume2 } from "lucide-react";
import { io } from "socket.io-client";

export default function DisplayScreen() {
  const [activePatient, setActivePatient] = useState(null);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Audio reference (Free notification bell sound)
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3") : null);

  const fetchDisplayData = async () => {
    try {
      // Note: TV screen public hoti hai, isliye agar chaho toh is route ko backend par public kar sakte ho, 
      // lekin abhi hum dummy bypass ya available data use karenge. 
      // (Asal app mein display screen ka alag secure token hota hai)
      const token = localStorage.getItem("token"); 
      
      const res = await fetch("http://localhost:5000/api/patients", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        // Active patient nikalo
        const current = data.find(p => p.status === 'Active');
        // Baqi waiting walon ki list banao (sirf pehle 3)
        const waiting = data.filter(p => p.status === 'Pending').slice(0, 3);
        
        // Sound Play Logic: Agar naya patient aaya hai aur sound enabled hai
        if (current && activePatient && current._id !== activePatient._id && soundEnabled) {
           playBellSound();
        } else if (current && !activePatient && soundEnabled) {
           playBellSound(); // Pehla patient call hone par
        }

        setActivePatient(current);
        setWaitingPatients(waiting);
      }
    } catch (err) {
      console.error("Failed to fetch display data", err);
    }
  };

  const playBellSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Rewind to start
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("Display needs login for now.");
    }

    fetchDisplayData();

    // Socket.io Connection
    const socket = io("http://localhost:5000");
    
    socket.on("queue_refreshed", () => {
      console.log("Live Update on TV Screen!");
      fetchDisplayData();
    });

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEnabled, activePatient]); // Dependencies for sound trigger

  // Browser Autoplay bypass karne ke liye pehla click
  const enableSound = () => {
    setSoundEnabled(true);
    playBellSound(); // Ek dafa test sound play karo
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Header */}
      <header className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/20 p-3 rounded-2xl">
            <Activity className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-widest">MediSync <span className="text-emerald-400 font-light">CLINIC</span></h1>
        </div>
        
        {/* Sound Enable Button (For Browser Policy) */}
        <button 
          onClick={enableSound}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg transition-all ${
            soundEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400 animate-pulse border border-red-500/50"
          }`}
        >
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          {soundEnabled ? "Audio Live" : "Tap to Enable Sound"}
        </button>
      </header>

      {/* Main Display Area */}
      <div className="flex-1 flex">
        
        {/* LEFT: CURRENT PATIENT (Massive View) */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 relative">
          <div className="absolute inset-0 bg-emerald-500/5 blur-[150px] pointer-events-none"></div>
          
          <h2 className="text-5xl font-bold text-slate-400 mb-8 uppercase tracking-[0.3em]">Now Serving</h2>
          
          <AnimatePresence mode="wait">
            {activePatient ? (
              <motion.div 
                key={activePatient._id}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                className="flex flex-col items-center"
              >
                {/* Massive Token Number */}
                <div className="text-[18rem] leading-none font-black text-white drop-shadow-[0_0_40px_rgba(52,211,153,0.4)] mb-8">
                  {activePatient.tokenNumber}
                </div>
                {/* Patient Name */}
                <div className="bg-slate-800 px-10 py-4 rounded-full border-2 border-slate-700 shadow-2xl">
                  <p className="text-5xl font-bold text-emerald-400">{activePatient.name}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-slate-600"
              >
                <BellRing className="w-32 h-32 mb-6 opacity-20" />
                <p className="text-4xl font-medium">Please wait for your token</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: UPCOMING QUEUE */}
        <div className="w-1/3 bg-slate-800 border-l border-slate-700 flex flex-col shadow-2xl z-10">
          <div className="bg-slate-900 p-8 border-b border-slate-700">
            <h3 className="text-3xl font-bold text-slate-300 uppercase tracking-widest text-center">Next in Line</h3>
          </div>
          
          <div className="flex-1 p-8 flex flex-col gap-6">
            {waitingPatients.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl text-slate-500 font-medium text-center">Queue is empty</p>
              </div>
            ) : (
              waitingPatients.map((patient, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={patient._id} 
                  className="bg-slate-700/50 p-6 rounded-3xl border border-slate-600 flex items-center gap-6"
                >
                  <div className="bg-slate-900 text-white w-20 h-20 rounded-2xl flex items-center justify-center font-black text-4xl shadow-inner border border-slate-700">
                    {patient.tokenNumber}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-3xl mb-1">{patient.name}</h4>
                    <p className="text-slate-400 text-lg font-medium">Please be ready</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
      
      {/* Bottom Ticker/Footer */}
      <div className="bg-emerald-600 py-3 px-8 text-center shadow-[0_-10px_30px_rgba(5,150,105,0.3)] z-20">
        <p className="text-white text-xl font-bold tracking-widest uppercase">
          Kindly approach the doctor's room when your token is called
        </p>
      </div>
    </div>
  );
}