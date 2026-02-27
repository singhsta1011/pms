import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import { Outlet } from "react-router-dom";
import { useState } from "react";

/*
🔥 ENTERPRISE LAYOUT (SCROLL SAFE)
✔ Sidebar fixed
✔ Header fixed
✔ Content scrollable
✔ Timeline horizontal scroll works
*/

export default function SuperAdminLayout() {

  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="h-full">
        <SuperAdminSidebar />
      </div>

      {/* RIGHT SECTION */}
      <div
        className={`
          flex-1 flex flex-col min-w-0
          transition-all duration-300
          ${openDrawer ? "pr-[440px]" : ""}
        `}
      >

        {/* HEADER */}
        <div className="flex-shrink-0">
          <SuperAdminHeader setOpenDrawer={setOpenDrawer} />
        </div>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          <Outlet context={{ openDrawer, setOpenDrawer }} />
        </main>

      </div>

    </div>
  );
}