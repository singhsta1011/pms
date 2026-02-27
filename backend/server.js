require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const { syncDB } = require("./src/models");
const presence = require("./src/services/presence.service");

const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");

const { apiLimiter } = require("./src/middleware/rateLimit.middleware");

const app = express();
const server = http.createServer(app);

//
// ======================================================
// ⭐ GLOBAL SECURITY MIDDLEWARE
// ======================================================
//
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);
app.use("/uploads", require("express").static("src/uploads"));


//
// ======================================================
// ⭐ UPLOAD ROUTES
// ======================================================
//
const uploadRoutes = require("./src/routes/upload.routes");
app.use("/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

//
// ======================================================
// ⭐ SOCKET.IO SERVER
// ======================================================
//
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//
// ======================================================
// ⭐ SOCKET.IO REDIS ADAPTER (PRODUCTION SCALING)
// ======================================================
//
let pubClient;
let subClient;

if (process.env.REDIS_HOST) {
  pubClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });

  subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  console.log("🟥 Socket Redis Adapter enabled (cluster ready)");
} else {
  console.log("⚠️ Redis not configured — running single instance");
}

// make io accessible globally
app.set("io", io);

//
// ======================================================
// ⭐ LOAD REALTIME WORKER
// ======================================================
//
require("./src/workers/realtime.worker")(io);

//
// ======================================================
// 🔐 SOCKET AUTH GUARD
// ======================================================
//
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized socket"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Socket auth failed");
    next(new Error("Unauthorized socket"));
  }
});

//
// ======================================================
// ⭐ SECURE SOCKET CONNECTION + REDIS PRESENCE
// ======================================================
//
io.on("connection", async (socket) => {
  console.log("⚡ Secure client connected:", socket.id);

  const hotelId = socket.user.hotelId;
  const userId = socket.user.id;

  if (hotelId) {
    const roomName = `hotel_${hotelId}`;
    socket.join(roomName);

    try {
      const count = await presence.addUser(hotelId, userId);

      io.to(roomName).emit("presenceUpdate", {
        hotelId,
        onlineAdmins: count,
      });

      console.log(`👤 Redis presence added → Hotel ${hotelId}, total ${count}`);
    } catch (err) {
      console.log("⚠️ Presence add failed");
    }
  }

  socket.on("disconnect", async () => {
    if (hotelId) {
      const roomName = `hotel_${hotelId}`;

      try {
        const count = await presence.removeUser(hotelId, userId);

        io.to(roomName).emit("presenceUpdate", {
          hotelId,
          onlineAdmins: count,
        });

        console.log(`❌ Redis presence removed → Hotel ${hotelId}, total ${count}`);
      } catch (err) {
        console.log("⚠️ Presence remove failed");
      }
    }
  });
});

//
// ======================================================
// ⭐ ROUTES
// ======================================================
//
const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require("./src/routes/admin.routes");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

//
// ======================================================
// ⭐ HEALTH CHECK
// ======================================================
//
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "PMS Backend",
    environment: process.env.NODE_ENV,
  });
});

//
// ======================================================
// ⭐ START SERVER + DB
// ======================================================
//
const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await syncDB();
});
