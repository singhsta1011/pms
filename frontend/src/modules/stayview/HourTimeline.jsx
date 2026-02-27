import HourlyCalendarView from "../../components/pms/HourlyCalendarView";
import usePmsData from "../../hooks/usePmsData";

export default function HourTimeline(){

  const { rooms, bookings } = usePmsData();

  return (
    <HourlyCalendarView
      rooms={rooms}
      bookings={bookings}
    />
  );
}