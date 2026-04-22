"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CalendarDays, Users, TrendingUp, Clock, Activity, XCircle, Filter } from "lucide-react";
// 1. WebSocket import kiya
import { io } from "socket.io-client"; 

export default function PatientHistoryPanel() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Data laane wala function alag kar diya taake bar bar call kar sakein
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/patients/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Page load hotay hi pehli dafa data lao
    fetchHistory();

    // 🌟 THE REAL-TIME MAGIC (Socket.io) 🌟
    // 2. Backend se connection joro
    const socket = io("http://localhost:5000"); 

    // 3. Jab bhi backend 'queue_refreshed' ka ishara de, chup chap naya data le aao!
    socket.on("queue_refreshed", () => {
      console.log("Real-time update received! Fetching fresh data...");
      fetchHistory(); 
    });

    // 4. Jab component band ho toh connection tor do (Memory leak se bachne ke liye)
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDate]);

  const getLocalYYYYMMDD = (dateString) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredHistory = history.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      patient.phone.includes(searchQuery) ||
      (patient.tokenNumber && patient.tokenNumber.toString().includes(searchQuery));

    let matchesDate = true;
    if (selectedDate) {
      const patientDate = getLocalYYYYMMDD(patient.archivedAt);
      matchesDate = patientDate === selectedDate;
    }

    return matchesSearch && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPatients = filteredHistory.length;
  const completedPatients = filteredHistory.filter(p => p.status === 'Completed').length;
  const completionRate = totalPatients > 0 ? Math.round((completedPatients / totalPatients) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all">
          <div className="bg-blue-50 p-4 rounded-2xl"><Users className="w-8 h-8 text-blue-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {selectedDate ? "Total on Date" : "Total Lifetime"}
            </p>
            <h3 className="text-3xl font-black text-slate-900">{totalPatients}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all">
          <div className="bg-emerald-50 p-4 rounded-2xl"><TrendingUp className="w-8 h-8 text-emerald-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Successfully Treated</p>
            <h3 className="text-3xl font-black text-slate-900">{completedPatients}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all">
          <div className="bg-purple-50 p-4 rounded-2xl"><Activity className="w-8 h-8 text-purple-600" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completion Rate</p>
            <h3 className="text-3xl font-black text-slate-900">{completionRate}%</h3>
          </div>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        
        {/* HEADER CONTROLS */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 whitespace-nowrap">
            <CalendarDays className="w-6 h-6 text-emerald-600" /> Patient Archive
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Filter className="w-5 h-5" />
                </div>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium text-slate-700 cursor-pointer"
                />
              </div>
              
              {selectedDate && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedDate("")}
                  className="bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 p-2 rounded-xl transition-all"
                  title="Clear Date Filter"
                >
                  <XCircle className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-8">Date</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Token</th>
                <th className="p-4 pr-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Loading records...</td></tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <CalendarDays className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-medium text-lg text-slate-600">No records found.</p>
                      {selectedDate && <p className="text-sm mt-1">Try selecting a different date or clearing the filter.</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((record) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={record._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-8 font-medium text-slate-600 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(record.archivedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 font-bold text-slate-900">{record.name}</td>
                    <td className="p-4 text-slate-600">{record.phone}</td>
                    <td className="p-4 font-bold text-slate-500">#{record.tokenNumber}</td>
                    <td className="p-4 pr-8">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        record.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-6 border-t border-slate-100 bg-white">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`w-10 h-10 rounded-full font-bold text-sm transition-all flex items-center justify-center ${
                  currentPage === i + 1
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-110"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}