/**
 * Optional cache for generated availability slots
 * @typedef {Object} AvailabilityRepository
 * @property {(providerId:string, fromISO:string, toISO:string)=>Promise<null|{ slots:any[], generatedAt:string }>} get
 * @property {(providerId:string, fromISO:string, toISO:string, slots:any[])=>Promise<void>} set
 * @property {(providerId:string)=>Promise<void>} invalidateForProvider
 */
module.exports = {};


