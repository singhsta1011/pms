//
// ⭐ Distributed Activity Timeline Engine
//

exports.emitActivity = (io, payload) => {
  try {
    const {
      hotelId,
      type,
      message,
      meta = {},
    } = payload;

    if (!hotelId) return;

    const activity = {
      type,                // BOOKING_CREATED / STATUS_UPDATED / REVENUE
      message,
      meta,
      createdAt: new Date(),
    };

    // Multi-tenant broadcast
    io.to(`hotel_${hotelId}`).emit("activityFeed", activity);

    console.log("📡 Activity broadcast:", activity.type);
  } catch (err) {
    console.error("Activity timeline error:", err.message);
  }
};
