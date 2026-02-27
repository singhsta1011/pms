import { api } from "./api";

/* ROOMS */
export const fetchRooms = () =>
  api.get("/rooms");

/* BOOKINGS */
export const fetchBookings = (from,to)=>
  api.get(`/bookings?from=${from}&to=${to}`);

export const updateBooking = (id,data)=>
  api.patch(`/bookings/${id}`,data);