/** @typedef {{ id:string, providerId:string, customer:Object, serviceId?:string, startISO:string, endISO:string, status:'booked'|'cancelled'|'completed' }} Appointment */
/**
 * @typedef {Object} AppointmentRepository
 * @property {(appt:Appointment)=>Promise<Appointment>} save
 * @property {(id:string)=>Promise<Appointment|null>} findById
 * @property {(id:string)=>Promise<boolean>} cancel
 * @property {(providerId:string, fromISO:string, toISO:string)=>Promise<Appointment[]>} listByProviderBetween
 * @property {(providerId:string, fromISO:string, toISO:string)=>Promise<Appointment[]>} findOverlappingRange
 */
module.exports = {};


