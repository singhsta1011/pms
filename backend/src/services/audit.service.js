const { AuditLog } = require("../models");

exports.createAuditLog = async ({
  userId,
  hotelId,
  action,
  entity,
  entityId,
  meta = {},
}) => {
  try {
    await AuditLog.create({
      userId,
      hotelId,
      action,
      entity,
      entityId,
      meta,
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
};
