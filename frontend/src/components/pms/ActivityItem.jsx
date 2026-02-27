import { CheckCircle2, CalendarPlus, CreditCard } from "lucide-react";

export default function ActivityItem({ type, title, time }) {
  const icons = {
    booking: <CalendarPlus size={16} className="text-blue-500" />,
    checkin: <CheckCircle2 size={16} className="text-green-500" />,
    payment: <CreditCard size={16} className="text-purple-500" />,
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        {icons[type]}
      </div>

      <div className="flex-1">
        <p className="text-sm text-[#2E3A59] font-medium">{title}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}