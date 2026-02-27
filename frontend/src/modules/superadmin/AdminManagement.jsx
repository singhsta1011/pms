import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useOutletContext } from "react-router-dom";

export default function AdminManagement(){

  const { openDrawer, setOpenDrawer } = useOutletContext();

  const [admins,setAdmins] = useState([]);
  const [loading,setLoading] = useState(false);

  /* ⭐ NEW EDIT DRAWER STATE */
  const [editDrawer,setEditDrawer] = useState(false);
  const [editForm,setEditForm] = useState({});

  const [form,setForm] = useState({
    name:"",
    hotelCode:"",
    city:"",
    state:"",
    ownerName:"",
    adminEmail:"",
    adminPassword:"",
    modules:[],
    roomLimit:0
  });

  /* ================= LOAD HOTELS ================= */

  const loadAdmins = async ()=>{
    const res = await api.get("/hotels");
    setAdmins(res.data?.data || []);
  };

  useEffect(()=>{ loadAdmins(); },[]);

  const totalHotels = admins.length;
  const activeHotels = admins.filter(h=>h.status==="ACTIVE").length;
  const suspendedHotels = admins.filter(h=>h.status==="SUSPENDED").length;

  /* ================= OPEN EDIT DRAWER ================= */

  const openEditHotel=(hotel)=>{
    setEditForm({
      id:hotel.id,
      name:hotel.name,
      hotelCode:hotel.hotelCode,
      city:hotel.city,
      state:hotel.state,
      ownerName:hotel.ownerName || "",
      status:hotel.status
    });
    setEditDrawer(true);
  };

  /* ================= MODULE TOGGLE ================= */

  const toggleModule=(module)=>{
    setForm(prev=>{
      const exists = prev.modules.includes(module);
      return {
        ...prev,
        modules: exists
          ? prev.modules.filter(m=>m!==module)
          : [...prev.modules,module]
      };
    });
  };

  /* ================= ROOM LIMIT +/- ================= */

  const increaseRoom = ()=>{
    setForm(prev=>({...prev,roomLimit:Number(prev.roomLimit)+1}));
  };

  const decreaseRoom = ()=>{
    if(form.roomLimit>0){
      setForm(prev=>({...prev,roomLimit:Number(prev.roomLimit)-1}));
    }
  };

  /* ================= VALIDATION ================= */

  const validateForm = () => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;

    if(!form.name) return "Hotel Name is required";
    if(!form.hotelCode) return "Hotel Code is required";
    if(!form.city) return "City is required";
    if(!form.state) return "State is required";
    if(!form.ownerName) return "Owner Name is required";
    if(!form.roomLimit) return "Room Limit is required";

    if(!form.adminEmail) return "Admin Email is required";
    if(!emailRegex.test(form.adminEmail))
      return "Email must be like example@gmail.com";

    if(!form.adminPassword) return "Admin Password is required";

    if(form.modules.length===0)
      return "Select at least one module";

    return null;
  };

  /* ================= CREATE HOTEL ================= */

  const createAdmin = async()=>{

    const error = validateForm();

    if(error){
      alert(error);
      return;
    }

    try{
      setLoading(true);

      await api.post("/hotels",{
        hotelCode: form.hotelCode,
        name: form.name,
        email: form.adminEmail,
        phone:"",
        address:"",
        city: form.city,
        state: form.state,
        ownerName: form.ownerName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        modules: form.modules,
        roomLimit: Number(form.roomLimit)
      });

      alert("Hotel Created Successfully");

      setOpenDrawer(false);

      setForm({
        name:"",
        hotelCode:"",
        city:"",
        state:"",
        ownerName:"",
        adminEmail:"",
        adminPassword:"",
        modules:[],
        roomLimit:0
      });

      loadAdmins();

    }catch(err){
      console.log("Create Hotel Error:",err?.response?.data || err);
      alert(err?.response?.data?.message || "Create failed");
    }finally{
      setLoading(false);
    }
  };

  const toggleStatus = async(id)=>{
    await api.patch(`/hotels/${id}/status`);
    loadAdmins();
  };

  return(
    <div className="flex w-full">

      {/* ================= MAIN CONTENT ================= */}
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">
              Super Admin PMS Dashboard
            </h1>

            <button
              onClick={()=>setOpenDrawer(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              + Create Hotel
            </button>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-3 gap-4 mb-6">

            <div className="bg-white p-5 rounded-2xl border">
              <p className="text-xs text-gray-400">Total Hotels</p>
              <h2 className="text-xl font-semibold">{totalHotels}</h2>
            </div>

            <div className="bg-green-50 p-5 rounded-2xl border">
              <p className="text-xs text-green-600">Active</p>
              <h2 className="text-xl font-semibold">{activeHotels}</h2>
            </div>

            <div className="bg-red-50 p-5 rounded-2xl border">
              <p className="text-xs text-red-600">Suspended</p>
              <h2 className="text-xl font-semibold">{suspendedHotels}</h2>
            </div>

          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Hotel</th>
                  <th>Code</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>

              <tbody>
                {admins.map(a=>(
                  <tr key={a.id} className="border-t">
                    <td className="p-3 font-medium">{a.name}</td>
                    <td>{a.hotelCode}</td>
                    <td>{a.city}</td>
                    <td>
                      <button
                        onClick={()=>toggleStatus(a.id)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          a.status==="ACTIVE"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {a.status}
                      </button>
                    </td>

                    <td>
                      <button
                        onClick={()=>openEditHotel(a)}
                        className="text-blue-600 text-xs"
                      >
                        Edit
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ================= CREATE DRAWER (UNCHANGED) ================= */}
      <div className={`fixed top-0 right-0 h-full w-[440px] bg-white border-l shadow-2xl transition-transform duration-300 ${openDrawer ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex flex-col h-full">

          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Create New Hotel</h2>
            <button onClick={()=>setOpenDrawer(false)}>Close</button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">

            <input placeholder="Hotel Name" className="border p-2 rounded w-full"
              onChange={e=>setForm({...form,name:e.target.value})}/>

            <input placeholder="Hotel Code" className="border p-2 rounded w-full"
              onChange={e=>setForm({...form,hotelCode:e.target.value})}/>

            <input placeholder="City" className="border p-2 rounded w-full"
              onChange={e=>setForm({...form,city:e.target.value})}/>

            <input placeholder="State" className="border p-2 rounded w-full"
              onChange={e=>setForm({...form,state:e.target.value})}/>

            <input placeholder="Owner Name" className="border p-2 rounded w-full"
              onChange={e=>setForm({...form,ownerName:e.target.value})}/>

            <div>
              <p className="text-sm mb-1">Room Limit</p>
              <div className="flex items-center gap-2">
                <button onClick={decreaseRoom} className="px-3 py-1 bg-gray-200 rounded">-</button>
                <input value={form.roomLimit} readOnly className="border p-2 rounded w-full text-center"/>
                <button onClick={increaseRoom} className="px-3 py-1 bg-gray-200 rounded">+</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox"
                  checked={form.modules.includes("PMS")}
                  onChange={()=>toggleModule("PMS")}/>
                <span className="px-3 py-1 bg-blue-100 rounded">PMS</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox"
                  checked={form.modules.includes("HOUSEKEEPING")}
                  onChange={()=>toggleModule("HOUSEKEEPING")}/>
                <span className="px-3 py-1 bg-purple-100 rounded">Housekeeping</span>
              </label>
            </div>

            <input placeholder="Admin Email" className="border p-2 rounded w-full"
              onChange={e=>setForm({...form,adminEmail:e.target.value})}/>

            <input type="password" placeholder="Admin Password" className="border p-2 rounded w-full"
              onChange={e=>setForm({...form,adminPassword:e.target.value})}/>
          </div>

          <button
            onClick={createAdmin}
            className="mt-4 bg-blue-600 text-white py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Hotel"}
          </button>

        </div>
      </div>

      {/* ================= NEW EDIT DRAWER ================= */}
      {/* ================= PROFESSIONAL EDIT DRAWER ================= */}
<div
  className={`fixed top-0 right-0 h-full w-[440px] bg-white border-l shadow-2xl transition-transform duration-300 ${
    editDrawer ? "translate-x-0" : "translate-x-full"
  }`}
>
  <div className="p-6 flex flex-col h-full">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">
        Edit Hotel
      </h2>

      <button
        onClick={()=>setEditDrawer(false)}
        className="text-sm text-gray-500 hover:text-black"
      >
        Close
      </button>
    </div>

    {/* FORM */}
    <div className="space-y-4 flex-1 overflow-y-auto">

      <div>
        <p className="text-xs text-gray-400 mb-1">Hotel Name</p>
        <input
          value={editForm.name || ""}
          onChange={e=>setEditForm({...editForm,name:e.target.value})}
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1">City</p>
        <input
          value={editForm.city || ""}
          onChange={e=>setEditForm({...editForm,city:e.target.value})}
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1">State</p>
        <input
          value={editForm.state || ""}
          onChange={e=>setEditForm({...editForm,state:e.target.value})}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* STATUS BADGE */}
      <div className="pt-2">
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            editForm.status==="ACTIVE"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {editForm.status}
        </span>
      </div>

    </div>

    {/* ACTION BUTTONS */}
    <div className="space-y-3">

      {/* SAVE BUTTON */}
      <button
        onClick={async()=>{
          try{

            // ⭐ call update API when ready (for now refresh list)
            await api.put(`/hotels/${editForm.id}`,{
              name:editForm.name,
              city:editForm.city,
              state:editForm.state
            });

            alert("Hotel Updated");
            setEditDrawer(false);
            loadAdmins();

          }catch(err){
            console.log(err);
          }
        }}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        Save Changes
      </button>

      {/* ACTIVE / SUSPEND BUTTON */}
      <button
        onClick={async()=>{
          await toggleStatus(editForm.id);
          setEditForm(prev=>({
            ...prev,
            status: prev.status==="ACTIVE" ? "SUSPENDED" : "ACTIVE"
          }));
        }}
        className={`w-full py-2 rounded-lg text-white ${
          editForm.status==="ACTIVE"
            ? "bg-red-500"
            : "bg-green-500"
        }`}
      >
        {editForm.status==="ACTIVE"
          ? "Suspend Hotel"
          : "Activate Hotel"}
      </button>

    </div>

  </div>
</div>
    </div>
  );
}