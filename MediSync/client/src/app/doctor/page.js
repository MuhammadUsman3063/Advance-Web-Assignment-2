"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DoctorSidebar from "./../components/doctor/DoctorSidebar";
import DoctorQueueList from "./../components/doctor/DoctorQueueList";
import CurrentPatientCard from "./../components/doctor/CurrentPatientCard";
import StaffManagement from "./../components/doctor/StaffManagement";
import PatientHistoryPanel from "./../components/doctor/PatientHistoryPanel"; // NAYA COMPONENT IMPORT KIYA
import { io } from "socket.io-client";

export default function DoctorDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  const [socket, setSocket] = useState(null);
  const [patientsList, setPatientsList] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);

  // TAB STATE: Decide karta hai ke kya show karna hai
  const [activeTab, setActiveTab] = useState('consultation');

  const currentPatient = patientsList.find(p => p.status === 'Active');

  const fetchPatients = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/patients", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPatientsList(data);
    } catch (err) {
      console.error("Failed to fetch queue", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    
    if (!token) {
      router.push("/");
    } else {
      setUserName(name || "Dr. Usman");
      setUserRole("Medical Officer"); 
      setIsAuthChecking(false);
      fetchPatients(token);

      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);

      newSocket.on("queue_refreshed", () => {
        fetchPatients(token);
      });

      return () => newSocket.disconnect();
    }
  }, [router]);

  const handleCallNext = async () => {
    setLoadingAction(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/patients/next", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchPatients(token);
        socket?.emit("update_queue");
      }
    } catch (err) {
      console.error("Failed to call next patient", err);
    } finally {
      setLoadingAction(false);
    }
  };

  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center font-medium text-emerald-600">Loading Console...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {/* Sidebar mein tab states pass kiye hain */}
      <DoctorSidebar userName={userName} userRole={userRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8 border-b border-slate-200 pb-6 flex justify-between items-end">
          <div>
            {/* DYNAMIC HEADER TITLE */}
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'consultation' && "Doctor's Consultation Room"}
              {activeTab === 'staff' && "Staff Administration"}
              {activeTab === 'history' && "Clinic Analytics & History"}
            </h2>
            {/* DYNAMIC HEADER SUBTITLE */}
            <p className="text-slate-500 mt-1 font-medium">
              {activeTab === 'consultation' && "Manage your active queue and call patients."}
              {activeTab === 'staff' && "Create and manage receptionist accounts securely."}
              {activeTab === 'history' && "Review past patient records and clinic performance."}
            </p>
          </div>
          
          {/* LIVE SYNC BADGE (Sirf Consultation tab mein show hoga) */}
          {activeTab === 'consultation' && (
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-emerald-700">Live Sync Active</span>
            </div>
          )}
        </header>

        {/* --- CONDITIONAL RENDERING FOR ALL 3 TABS --- */}
        
        {activeTab === 'consultation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                  <CurrentPatientCard currentPatient={currentPatient} onCallNext={handleCallNext} loading={loadingAction} />
              </div>
              <div className="lg:col-span-1">
                   <DoctorQueueList patients={patientsList} />
              </div>
          </div>
        )}

        {activeTab === 'staff' && <StaffManagement />}

        {activeTab === 'history' && <PatientHistoryPanel />}

      </div>
    </div>
  );
}