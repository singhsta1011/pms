import { Outlet } from "react-router-dom";
import { useState } from "react";
import SmartSidebar from "./SmartSidebar";
import TopGlobalBar from "./TopGlobalBar";

export default function MainLayout() {

  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">

      {/* MOBILE OVERLAY */}
      {openDrawer && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpenDrawer(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed lg:relative z-50 h-full
          transition-transform duration-300
          ${openDrawer ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <SmartSidebar closeSidebar={() => setOpenDrawer(false)} />
      </div>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}
        <TopGlobalBar toggleSidebar={() => setOpenDrawer(true)} />

        {/* CONTENT */}
        <main className="flex-1 min-w-0 overflow-hidden p-3 sm:p-4 md:p-6">
          <div className="h-full w-full overflow-auto">
            <Outlet context={{ openDrawer, setOpenDrawer }} />
          </div>
        </main>

      </div>

    </div>
  );
}