import { useState } from "react";
import { api } from "../../services/api";

export default function EditUserDrawer({ user, onClose, reload }) {

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || ""
  });

  const [loading,setLoading] = useState(false);

  const [toast,setToast] = useState(null);

  /* =================================================
     ⭐ SHOW TOAST
  ================================================= */

  const showToast = (message, type="success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  /* =================================================
     ⭐ SAVE USER
  ================================================= */

  const save = async () => {
    try{
      setLoading(true);

      await api.put(`/users/${user.id}`, form);

      reload();
      showToast("Changes saved successfully");

      setTimeout(() => {
        onClose();
      }, 1500);

    }catch(err){
      console.log("Update error:",err?.response?.data || err);
    }finally{
      setLoading(false);
    }
  };

  /* =================================================
     ⭐ TOGGLE ACTIVE / SUSPEND
  ================================================= */

  const toggleStatus = async () => {
    try{
      setLoading(true);

      await api.patch(`/users/${user.id}/status`);

      reload();

      if(user.status === "ACTIVE"){
        showToast("User suspended successfully");
      } else {
        showToast("User activated successfully");
      }

      setTimeout(() => {
        onClose();
      }, 1500);

    }catch(err){
      console.log("Status error:",err?.response?.data || err);
    }finally{
      setLoading(false);
    }
  };

  /* =================================================
     ⭐ UI
  ================================================= */

  return (
    <>
      {/* ================= TOAST ================= */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
            toast.type === "success"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* ================= DRAWER ================= */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white border-l shadow-xl p-6 flex flex-col z-40">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Edit User
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            Close
          </button>
        </div>

        {/* STATUS BADGE */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            user.status === "ACTIVE"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}>
            {user.status}
          </span>
        </div>

        {/* FORM */}
        <div className="space-y-3 flex-1">

          <input
            value={form.name}
            placeholder="Full Name"
            className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e=>setForm({...form,name:e.target.value})}
          />

          <input
            type="email"
            value={form.email}
            placeholder="Email Address"
            className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e=>setForm({...form,email:e.target.value})}
          />

        </div>

        {/* FOOTER BUTTONS */}
        <div className="space-y-3 pt-6">

          {/* SAVE */}
          <button
            disabled={loading}
            onClick={save}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          {/* TOGGLE STATUS */}
          <button
            disabled={loading}
            onClick={toggleStatus}
            className={`w-full py-3 rounded-lg text-white transition disabled:opacity-50 ${
              user.status === "ACTIVE"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {user.status === "ACTIVE"
              ? "Suspend User"
              : "Activate User"}
          </button>

        </div>

      </div>
    </>
  );
}