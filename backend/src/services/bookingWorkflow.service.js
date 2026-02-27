//
// ==========================================================
// ⭐ BOOKING WORKFLOW ENGINE (ENTERPRISE SAFE)
// ==========================================================
//

/*
  Allowed transitions:

  PENDING → CONFIRMED / CANCELLED
  CONFIRMED → CHECKED_IN / CANCELLED
  CHECKED_IN → CHECKED_OUT
  CHECKED_OUT → COMPLETED
*/

const WORKFLOW = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED"],
  CHECKED_IN: ["CHECKED_OUT"],
  CHECKED_OUT: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

//
// ==========================================================
// ⭐ VALIDATE STATUS TRANSITION
// ==========================================================
//
const isValidTransition = (currentStatus, newStatus) => {
  if (!currentStatus || !newStatus) return false;

  // normalize (enterprise safe)
  const from = String(currentStatus).toUpperCase();
  const to = String(newStatus).toUpperCase();

  const allowed = WORKFLOW[from];

  if (!allowed) {
    console.warn("⚠️ Unknown workflow state:", from);
    return false;
  }

  return allowed.includes(to);
};

//
// ==========================================================
// ⭐ OPTIONAL HELPER (VERY USEFUL FOR UI)
// ==========================================================
//
const getNextAllowedStatuses = (currentStatus) => {
  if (!currentStatus) return [];
  return WORKFLOW[String(currentStatus).toUpperCase()] || [];
};

module.exports = {
  WORKFLOW,
  isValidTransition,
  getNextAllowedStatuses,
};