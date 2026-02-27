import { Outlet } from "react-router-dom";

export default function StayView() {

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Outlet />
    </div>
  );
}