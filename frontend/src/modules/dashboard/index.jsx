import KPICard from "../../components/pms/KPIBox";
import LiveActivityPanel from "../../components/pms/LiveActivityPanel";
import {
  Activity,
  Wallet,
  LogIn,
  LogOut,
} from "lucide-react";

export default function Dashboard() {
  // later fetch from backend API
  const stats = [
    {
      title: "Occupancy Today",
      value: "72%",
      icon: Activity,
      color: "bg-green-500",
    },
    {
      title: "Revenue Today",
      value: "₹84,000",
      icon: Wallet,
      color: "bg-blue-500",
    },
    {
      title: "Arrivals",
      value: "18 Guests",
      icon: LogIn,
      color: "bg-purple-500",
    },
    {
      title: "Departures",
      value: "9 Guests",
      icon: LogOut,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">

  <h1 className="text-xl font-semibold text-[#2E3A59]">
    Dashboard Overview
  </h1>

  {/* KPI STRIP */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    {stats.map((item, i) => (
      <KPICard key={i} {...item} />
    ))}
  </div>

  {/* 🔥 ENTERPRISE GRID */}
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-sm">
      <p className="text-gray-500">Stay timeline or chart goes here...</p>
    </div>

    <LiveActivityPanel />
  </div>

</div>
  );
}
