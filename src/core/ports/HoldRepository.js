/** @typedef {{ id:string, providerId:string, startISO:string, endISO:string, status:'active'|'released'|'expired', expiresAt:string, customer?:object }} Hold */
/**
 * @typedef {Object} HoldRepository
 * @property {(hold:Omit<Hold,'id'|'status'>)=>Promise<Hold>} create
 * @property {(id:string)=>Promise<boolean>} release
 * @property {(providerId:string, fromISO:string, toISO:string)=>Promise<Hold[]>} listActiveByProviderBetween
 * @property {(nowISO:string)=>Promise<number>} expireOlderThan
 */
module.exports = {};


