import { useMemo, useState, useEffect, useRef } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

/* ===============================
   CONFIG (DAY ONLY)
================================= */
const BASE_DAY_WIDTH = 90;

const getLeftWidth = () => {
  if (window.innerWidth > 1700) return 360;
  if (window.innerWidth > 1400) return 320;
  return 300;
};

const getScreenFactor = () => {
  if (window.innerWidth > 1700) return 1.4;
  if (window.innerWidth > 1400) return 1.2;
  if (window.innerWidth > 1100) return 1;
  return 0.85;
};

const formatDate = (d) => d.toISOString().slice(5, 10);

export default function StayTimeline({
  rooms = [],
  bookings = [],
}) {
  const LEFT_COL_WIDTH = getLeftWidth();
  const screenFactor = getScreenFactor();

  const [hoverX, setHoverX] = useState(null);
  const [now] = useState(new Date());

  const safeRooms = Array.isArray(rooms)
    ? rooms
    : Array.isArray(rooms?.data)
      ? rooms.data
      : [];

  const safeBookings = Array.isArray(bookings)
    ? bookings
    : Array.isArray(bookings?.data)
      ? bookings.data
      : [];

  const [liveBookings, setLiveBookings] = useState(safeBookings);
  const [roomFilter, setRoomFilter] = useState("ALL");

  const timelineRef = useRef(null);

  useEffect(() => {
    setLiveBookings(safeBookings);
  }, [safeBookings]);

  const CELL_WIDTH = BASE_DAY_WIDTH * screenFactor;

  /* ===============================
     DAY DATES ONLY
  ================================= */
  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 240 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i - 120);
      return d;
    });
  }, []);

  /* ===============================
     AUTO SCROLL TO TODAY
  ================================= */
  useEffect(() => {
    if (!timelineRef.current) return;

    const todayIndex = dates.findIndex(
      (d) => formatDate(d) === formatDate(now)
    );

    if (todayIndex !== -1) {
      const scrollLeft =
        todayIndex * CELL_WIDTH -
        LEFT_COL_WIDTH -
        window.innerWidth / 3;

      timelineRef.current.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      });
    }
  }, []);

  /* ===============================
     KPI STATS
  ================================= */
  const stats = useMemo(() => {
    const total = safeRooms.length;
    const reserved = liveBookings.filter((b) => b.status === "reserved").length;
    const occupied = liveBookings.filter((b) => b.status === "checkedin").length;
    const blocked = liveBookings.filter((b) => b.status === "maintenance").length;
    const vacant = total - reserved - occupied;

    return {
      total,
      vacant,
      reserved,
      occupied,
      blocked,
      dirty: Math.floor(total * 0.03),
    };
  }, [safeRooms, liveBookings]);

  const filteredRooms = useMemo(() => {
    if (roomFilter === "ALL") return safeRooms;
    return safeRooms.filter((r) => r.roomType === roomFilter);
  }, [safeRooms, roomFilter]);

  const groupedRooms = useMemo(() => {
    const map = {};
    filteredRooms.forEach((r) => {
      const type = r.roomType || "General";
      if (!map[type]) map[type] = [];
      map[type].push(r);
    });
    return map;
  }, [filteredRooms]);

  const buildStacks = (roomBookings) => {
    const sorted = [...roomBookings].sort(
      (a, b) => new Date(a.checkIn) - new Date(b.checkIn)
    );

    const layers = [];

    sorted.forEach((b) => {
      let placed = false;
      for (let i = 0; i < layers.length; i++) {
        const last = layers[i][layers[i].length - 1];
        if (new Date(b.checkIn) >= new Date(last.checkOut)) {
          layers[i].push(b);
          placed = true;
          break;
        }
      }
      if (!placed) layers.push([b]);
    });

    return layers;
  };

  const statusColor = (status) => {
    switch (status) {
      case "checkedin":
        return "bg-orange-500";
      case "reserved":
        return "bg-blue-600";
      default:
        return "bg-gray-400";
    }
  };

  function DroppableRow({ id, children }) {
    const { setNodeRef } = useDroppable({ id });
    return <div ref={setNodeRef} className="flex relative">{children}</div>;
  }

  /* ⭐ LIVE DAY PROGRESS LINE */
  const todayIndex = dates.findIndex(
    (d) => formatDate(d) === formatDate(now)
  );

  const progress =
    (now.getHours() + now.getMinutes() / 60) / 24;

  const liveLeft =
    todayIndex !== -1 ? (todayIndex + progress) * CELL_WIDTH : null;

  function DraggableBooking({ booking, left, width, top, color }) {
    const { attributes, listeners, setNodeRef, transform } =
      useDraggable({ id: booking.id, data: booking });

    const style = {
      transform: transform
        ? `translate3d(${transform.x}px,${transform.y}px,0)`
        : undefined,
      left,
      width,
      top,
      height: 30,
    };

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className={`absolute rounded text-white text-[11px] px-2 flex items-center shadow cursor-grab ${color}`}
      >
        {booking.guestName || "Guest"}
      </div>
    );
  }

  return (
  <DndContext>
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200">

      {/* KPI BAR */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-white text-sm">
        <KPI label="All" value={stats.total} />
        <KPI label="Vacant" value={stats.vacant} />
        <KPI label="Occupied" value={stats.occupied} />
        <KPI label="Reserved" value={stats.reserved} />
        <KPI label="Blocked" value={stats.blocked} />
        <KPI label="Dirty" value={stats.dirty} />
      </div>

      {/* SCROLL CONTAINER */}
      <div className="flex-1 overflow-auto relative" ref={timelineRef}>

        <div
          style={{
            width: LEFT_COL_WIDTH + dates.length * CELL_WIDTH,
            minHeight: "100%"
          }}
        >

          {/* HEADER ROW */}
          <div className="flex sticky top-0 z-30 bg-gray-50 border-b">

            {/* STICKY LEFT COLUMN HEADER */}
            <div
              style={{
                width: LEFT_COL_WIDTH,
                minWidth: LEFT_COL_WIDTH
              }}
              className="sticky left-0 z-40 bg-white border-r px-4 flex items-center gap-2"
            >
              <span className="text-xs font-semibold">Room Type</span>

              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="border px-2 py-1 text-xs rounded w-full"
              >
                <option value="ALL">ALL</option>
                {[...new Set(safeRooms.map(r => r.roomType))].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* DATE CELLS */}
            <div className="flex">
              {dates.map((slot, i) => {
                const isWeekend =
                  slot.getDay() === 0 || slot.getDay() === 6;

                return (
                  <div
                    key={i}
                    style={{ width: CELL_WIDTH }}
                    className="text-[11px] text-center py-3 border-r border-gray-200"
                  >
                    <div className="font-semibold">
                      {slot.toLocaleDateString("en-US", {
                        weekday: "short"
                      })}
                    </div>
                    <div className="opacity-60">
                      {slot.toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit"
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROOM ROWS */}
          {Object.entries(groupedRooms).map(([type, rooms]) => (
            <div key={type}>

              {/* TYPE ROW */}
              <div className="flex border-b">
                <div
                  style={{
                    width: LEFT_COL_WIDTH,
                    minWidth: LEFT_COL_WIDTH
                  }}
                  className="sticky left-0 z-20 bg-gray-100 px-3 py-2 text-xs font-semibold border-r"
                >
                  {type}
                </div>

                <div className="flex">
                  {dates.map((_, i) => (
                    <div
                      key={i}
                      style={{ width: CELL_WIDTH, height: 34 }}
                      className="border-r border-gray-200"
                    />
                  ))}
                </div>
              </div>

              {/* ROOM ROW */}
              {rooms.map(room => {

                const roomBookings = liveBookings.filter(
                  b => b.roomId === room.id
                );

                const layers = buildStacks(roomBookings);
                const rowHeight = Math.max(1, layers.length) * 36;

                return (
                  <div key={room.id} className="flex border-b relative">

                    {/* STICKY ROOM NUMBER */}
                    <div
                      style={{
                        width: LEFT_COL_WIDTH,
                        minWidth: LEFT_COL_WIDTH
                      }}
                      className="sticky left-0 z-20 bg-white border-r px-3 flex items-center"
                    >
                      <p className="font-semibold">
                        {room.roomNumber || room.number}
                      </p>
                    </div>

                    {/* GRID CELLS */}
                    <div className="flex relative">
                      {dates.map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: CELL_WIDTH,
                            height: rowHeight
                          }}
                          className="border-r border-gray-200"
                        />
                      ))}

                      {/* BOOKINGS */}
                      {layers.map((layer, layerIndex) =>
                        layer.map(b => {

                          const startIndex = dates.findIndex(
                            d =>
                              formatDate(d) ===
                              formatDate(new Date(b.checkIn))
                          );

                          const endIndex = dates.findIndex(
                            d =>
                              formatDate(d) ===
                              formatDate(new Date(b.checkOut))
                          );

                          const left = startIndex * CELL_WIDTH;
                          const width = Math.max(
                            CELL_WIDTH,
                            (endIndex - startIndex) * CELL_WIDTH
                          );

                          return (
                            <div
                              key={b.id}
                              style={{
                                position: "absolute",
                                left,
                                top: layerIndex * 34 + 4,
                                width,
                                height: 30
                              }}
                              className={`rounded text-white text-[11px] px-2 flex items-center shadow ${statusColor(b.status)}`}
                            >
                              {b.guestName || "Guest"}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  </DndContext>
);
}

function KPI({ label, value }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-500">{label}</span>
      <span className="bg-gray-200 px-2 rounded-full text-xs font-semibold">
        {value}
      </span>
    </div>
  );
}