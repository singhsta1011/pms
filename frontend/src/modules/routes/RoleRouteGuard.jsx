import { Navigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function RoleRouteGuard({
  children,
  roles=[],
  module=null,
  permission=null
}){

  const { user, hasModule, hasPermission } = useAuth();

  if(!user){
    return <Navigate to="/" replace />;
  }

  if(roles.length && !roles.includes(user.role)){
    return <Navigate to="/" replace />;
  }

  if(module && !hasModule(module)){
    return <Navigate to="/" replace />;
  }

  if(permission && !hasPermission(permission)){
    return <Navigate to="/" replace />;
  }

  return children;
}