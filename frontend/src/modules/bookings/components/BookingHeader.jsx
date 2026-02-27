export default function BookingHeader({ onNew }) {

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-white">

      <h2 className="text-lg font-semibold">
        Bookings Module
      </h2>

      <button
        onClick={onNew}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        + New Booking
      </button>

    </div>
  );
}