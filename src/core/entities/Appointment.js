class Appointment {
  constructor({ id, providerId, customer, serviceId, startISO, endISO, status = 'booked' }) {
    this.id = id;
    this.providerId = providerId;
    this.customer = customer; // { id?, name, email, phone }
    this.serviceId = serviceId;
    this.startISO = startISO;
    this.endISO = endISO;
    this.status = status; // booked | cancelled | completed
  }
}

module.exports = Appointment;


