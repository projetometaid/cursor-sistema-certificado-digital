module.exports = function AppointmentBookedEvent({ appointment }){
  return {
    eventName: 'appointment_booked',
    payload: {
      appointmentId: appointment.id,
      providerId: appointment.providerId,
      startISO: appointment.startISO,
      endISO: appointment.endISO,
      customer: appointment.customer || {}
    }
  };
};


