"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, UserPlus, LogOut, Activity, LayoutDashboard, 
  ClipboardList, CheckCircle, AlertCircle, Clock, 
  Search, XCircle, Printer 
} from "lucide-react";
import { io } from "socket.io-client"; // Real-time sync ke liye Socket.io

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Socket State
  const [socket, setSocket] = useState(null);

  // Patient Form States
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Data States
  const [patientsList, setPatientsList] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [printData, setPrintData] = useState(null);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchPatients = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/patients", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatientsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch queue", err);
    }
  };

  // --- SOCKET.IO & INITIAL DATA LOAD ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/");
    } else {
      setUserName(name || "Staff");
      setUserRole(role || "Receptionist");
      setIsAuthChecking(false);
      fetchPatients(token);

      // Walkie-Talkie Connect karo
      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);

      // Jab server kahe ke "Queue Refresh karo", toh list update kar lo
      newSocket.on("queue_refreshed", () => {
        console.log("Live Update Received from Server!");
        fetchPatients(token);
      });

      // Component close hone par connection tor do taa ke memory leak na ho
      return () => newSocket.disconnect();
    }
  }, [router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handleCancelToken = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this token? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccessMsg("Token cancelled successfully!");
        fetchPatients(token); 
        socket?.emit("update_queue"); // Live Sync: Sabko batao ke patient cancel ho gaya
        setTimeout(() => setSuccessMsg(""), 3000); 
      } else {
        const data = await res.json();
        setErrorMsg(data.message || "Failed to cancel token.");
      }
    } catch (err) {
      setErrorMsg("Server error while cancelling.");
    }
  };

  // --- PRINT LOGIC ---
  const handlePrintToken = (patient) => {
    setPrintData(patient);
    setTimeout(() => {
      window.print();
    }, 100); 
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    
    // Validations
    if (patientPhone.length !== 11) {
      setErrorMsg("Phone number must be exactly 11 digits.");
      return;
    }
    if (patientName.trim().length < 3) {
      setErrorMsg("Please enter a valid full name.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/patients/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: patientName, phone: patientPhone }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`Success! Token #${data.patient.tokenNumber} assigned to ${data.patient.name}.`);
        setPatientName("");
        setPatientPhone("");
        fetchPatients(token);
        socket?.emit("update_queue"); // Live Sync: Doctor ko batao ke naya patient aaya hai
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        setErrorMsg(data.message || "Failed to register patient.");
      }
    } catch (err) {
      setErrorMsg("Server error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination & Search Logic
  const filteredPatients = patientsList.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    patient.phone.includes(searchQuery) ||
    patient.tokenNumber.toString().includes(searchQuery)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-primary font-medium">Verifying Access...</div>;
  }

  return (
    <>
      {/* --- MAIN DASHBOARD (Print hone par hide ho jayega) --- */}
      <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 print:hidden">
        
        {/* SIDEBAR */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm hidden md:flex">
          <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">MediSync</h1>
          </div>

          <div className="p-6 flex-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Main Menu</p>
            <ul className="space-y-2">
              <li>
                <button className="w-full flex items-center gap-3 text-sm bg-primary/10 text-primary font-medium px-4 py-3 rounded-xl border border-primary/20 transition-all">
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </button>
              </li>
              <li>
                <button className="w-full flex items-center gap-3 text-sm text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 px-4 py-3 rounded-xl transition-all">
                  <ClipboardList className="w-5 h-5" /> Active Queue
                </button>
              </li>
            </ul>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-800">{userName}</p>
              <p className="text-xs font-medium text-slate-500">{userRole}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2.5 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reception Desk</h2>
              <p className="text-slate-500 mt-1 font-medium">Manage patients and live queue tokens clearly.</p>
            </div>
            
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm w-fit">
              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Queue Total</p>
                <p className="text-2xl font-bold text-slate-900">{patientsList.length}</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ADD NEW PATIENT FORM */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm h-fit"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">New Patient</h3>
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

              <form onSubmit={handleAddPatient} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={patientName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setPatientName(val);
                    }}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="e.g. Ali Khan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    value={patientPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setPatientPhone(val);
                    }}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="03001234567"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Exactly 11 digits required</p>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading || patientPhone.length !== 11 || patientName.length < 3}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : (
                    <>Generate Token <Activity className="w-5 h-5" /></>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* ACTIVE QUEUE LIST */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-100 pb-4 gap-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-primary" /> Active Queue
                </h3>
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or token..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="bg-slate-50 p-6 rounded-full border border-slate-100 mb-4">
                    <ClipboardList className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No patients found</h3>
                  <p className="text-sm font-medium text-slate-500 mt-2">Try a different search or register a new patient.</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1 justify-between">
                  <div className="space-y-3">
                    {currentItems.map((patient, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={patient._id} 
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all bg-slate-50 hover:bg-white group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">
                            {patient.tokenNumber}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{patient.name}</h4>
                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> 
                              {new Date(patient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              <span className="mx-1">•</span>
                              {patient.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                            patient.status === 'Active' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {patient.status === 'Active' ? 'In Consultation' : 'Waiting'}
                          </div>
                          
                          {/* Print Button */}
                          <button 
                            onClick={() => handlePrintToken(patient)}
                            className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all p-1.5" 
                            title="Print Token Receipt"
                          >
                            <Printer className="w-5 h-5" />
                          </button>

                          {/* Cancel Button */}
                          <button 
                            onClick={() => handleCancelToken(patient._id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all p-1.5" 
                            title="Cancel Token"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-slate-100">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={`w-10 h-10 rounded-full font-bold text-sm transition-all flex items-center justify-center ${
                            currentPage === i + 1
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-110"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>

      {/* --- PRINTABLE RECEIPT --- */}
      {printData && (
        <div className="hidden print:flex print:fixed print:inset-0 print:bg-white print:text-black print:z-50 items-start justify-center pt-10">
          <div className="max-w-xs w-full mx-auto text-center border-2 border-dashed border-gray-400 p-8 rounded-xl font-sans">
            <div className="flex justify-center mb-2">
               <Activity className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-black mb-1 tracking-tight">MediSync Clinic</h2>
            <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest font-bold">Official Receipt</p>
            
            <p className="text-sm font-bold text-gray-600 mb-2">Your Token Number</p>
            <div className="text-7xl font-black mb-6 py-4 border-y-2 border-gray-200">
              {printData.tokenNumber}
            </div>
            
            <p className="text-xl font-bold uppercase">{printData.name}</p>
            <p className="text-sm text-gray-600 mt-1">Ph: {printData.phone}</p>
            
            <div className="my-6 border-t-2 border-dashed border-gray-300"></div>
            
            <p className="text-xs font-bold text-gray-500 mb-1">Date & Time Generated</p>
            <p className="text-sm font-bold">
              {new Date(printData.createdAt).toLocaleDateString()} at {new Date(printData.createdAt).toLocaleTimeString()}
            </p>
            
            <p className="text-xs font-bold mt-8 p-3 bg-gray-100 rounded-lg">
              Please wait in the waiting area until your token is called on the screen.
            </p>
          </div>
        </div>
      )}
    </>
  );
}