import StayTimeline from "../../components/pms/StayTimeline";
import usePmsData from "../../hooks/usePmsData";

export default function DayTimeline() {

  // 👇 get rooms + bookings from your hook
  const { rooms, bookings } = usePmsData();

  return (
    <div className="p-6 h-full">
      <StayTimeline
        mode="day"      // ⭐ THIS CONTROLS DAY VIEW
        rooms={rooms}
        bookings={bookings}
      />
    </div>
  );
}