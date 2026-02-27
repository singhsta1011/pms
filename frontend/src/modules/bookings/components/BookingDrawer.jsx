import { useState } from "react";

export default function BookingDrawer({
  open,
  onClose,
  onSubmit,
  rooms = []
}) {

  const initialState = {
    guestName: "",
    guestPhone: "",
    bookingType: "DAILY",
    bookingSource: "OFFLINE",
    roomType: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    notes: ""
  };

  const [form, setForm] = useState(initialState);

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submitBooking = () => {
    onSubmit(form);
    setForm(initialState);
  };

  const roomTypes = [...new Set(rooms.map(r => r.roomType))];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">

      {/* DRAWER */}
      <div className="w-[520px] h-full bg-white shadow-2xl flex flex-col">

        {/* ================= HEADER ================= */}
        <div className="px-6 py-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            New Booking
          </h2>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Guest Info */}
          <div className="grid grid-cols-2 gap-4">

            <input
              placeholder="Guest Name"
              value={form.guestName}
              onChange={e=>handleChange("guestName", e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              placeholder="Phone"
              value={form.guestPhone}
              onChange={e=>handleChange("guestPhone", e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

          </div>

          {/* Booking Type */}
          <div className="flex gap-3">

            {["HOURLY","DAILY"].map(type => (
              <button
                key={type}
                onClick={()=>handleChange("bookingType", type)}
                className={`
                  px-4 py-2 rounded-lg border
                  ${form.bookingType===type
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"}
                `}
              >
                {type}
              </button>
            ))}

          </div>

          {/* Room Type */}
          <select
            value={form.roomType}
            onChange={e=>handleChange("roomType", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Room Type</option>
            {roomTypes.map(rt=>(
              <option key={rt}>{rt}</option>
            ))}
          </select>

          {/* Date Time */}
          <div className="grid grid-cols-2 gap-4">

            <input
              type="datetime-local"
              value={form.checkIn}
              onChange={e=>handleChange("checkIn", e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="datetime-local"
              value={form.checkOut}
              onChange={e=>handleChange("checkOut", e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

          </div>

          {/* Guests */}
          <div className="grid grid-cols-2 gap-4">

            <input
              type="number"
              placeholder="Adults"
              value={form.adults}
              onChange={e=>handleChange("adults", e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              placeholder="Children"
              value={form.children}
              onChange={e=>handleChange("children", e.target.value)}
              className="border rounded-lg px-3 py-2"
            />

          </div>

          {/* Notes */}
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={e=>handleChange("notes", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        {/* ================= FOOTER ================= */}
        <div className="p-6 border-t flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={submitBooking}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700"
          >
            Create Booking
          </button>

        </div>

      </div>
    </div>
  );
}