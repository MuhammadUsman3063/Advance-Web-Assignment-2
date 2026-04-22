"use client";

import { LogOut, Activity, Stethoscope, Users, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DoctorSidebar({ userName, userRole, activeTab, setActiveTab }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm hidden md:flex min-h-screen">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <Activity className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">MediSync</h1>
      </div>

      <div className="p-6 flex-1">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Doctor's Console</p>
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => setActiveTab('consultation')}
              className={`w-full flex items-center gap-3 text-sm font-bold px-4 py-3 rounded-xl transition-all ${
                activeTab === 'consultation' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Stethoscope className="w-5 h-5" /> Consultation
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center gap-3 text-sm font-bold px-4 py-3 rounded-xl transition-all ${
                activeTab === 'staff' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <UserCog className="w-5 h-5" /> Staff Management
            </button>
          </li>
          {/* ... Consultation aur Staff wale buttons ke theek neechay yeh add karo ... */}
          <li>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 text-sm font-bold px-4 py-3 rounded-xl transition-all ${
                activeTab === 'history' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Users className="w-5 h-5" /> Patient History
            </button>
          </li>
        </ul>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="mb-4">
          <p className="text-sm font-bold text-slate-800">{userName || "Doctor"}</p>
          <p className="text-xs font-medium text-emerald-600">{userRole || "Medical Officer"}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2.5 rounded-xl transition-all border border-transparent hover:border-red-100"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}