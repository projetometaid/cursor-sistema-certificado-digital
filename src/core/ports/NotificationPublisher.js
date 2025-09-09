/**
 * @typedef {Object} NotificationPublisher
 * @property {(kind:'email', payload:Object, options?:{ async?:boolean, tenantId?:string, idempotencyKey?:string })=>Promise<{ ok:boolean, messageId?:string }>} publish
 */
module.exports = {};


