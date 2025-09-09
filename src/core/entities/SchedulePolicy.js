class SchedulePolicy {
  constructor({
    providerId,
    enabled = false,
    timezone = 'America/Sao_Paulo',
    workingDays = [1, 2, 3, 4, 5],
    shifts = [],
    slotDurationMinutes = 30,
    gapBetweenSlotsMinutes = 0,
    exceptions = { holidays: [], blocks: [] },
    maxConcurrentAppointments = 1,
    bookingWindowDays = 30,
    serviceDurations = null
  }) {
    this.providerId = providerId;
    this.enabled = enabled;
    this.timezone = timezone;
    this.workingDays = workingDays;
    this.shifts = shifts;
    this.slotDurationMinutes = slotDurationMinutes;
    this.gapBetweenSlotsMinutes = gapBetweenSlotsMinutes;
    this.exceptions = exceptions;
    this.maxConcurrentAppointments = maxConcurrentAppointments;
    this.bookingWindowDays = bookingWindowDays;
    this.serviceDurations = serviceDurations;
  }
}

module.exports = SchedulePolicy;


