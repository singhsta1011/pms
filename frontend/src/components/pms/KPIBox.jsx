import { TrendingUp } from "lucide-react";

export default function KPICard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition">

      {/* LEFT CONTENT */}
      <div>
        <p className="text-xs text-gray-400 mb-1">{title}</p>
        <h2 className="text-xl font-semibold text-[#2E3A59]">
          {value}
        </h2>
      </div>

      {/* RIGHT ICON */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
      >
        {Icon ? <Icon size={18} className="text-white" /> : <TrendingUp />}
      </div>
    </div>
  );
}