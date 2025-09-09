/**
 * @typedef {Object} CalendarProvider
 * @property {(appt:{ id:string, providerId:string, startISO:string, endISO:string, title?:string, description?:string })=>Promise<{ ok:boolean, externalId?:string }>} createEvent
 * @property {(externalId:string)=>Promise<{ ok:boolean }>} cancelEvent
 */
module.exports = {};


