"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Mail, Lock, ArrowRight,Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import ThreeBackground from "./components/ThreeBackground";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Server error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Glowing Border Animation ke liye settings
  const glowAnimation = {
    boxShadow: [
      "0 0 20px -5px rgba(6, 182, 212, 0.3)", // Kam glow
      "0 0 40px 5px rgba(6, 182, 212, 0.6)",  // Zyada glow
      "0 0 20px -5px rgba(6, 182, 212, 0.3)"  // Wapis kam glow
    ],
    borderColor: [
      "rgba(6, 182, 212, 0.3)", // Halka border
      "rgba(6, 182, 212, 0.8)", // Teiz border
      "rgba(6, 182, 212, 0.3)"  // Wapis halka
    ],
    transition: {
      duration: 3, // 3 second mein ek chakkar poora hoga
      repeat: Infinity, // Hamesha chalta rahega
      ease: "easeInOut" // Smooth transition
    }
  };

  return (
    // BACKGROUND: Dark Gradient for better contrast
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-darkBg via-slate-800 to-primary/30 relative overflow-hidden">
      
      {/* 3D Canvas Background - Ab zyada visible hoga */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <ThreeBackground />
      </div>

      {/* Login Card (Animated Glass with Glowing Border) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          boxShadow: [
            "0 0 20px -5px rgba(6, 182, 212, 0.2)", 
            "0 0 40px 5px rgba(6, 182, 212, 0.6)",  
            "0 0 20px -5px rgba(6, 182, 212, 0.2)"  
          ],
          borderColor: [
            "rgba(6, 182, 212, 0.3)", 
            "rgba(6, 182, 212, 0.8)", 
            "rgba(6, 182, 212, 0.3)"  
          ]
        }}
        transition={{
          // Opacity aur Y axis sirf ek dafa chalenge
          opacity: { duration: 0.8, ease: "easeOut" },
          y: { duration: 0.8, ease: "easeOut" },
          // BoxShadow aur Border hamesha (Infinity) repeat honge
          boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          borderColor: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="bg-glass backdrop-blur-2xl p-8 rounded-3xl shadow-2xl z-10 w-full max-w-md border-2 relative overflow-hidden"
      >
        {/* Top Gradient Line for extra style */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary opacity-80"></div>

        <div className="flex justify-center mb-6 mt-2">
          <div className="bg-gradient-to-tr from-primary to-secondary p-4 rounded-full shadow-lg shadow-primary/30">
            <Activity className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">MediSync Portal</h2>
        <p className="text-gray-300 text-center mb-8">Secure access for clinic staff</p>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg text-sm mb-4 text-center backdrop-blur-md">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // Inputs ko ab dark glass look diya hai taa ke visible hon
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-darkBg/50 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-sm"
                placeholder="reception@clinic.com"
                required
              />
            </div>
          </div>

          {/* PASSWORD FIELD WITH EYE TOGGLE */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
              
              <input 
                // State ke hisaab se type change hoga
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-darkBg/50 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-sm"
                placeholder="••••••••"
                required
              />
              
              {/* Eye Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" }}
            whileTap={{ scale: 0.97 }}
            type="submit" 
            disabled={loading}
            // Button ab vibrant gradient wala hai jo door se chamkega
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Authenticating..."
            ) : (
              <>
                Sign In Securely <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
      
      {/* Bottom text for professional look */}
      <p className="absolute bottom-4 text-gray-400 text-xs">© 2026 MediSync Healthcare Solutions. Secure System.</p>
    </div>
  );
}