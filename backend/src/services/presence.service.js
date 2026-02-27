const redis = require("../config/redis");

exports.addUser = async (hotelId, userId) => {
  const key = `hotel_presence:${hotelId}`;

  await redis.sadd(key, userId);

  return await redis.scard(key); // return total online admins
};

exports.removeUser = async (hotelId, userId) => {
  const key = `hotel_presence:${hotelId}`;

  await redis.srem(key, userId);

  return await redis.scard(key);
};

exports.getCount = async (hotelId) => {
  const key = `hotel_presence:${hotelId}`;

  return await redis.scard(key);
};
