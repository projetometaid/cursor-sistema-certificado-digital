class TimeSlot {
  constructor({ startISO, endISO, providerId, capacity = 1 }) {
    this.startISO = startISO;
    this.endISO = endISO;
    this.providerId = providerId;
    this.capacity = capacity;
  }
}

module.exports = TimeSlot;


