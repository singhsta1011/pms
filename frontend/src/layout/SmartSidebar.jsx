import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpenCheck,
  BedDouble,
  Wallet,
  ChevronDown,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck
} from "lucide-react";

import useAuth from "../modules/auth/useAuth";

/* =====================================================
   ⭐ ENTERPRISE MENU CONFIG (SIDEBAR ONLY)
   ✔ Clean paths
   ✔ No blur
   ✔ Correct routing
===================================================== */

const menuConfig = [

  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    module: "PMS"
  },

  {
    name: "Stay View",
    icon: CalendarDays,
    module: "PMS",
    children: [
      { name: "Day Timeline", path: "/stayview/day" },
      { name: "Hourly Timeline", path: "/stayview/hour" }
    ]
  },

  {
    name: "Bookings",
    path: "/bookings",
    icon: BookOpenCheck,
    module: "PMS"
  },

  {
    name: "Rooms",
    path: "/rooms",
    icon: BedDouble,
    module: "PMS"
  },

  {
    name: "User Management",
    path: "/users",
    icon: ShieldCheck,
    module: "PMS"
  },

  {
    name: "Finance",
    path: "/finance",
    icon: Wallet,
    module: "PMS"
  },

  {
    name: "Housekeeping",
    path: "/housekeeping",
    icon: CalendarDays,
    permission: "HOUSEKEEPING"
  }
];

export default function SmartSidebar() {

  const location = useLocation();

  const {
    logout,
    user,
    hasModule,
    hasPermission
  } = useAuth();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hoverExpand, setHoverExpand] = useState(false);

  const expanded = !collapsed || hoverExpand;

  /* =====================================================
     ⭐ FILTER BASED ON ROLE + MODULE
  ===================================================== */

  const menus = menuConfig.filter((m) => {

    if (user?.role === "SUPER_ADMIN") return true;

    if (m.module && !hasModule?.(m.module)) return false;

    if (m.permission && !hasPermission?.(m.permission)) return false;

    return true;
  });

  /* =====================================================
     ⭐ AUTO OPEN DROPDOWN
  ===================================================== */

  useEffect(() => {

    const activeMenu = menus.find(m =>
      m.children?.some(c =>
        location.pathname.startsWith(`/app${c.path}`)
      )
    );

    if (activeMenu) setOpenDropdown(activeMenu.name);

  }, [location.pathname, menus]);

  return (
    <div
      onMouseEnter={() => collapsed && setHoverExpand(true)}
      onMouseLeave={() => setHoverExpand(false)}
      className={`
        h-screen bg-white border-r flex flex-col transition-all duration-300 overflow-hidden
        ${expanded ? "w-64" : "w-20"}
      `}
    >

      {/* ================= HEADER ================= */}

      <div className="h-16 flex items-center justify-between px-4 border-b">

        {expanded && (
          <h2 className="text-lg font-semibold text-gray-800">
            PMS Console
          </h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          {collapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}
        </button>
      </div>

      {/* ================= MENU ================= */}

      <div className="flex-1 py-4 space-y-1 overflow-y-auto">

        {menus.map((m) => {

          const Icon = m.icon;

          /* ================= DROPDOWN ================= */

          if (m.children) {

            const isActiveChild = m.children.some(c =>
              location.pathname.startsWith(`/app${c.path}`)
            );

            return (
              <div key={m.name}>

                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === m.name ? null : m.name)
                  }
                  className={`
                    w-full flex items-center justify-between
                    px-4 py-3 mx-1 rounded-xl transition
                    ${
                      isActiveChild
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  <div className={`flex items-center ${expanded ? "gap-3" : "justify-center w-full"}`}>
                    <Icon size={18}/>
                    {expanded && <span>{m.name}</span>}
                  </div>

                  {expanded && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        openDropdown === m.name ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {expanded && openDropdown === m.name && (
                  <div className="mt-1 space-y-1 pb-1">

                    {m.children.map((c) => (
                      <NavLink
                        key={c.path}
                        to={`/app${c.path}`}
                        className={({ isActive }) =>
                          `block px-10 py-2 mx-1 text-sm rounded-lg transition
                          ${
                            isActive
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "text-gray-500 hover:bg-gray-100"
                          }`
                        }
                      >
                        {c.name}
                      </NavLink>
                    ))}

                  </div>
                )}

              </div>
            );
          }

          /* ================= NORMAL MENU ================= */

          return (
            <NavLink
              key={m.path}
              to={`/app${m.path}`}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-1 rounded-xl transition
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={18}/>
              {expanded && <span className="ml-3">{m.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* ================= USER PANEL ================= */}

      <div className="border-t p-3 bg-gray-50">

        <div className="flex items-center gap-3 px-2 mb-3">

          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={18} className="text-blue-600"/>
          </div>

          {expanded && (
            <div className="flex flex-col text-sm">
              <span className="font-semibold text-gray-700">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-gray-400">
                {user?.role || "PMS Console"}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={18}/>
          {expanded && "Logout"}
        </button>

        {expanded && (
          <div className="text-xs text-gray-400 mt-2 px-2">
            PMS v1.0
          </div>
        )}
      </div>

    </div>
  );
}