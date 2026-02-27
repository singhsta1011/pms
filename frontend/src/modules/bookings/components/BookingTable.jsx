import StatusBadge from "../../../components/pms/StatusBadge";

export default function BookingTable({
  bookings = [],
  onEdit
}) {

  const safeBookings = Array.isArray(bookings)
    ? bookings
    : bookings?.data || [];

  return (
    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">

      <div className="overflow-x-auto">

        <table className="min-w-full text-sm">

          {/* ================= HEADER ================= */}
          <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
            <tr className="text-left">

              <th className="px-6 py-4 font-semibold">Guest</th>
              <th className="px-4 py-4 font-semibold">Room</th>
              <th className="px-4 py-4 font-semibold">Type</th>
              <th className="px-4 py-4 font-semibold">Check-In</th>
              <th className="px-4 py-4 font-semibold">Check-Out</th>
              <th className="px-4 py-4 font-semibold">Status</th>
              <th className="px-4 py-4 font-semibold">Payment</th>
              <th className="px-6 py-4 text-right">Action</th>

            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody>

            {safeBookings.map((b) => (

              <tr
                key={b.id}
                className="
                  border-t
                  hover:bg-blue-50/40
                  transition
                "
              >

                <td className="px-6 py-4 font-medium text-gray-800">
                  {b.guestName}
                </td>

                <td className="px-4 py-4">
                  {b.Room?.roomNumber || "-"}
                </td>

                <td className="px-4 py-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                    {b.bookingType}
                  </span>
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {new Date(b.checkIn).toLocaleString()}
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {new Date(b.checkOut).toLocaleString()}
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={b.status} />
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={b.paymentStatus} />
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onEdit(b)}
                    className="
                      text-blue-600
                      hover:bg-blue-100
                      px-3 py-1
                      rounded-lg
                      transition
                    "
                  >
                    Edit
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
}