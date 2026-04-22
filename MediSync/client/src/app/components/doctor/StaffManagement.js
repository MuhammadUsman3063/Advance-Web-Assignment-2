"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserPlus, Mail, Lock, ShieldCheck, 
  CheckCircle, AlertCircle, Eye, EyeOff 
} from "lucide-react"; // Eye aur EyeOff import kiye hain

export default function StaffManagement() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password hide/show state
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // --- FORM VALIDATION LOGIC ---
  const validateForm = () => {
    // 1. Name Validation (At least 3 chars)
    if (name.trim().length < 3) {
      return "Name must be at least 3 letters long.";
    }

    // 2. Email Validation (Strict Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    // 3. Password Validation (Min 8 chars, 1 Letter, 1 Number, 1 Special Char)
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passRegex.test(password)) {
      return "Password must be at least 8 chars, include a letter, a number, and a symbol (e.g., @, #, $).";
    }

    return null; // Agar sab theek hai toh null return karo
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    // Pehle form validate karo
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password, role: "Receptionist" }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`Secure account for ${data.name} created successfully!`);
        setName("");
        setEmail("");
        setPassword("");
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        setErrorMsg(data.message || "Failed to create account. Email might be taken.");
      }
    } catch (err) {
      setErrorMsg("Server error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto mt-10">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
        <div className="bg-emerald-100 p-3 rounded-xl">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Add Receptionist</h2>
          <p className="text-slate-500 font-medium text-sm">Create a secure access account for your clinic staff.</p>
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-800 text-sm font-medium shadow-sm">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /> 
          <p>{successMsg}</p>
        </motion.div>
      )}
      
      {errorMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm font-medium shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" /> 
          <p>{errorMsg}</p>
        </motion.div>
      )}

      <form onSubmit={handleCreateStaff} className="space-y-5">
        
        {/* NAME INPUT */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Staff Name</label>
          <div className="relative">
            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              value={name} 
              onChange={(e) => {
                // Sirf alphabets aur space allow karega
                const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setName(val);
              }} 
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium"
              placeholder="e.g. Usman"
            />
          </div>
        </div>

        {/* EMAIL INPUT */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Login Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium"
              placeholder="usman.fullstacks.code@clinic.com"
            />
          </div>
        </div>

        {/* PASSWORD INPUT WITH EYE TOGGLE */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Secure Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium"
              placeholder="e.g. Usman@123"
            />
            {/* Eye Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Must be 8+ chars with at least 1 letter, 1 number, and 1 symbol.
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-70"
        >
          {loading ? "Creating Account..." : "Create Staff Account"}
        </motion.button>
      </form>
    </div>
  );
}