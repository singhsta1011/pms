export default function StatusBadge({ status }) {
  const colors = {
    occupied: "bg-green-100 text-green-600",
    reserved: "bg-blue-100 text-blue-600",
    cleaning: "bg-yellow-100 text-yellow-600",
    maintenance: "bg-red-100 text-red-600",
    paid: "bg-green-100 text-green-600",
    pending: "bg-orange-100 text-orange-600",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[status]}`}>
      {status}
    </span>
  );
}