import { useMemo, useState, useEffect } from "react";

/* ===============================
   ENTERPRISE CONFIG
================================= */

const HOURS = Array.from({ length: 24 }).map((_, i) =>
  `${i.toString().padStart(2, "0")}:00`
);

const CELL_WIDTH = 120;
const ROW_HEIGHT = 60;
const LEFT_COL = 200;

export default function HourlyCalendarView({
  rooms = [],
  bookings = []
}) {

  const [now, setNow] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  const [roomTypeFilter, setRoomTypeFilter] = useState("ALL");
  const [roomFilter, setRoomFilter] = useState("ALL");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  /* ===============================
     SAFE DATA
  ================================= */

  const safeRooms = Array.isArray(rooms)
    ? rooms
    : rooms?.data || [];

  const safeBookings = Array.isArray(bookings)
    ? bookings
    : bookings?.data || [];

  /* ===============================
     FILTER ROOMS
  ================================= */

  const filteredRooms = useMemo(() => {

    let data = safeRooms;

    if (roomTypeFilter !== "ALL") {
      data = data.filter(r => r.roomType === roomTypeFilter);
    }

    if (roomFilter !== "ALL") {
      data = data.filter(r => String(r.roomNumber) === roomFilter);
    }

    return data;

  }, [safeRooms, roomTypeFilter, roomFilter]);

  /* ===============================
     DAY START + END ⭐ ENTERPRISE
  ================================= */

  const dayStart = useMemo(()=>{
    const d = new Date(currentDate);
    d.setHours(0,0,0,0);
    return d;
  },[currentDate]);

  const dayEnd = useMemo(()=>{
    const d = new Date(currentDate);
    d.setHours(24,0,0,0);
    return d;
  },[currentDate]);

  /* ===============================
     FILTER BOOKINGS (FIXED LOGIC)
  ================================= */

  const dayBookings = useMemo(()=>{
    return safeBookings.filter(b=>{
      const ci = new Date(b.checkIn);
      const co = new Date(b.checkOut);

      // ⭐ show booking if it touches this day
      return ci < dayEnd && co > dayStart;
    });
  },[safeBookings, dayStart, dayEnd]);

  /* ===============================
     DATE NAVIGATION
  ================================= */

  const changeDate = (offset) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d);
  };

  /* ===============================
     LIVE CURRENT TIME LINE ⭐
  ================================= */

  const liveLeft =
    (now - dayStart) / (1000*60*60) * CELL_WIDTH;

  /* ===============================
     UI
  ================================= */

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border overflow-hidden">

      {/* ================= HEADER ================= */}

      <div className="sticky top-0 z-40 bg-white border-b px-5 py-4">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-3 flex-wrap">

            <button
              onClick={()=>changeDate(-1)}
              className="w-9 h-9 rounded-lg border hover:bg-gray-100"
            >
              ◀
            </button>

            <button
              onClick={()=>changeDate(1)}
              className="w-9 h-9 rounded-lg border hover:bg-gray-100"
            >
              ▶
            </button>

            <button
              onClick={()=>setCurrentDate(new Date())}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow"
            >
              Today
            </button>

            <h3 className="font-semibold ml-3">
              {currentDate.toDateString()}
            </h3>

          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <select
              value={roomTypeFilter}
              onChange={(e)=>setRoomTypeFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm"
            >
              <option value="ALL">All Room Types</option>
              {[...new Set(safeRooms.map(r=>r.roomType))].map(t=>(
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={roomFilter}
              onChange={(e)=>setRoomFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm"
            >
              <option value="ALL">All Rooms</option>
              {safeRooms.map(r=>(
                <option key={r.id}>{r.roomNumber}</option>
              ))}
            </select>

          </div>

        </div>
      </div>

      {/* ================= GRID ================= */}

      <div className="flex-1 overflow-auto">

        <div style={{ minWidth: LEFT_COL + HOURS.length * CELL_WIDTH }}>

          {/* TIME HEADER */}
          <div className="flex sticky top-0 z-30 bg-gray-50 border-b relative">

            <div
              style={{ width: LEFT_COL }}
              className="sticky left-0 bg-white border-r z-40"
            />

            {/* LIVE RED LINE */}
            {liveLeft > 0 && liveLeft < HOURS.length*CELL_WIDTH && (
              <div
                style={{
                  position:"absolute",
                  left: LEFT_COL + liveLeft,
                  top:0,
                  bottom:0,
                  width:2,
                  background:"#ef4444",
                  zIndex:50
                }}
              />
            )}

            {HOURS.map(h=>(
              <div key={h}
                style={{ width: CELL_WIDTH }}
                className="text-xs font-semibold text-center py-3 border-r">
                {h}
              </div>
            ))}

          </div>

          {/* ROOM ROWS */}
          {filteredRooms.map(room=>{

            const roomBookings =
              dayBookings.filter(b=>b.roomId===room.id);

            return (
              <div key={room.id} className="flex border-b relative">

                {/* ROOM LABEL */}
                <div
                  style={{ width: LEFT_COL, height: ROW_HEIGHT }}
                  className="sticky left-0 z-20 bg-white border-r flex items-center px-4 font-semibold"
                >
                  {room.roomNumber}
                </div>

                {/* GRID CELLS */}
                {HOURS.map((_,i)=>(
                  <div key={i}
                    style={{ width:CELL_WIDTH, height:ROW_HEIGHT }}
                    className="border-r relative hover:bg-blue-50 transition"
                  />
                ))}

                {/* BOOKINGS ⭐ ENTERPRISE POSITIONING */}
                {roomBookings.map(b=>{

                  const ci = new Date(b.checkIn);
                  const co = new Date(b.checkOut);

                  const visibleStart = ci < dayStart ? dayStart : ci;
                  const visibleEnd = co > dayEnd ? dayEnd : co;

                  const start =
                    (visibleStart - dayStart) / (1000*60*60);

                  const end =
                    (visibleEnd - dayStart) / (1000*60*60);

                  if(end <= 0 || start >= 24) return null;

                  const left = LEFT_COL + start * CELL_WIDTH;
                  const width = Math.max(20,(end-start)*CELL_WIDTH);

                  return(
                    <div
                      key={b.id}
                      style={{
                        position:"absolute",
                        left,
                        top:10,
                        width,
                        height:40
                      }}
                      className="bg-blue-600 text-white rounded-lg shadow px-3 flex items-center text-xs"
                    >
                      {b.guestName || "Guest"}
                    </div>
                  );
                })}

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}