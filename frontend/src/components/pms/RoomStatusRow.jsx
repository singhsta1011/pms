import StatusBadge from "./StatusBadge";

export default function RoomStatusRow({ room }) {
  return (
    <div className="flex justify-between bg-white p-3 rounded-lg mb-2">
      <div>
        <p className="font-semibold">
          {room.number} — {room.type}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <StatusBadge status={room.status} />
        <span>₹{room.price}</span>
      </div>
    </div>
  );
}