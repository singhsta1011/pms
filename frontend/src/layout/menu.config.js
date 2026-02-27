import {
  LayoutDashboard,
  CalendarDays,
  BookOpenCheck,
  BedDouble,
  Wallet,
  ShieldCheck
} from "lucide-react";

import Dashboard from "../modules/dashboard";
import DayTimeline from "../modules/stayview/DayTimeline";
import HourTimeline from "../modules/stayview/HourTimeline";
import Bookings from "../modules/bookings";
import Rooms from "../modules/rooms";
import Finance from "../modules/finance";

/* 👑 SUPER ADMIN PAGES */
import AdminManagement from "../modules/superadmin/AdminManagement";
import AdminList from "../modules/superadmin/AdminList";
import EditAdmin from "../modules/superadmin/EditAdmin";
import AssignModules from "../modules/superadmin/AssignModules";
import RoomLimit from "../modules/superadmin/RoomLimit";

/* ⭐ HOTEL ADMIN USER MANAGEMENT */
import UserManagement from "../modules/hoteladmin/UserManagement";

/*
🔥 VERY IMPORTANT FIXES APPLIED

✔ All paths are RELATIVE
✔ No leading "/"
✔ Children are RELATIVE to parent
✔ Compatible with nested layouts
*/

export const menuConfig = [

  /* =====================================================
     👑 SUPER ADMIN ROOT
  ===================================================== */

  {
    name:"Admin Management",
    path:"admins",
    icon:ShieldCheck,
    roles:["SUPER_ADMIN"],
    component:AdminManagement,

    children:[
      {
        name:"Admin List",
        path:"list",
        roles:["SUPER_ADMIN"],
        component:AdminList,
        hidden:true
      },
      {
        name:"Edit Admin",
        path:"edit/:id",
        roles:["SUPER_ADMIN"],
        component:EditAdmin,
        hidden:true
      },
      {
        name:"Assign Modules",
        path:"modules/:id",
        roles:["SUPER_ADMIN"],
        component:AssignModules,
        hidden:true
      },
      {
        name:"Room Limit",
        path:"roomlimit/:id",
        roles:["SUPER_ADMIN"],
        component:RoomLimit,
        hidden:true
      }
    ]
  },

  /* =====================================================
     ⭐ HOTEL ADMIN ONLY
  ===================================================== */

  {
    name:"User Management",
    path:"users",
    icon:ShieldCheck,
    roles:["SUPER_ADMIN","HOTEL_ADMIN"],
    module:"PMS",
    component:UserManagement
  },

  /* =====================================================
     ⭐ DASHBOARD
  ===================================================== */

  {
    name:"Dashboard",
    path:"dashboard",
    icon:LayoutDashboard,
    roles:[
      "SUPER_ADMIN",
      "HOTEL_ADMIN",
      "USER",
      "RECEPTIONIST",
      "HOUSEKEEPING",
      "ACCOUNTANT",
      "MANAGER"
    ],
    module:"PMS",
    component:Dashboard
  },

  /* =====================================================
     ⭐ STAY VIEW
  ===================================================== */

  {
  name:"Stay View",
  path:"stayview",   // ⭐ ADD THIS
  icon:CalendarDays,
  roles:[
    "SUPER_ADMIN",
    "HOTEL_ADMIN",
    "USER"
  ],
  module:"PMS",
  children:[
    {
      name:"Day Timeline",
      path:"day",     // ⭐ RELATIVE
      component:DayTimeline
    },
    {
      name:"Hourly Timeline",
      path:"hour",    // ⭐ RELATIVE
      component:HourTimeline
    }
  ]
},

  /* =====================================================
     ⭐ BOOKINGS
  ===================================================== */

  {
    name:"Bookings",
    path:"bookings",
    icon:BookOpenCheck,
    roles:[
      "SUPER_ADMIN",
      "HOTEL_ADMIN",
      "USER",
      "RECEPTIONIST",
      "MANAGER"
    ],
    module:"PMS",
    component:Bookings
  },

  /* =====================================================
     ⭐ ROOMS
  ===================================================== */

  {
    name:"Rooms",
    path:"rooms",
    icon:BedDouble,
    roles:[
      "SUPER_ADMIN",
      "HOTEL_ADMIN",
      "USER",
      "HOUSEKEEPING",
      "MANAGER"
    ],
    module:"PMS",
    component:Rooms
  },

  /* =====================================================
     ⭐ FINANCE
  ===================================================== */

  {
    name:"Finance",
    path:"finance",
    icon:Wallet,
    roles:["SUPER_ADMIN"],
    component:Finance
  }

];