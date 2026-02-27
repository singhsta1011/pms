import { useState } from "react";
import usePmsData from "../../hooks/usePmsData";

import BookingHeader from "./components/BookingHeader";
import BookingTable from "./components/BookingTable";
import BookingDrawer from "./components/BookingDrawer";

export default function BookingsPage() {

  const {
    bookings,
    rooms,
    createBooking,
    updateBooking
  } = usePmsData();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  /* ===============================
     OPEN NEW BOOKING
  ================================= */
  const handleNewBooking = () => {
    setSelectedBooking(null);
    setOpenDrawer(true);
  };

  /* ===============================
     EDIT BOOKING
  ================================= */
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setOpenDrawer(true);
  };

  /* ===============================
     SAVE BOOKING
  ================================= */
  const handleSave = async (data) => {

    try {

      if (selectedBooking) {
        await updateBooking(selectedBooking.id, data);
      } else {
        await createBooking(data);
      }

      setOpenDrawer(false);
      setSelectedBooking(null);

    } catch (err) {
      console.error("Booking save error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* ⭐ HEADER */}
      <BookingHeader onNew={handleNewBooking} />

      {/* ⭐ TABLE */}
      <BookingTable
        bookings={bookings}
        onEdit={handleEdit}
      />

      {/* ⭐ ENTERPRISE DRAWER (ALWAYS MOUNTED) */}
      <BookingDrawer
        open={openDrawer}
        booking={selectedBooking}
        rooms={rooms}
        onClose={() => setOpenDrawer(false)}
        onSave={handleSave}
      />

    </div>
  );
}