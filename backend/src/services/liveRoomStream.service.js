const { getRoomStatus } = require("./roomStatus.service");

//
// ⭐ ENTERPRISE REALTIME ROOM STATUS EMITTER
//
exports.emitRoomLiveStatus = async ({ io, hotelId, roomId }) => {
  try {

    if (!io) {
      console.warn("Socket.io instance missing");
      return;
    }

    // =====================================================
    // ⭐ GET LIVE STATUS (DYNAMIC ENGINE)
    // =====================================================
    let liveStatus = "UNKNOWN";

    try {
      liveStatus = await getRoomStatus(roomId);
    } catch (err) {
      console.error("Status fetch failed:", err.message);
    }

    // =====================================================
    // ⭐ SOCKET EMIT (ROOM LEVEL)
    // =====================================================
    io.to(`hotel_${hotelId}`).emit("roomLiveStatusUpdated", {
      roomId,
      hotelId,
      liveStatus,
      updatedAt: new Date(),
    });

  } catch (err) {
    console.error("Live room stream error:", err.message);
  }
};