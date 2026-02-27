import { NavLink } from "react-router-dom";
import { menuConfig } from "../layout/menu.config";
import useAuth from "../modules/auth/useAuth";
import { LogOut } from "lucide-react";

export default function SuperAdminSidebar(){

  const { user, logout } = useAuth();

  return(
    <div className="w-[240px] bg-white border-r h-full flex flex-col">

      <div className="p-4 font-semibold text-lg border-b">
        Super Admin
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">

        {menuConfig
          .filter(m => !m.hidden)
          .map((item)=>{

            if(item.roles && !item.roles.includes(user?.role)){
              return null;
            }

            const Icon = item.icon;

            return(
              <div key={item.path || item.name}>

                {/* ===== MAIN MENU ===== */}
                {item.path && (
                  <NavLink
                    to={`/superadmin/${item.path}`}
                    className={({isActive}) =>
                      `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-100"
                      }`
                    }
                  >
                    {Icon && <Icon size={18}/>}
                    <span>{item.name}</span>
                  </NavLink>
                )}

                {/* ===== CHILD ROUTES ===== */}
                {item.children?.map(child=>{

                  if(child.hidden) return null;
                  if(child.roles && !child.roles.includes(user?.role)){
                    return null;
                  }

                  return(
                    <NavLink
                      key={child.path}
                      to={`/superadmin/${item.path}/${child.path}`}
                      className={({isActive}) =>
                        `flex items-center gap-3 px-6 py-2 text-sm rounded-lg ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "hover:bg-gray-100"
                        }`
                      }
                    >
                      {child.name}
                    </NavLink>
                  );
                })}

              </div>
            );
        })}

      </div>

      <div className="border-t p-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={18}/>
          Logout
        </button>
      </div>

    </div>
  );
}