import ActivityItem from "./ActivityItem";

export default function LiveActivityPanel() {

  // Later this comes from backend realtime API
  const activities = [
    { id: 1, type: "booking", title: "New booking created — Room 101", time: "2 min ago" },
    { id: 2, type: "checkin", title: "Guest Rahul checked-in", time: "10 min ago" },
    { id: 3, type: "payment", title: "Invoice INV-1024 paid", time: "30 min ago" },
    { id: 4, type: "booking", title: "Reservation updated — Suite 204", time: "1 hr ago" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-[#2E3A59] mb-3">
        Live Activity
      </h2>

      <div>
        {activities.map((item) => (
          <ActivityItem key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}