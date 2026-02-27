const EventEmitter = require("events");

class PMSQueue extends EventEmitter {}

const eventQueue = new PMSQueue();

module.exports = eventQueue;
