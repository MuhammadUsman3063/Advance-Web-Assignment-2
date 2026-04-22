"use client";

import { User, Phone, ArrowRight, Volume2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CurrentPatientCard({ currentPatient, onCallNext, loading }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col h-full relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="bg-emerald-100 p-2.5 rounded-xl">
          <Volume2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Current Consultation</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {!currentPatient ? (
          // Agar koi patient andar nahi hai
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
              <User className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Room is Empty</h2>
            <p className="text-slate-500 mb-8">Click the button below to call the first patient from the queue.</p>
          </motion.div>
        ) : (
          // Agar patient andar hai
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
            <p className="text-sm font-bold text-emerald-600 tracking-widest uppercase mb-2">Token Number</p>
            <div className="text-7xl font-black text-slate-900 mb-6 drop-shadow-sm">
              {currentPatient.tokenNumber}
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 w-full shadow-inner">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{currentPatient.name}</h2>
              <div className="flex items-center justify-center gap-2 text-slate-500 font-medium">
                <Phone className="w-4 h-4" /> {currentPatient.phone}
              </div>
            </div>
          </motion.div>
        )}

        {/* The Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCallNext}
          disabled={loading}
          className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-lg"
        >
          {loading ? "Processing..." : (
            currentPatient ? (
              <>Mark Complete & Call Next <ArrowRight className="w-5 h-5" /></>
            ) : (
              <>Call First Patient <ArrowRight className="w-5 h-5" /></>
            )
          )}
        </motion.button>
      </div>
    </div>
  );
}