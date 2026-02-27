import { useState } from "react";
import StatsCards from "./StatsCards";
import HotelTable from "./components/HotelTable";
import CreateHotelDrawer from "./components/CreateHotelDrawer";

export default function Hotels() {

  const [open,setOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">

      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Super Admin PMS Dashboard
        </h1>

        <button
          onClick={()=>setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Create Hotel
        </button>
      </div>

      <StatsCards />

      <HotelTable />

      <CreateHotelDrawer open={open} setOpen={setOpen}/>
    </div>
  );
}