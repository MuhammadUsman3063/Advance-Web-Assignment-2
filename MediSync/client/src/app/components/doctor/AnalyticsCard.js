"use client";

// REFACTORING: Extract Component
// Humne ek generic card bana liya hai jo props ke zariye koi bhi data accept kar sakta hai.
export default function AnalyticsCard({ title, value, icon, bgColor, textColor }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`p-4 rounded-2xl ${bgColor}`}>
        {/* Dynamic Icon and Color */}
        <div className={textColor}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
      </div>
    </div>
  );
}