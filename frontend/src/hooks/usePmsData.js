import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";

export default function usePmsData() {

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================================
     ⭐ ENTERPRISE SAFE NORMALIZER
  ========================================= */
  const normalize = (res) => {
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  /* =========================================
     🚀 LOAD DATA
  ========================================= */
  const loadData = useCallback(async () => {

    try {
      setLoading(true);

      console.log("🚀 PMS Loading...");

      const [roomsRes, bookingsRes] = await Promise.all([
        api.get("/rooms"),
        api.get("/bookings")
      ]);

      console.log("ROOM API:", roomsRes);
      console.log("BOOKING API:", bookingsRes);

      setRooms(normalize(roomsRes));
      setBookings(normalize(bookingsRes));

    } catch (err) {

      console.error("❌ PMS Load Error", err);

      if (err?.response?.status === 401) {
        console.warn("⚠️ TOKEN EXPIRED — clearing localStorage");
        localStorage.removeItem("token");
      }

    } finally {
      setLoading(false);
    }

  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================
     ⭐ CREATE BOOKING  (🔥 FIXED)
  ========================================= */
  const createBooking = async (payload) => {

    try {

      console.log("🟢 Creating Booking:", payload);

      const res = await api.post("/bookings", payload);

      const newBooking =
        res?.data?.data || res?.data || null;

      if (newBooking) {
        // optimistic add
        setBookings(prev => [newBooking, ...prev]);
      }

      console.log("✅ Booking Created");

      return newBooking;

    } catch (err) {
      console.error("❌ Create booking failed", err);
      throw err;
    }
  };

  /* =========================================
     ⭐ UPDATE BOOKING
  ========================================= */
  const updateBooking = async (id, payload) => {

    try {

      console.log("🟡 Updating Booking:", id, payload);

      // optimistic UI
      setBookings(prev =>
        prev.map(b =>
          b.id === id ? { ...b, ...payload } : b
        )
      );

      await api.put(`/bookings/${id}`, payload);

      console.log("✅ Booking Updated");

    } catch (err) {

      console.error("❌ Update booking failed", err);

      // rollback
      loadData();
    }
  };

  /* =========================================
     ⭐ RETURN API
  ========================================= */
  return {
    rooms,
    bookings,
    loading,
    reload: loadData,
    createBooking,     // ✅ NOW EXISTS
    updateBooking
  };
}