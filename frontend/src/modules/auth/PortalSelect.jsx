import { useNavigate } from "react-router-dom";
import { ShieldCheck, Building2, User } from "lucide-react";

export default function PortalSelect(){

  const nav = useNavigate();

  const portals = [
    {
      title:"PMS Console",
      subtitle:"Super Admin Access",
      icon:ShieldCheck,
      gradient:"from-blue-500 to-indigo-600",
      route:"/superadmin/login"
    },
    {
      title:"Hotel Admin",
      subtitle:"Hotel Management Access",
      icon:Building2,
      gradient:"from-emerald-500 to-green-600",
      route:"/admin/login"
    },
    {
      title:"Staff Portal",
      subtitle:"Reception / Manager / Accountant",
      icon:User,
      gradient:"from-purple-500 to-pink-600",
      route:"/user/login"
    }
  ];

  return(
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-6">

      {/* Decorative Background Glow */}
      <div className="absolute top-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-200 rounded-full blur-3xl opacity-30"/>
      <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-200 rounded-full blur-3xl opacity-30"/>

      <div className="relative w-full max-w-6xl">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            PMS Enterprise Console
          </h1>

          <p className="text-gray-500 mt-4 text-lg">
            Secure access for administrators and staff
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-8">

          {portals.map((p,i)=>{

            const Icon = p.icon;

            return(
              <div
                key={i}
                onClick={()=>nav(p.route)}
                className="
                  group relative bg-white/70 backdrop-blur-xl border border-gray-200
                  rounded-3xl p-8 text-center
                  shadow-md hover:shadow-2xl
                  transition-all duration-500
                  hover:-translate-y-3
                  cursor-pointer
                "
              >
                {/* Gradient Icon */}
                <div className={`mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${p.gradient} shadow-lg group-hover:scale-110 transition duration-500`}>
                  <Icon size={28}/>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition">
                  {p.title}
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  {p.subtitle}
                </p>

                {/* Hover Glow Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-400 transition duration-500 pointer-events-none"/>
              </div>
            );
          })}

        </div>

        {/* FOOTER */}
        <div className="text-center mt-14 text-sm text-gray-400">
          PMS Enterprise v1.0 • Secure Role-Based System
        </div>

      </div>
    </div>
  );
}