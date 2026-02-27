import { useState } from "react";
import { api } from "../../services/api";

export default function CreateUserDrawer({ onClose, reload }) {

  const currentRole = localStorage.getItem("role");

  const [form,setForm] = useState({
    name:"",
    email:"",
    password:"",
    roleType:""
  });

  const [errors,setErrors] = useState({});
  const [loading,setLoading] = useState(false);

  const [showSuccess,setShowSuccess] = useState(false);
  const [showNotAllowed,setShowNotAllowed] = useState(false);

  /* =================================================
     ⭐ VALIDATION
  ================================================= */

  const validate = ()=>{

    const newErrors = {};

    if(!form.name.trim()){
      newErrors.name = "Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!form.email){
      newErrors.email = "Email is required";
    }
    else if(!emailRegex.test(form.email)){
      newErrors.email = "Enter valid email address";
    }

    const passRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if(!form.password){
      newErrors.password = "Password is required";
    }
    else if(!passRegex.test(form.password)){
      newErrors.password =
        "Min 8 chars with A-Z, a-z, number & symbol";
    }

    if(!form.roleType){
      newErrors.roleType = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =================================================
     ⭐ CREATE USER
  ================================================= */

  const createUser = async()=>{

    // 🚫 ROLE CHECK
    if(currentRole !== "HOTEL_ADMIN"){
      setShowNotAllowed(true);
      return;
    }

    if(!validate()) return;

    try{
      setLoading(true);

      await api.post("/users",form);

      setShowSuccess(true);

      reload();

      setTimeout(()=>{
        setShowSuccess(false);
        onClose();
      },1500);

    }catch(err){
      console.log(err?.response?.data || err);
    }finally{
      setLoading(false);
    }
  };

  /* =================================================
     ⭐ UI
  ================================================= */

  return(
    <>
      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✅ User created successfully
        </div>
      )}

      {/* NOT ALLOWED POPUP */}
      {showNotAllowed && (
        <div className="fixed top-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          🚫 Only Hotel Admin can create user
        </div>
      )}

      {/* DRAWER */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white border-l shadow-xl p-6 z-40">

        <div className="flex justify-between mb-6">
          <h2 className="font-semibold text-lg">
            Create Staff
          </h2>
          <button onClick={onClose}>Close</button>
        </div>

        <div className="space-y-4">

          {/* NAME */}
          <div>
            <input
              placeholder="Full Name"
              className="border p-2 w-full rounded"
              value={form.name}
              onChange={e=>setForm({...form,name:e.target.value})}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="border p-2 w-full rounded"
              value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <input
              type="password"
              placeholder="Password"
              className="border p-2 w-full rounded"
              value={form.password}
              onChange={e=>setForm({...form,password:e.target.value})}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* ROLE TYPE */}
          <div>
            <select
              className="border p-2 w-full rounded"
              value={form.roleType}
              onChange={e=>setForm({...form,roleType:e.target.value})}
            >
              <option value="">Select Staff Role</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="HOUSEKEEPING">Housekeeping</option>
              <option value="MANAGER">Manager</option>
              <option value="ACCOUNTANT">Account accountant</option>
            </select>

            {errors.roleType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.roleType}
              </p>
            )}
          </div>

        </div>

        <button
          onClick={createUser}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create User"}
        </button>

      </div>
    </>
  );
}