import { useEffect, useState } from "react";
import { api } from "../../services/api";

import CreateUserDrawer from "./CreateUserDrawer";
import EditUserDrawer from "./EditUserDrawer";
import AssignUserModules from "./AssignUserModules";

export default function UserManagement(){

  const [users,setUsers] = useState([]);
  const [loading,setLoading] = useState(true);

  const [openCreate,setOpenCreate] = useState(false);
  const [editUser,setEditUser] = useState(null);
  const [moduleUser,setModuleUser] = useState(null);

  /* =================================================
     ⭐ LOAD USERS
  ================================================= */

  const loadUsers = async()=>{
    try{
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data?.data || []);
    }catch(err){
      console.log("User load error:",err?.response?.data || err);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    loadUsers();
  },[]);

  /* =================================================
     ⭐ STATUS TOGGLE
  ================================================= */

  const toggleStatus = async(id)=>{
    try{
      await api.patch(`/users/${id}/status`);
      loadUsers();
    }catch(err){
      console.log("Toggle error:",err?.response?.data || err);
    }
  };

  /* =================================================
     ⭐ ROLE COLORS (ENTERPRISE STYLE)
  ================================================= */

  const roleColor = {
    RECEPTIONIST:"bg-blue-100 text-blue-600",
    HOUSEKEEPING:"bg-purple-100 text-purple-600",
    ACCOUNTANT:"bg-yellow-100 text-yellow-700",
    MANAGER:"bg-indigo-100 text-indigo-600"
  };

  /* =================================================
     ⭐ UI
  ================================================= */

  return(
    <div className="flex w-full">

      {/* ================= MAIN CONTENT ================= */}
      <div
        className={`
          flex-1 transition-all duration-300
          ${openCreate || editUser || moduleUser ? "pr-[420px]" : ""}
        `}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-6">

          {/* ================= HEADER ================= */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">
              User Management
            </h1>

            <button
              onClick={()=>setOpenCreate(true)}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg shadow-sm"
            >
              + Create User
            </button>
          </div>

          {/* ================= TABLE CARD ================= */}

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">
                <tr className="text-gray-600">
                  <th className="p-4 text-left">Name</th>
                  <th>Email</th>
                  <th>Staff Role</th>
                  <th>Status</th>
                  <th className="text-right pr-6">Actions</th>
                </tr>
              </thead>

              <tbody>

                {/* ================= LOADING ================= */}
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                )}

                {/* ================= EMPTY ================= */}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400">
                      No staff created yet
                    </td>
                  </tr>
                )}

                {/* ================= ROWS ================= */}
                {!loading && users.map(u=>(
                  <tr
                    key={u.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">
                      {u.name}
                    </td>

                    <td className="text-gray-600">
                      {u.email}
                    </td>

                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        roleColor[u.roleType] || "bg-gray-100 text-gray-600"
                      }`}>
                        {u.roleType || "STAFF"}
                      </span>
                    </td>

                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.status==="ACTIVE"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="text-right pr-6 space-x-4">
                      <button
                        onClick={()=>setEditUser(u)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>

                      {/* <button
                        onClick={()=>setModuleUser(u)}
                        className="text-purple-600 hover:underline"
                      >
                        Modules
                      </button> */}

                      {/* <button
                        onClick={()=>toggleStatus(u.id)}
                        className="text-orange-600 hover:underline"
                      >
                        Toggle
                      </button> */}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>

          </div>

        </div>
      </div>

      {/* ================= DRAWERS ================= */}

      {openCreate && (
        <CreateUserDrawer
          onClose={()=>setOpenCreate(false)}
          reload={loadUsers}
        />
      )}

      {editUser && (
        <EditUserDrawer
          user={editUser}
          onClose={()=>setEditUser(null)}
          reload={loadUsers}
        />
      )}

      {moduleUser && (
        <AssignUserModules
          user={moduleUser}
          onClose={()=>setModuleUser(null)}
          reload={loadUsers}
        />
      )}

    </div>
  );
}