const eventQueue = require("../services/eventQueue.service");
const { getRoomStatus } = require("../services/roomStatus.service");
const { Booking } = require("../models");
const { emitActivity } = require("../services/activityTimeline.service");
const { calculateHeatmap } = require("../services/heatmap.service");
const { calculatePrediction } = require("../services/predictiveOccupancy.service");
const { calculateDynamicPrice } = require("../services/dynamicPricing.service");
const { calculateRevenueOptimization } = require("../services/revenueOptimizer.service");

/* ======================================================
   ⭐ SAFE EXECUTION WRAPPER (prevents crash)
====================================================== */
async function safeExecute(fn, label){
  try{
    await fn();
  }catch(err){
    console.error(`${label} error:`, err.message);
  }
}

/* ======================================================
   ⭐ SIMPLE EVENT DEBOUNCE (prevents DB overload)
====================================================== */
const debounceMap = new Map();

function shouldRun(key, delay=3000){

  const now = Date.now();
  const last = debounceMap.get(key);

  if(last && now - last < delay){
    return false;
  }

  debounceMap.set(key, now);
  return true;
}

module.exports = (io) => {

  /* ======================================================
     ⭐ ROOM STATUS STREAM
  ====================================================== */
  eventQueue.on("ROOM_STATUS_EVENT", async (data) => {

    if(!data?.hotelId || !data?.roomId) return;

    await safeExecute(async()=>{

      const liveStatus = await getRoomStatus(data.roomId);

      io.to(`hotel_${data.hotelId}`).emit("roomLiveStatusUpdated",{
        roomId:data.roomId,
        liveStatus
      });

      emitActivity(io,{
        hotelId:data.hotelId,
        type:"ROOM_STATUS",
        message:"Room status updated",
        meta:data
      });

    },"ROOM_STATUS_EVENT");

  });

  /* ======================================================
     ⭐ REVENUE STREAM
  ====================================================== */
  eventQueue.on("REVENUE_EVENT", async (data)=>{

    if(!data?.hotelId) return;

    // ⭐ Prevent revenue DB spam
    if(!shouldRun(`revenue_${data.hotelId}`,2000)) return;

    await safeExecute(async()=>{

      const totalRevenue =
        (await Booking.sum("totalAmount",{
          where:{ hotelId:data.hotelId }
        })) || 0;

      io.to(`hotel_${data.hotelId}`).emit("revenueUpdated",{
        hotelId:data.hotelId,
        totalRevenue
      });

      emitActivity(io,{
        hotelId:data.hotelId,
        type:"REVENUE",
        message:"Revenue updated",
        meta:{ totalRevenue }
      });

    },"REVENUE_EVENT");

  });

  /* ======================================================
     ⭐ REVENUE OPTIMIZER ENGINE
  ====================================================== */
  eventQueue.on("OPTIMIZER_EVENT", async(data)=>{

    if(!data?.hotelId) return;

    if(!shouldRun(`optimizer_${data.hotelId}`,5000)) return;

    await safeExecute(async()=>{

      const result = await calculateRevenueOptimization(data.hotelId);
      if(!result) return;

      io.to(`hotel_${data.hotelId}`).emit(
        "revenueOptimizerUpdated",
        result
      );

      console.log("🧠 Revenue optimizer updated:",data.hotelId);

    },"OPTIMIZER_EVENT");

  });

  /* ======================================================
     ⭐ OPERATIONAL HEATMAP STREAM
  ====================================================== */
  eventQueue.on("HEATMAP_EVENT", async(data)=>{

    if(!data?.hotelId) return;

    if(!shouldRun(`heatmap_${data.hotelId}`,4000)) return;

    await safeExecute(async()=>{

      const heatmap = await calculateHeatmap(data.hotelId);

      io.to(`hotel_${data.hotelId}`).emit(
        "operationalHeatmapUpdated",
        heatmap
      );

      console.log("🔥 Heatmap updated:",data.hotelId);

    },"HEATMAP_EVENT");

  });

  /* ======================================================
     ⭐ PREDICTION + DYNAMIC PRICING ENGINE
  ====================================================== */
  eventQueue.on("PREDICTION_EVENT", async(data)=>{

    if(!data?.hotelId) return;

    if(!shouldRun(`prediction_${data.hotelId}`,5000)) return;

    await safeExecute(async()=>{

      const prediction = await calculatePrediction(data.hotelId);

      io.to(`hotel_${data.hotelId}`).emit(
        "predictiveOccupancyUpdated",
        prediction
      );

      console.log("🔮 Prediction updated:",data.hotelId);

      /* ================= DYNAMIC PRICING ================= */

      if(data.roomId){

        const pricing = await calculateDynamicPrice({
          hotelId:data.hotelId,
          roomId:data.roomId,
          predictedOccupancy:prediction.predictedOccupancy
        });

        if(pricing){
          io.to(`hotel_${data.hotelId}`).emit(
            "dynamicPricingUpdated",
            pricing
          );
          console.log("💰 Dynamic pricing updated:",data.roomId);
        }
      }

    },"PREDICTION_EVENT");

  });

};