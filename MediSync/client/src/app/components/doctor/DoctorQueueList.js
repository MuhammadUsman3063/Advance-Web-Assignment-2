"use client";

import { ClipboardList, Clock } from "lucide-react";

export default function DoctorQueueList({ patients }) {
  // Sirf wo patients filter karo jo abhi wait kar rahe hain (Pending)
  const waitingPatients = patients.filter(p => p.status === 'Pending');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-emerald-600" /> Waiting Queue
        </h3>
        <span className="bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full border border-emerald-100">
          {waitingPatients.length} Left
        </span>
      </div>

      {waitingPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center min-h-[200px]">
          <div className="bg-slate-50 p-4 rounded-full mb-3">
            <ClipboardList className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium text-sm">No patients waiting.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2 max-h-[400px]">
          {waitingPatients.map((patient) => (
            <div key={patient._id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-emerald-200 transition-all">
              <div className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {patient.tokenNumber}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{patient.name}</h4>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {new Date(patient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}