import { Bell, ChevronDown, Activity, Plus } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function TopGlobalBar() {

  const location = useLocation();

  const user = {
    name: "Super Admin",
    role: "SUPER_ADMIN",
    hotel: "Taj Resort",
    occupancy: 72,
    revenue: "₹84,000",
  };

  const showCreateHotelBtn =
    user.role === "SUPER_ADMIN" &&
    location.pathname.startsWith("/superadmin");

  /* 👑 THIS OPENS DRAWER */
  const openCreateHotel = () => {
    window.dispatchEvent(new Event("OPEN_CREATE_HOTEL"));
  };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">

      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-[#2E3A59]">
          {user.hotel}
          <span className="ml-3 text-xs px-2 py-1 rounded bg-blue-50 text-blue-600">
            {user.role}
          </span>
        </h1>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Activity size={14} className="text-green-500" />
            Occupancy {user.occupancy}%
          </span>

          <span>Revenue {user.revenue}</span>
        </div>
      </div>

      <div className="flex items-center gap-5">

        {showCreateHotelBtn && (
          <button
            onClick={openCreateHotel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm shadow-sm"
          >
            <Plus size={16}/>
            Create Hotel
          </button>
        )}

        <Bell size={18}/>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
            S
          </div>
          <ChevronDown size={16}/>
        </div>

      </div>
    </div>
  );
}