import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { authService } from "./authService";

export default function useAuth(){

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const user = useMemo(()=>{

    if(!token) return null;

    try{
      const parts = token.split(".");
      if(parts.length !== 3) return null;

      return JSON.parse(atob(parts[1]));
    }
    catch(err){
      return null;
    }

  },[token]);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isHotelAdmin = user?.role === "HOTEL_ADMIN";
  const isUser = user?.role === "USER";

  const hasModule = (moduleName)=>{
    if(!user) return false;
    if(isSuperAdmin) return true;
    return user.modules?.includes(moduleName);
  };

  const hasPermission = (perm)=>{
    if(!user) return false;
    if(isSuperAdmin) return true;
    return user.permissions?.includes(perm);
  };

  const logout = ()=>{

    const role = user?.role;

    authService.logout();

    if(role === "SUPER_ADMIN"){
      navigate("../../auth/PortalSelect",{replace:true});
    }
    else if(role === "HOTEL_ADMIN"){
      navigate("../../auth/PortalSelect",{replace:true});
    }
    else{
      navigate("../../auth/PortalSelect",{replace:true});
    }
  };

  return {
    user,
    logout,
    isSuperAdmin,
    isHotelAdmin,
    isUser,
    hasModule,
    hasPermission
  };
}