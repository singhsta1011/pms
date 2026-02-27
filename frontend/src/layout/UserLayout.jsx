import { Outlet } from "react-router-dom";

/*
   👤 USER APP LAYOUT
   (Simple minimal layout)
*/

export default function UserLayout() {

  return (
    <div className="min-h-screen bg-gray-50">

      {/* USER HEADER (optional later) */}
      <div className="h-14 bg-white border-b flex items-center px-6 font-semibold">
        PMS User Panel
      </div>

      {/* 👇 VERY IMPORTANT */}
      <div className="p-6">
        <Outlet />
      </div>

    </div>
  );
}