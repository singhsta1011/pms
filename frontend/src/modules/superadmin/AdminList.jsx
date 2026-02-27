import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminList(){

  const [admins,setAdmins] = useState([]);
  const navigate = useNavigate();

  const load = async ()=>{
    const res = await api.get("/hotels");
    setAdmins(res.data?.data || []);
  };

  useEffect(()=>{ load(); },[]);

  /* ================= TOGGLE STATUS ================= */

  const toggleStatus = async(id)=>{
    try{
      await api.patch(`/hotels/${id}/status`);
      load();
    }catch(err){
      console.log(err);
    }
  };

  return(
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Admin Control Panel
      </h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">

          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Hotel</th>
              <th>Code</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {admins.map(a=>(

              <tr key={a.id} className="border-t">
                <td className="p-3">{a.name}</td>
                <td>{a.hotelCode}</td>
                <td>{a.city}</td>

                {/* STATUS */}
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      a.status==="ACTIVE"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="space-x-3">

                  <button
                    onClick={()=>navigate(`/superadmin/edit/${a.id}`)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={()=>navigate(`/superadmin/modules/${a.id}`)}
                    className="text-purple-600"
                  >
                    Modules
                  </button>

                  <button
                    onClick={()=>navigate(`/superadmin/roomlimit/${a.id}`)}
                    className="text-yellow-600"
                  >
                    Rooms
                  </button>

                  {/* ⭐ NOW ONLY TOGGLE STATUS */}
                  <button
                    onClick={()=>toggleStatus(a.id)}
                    className={`${
                      a.status==="ACTIVE"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {a.status==="ACTIVE" ? "Suspend" : "Activate"}
                  </button>

                </td>

              </tr>

            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}