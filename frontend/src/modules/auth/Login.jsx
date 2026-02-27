import { useState } from "react";
import { authApi } from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Building2, User } from "lucide-react";

export default function Login(){

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const nav = useNavigate();
  const location = useLocation();

  /* =============================================
     DETECT PORTAL TYPE
  ============================================= */

  const isSuperAdmin = location.pathname.includes("superadmin");
  const isHotelAdmin = location.pathname.includes("admin") && !isSuperAdmin;
  const isUser = location.pathname.includes("user");

  const portalConfig = isSuperAdmin
    ? {
        title:"Super Admin Login",
        subtitle:"Full Enterprise Control",
        icon:ShieldCheck,
        gradient:"from-blue-600 to-indigo-600"
      }
    : isHotelAdmin
    ? {
        title:"Hotel Admin Login",
        subtitle:"Manage Your Property",
        icon:Building2,
        gradient:"from-emerald-500 to-green-600"
      }
    : {
        title:"Staff Login",
        subtitle:"Access Your Dashboard",
        icon:User,
        gradient:"from-purple-500 to-pink-600"
      };

  const Icon = portalConfig.icon;

  /* =============================================
     JWT DECODE
  ============================================= */

  const decodeToken = (token)=>{
    try{
      return JSON.parse(atob(token.split(".")[1]));
    }catch{
      return null;
    }
  };

  /* =============================================
     LOGIN
  ============================================= */

  const handleLogin = async(e)=>{
    e.preventDefault();

    try{
      setLoading(true);

      const res = await authApi.post("/login",{ email,password });
      const { token } = res.data;

      const payload = decodeToken(token);
      if(!payload) return;

      localStorage.setItem("token", token);
      localStorage.setItem("role", payload.role);

      if(payload.hotelId){
        localStorage.setItem("hotelId", payload.hotelId);
      }

      if(payload.role === "SUPER_ADMIN"){
        nav("/superadmin",{ replace:true });
      }else{
        nav("/app",{ replace:true });
      }

    }catch(err){
      console.log(err?.response?.data || err);
      alert("Invalid credentials");
    }finally{
      setLoading(false);
    }
  };

  /* =============================================
     UI
  ============================================= */

  return(
    <div className="min-h-screen flex">

      {/* LEFT SIDE BRAND PANEL */}
      <div className={`hidden md:flex flex-1 bg-gradient-to-br ${portalConfig.gradient} text-white items-center justify-center relative`}>

        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"/>

        <div className="relative text-center px-10">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon size={36}/>
          </div>

          <h1 className="text-3xl font-bold">
            PMS Enterprise
          </h1>

          <p className="mt-4 text-white/80">
            Secure role-based access management system
          </p>
        </div>
      </div>

      {/* RIGHT SIDE LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">

        <div className="w-full max-w-md">

          <div className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">

            <div className="text-center mb-8">
              <div className={`mx-auto mb-4 w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${portalConfig.gradient}`}>
                <Icon size={24}/>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800">
                {portalConfig.title}
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                {portalConfig.subtitle}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              <div>
                <label className="text-sm text-gray-500">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  className="mt-1 w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  className="mt-1 w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Enter your password"
                />
              </div>

              <button
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white font-semibold transition shadow-md bg-gradient-to-r ${portalConfig.gradient} hover:opacity-90 disabled:opacity-50`}
              >
                {loading ? "Signing in..." : "Login"}
              </button>

            </form>

            <div className="text-center mt-6 text-xs text-gray-400">
              PMS Enterprise v1.0
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}